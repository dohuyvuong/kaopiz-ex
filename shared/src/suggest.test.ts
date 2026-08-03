import { describe, expect, it } from 'vitest';

import calendarJul from './__fixtures__/calendar-2026-07.api.json';
import calendarApr from './__fixtures__/calendar-2026-04.api.json';
import absenceReasons from './__fixtures__/reasons-absence.json';

import { suggestForms } from './suggest';
import { buildRules, normalizeCalendarDay } from './normalize';
import { CalendarDay, FormType, Reason } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const julData = (calendarJul as any).data;
const aprData = (calendarApr as any).data;

function makeRules(overrides: { maxDaysAfter?: number } = {}) {
  return buildRules({
    workingTime: julData.workingTime,
    reasons: (absenceReasons as any).items,
    maxDaysAfterByType:
      overrides.maxDaysAfter == null
        ? []
        : [
            { typeId: FormType.LEAVE, maxDaysAfter: overrides.maxDaysAfter },
            { typeId: FormType.ABSENCE, maxDaysAfter: overrides.maxDaysAfter },
          ],
  });
}

const rules = makeRules();

function daysOf(data: any): CalendarDay[] {
  return data.timelines
    .map(normalizeCalendarDay)
    .filter((day: CalendarDay | null): day is CalendarDay => day !== null);
}

const julDays = daysOf(julData);
const julTotal = {
  minutesLate: julData.summary.minutesLate,
  minutesEarly: julData.summary.minutesEarly,
};

describe('không gợi ý khi chưa vượt hạn mức', () => {
  it('tháng 04/2026 tổng 79 phút < 90 → không cần đơn nào', () => {
    const result = suggestForms({
      days: daysOf(aprData),
      rules,
      actualTotal: {
        minutesLate: aprData.summary.minutesLate,
        minutesEarly: aprData.summary.minutesEarly,
      },
      today: '2026-05-01',
    });

    expect(result.neededMinutes).toBe(0);
    expect(result.forms).toEqual([]);
  });
});

describe('tháng 07/2026 — vượt 25 phút', () => {
  const result = suggestForms({
    days: julDays,
    rules,
    actualTotal: julTotal,
    today: '2026-08-03',
  });

  it('chỉ cần che đúng phần vượt, không che cả 115 phút', () => {
    expect(result.currentTotal).toBe(115);
    expect(result.allowedTotal).toBe(90);
    expect(result.neededMinutes).toBe(25);
    expect(result.coveredMinutes).toBe(25);
    expect(result.uncoveredMinutes).toBe(0);
  });

  it('thử đơn vắng mặt trước vì không tốn phép năm', () => {
    expect(result.forms[0].typeId).toBe(FormType.ABSENCE);
    expect(result.forms[0].reasonId).toBe(Reason.SHIFT_ADJUSTMENT);
  });

  it('bỏ qua 31/07 dù vi phạm nặng nhất — ngày đó không đủ giờ làm', () => {
    // 31/07 muộn 35 phút nhưng ra về lúc 15:55: 6h50 − 1h nghỉ trưa = 5h50 < 8h,
    // và về sớm nên không bù được. Không đủ điều kiện cho lý do 21.
    const absenceOn31 = result.forms.find(
      (form) => form.date === '2026-07-31' && form.typeId === FormType.ABSENCE,
    );
    expect(absenceOn31).toBeUndefined();
  });

  it('bỏ qua tuần 13–19/07 vì đã dùng hết 2 đơn lý do 21', () => {
    // 15/07 và 17/07 đã có đơn lý do 21 ĐÃ DUYỆT — hết quota tuần, dù 13/07 và
    // 16/07 là hai ngày vi phạm nặng tiếp theo (17 và 13 phút).
    const inThatWeek = result.forms.filter(
      (form) =>
        form.date >= '2026-07-13' &&
        form.date <= '2026-07-19' &&
        form.typeId === FormType.ABSENCE,
    );
    expect(inThatWeek).toEqual([]);
  });

  it('chọn 01/07 — ngày nặng nhất còn quota tuần và đủ giờ làm', () => {
    // Tuần 29/06–05/07 mới dùng 1/2 (đơn ngày 02/07).
    expect(result.forms[0].date).toBe('2026-07-01');
    expect(result.forms[0].timeStart).toBe('08:30');
    expect(result.forms[0].timeEnd).toBe('08:42');
    expect(result.forms[0].minutes).toBe(12);
  });

  it('phần còn dư mới dùng phép năm, và đặt vào ngày nặng nhất', () => {
    const leave = result.forms.filter((form) => form.usesAnnualLeave);
    expect(leave).toHaveLength(1);
    expect(leave[0].date).toBe('2026-07-31');
    expect(leave[0].minutes).toBe(13);
    expect(leave[0].reasonId).toBe(Reason.ANNUAL_LEAVE);
  });

  it('mỗi gợi ý nói rõ che muộn hay che sớm, không suy từ mô tả', () => {
    expect(result.forms.every((form) => form.covers === 'late')).toBe(true);
  });
});

describe('tôn trọng giới hạn của lý do, đọc từ API', () => {
  it('không quá 60 phút mỗi đơn vắng mặt', () => {
    // Ép cần che nhiều: coi như hạn mức tháng bằng 0.
    const strict = { ...rules, allowedMinutesPerMonth: 0 };
    const result = suggestForms({
      days: julDays,
      rules: strict,
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    const absences = result.forms.filter(
      (form) => form.typeId === FormType.ABSENCE,
    );
    expect(absences.length).toBeGreaterThan(0);
    expect(Math.max(...absences.map((form) => form.minutes))).toBeLessThanOrEqual(
      60,
    );
  });

  it('không quá 2 đơn vắng mặt mỗi tuần', () => {
    const strict = { ...rules, allowedMinutesPerMonth: 0 };
    const result = suggestForms({
      days: julDays,
      rules: strict,
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    const perWeek = new Map<string, number>();
    for (const form of result.forms) {
      if (form.typeId !== FormType.ABSENCE) continue;
      // Tuần bắt đầu thứ Hai.
      const monday = new Date(`${form.date}T00:00:00Z`);
      monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
    }
    expect(Math.max(...perWeek.values())).toBeLessThanOrEqual(2);
  });

  it('dùng nghỉ phép năm cho phần đơn vắng mặt không gánh nổi', () => {
    const strict = { ...rules, allowedMinutesPerMonth: 0 };
    const result = suggestForms({
      days: julDays,
      rules: strict,
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    expect(result.forms.some((form) => form.usesAnnualLeave)).toBe(true);
  });
});

describe('không đề xuất trùng lên đơn đã có trong ngày', () => {
  it('ngày đã có đơn che 08:30–08:55 thì đề xuất bắt đầu từ 08:55', () => {
    const withExisting: CalendarDay[] = julDays.map((day) =>
      day.date === '2026-07-31'
        ? {
            ...day,
            forms: [
              ...day.forms,
              {
                id: 999,
                typeId: FormType.LEAVE,
                isApproved: false,
                reasonId: Reason.ANNUAL_LEAVE,
                typeName: 'Đơn xin nghỉ',
                intervals: [{ start: '08:30', end: '08:55' }],
                punches: [],
              },
            ],
          }
        : day,
    );

    const result = suggestForms({
      days: withExisting,
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    const onThatDay = result.forms.filter(
      (form) => form.date === '2026-07-31',
    );
    expect(onThatDay.length).toBeGreaterThan(0);
    // Phần 08:30–08:55 đã bị đơn kia chiếm, đề xuất phải nối tiếp sau đó.
    expect(onThatDay[0].timeStart).toBe('08:55');
    expect(
      onThatDay.every((form) => form.timeStart >= '08:55'),
    ).toBe(true);
  });
});

describe('tuần vắt qua hai tháng', () => {
  // Tuần 29/06–05/07 nằm một nửa ở tháng 6. API calendar tháng 7 KHÔNG trả các
  // ngày tháng 6, nên nếu người gọi không bổ sung chúng thì quota tuần bị đếm
  // thiếu và tool đề xuất vượt mức HRM cho phép.
  const absenceFormOn = (date: string, id: number) => ({
    id,
    typeId: FormType.ABSENCE,
    isApproved: true,
    reasonId: Reason.SHIFT_ADJUSTMENT,
    typeName: 'Đơn vắng mặt',
    intervals: [{ start: '08:30', end: '08:50' }],
    punches: [],
  });

  // 02/07 trong fixture đã có sẵn 1 đơn lý do 21 → thêm 1 đơn ở 30/06 là đủ 2.
  const juneDay: CalendarDay = {
    date: '2026-06-30',
    work: 'N',
    timeIn: null,
    timeOut: null,
    timeInFinal: null,
    timeOutFinal: null,
    actual: { minutesLate: 0, minutesEarly: 0 },
    forms: [absenceFormOn('2026-06-30', 90001)],
    symbol: null,
    logWork: null,
  };

  it('thiếu ngày tháng trước → đề xuất đơn vắng mặt vượt quota tuần', () => {
    const result = suggestForms({
      days: julDays,
      rules,
      actualTotal: julTotal,
      today: '2026-08-03',
    });
    // Chỉ thấy 1/2 đơn của tuần nên vẫn đề xuất thêm cho 01/07.
    expect(
      result.forms.some(
        (form) =>
          form.date === '2026-07-01' && form.typeId === FormType.ABSENCE,
      ),
    ).toBe(true);
  });

  it('có ngày tháng trước → tôn trọng quota, chuyển sang phép năm', () => {
    const result = suggestForms({
      days: [...julDays, juneDay],
      rules,
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    expect(
      result.forms.some(
        (form) =>
          form.date === '2026-07-01' && form.typeId === FormType.ABSENCE,
      ),
    ).toBe(false);
    // Vẫn che đủ phần vượt, chỉ là bằng phép năm.
    expect(result.coveredMinutes).toBe(result.neededMinutes);
  });

  it('ngày dựng từ day-detail không bao giờ được chọn làm ứng viên tạo đơn', () => {
    const result = suggestForms({
      days: [...julDays, juneDay],
      rules,
      actualTotal: julTotal,
      today: '2026-08-03',
    });
    expect(result.forms.some((form) => form.date === '2026-06-30')).toBe(false);
  });
});

describe('hạn nộp đơn', () => {
  it('bỏ qua ngày đã quá hạn, và báo phần không che nổi', () => {
    // Đứng ở 30/09 thì mọi ngày tháng 7 đều quá hạn 7 ngày.
    const result = suggestForms({
      days: julDays,
      rules: makeRules({ maxDaysAfter: 6 }),
      actualTotal: julTotal,
      today: '2026-09-30',
    });

    expect(result.forms).toEqual([]);
    expect(result.uncoveredMinutes).toBe(25);
  });

  it('còn trong hạn thì vẫn đề xuất bình thường', () => {
    const result = suggestForms({
      days: julDays,
      rules: makeRules({ maxDaysAfter: 6 }),
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    expect(result.forms.length).toBeGreaterThan(0);
    expect(result.uncoveredMinutes).toBe(0);
  });
});
