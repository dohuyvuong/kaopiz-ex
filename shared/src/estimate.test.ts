/**
 * Test dựa trên response THẬT của HRM (thư mục `__fixtures__`, rút từ `fixtures/`).
 * Mọi con số kỳ vọng đều đối chiếu được với dữ liệu gốc, không phải bịa.
 */

import { describe, expect, it } from 'vitest';

import calendarJul from './__fixtures__/calendar-2026-07.api.json';
import calendarApr from './__fixtures__/calendar-2026-04.api.json';
import dayDetailJul31 from './__fixtures__/day-detail-2026-07-31.raw.json';
import dayDetailApr16 from './__fixtures__/day-detail-2026-04-16.raw.json';
import absenceReasons from './__fixtures__/reasons-absence.json';

import { estimateDay, estimateMonth } from './estimate';
import {
  buildRules,
  mergeDayDetailForms,
  normalizeCalendarDay,
  normalizeForm,
  toDateKey,
  toMinutes,
} from './normalize';
import { CalendarDay, Reason } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const julData = (calendarJul as any).data;
const aprData = (calendarApr as any).data;

const rules = buildRules({
  workingTime: julData.workingTime,
  reasons: (absenceReasons as any).items,
});

function daysOf(data: any): CalendarDay[] {
  return data.timelines
    .map(normalizeCalendarDay)
    .filter((day: CalendarDay | null): day is CalendarDay => day !== null);
}

function dayOn(data: any, date: string): CalendarDay {
  const day = daysOf(data).find((candidate) => candidate.date === date);
  if (!day) throw new Error(`Không có ngày ${date} trong fixture`);
  return day;
}

/**
 * Day-detail RAW dùng snake_case; backend sẽ camelCase hoá. Test chuyển tối thiểu
 * để kiểm chứng được cả những field backend đang làm rơi (`time`, `reason_id`).
 */
function detailForms(raw: any) {
  return raw.application_forms.map((form: any) => ({
    id: form.id,
    typeId: form.type_id,
    status: form.status,
    type: form.type,
    data: {
      reasonId: form.data?.reason_id ?? null,
      trackingTimes: (form.data?.tracking_times ?? []).map((tracking: any) => ({
        date: tracking.date ?? null,
        dateStart: tracking.date_start ?? null,
        dateEnd: tracking.date_end ?? null,
        timeStart: tracking.time_start ?? null,
        timeEnd: tracking.time_end ?? null,
        time: tracking.time ?? null,
        reasonId: tracking.reason_id ?? null,
      })),
    },
  }));
}

describe('ràng buộc đọc từ HRM, không hardcode', () => {
  it('lấy hạn mức tháng và giờ làm từ workingTime', () => {
    expect(rules.allowedMinutesPerMonth).toBe(90);
    expect(rules.workStart).toBe('08:30');
    expect(rules.workEnd).toBe('17:30');
    expect(rules.lunchBreakMinutes).toBe(60);
    expect(rules.workingHoursPerDay).toBe(8);
  });

  it('lấy giới hạn của lý do 21 từ /master/all-reasons', () => {
    const limit = rules.reasonLimits.get(Reason.SHIFT_ADJUSTMENT);
    expect(limit?.maxTimesInWeek).toBe(2);
    expect(limit?.maxMinutesInDay).toBe(60);
    expect(limit?.needLogWork).toBe(true);
  });
});

describe('chuẩn hoá ngày không lệ thuộc timezone', () => {
  it('cắt phần ngày từ ISO UTC thay vì parse qua giờ địa phương', () => {
    expect(toDateKey('2026-04-16T00:00:00.000Z')).toBe('2026-04-16');
    expect(toDateKey('2026-04-16 00:00:00')).toBe('2026-04-16');
    expect(toDateKey(null)).toBeNull();
  });

  it('parse giờ "HH:mm"', () => {
    expect(toMinutes('08:30')).toBe(510);
    expect(toMinutes('17:30')).toBe(1050);
    expect(toMinutes('bậy')).toBeNull();
  });
});

describe('chuẩn hoá 3 shape trackingTimes của HRM', () => {
  it('đơn vắng mặt (type 2): date + timeStart/timeEnd → khoảng', () => {
    const forms = detailForms(dayDetailApr16);
    const absence = normalizeForm(
      forms.find((form: any) => form.typeId === 2),
      '2026-04-16',
    );
    expect(absence.intervals).toEqual([{ start: '08:30', end: '08:45' }]);
    expect(absence.punches).toEqual([]);
    expect(absence.reasonId).toBe(Reason.SHIFT_ADJUSTMENT);
  });

  it('đơn checkin/out (type 4): date + time → mốc giờ, không phải khoảng', () => {
    const forms = detailForms(dayDetailApr16);
    const checkInOut = normalizeForm(
      forms.find((form: any) => form.typeId === 4),
      '2026-04-16',
    );
    expect(checkInOut.punches).toEqual(['17:30']);
    expect(checkInOut.intervals).toEqual([]);
    expect(checkInOut.reasonId).toBe(25);
  });

  it('đơn nghỉ (type 1): dateStart/dateEnd + reasonId ở cấp form', () => {
    const forms = detailForms(dayDetailJul31);
    const leave = normalizeForm(forms[0], '2026-07-31');
    expect(leave.intervals).toEqual([{ start: '15:55', end: '17:30' }]);
    expect(leave.reasonId).toBe(Reason.ANNUAL_LEAVE);
  });

  it('bỏ qua tracking time của ngày khác', () => {
    const form = normalizeForm(
      {
        id: 1,
        typeId: 1,
        data: {
          trackingTimes: [
            { dateStart: '2026-07-30', dateEnd: '2026-07-30', timeStart: '08:30', timeEnd: '09:00' },
            { dateStart: '2026-07-31', dateEnd: '2026-07-31', timeStart: '10:00', timeEnd: '11:00' },
          ],
        },
      },
      '2026-07-31',
    );
    expect(form.intervals).toEqual([{ start: '10:00', end: '11:00' }]);
  });

  it('đơn từ calendar không có status → coi là đã duyệt', () => {
    const day = dayOn(julData, '2026-07-31');
    expect(day.forms.every((form) => form.isApproved)).toBe(true);
  });
});

describe('31/07/2026 — đơn pending buổi sáng che một phần đi muộn', () => {
  // timeIn 09:05, workStart 08:30 → muộn 35 phút.
  // Đơn ĐÃ DUYỆT 15:55–17:30 che buổi chiều (early = 0).
  // Đơn CHỜ DUYỆT 08:30–08:55 che 25 phút đầu ca.
  const day = mergeDayDetailForms(
    dayOn(julData, '2026-07-31'),
    detailForms(dayDetailJul31),
  );

  it('HRM đã trừ sẵn đơn đã duyệt', () => {
    expect(day.actual.minutesLate).toBe(35);
    expect(day.actual.minutesEarly).toBe(0);
    expect(day.timeOutFinal).toBe('17:30');
    expect(day.timeIn).toBe('09:05');
  });

  it('day-detail bổ sung đúng một đơn chờ duyệt', () => {
    const pending = day.forms.filter((form) => !form.isApproved);
    expect(pending).toHaveLength(1);
    expect(pending[0].intervals).toEqual([{ start: '08:30', end: '08:55' }]);
  });

  it('ước tính: 35 muộn − 25 che = 10 còn lại', () => {
    const estimate = estimateDay(day, rules);
    expect(estimate.covered.minutesLate).toBe(25);
    expect(estimate.estimated.minutesLate).toBe(10);
    expect(estimate.estimated.minutesEarly).toBe(0);
    expect(estimate.hasPendingCoverage).toBe(true);
  });

  it('đơn buổi chiều không đụng tới phần muộn buổi sáng', () => {
    // Giả lập đơn 15:55–17:30 ở trạng thái chờ duyệt.
    const withPendingAfternoon: CalendarDay = {
      ...day,
      forms: day.forms.map((form) =>
        form.intervals[0]?.start === '15:55' ? { ...form, isApproved: false } : form,
      ),
    };
    const estimate = estimateDay(withPendingAfternoon, rules);
    // Vẫn chỉ che được 25 phút của đơn buổi sáng.
    expect(estimate.covered.minutesLate).toBe(25);
  });
});

describe('16/04/2026 — đơn checkin/out bù giờ ra bị thiếu', () => {
  const approved = dayOn(aprData, '2026-04-16');

  it('HRM áp đơn checkin/out vào timeOutFinal', () => {
    expect(approved.timeOut).toBe('13:50');
    expect(approved.timeOutFinal).toBe('17:30');
    expect(approved.actual.minutesEarly).toBe(0);
    expect(approved.symbol).toBe('I/O,V');
  });

  it('nếu đơn checkin/out còn CHỜ DUYỆT thì mốc giờ che phần về sớm', () => {
    // Dựng lại trạng thái trước khi duyệt: chưa có đơn nào được áp,
    // nên timeOutFinal = timeOut = 13:50, về sớm 220 phút.
    const beforeApproval: CalendarDay = {
      ...approved,
      timeInFinal: '08:45',
      timeOutFinal: '13:50',
      actual: { minutesLate: 15, minutesEarly: 220 },
      forms: mergeDayDetailForms(approved, detailForms(dayDetailApr16)).forms.map(
        (form) => ({ ...form, isApproved: false }),
      ),
    };

    const estimate = estimateDay(beforeApproval, rules);
    // Mốc 17:30 bù trọn khoảng 13:50 → 17:30.
    expect(estimate.covered.minutesEarly).toBe(220);
    expect(estimate.estimated.minutesEarly).toBe(0);
    // Đơn vắng mặt 08:30–08:45 che trọn 15 phút muộn.
    expect(estimate.covered.minutesLate).toBe(15);
    expect(estimate.estimated.minutesLate).toBe(0);
  });
});

describe('tổng hợp tháng', () => {
  it('tháng 07/2026: tổng muộn 115 phút, vượt hạn mức 90', () => {
    const days = daysOf(julData);
    const estimate = estimateMonth(days, rules, {
      minutesLate: julData.summary.minutesLate,
      minutesEarly: julData.summary.minutesEarly,
    });

    expect(estimate.actual.minutesLate).toBe(115);
    expect(estimate.allowedMinutes).toBe(90);
    // Calendar API không kèm đơn chờ duyệt → chưa che được gì.
    expect(estimate.estimated.minutesLate).toBe(115);
    expect(estimate.estimatedOverage).toBe(25);
  });

  it('tháng 04/2026: 79 phút, dưới hạn mức nên không vượt', () => {
    const days = daysOf(aprData);
    const estimate = estimateMonth(days, rules, {
      minutesLate: aprData.summary.minutesLate,
      minutesEarly: aprData.summary.minutesEarly,
    });

    expect(estimate.actual.minutesLate).toBe(79);
    expect(estimate.estimatedOverage).toBe(0);
  });

  it('duyệt đơn 25 phút của 31/07 là tháng vừa đúng hạn mức, hết phạt', () => {
    const days = daysOf(julData).map((day) =>
      day.date === '2026-07-31'
        ? mergeDayDetailForms(day, detailForms(dayDetailJul31))
        : day,
    );
    const estimate = estimateMonth(days, rules, {
      minutesLate: julData.summary.minutesLate,
      minutesEarly: julData.summary.minutesEarly,
    });

    // 115 thực tế − 25 đơn che = 90, vừa chạm hạn mức 90 → không còn vượt.
    expect(estimate.estimated.minutesLate).toBe(90);
    expect(estimate.estimatedOverage).toBe(0);
  });
});
