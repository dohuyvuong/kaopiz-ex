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

describe('quota đơn vắng mặt là quyền lợi hết hạn theo tuần', () => {
  /*
   * Đơn vắng mặt lý do 21 được cấp 2 lần mỗi TUẦN và không dồn sang tuần sau.
   * Không dùng là mất. Vì hạn nộp đơn chỉ vài ngày, hạn mức của tuần đã qua
   * không thể lấy lại — nên phải tận dụng ngay cả khi tháng chưa vượt mức phạt,
   * để dành chỗ trống cho những ngày đi muộn phát sinh về sau.
   */
  const aprResult = suggestForms({
    days: daysOf(aprData),
    rules,
    actualTotal: {
      minutesLate: aprData.summary.minutesLate,
      minutesEarly: aprData.summary.minutesEarly,
    },
    today: '2026-04-05',
  });

  it('tháng 04/2026 tổng 79 phút < 90 nên không cần phép năm', () => {
    expect(aprResult.currentTotal).toBe(79);
    expect(aprResult.overageBefore).toBe(0);
    expect(aprResult.leaveMinutes).toBe(0);
  });

  it('nhưng vẫn dùng quota đơn vắng mặt còn lại của tuần', () => {
    // Tuần 30/03–05/04 mới dùng 1/2 (đơn ngày 02/04); 01/04 muộn 20 phút và làm
    // đủ giờ nên vẫn đáng làm đơn, dù tháng chưa vượt hạn mức.
    expect(aprResult.forms).toHaveLength(1);
    expect(aprResult.forms[0]).toMatchObject({
      date: '2026-04-01',
      typeId: FormType.ABSENCE,
      reasonId: Reason.SHIFT_ADJUSTMENT,
      minutes: 20,
      usesAnnualLeave: false,
    });
  });

  it('kéo tổng tháng xuống, tạo đệm cho phần còn lại của tháng', () => {
    expect(aprResult.projectedTotal).toBe(59);
  });

  it('các tuần đã dùng hết 2 đơn thì không đề xuất thêm', () => {
    // Tuần 06–12/04 và 13–19/04 đều đã có 2 đơn lý do 21 đã duyệt.
    const inFullWeeks = aprResult.forms.filter(
      (form) => form.date >= '2026-04-06' && form.date <= '2026-04-19',
    );
    expect(inFullWeeks).toEqual([]);
  });
});

describe('tháng 07/2026 — vượt 25 phút, đứng ở ngày 08/07', () => {
  // `today` phải gần ngày vi phạm: gợi ý chỉ xét các ngày còn nộp đơn được.
  const result = suggestForms({
    days: julDays,
    rules,
    actualTotal: julTotal,
    today: '2026-07-08',
  });

  it('chỉ cần che đúng phần vượt, không che cả 115 phút', () => {
    expect(result.currentTotal).toBe(115);
    expect(result.allowedTotal).toBe(90);
    expect(result.overageBefore).toBe(25);
    expect(result.uncoveredMinutes).toBe(0);
    // Phép năm chỉ dùng đúng phần đơn vắng mặt không gánh nổi.
    expect(result.leaveMinutes).toBe(25 - result.absenceMinutes);
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

  it('bỏ qua tuần đã dùng hết 2 đơn lý do 21', () => {
    // Đứng ở 17/07: cửa sổ gồm 13, 14, 16/07 — ba ngày vi phạm nặng. Nhưng 15/07
    // và 17/07 đã có đơn lý do 21 ĐÃ DUYỆT nên tuần 13–19/07 hết quota.
    const midMonth = suggestForms({
      days: julDays,
      rules,
      actualTotal: julTotal,
      today: '2026-07-17',
    });
    expect(
      midMonth.forms.filter((form) => form.typeId === FormType.ABSENCE),
    ).toEqual([]);
    expect(midMonth.absenceMinutes).toBe(0);
  });

  it('chọn 01/07 — ngày nặng nhất còn quota tuần và đủ giờ làm', () => {
    // Tuần 29/06–05/07 mới dùng 1/2 (đơn ngày 02/07).
    expect(result.forms[0].date).toBe('2026-07-01');
    expect(result.forms[0].timeStart).toBe('08:30');
    expect(result.forms[0].timeEnd).toBe('08:42');
    expect(result.forms[0].minutes).toBe(12);
  });

  it('phần còn dư mới dùng phép năm, rải theo ngày nặng nhất trong hạn', () => {
    const leave = result.forms.filter((form) => form.usesAnnualLeave);
    expect(leave.map((form) => `${form.date}:${form.minutes}`)).toEqual([
      '2026-07-08:10',
      '2026-07-03:3',
    ]);
    expect(result.leaveMinutes).toBe(13);
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
      today: '2026-07-08',
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
      today: '2026-07-08',
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
      today: '2026-07-08',
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

describe('một ngày có thể cần hai đơn nối tiếp', () => {
  // HRM cho phép nhiều đơn trong cùng ngày miễn không trùng giờ. Đơn vắng mặt bị
  // chặn trần 60 phút/ngày, nên ngày muộn nhiều hơn thế phải bù tiếp bằng phép.
  const heavyDay: CalendarDay = {
    date: '2026-07-06',
    work: '1',
    timeIn: '10:00',
    timeOut: '19:30',
    timeInFinal: '10:00',
    timeOutFinal: '19:30',
    actual: { minutesLate: 90, minutesEarly: 0 },
    forms: [],
    symbol: null,
    logWork: null,
  };

  it('đơn vắng mặt lấy trần 60 phút, phép năm nối tiếp phần còn lại', () => {
    const result = suggestForms({
      days: [heavyDay],
      // Hạn mức 0 để buộc phải che toàn bộ 90 phút.
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: { minutesLate: 90, minutesEarly: 0 },
      today: '2026-07-07',
    });

    expect(result.absenceMinutes).toBe(60);
    expect(result.leaveMinutes).toBe(30);
    expect(result.projectedTotal).toBe(0);

    const [absence, leave] = result.forms;
    expect(absence).toMatchObject({ timeStart: '08:30', timeEnd: '09:30' });
    // Nối tiếp, không chồng lên đơn vắng mặt.
    expect(leave).toMatchObject({ timeStart: '09:30', timeEnd: '10:00' });
    expect(leave.usesAnnualLeave).toBe(true);
  });

  it('không tạo hai đơn vắng mặt cho cùng một ngày', () => {
    const result = suggestForms({
      days: [heavyDay],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: { minutesLate: 90, minutesEarly: 0 },
      today: '2026-07-07',
    });
    const absences = result.forms.filter(
      (form) => form.typeId === FormType.ABSENCE,
    );
    expect(absences).toHaveLength(1);
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
      today: '2026-07-08',
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
      today: '2026-07-08',
    });

    expect(
      result.forms.some(
        (form) =>
          form.date === '2026-07-01' && form.typeId === FormType.ABSENCE,
      ),
    ).toBe(false);
    // Vẫn về đúng hạn mức, chỉ là phải trả bằng phép năm.
    expect(result.uncoveredMinutes).toBe(0);
  });

  it('ngày dựng từ day-detail không bao giờ được chọn làm ứng viên tạo đơn', () => {
    const result = suggestForms({
      days: [...julDays, juneDay],
      rules,
      actualTotal: julTotal,
      today: '2026-07-08',
    });
    expect(result.forms.some((form) => form.date === '2026-06-30')).toBe(false);
  });
});

describe('cửa sổ gợi ý — chỉ những ngày còn nộp đơn được', () => {
  /*
   * Khác `checkDraftForm` (chỉ cảnh báo để người dùng tự quyết), phần GỢI Ý phải
   * tự lọc: đề xuất một ngày chắc chắn không nộp được đơn là đề xuất vô ích.
   */
  it('ngày quá hạn nộp không được gợi ý, dù vẫn còn vi phạm', () => {
    // Đứng ở 03/08: chỉ 31/07 còn trong hạn 7 ngày. 01/07 đã quá hạn từ lâu.
    const result = suggestForms({
      days: julDays,
      rules,
      actualTotal: julTotal,
      today: '2026-08-03',
    });

    expect(result.forms.every((form) => form.date >= '2026-07-27')).toBe(true);
    expect(result.forms.some((form) => form.date === '2026-07-01')).toBe(false);
  });

  const dayTemplate: CalendarDay = {
    date: '2026-07-08',
    work: '1',
    timeIn: '09:00',
    timeOut: '17:00',
    timeInFinal: '09:00',
    timeOutFinal: '17:00',
    actual: { minutesLate: 30, minutesEarly: 0 },
    forms: [],
    symbol: null,
    logWork: null,
  };
  const totalOf = (day: CalendarDay) => ({
    minutesLate: day.actual.minutesLate,
    minutesEarly: day.actual.minutesEarly,
  });

  it('hôm nay chưa tan ca thì chưa gợi ý', () => {
    // Ra về 17:00, sớm hơn giờ tan ca 17:30 → có thể vẫn đang làm.
    const result = suggestForms({
      days: [dayTemplate],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: totalOf(dayTemplate),
      today: dayTemplate.date,
    });
    expect(result.forms).toEqual([]);
    expect(result.uncoveredMinutes).toBe(30);
  });

  it('hôm nay đã tan ca thì gợi ý bình thường', () => {
    const finished: CalendarDay = {
      ...dayTemplate,
      timeOut: '18:00',
      timeOutFinal: '18:00',
    };
    const result = suggestForms({
      days: [finished],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: totalOf(finished),
      today: finished.date,
    });
    expect(result.forms).toHaveLength(1);
    expect(result.forms[0].minutes).toBe(30);
  });

  it('ngày chưa chấm công ra thì coi như chưa tan ca', () => {
    const noCheckout: CalendarDay = {
      ...dayTemplate,
      timeOut: null,
      timeOutFinal: null,
    };
    const result = suggestForms({
      days: [noCheckout],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: totalOf(noCheckout),
      today: noCheckout.date,
    });
    expect(result.forms).toEqual([]);
  });

  it('ngày tương lai không bao giờ được gợi ý', () => {
    const result = suggestForms({
      days: [{ ...dayTemplate, timeOut: '18:00', timeOutFinal: '18:00' }],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: totalOf(dayTemplate),
      today: '2026-07-07',
    });
    expect(result.forms).toEqual([]);
  });
});

describe('quota tính riêng cho từng tuần', () => {
  /*
   * Cửa sổ gợi ý 7 ngày thường VẮT QUA hai tuần. Ví dụ hôm nay thứ Hai 20/07 thì
   * cửa sổ là 13/07–20/07: 13–19/07 là một tuần, còn 20/07 mở đầu tuần mới.
   * Quota 2 đơn/tuần phải đếm riêng cho từng tuần — tuần trước tiêu hết không
   * được phép ảnh hưởng tới ngày đầu tuần này.
   */
  const violationDay = (date: string): CalendarDay => ({
    date,
    work: '1',
    timeIn: '08:50',
    timeOut: '19:00',
    timeInFinal: '08:50',
    timeOutFinal: '19:00',
    actual: { minutesLate: 20, minutesEarly: 0 },
    forms: [],
    symbol: null,
    logWork: null,
  });

  /** Ngày đã tiêu một suất quota bằng đơn lý do 21 đã duyệt. */
  const quotaUsedDay = (date: string, id: number): CalendarDay => ({
    ...violationDay(date),
    actual: { minutesLate: 0, minutesEarly: 0 },
    forms: [
      {
        id,
        typeId: FormType.ABSENCE,
        isApproved: true,
        reasonId: Reason.SHIFT_ADJUSTMENT,
        typeName: 'Đơn vắng mặt',
        intervals: [{ start: '08:30', end: '08:50' }],
        punches: [],
      },
    ],
  });

  const days = [
    violationDay('2026-07-13'), // thứ Hai tuần trước
    violationDay('2026-07-14'),
    quotaUsedDay('2026-07-15', 9001),
    quotaUsedDay('2026-07-17', 9002), // tuần 13–19/07 hết quota
    violationDay('2026-07-20'), // thứ Hai tuần mới, cũng là hôm nay
  ];

  const result = suggestForms({
    days,
    rules: { ...rules, allowedMinutesPerMonth: 0 },
    actualTotal: { minutesLate: 60, minutesEarly: 0 },
    today: '2026-07-20',
  });

  const absences = result.forms.filter(
    (form) => form.typeId === FormType.ABSENCE,
  );

  it('tuần trước hết quota thì 13 và 14/07 không có đơn vắng mặt', () => {
    expect(absences.some((form) => form.date === '2026-07-13')).toBe(false);
    expect(absences.some((form) => form.date === '2026-07-14')).toBe(false);
  });

  it('20/07 mở đầu tuần mới nên vẫn còn nguyên quota', () => {
    expect(absences.map((form) => form.date)).toEqual(['2026-07-20']);
    expect(absences[0].minutes).toBe(20);
  });

  it('nếu chính tuần mới cũng hết quota thì 20/07 mới bị chặn', () => {
    const blocked = suggestForms({
      days: [
        ...days,
        quotaUsedDay('2026-07-21', 9003),
        quotaUsedDay('2026-07-22', 9004),
      ],
      rules: { ...rules, allowedMinutesPerMonth: 0 },
      actualTotal: { minutesLate: 60, minutesEarly: 0 },
      today: '2026-07-20',
    });
    expect(
      blocked.forms.filter((form) => form.typeId === FormType.ABSENCE),
    ).toEqual([]);
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
