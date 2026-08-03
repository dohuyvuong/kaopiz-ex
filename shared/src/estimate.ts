/**
 * Ước tính số phút muộn/sớm còn lại NẾU các đơn đang chờ duyệt được duyệt.
 *
 * Ý tưởng: HRM đã trừ sẵn đơn đã duyệt vào `minutesLate/minutesEarly` và phản ánh
 * kết quả vào `timeInFinal`/`timeOutFinal`. Nên phần vi phạm còn lại luôn nằm gọn
 * trong hai cửa sổ:
 *
 *     [workStart → timeInFinal]      ← phần đi muộn
 *     [timeOutFinal → workEnd]       ← phần về sớm
 *
 * Một đơn chờ duyệt che được bao nhiêu phút = phần nó GIAO với cửa sổ đó. Không
 * cần biết đơn thuộc loại nào, không cần đọc mô tả, không chia theo tỷ lệ.
 *
 * Lưu ý: ước tính này THẬN TRỌNG. HRM đôi khi rộng lượng hơn (một đơn chạm vào
 * đầu ca có thể miễn toàn bộ phần muộn của ca đó). Ta không khai thác điều đó —
 * số cuối cùng để HRM chốt.
 */

import { toMinutes } from './normalize';
import { CalendarDay, DayForm, LateEarly, TimesheetRules } from './types';

interface Window {
  start: number;
  end: number;
}

function overlap(window: Window, start: number, end: number): number {
  return Math.max(0, Math.min(window.end, end) - Math.max(window.start, start));
}

/**
 * Cửa sổ đi muộn của một ngày: từ giờ vào ca tới giờ vào thực tế (sau đơn đã duyệt).
 * Trả `null` nếu ngày đó không đi muộn.
 */
function lateWindow(day: CalendarDay, rules: TimesheetRules): Window | null {
  if (day.actual.minutesLate <= 0) return null;
  const start = toMinutes(rules.workStart);
  const end = toMinutes(day.timeInFinal ?? day.timeIn);
  if (start == null || end == null || end <= start) return null;
  return { start, end };
}

/** Cửa sổ về sớm: từ giờ ra thực tế (sau đơn đã duyệt) tới giờ tan ca. */
function earlyWindow(day: CalendarDay, rules: TimesheetRules): Window | null {
  if (day.actual.minutesEarly <= 0) return null;
  const start = toMinutes(day.timeOutFinal ?? day.timeOut);
  const end = toMinutes(rules.workEnd);
  if (start == null || end == null || end <= start) return null;
  return { start, end };
}

/** Số phút một đơn che được trong một cửa sổ. */
function minutesCoveredBy(form: DayForm, window: Window, isLate: boolean): number {
  let covered = 0;

  for (const interval of form.intervals) {
    const start = toMinutes(interval.start);
    const end = toMinutes(interval.end);
    if (start == null || end == null || end <= start) continue;
    covered += overlap(window, start, end);
  }

  // Đơn checkin/out khai một MỐC giờ, không phải khoảng. Mốc đó thay thế giờ
  // chấm công thiếu, nên nó che từ mốc tới hết cửa sổ (đi muộn: từ mốc trở đi;
  // về sớm: từ đầu cửa sổ tới mốc).
  for (const punch of form.punches) {
    const at = toMinutes(punch);
    if (at == null) continue;
    covered += isLate
      ? overlap(window, at, window.end)
      : overlap(window, window.start, at);
  }

  return covered;
}

/**
 * Chi tiết ước tính của một ngày — đủ để hiển thị "muộn 35p / đơn che 25p / còn 10p".
 */
export interface DayEstimate {
  date: string;
  actual: LateEarly;
  /** Số phút các đơn CHỜ DUYỆT che được. */
  covered: LateEarly;
  /** Còn lại nếu mọi đơn chờ duyệt được duyệt. */
  estimated: LateEarly;
  /** Có đơn chờ duyệt che được ít nhất 1 phút vi phạm không. */
  hasPendingCoverage: boolean;
}

export function estimateDay(
  day: CalendarDay,
  rules: TimesheetRules,
): DayEstimate {
  const pending = day.forms.filter((form) => !form.isApproved);

  let coveredLate = 0;
  let coveredEarly = 0;

  const late = lateWindow(day, rules);
  if (late) {
    for (const form of pending) {
      coveredLate += minutesCoveredBy(form, late, true);
    }
    coveredLate = Math.min(coveredLate, day.actual.minutesLate);
  }

  const early = earlyWindow(day, rules);
  if (early) {
    for (const form of pending) {
      coveredEarly += minutesCoveredBy(form, early, false);
    }
    coveredEarly = Math.min(coveredEarly, day.actual.minutesEarly);
  }

  return {
    date: day.date,
    actual: day.actual,
    covered: { minutesLate: coveredLate, minutesEarly: coveredEarly },
    estimated: {
      minutesLate: day.actual.minutesLate - coveredLate,
      minutesEarly: day.actual.minutesEarly - coveredEarly,
    },
    hasPendingCoverage: coveredLate > 0 || coveredEarly > 0,
  };
}

export interface MonthEstimate {
  actual: LateEarly;
  estimated: LateEarly;
  byDate: Map<string, DayEstimate>;
  /** Hạn mức miễn phạt của tháng, từ `minutes_early_late_allowed`. */
  allowedMinutes: number;
  /** Tổng ước tính vượt hạn mức bao nhiêu phút (0 nếu không vượt). */
  estimatedOverage: number;
}

export function estimateMonth(
  days: CalendarDay[],
  rules: TimesheetRules,
  /**
   * Tổng của HRM. Truyền vào vì `summary` là nguồn chuẩn — cộng tay từ `days`
   * có thể lệch nếu lưới calendar thiếu ngày.
   */
  actualTotal: LateEarly,
): MonthEstimate {
  const byDate = new Map<string, DayEstimate>();
  let coveredLate = 0;
  let coveredEarly = 0;

  for (const day of days) {
    const estimate = estimateDay(day, rules);
    byDate.set(day.date, estimate);
    coveredLate += estimate.covered.minutesLate;
    coveredEarly += estimate.covered.minutesEarly;
  }

  const estimated: LateEarly = {
    minutesLate: Math.max(0, actualTotal.minutesLate - coveredLate),
    minutesEarly: Math.max(0, actualTotal.minutesEarly - coveredEarly),
  };

  return {
    actual: actualTotal,
    estimated,
    byDate,
    allowedMinutes: rules.allowedMinutesPerMonth,
    estimatedOverage: Math.max(
      0,
      estimated.minutesLate +
        estimated.minutesEarly -
        rules.allowedMinutesPerMonth,
    ),
  };
}
