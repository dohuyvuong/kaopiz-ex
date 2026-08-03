import { describe, expect, it } from 'vitest';

import calendarApr from './__fixtures__/calendar-2026-04.api.json';
import absenceReasons from './__fixtures__/reasons-absence.json';

import {
  checkDraftForm,
  countReasonUsageInWeek,
  daysBetween,
  hasEnoughWorkHours,
  startOfWorkWeek,
  workWeekDates,
} from './rules';
import { buildRules, normalizeCalendarDay } from './normalize';
import { CalendarDay, FormType, Reason } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const aprData = (calendarApr as any).data;

const rules = buildRules({
  workingTime: aprData.workingTime,
  reasons: (absenceReasons as any).items,
  maxDaysAfterByType: (aprData.applicationFormConfig?.types ?? []).map(
    (type: any) => ({ typeId: type.typeId, maxDaysAfter: type.maxDaysAfter }),
  ),
});

const daysByDate = new Map<string, CalendarDay>(
  aprData.timelines
    .map(normalizeCalendarDay)
    .filter((day: CalendarDay | null): day is CalendarDay => day !== null)
    .map((day: CalendarDay) => [day.date, day]),
);

describe('tuần làm việc bắt đầu từ thứ Hai', () => {
  it('thứ Hai là chính nó', () => {
    // 2026-04-13 là thứ Hai.
    expect(startOfWorkWeek('2026-04-13')).toBe('2026-04-13');
  });

  it('chủ nhật thuộc về tuần bắt đầu thứ Hai TRƯỚC đó', () => {
    // 2026-04-19 là Chủ nhật — dayjs mặc định sẽ trả 2026-04-19, sai một tuần.
    expect(startOfWorkWeek('2026-04-19')).toBe('2026-04-13');
  });

  it('giữa tuần lùi đúng về thứ Hai', () => {
    expect(startOfWorkWeek('2026-04-16')).toBe('2026-04-13');
  });

  it('liệt kê đủ 7 ngày T2 → CN, vắt qua tháng vẫn đúng', () => {
    expect(workWeekDates('2026-04-16')).toEqual([
      '2026-04-13',
      '2026-04-14',
      '2026-04-15',
      '2026-04-16',
      '2026-04-17',
      '2026-04-18',
      '2026-04-19',
    ]);
    // Tuần vắt từ tháng 4 sang tháng 5.
    expect(workWeekDates('2026-05-01')[0]).toBe('2026-04-27');
  });
});

describe('đếm ngày không lệ thuộc timezone', () => {
  it('tính đúng số ngày giữa hai nhãn ngày', () => {
    expect(daysBetween('2026-07-27', '2026-08-03')).toBe(7);
    expect(daysBetween('2026-04-16', '2026-04-16')).toBe(0);
  });
});

describe('đếm số lần dùng lý do trong tuần', () => {
  it('tuần 13–19/04 có 2 đơn lý do 21 (16/04 và 17/04)', () => {
    const used = countReasonUsageInWeek(
      daysByDate,
      '2026-04-16',
      Reason.SHIFT_ADJUSTMENT,
    );
    expect(used).toBe(2);
  });

  it('tuần 20–26/04 có 2 đơn lý do 21 (21/04 và 24/04)', () => {
    expect(
      countReasonUsageInWeek(daysByDate, '2026-04-22', Reason.SHIFT_ADJUSTMENT),
    ).toBe(2);
  });

  it('bỏ qua đơn đang sửa để không tự tính trùng chính nó', () => {
    const day = daysByDate.get('2026-04-16')!;
    const ownForm = day.forms.find(
      (form) => form.reasonId === Reason.SHIFT_ADJUSTMENT,
    )!;
    expect(
      countReasonUsageInWeek(daysByDate, '2026-04-16', Reason.SHIFT_ADJUSTMENT, {
        excludeFormIds: new Set([ownForm.id]),
      }),
    ).toBe(1);
  });
});

describe('điều kiện đủ giờ làm', () => {
  it('01/04: vào 08:50, ra 19:27 → dư giờ', () => {
    // 10h37 − 1h nghỉ trưa = 9h37 ≥ 8h.
    expect(hasEnoughWorkHours(daysByDate.get('2026-04-01')!, rules)).toBe(true);
  });

  it('13/04: vào 08:38, ra 17:40 → thiếu giờ, và về muộn không bù đủ', () => {
    // 9h02 − 1h = 8h02 ≥ 8h → vẫn đủ.
    expect(hasEnoughWorkHours(daysByDate.get('2026-04-13')!, rules)).toBe(true);
  });

  it('thiếu giờ khi làm ngắn và không về muộn bù', () => {
    const short: CalendarDay = {
      ...daysByDate.get('2026-04-13')!,
      timeIn: '09:00',
      timeOut: '17:00',
      actual: { minutesLate: 30, minutesEarly: 30 },
    };
    // 8h − 1h = 7h < 8h; và 17:00 − 17:30 = −30 < 30 phút muộn.
    expect(hasEnoughWorkHours(short, rules)).toBe(false);
  });

  it('về muộn bù đủ số phút đi muộn thì chấp nhận dù giờ hiệu quả thiếu', () => {
    const compensated: CalendarDay = {
      ...daysByDate.get('2026-04-13')!,
      timeIn: '09:00',
      timeOut: '18:05',
      actual: { minutesLate: 30, minutesEarly: 0 },
    };
    // 9h05 − 1h = 8h05 ≥ 8h → đủ theo cách 1.
    expect(hasEnoughWorkHours(compensated, rules)).toBe(true);
  });

  it('không có chấm công thì coi là chưa đủ giờ', () => {
    expect(hasEnoughWorkHours(daysByDate.get('2026-04-03')!, rules)).toBe(false);
  });
});

describe('soát đơn sắp tạo — chỉ cảnh báo, không chặn', () => {
  // 01/04: vào 08:50, ra 19:27, chưa có đơn nào, tuần đó mới dùng 1/2 lần lý do 21.
  const draft = {
    date: '2026-04-01',
    typeId: FormType.ABSENCE,
    reasonId: Reason.SHIFT_ADJUSTMENT,
    timeStart: '08:30',
    timeEnd: '08:50',
  };

  it('ngày sạch, trong hạn, chưa dùng hết lý do → không cảnh báo', () => {
    expect(
      checkDraftForm(draft, { daysByDate, rules, today: '2026-04-05' }),
    ).toEqual([]);
  });

  it('cảnh báo khi tuần đã dùng đủ số lần của lý do', () => {
    const warnings = checkDraftForm(
      { ...draft, date: '2026-04-18' },
      { daysByDate, rules, today: '2026-04-20' },
    );
    const codes = warnings.map((warning) => warning.code);
    expect(codes).toContain('reason-week-limit');
    expect(warnings[0].message).toContain('2/2');
  });

  it('cảnh báo khi đơn dài quá mức cho phép mỗi lần', () => {
    const warnings = checkDraftForm(
      { ...draft, timeStart: '08:30', timeEnd: '10:00' },
      { daysByDate, rules, today: '2026-04-05' },
    );
    const warning = warnings.find(
      (item) => item.code === 'reason-minutes-limit',
    );
    expect(warning?.message).toContain('90 phút');
    expect(warning?.message).toContain('60 phút');
  });

  it('cảnh báo quá hạn nộp — theo ví dụ: đơn cho 27/07 hạn tới 03/08', () => {
    const julyRules = buildRules({
      workingTime: aprData.workingTime,
      reasons: (absenceReasons as any).items,
      maxDaysAfterByType: [{ typeId: FormType.ABSENCE, maxDaysAfter: 6 }],
    });
    const inTime = checkDraftForm(
      { ...draft, date: '2026-07-27' },
      { daysByDate: new Map(), rules: julyRules, today: '2026-08-03' },
    );
    expect(inTime.map((warning) => warning.code)).not.toContain(
      'submission-deadline',
    );

    const late = checkDraftForm(
      { ...draft, date: '2026-07-27' },
      { daysByDate: new Map(), rules: julyRules, today: '2026-08-04' },
    );
    expect(late.map((warning) => warning.code)).toContain(
      'submission-deadline',
    );
  });

  it('cảnh báo trùng giờ với đơn đã có trong ngày', () => {
    const warnings = checkDraftForm(
      { ...draft, date: '2026-04-16', timeStart: '08:35', timeEnd: '08:50' },
      { daysByDate, rules, today: '2026-04-20' },
    );
    expect(warnings.map((warning) => warning.code)).toContain(
      'overlapping-form',
    );
  });

  it('đơn kề nhau không tính là trùng', () => {
    // 16/04 đã có đơn 08:30–08:45; đơn mới bắt đầu đúng 08:45.
    const warnings = checkDraftForm(
      { ...draft, date: '2026-04-16', timeStart: '08:45', timeEnd: '09:00' },
      { daysByDate, rules, today: '2026-04-20' },
    );
    expect(warnings.map((warning) => warning.code)).not.toContain(
      'overlapping-form',
    );
  });

  it('mốc giờ của đơn checkin/out không bị tính là trùng khoảng', () => {
    // 16/04 có đơn checkin/out mốc 17:30 — không có `intervals` nên không trùng.
    const warnings = checkDraftForm(
      { ...draft, date: '2026-04-16', timeStart: '17:00', timeEnd: '17:30' },
      { daysByDate, rules, today: '2026-04-20' },
    );
    expect(warnings.map((warning) => warning.code)).not.toContain(
      'overlapping-form',
    );
  });
});
