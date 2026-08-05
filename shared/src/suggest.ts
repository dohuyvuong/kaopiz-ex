/**
 * Gợi ý các đơn cần tạo để kéo tổng đi muộn + về sớm của tháng về dưới hạn mức.
 *
 * Thứ tự ưu tiên bám theo CHI PHÍ với người dùng:
 *
 *   1. Đơn vắng mặt "Thay đổi thời gian làm việc" — KHÔNG tốn phép năm, nhưng bị
 *      HRM giới hạn số lần/tuần và số phút/lần.
 *   2. Đơn xin nghỉ phép năm — không giới hạn nhưng TỐN PHÉP, chỉ dùng cho phần
 *      còn dư.
 *
 * Chỉ tạo đủ để chạm hạn mức, không tạo thừa: mỗi đơn đều tốn công người duyệt.
 *
 * Khác bản cũ ở hai điểm cốt lõi:
 * - Mỗi gợi ý mang sẵn `covers: 'late' | 'early'`. Bản cũ suy ngược ra điều này
 *   bằng cách dò chữ trong câu mô tả tiếng Việt, và dò sai vì lệch hoa/thường.
 * - Khoảng thời gian đề xuất được tính bằng cách TRỪ đi phần đã có đơn, nên hai
 *   đơn trong cùng một ngày không chồng lên nhau (vd xin muộn 08:30–09:30 rồi
 *   xin nghỉ tiếp 09:30–10:00).
 */

import { estimateDay } from './estimate';
import { toMinutes, toTimeString } from './normalize';
import {
  countReasonUsageInWeek,
  daysBetween,
  hasEnoughWorkHours,
  startOfWorkWeek,
} from './rules';
import { CalendarDay, FormType, Reason, TimesheetRules } from './types';

export interface SuggestedForm {
  date: string;
  typeId: number;
  reasonId: number;
  timeStart: string;
  timeEnd: string;
  /** Số phút đơn này che được. */
  minutes: number;
  /** Che phần đi muộn hay về sớm — nói thẳng, không suy từ mô tả. */
  covers: 'late' | 'early';
  /** Câu mô tả gửi kèm đơn. Chỉ để người đọc, KHÔNG dùng để phân loại. */
  description: string;
  /** True nếu đơn này tốn phép năm. */
  usesAnnualLeave: boolean;
}

export interface SuggestionResult {
  forms: SuggestedForm[];
  /** Tổng ước tính hiện tại (đã trừ đơn chờ duyệt). */
  currentTotal: number;
  allowedTotal: number;
  /** Số phút vượt hạn mức TRƯỚC khi áp các gợi ý. */
  overageBefore: number;
  /** Số phút đơn vắng mặt che được — không tốn phép năm. */
  absenceMinutes: number;
  /** Số phút phải dùng phép năm. */
  leaveMinutes: number;
  /** Tổng số phút các gợi ý che được. */
  coveredMinutes: number;
  /** Tổng dự kiến sau khi tạo và duyệt hết các gợi ý. */
  projectedTotal: number;
  /**
   * Số phút vẫn vượt hạn mức sau khi đã dùng hết cách. Khác 0 nghĩa là hết
   * quota tuần, hết ngày hợp lệ, hoặc đã quá hạn nộp đơn.
   */
  uncoveredMinutes: number;
}

interface Segment {
  start: number;
  end: number;
}

/** Phần của `window` chưa bị các khoảng trong `occupied` chiếm. */
function freeSegments(window: Segment, occupied: Segment[]): Segment[] {
  const sorted = occupied
    .map((segment) => ({
      start: Math.max(segment.start, window.start),
      end: Math.min(segment.end, window.end),
    }))
    .filter((segment) => segment.end > segment.start)
    .sort((a, b) => a.start - b.start);

  const free: Segment[] = [];
  let cursor = window.start;

  for (const segment of sorted) {
    if (segment.start > cursor) free.push({ start: cursor, end: segment.start });
    cursor = Math.max(cursor, segment.end);
  }
  if (cursor < window.end) free.push({ start: cursor, end: window.end });

  return free;
}

/** Mọi khoảng đã bị đơn (đã duyệt lẫn chờ duyệt) chiếm trong ngày. */
function occupiedSegments(day: CalendarDay): Segment[] {
  const segments: Segment[] = [];
  for (const form of day.forms) {
    for (const interval of form.intervals) {
      const start = toMinutes(interval.start);
      const end = toMinutes(interval.end);
      if (start != null && end != null && end > start) {
        segments.push({ start, end });
      }
    }
  }
  return segments;
}

interface Candidate {
  day: CalendarDay;
  covers: 'late' | 'early';
  /** Các khoảng còn trống có thể làm đơn, đã trừ đơn sẵn có. */
  free: Segment[];
  /** Số phút vi phạm còn lại của chiều này. */
  remaining: number;
}

function buildCandidates(
  days: CalendarDay[],
  rules: TimesheetRules,
): Candidate[] {
  const workStart = toMinutes(rules.workStart);
  const workEnd = toMinutes(rules.workEnd);
  const candidates: Candidate[] = [];

  for (const day of days) {
    if (day.work !== '1') continue;

    const estimate = estimateDay(day, rules);
    const occupied = occupiedSegments(day);

    if (estimate.estimated.minutesLate > 0 && workStart != null) {
      const end = toMinutes(day.timeInFinal ?? day.timeIn);
      if (end != null && end > workStart) {
        candidates.push({
          day,
          covers: 'late',
          free: freeSegments({ start: workStart, end }, occupied),
          remaining: estimate.estimated.minutesLate,
        });
      }
    }

    if (estimate.estimated.minutesEarly > 0 && workEnd != null) {
      const start = toMinutes(day.timeOutFinal ?? day.timeOut);
      if (start != null && start < workEnd) {
        candidates.push({
          day,
          covers: 'early',
          free: freeSegments({ start, end: workEnd }, occupied),
          remaining: estimate.estimated.minutesEarly,
        });
      }
    }
  }

  // Ngày vi phạm nhiều nhất trước: đơn vắng mặt bị chặn trần phút nên dùng vào
  // ngày nặng sẽ tiết kiệm được nhiều phép năm hơn.
  return candidates.sort((a, b) => b.remaining - a.remaining);
}

/**
 * Lấy một khoảng dài tối đa `maxMinutes` từ các khoảng trống, ưu tiên khoảng dài
 * nhất. Đơn vắng mặt che đầu ca thì lấy từ đầu, che cuối ca thì lấy từ cuối —
 * để đơn nằm sát mốc vi phạm.
 */
function takeSegment(
  free: Segment[],
  maxMinutes: number,
  covers: 'late' | 'early',
): Segment | null {
  const longest = free.reduce<Segment | null>(
    (best, segment) =>
      best == null || segment.end - segment.start > best.end - best.start
        ? segment
        : best,
    null,
  );
  if (!longest) return null;

  const available = longest.end - longest.start;
  const minutes = Math.min(available, maxMinutes);
  if (minutes <= 0) return null;

  return covers === 'late'
    ? { start: longest.start, end: longest.start + minutes }
    : { start: longest.end - minutes, end: longest.end };
}

/** Bỏ `used` khỏi danh sách khoảng trống. */
function consume(free: Segment[], used: Segment): Segment[] {
  return free.flatMap((segment) => freeSegments(segment, [used]));
}

/**
 * Khoảng giờ gợi ý sẵn khi người dùng mở form tạo đơn cho một ngày.
 *
 * Lấy chiều vi phạm nặng hơn, rồi lấy khoảng trống đầu tiên chưa bị đơn nào
 * chiếm — nên mở form nhiều lần sẽ đề xuất các khoảng nối tiếp nhau thay vì lặp
 * lại cùng một khoảng đã có đơn.
 */
export function suggestIntervalForDay(
  day: CalendarDay,
  rules: TimesheetRules,
  options: { maxMinutes?: number } = {},
): { covers: 'late' | 'early'; timeStart: string; timeEnd: string } | null {
  const candidates = buildCandidates([day], rules);
  if (candidates.length === 0) return null;

  const candidate = candidates[0];
  const cap = Math.min(
    options.maxMinutes ?? Number.POSITIVE_INFINITY,
    candidate.remaining,
  );
  const segment = takeSegment(candidate.free, cap, candidate.covers);
  if (!segment) return null;

  return {
    covers: candidate.covers,
    timeStart: toTimeString(segment.start),
    timeEnd: toTimeString(segment.end),
  };
}

export interface SuggestOptions {
  days: CalendarDay[];
  rules: TimesheetRules;
  /** Tổng thực tế của tháng, từ `summary` của HRM. */
  actualTotal: { minutesLate: number; minutesEarly: number };
  /** Hôm nay dạng "YYYY-MM-DD". Truyền vào để test được. */
  today: string;
}

export function suggestForms(options: SuggestOptions): SuggestionResult {
  const { days, rules, actualTotal, today } = options;
  const daysByDate = new Map(days.map((day) => [day.date, day]));

  // Tổng hiện tại đã tính cả đơn đang chờ duyệt như thể sẽ được duyệt.
  let pendingCovered = 0;
  for (const day of days) {
    const estimate = estimateDay(day, rules);
    pendingCovered +=
      estimate.covered.minutesLate + estimate.covered.minutesEarly;
  }
  const currentTotal = Math.max(
    0,
    actualTotal.minutesLate + actualTotal.minutesEarly - pendingCovered,
  );

  const allowedTotal = rules.allowedMinutesPerMonth;

  const result: SuggestionResult = {
    forms: [],
    currentTotal,
    allowedTotal,
    overageBefore: Math.max(0, currentTotal - allowedTotal),
    absenceMinutes: 0,
    leaveMinutes: 0,
    coveredMinutes: 0,
    projectedTotal: currentTotal,
    uncoveredMinutes: Math.max(0, currentTotal - allowedTotal),
  };

  const candidates = buildCandidates(days, rules);
  const absenceLimit = rules.reasonLimits.get(Reason.SHIFT_ADJUSTMENT);
  const maxPerAbsence = absenceLimit?.maxMinutesInDay ?? 60;
  const maxAbsencePerWeek = absenceLimit?.maxTimesInWeek ?? 2;

  /** Quota đơn vắng mặt của từng tuần: tính cả đơn đã có lẫn đơn ta vừa đề xuất. */
  const absenceUsedByWeek = new Map<string, number>();
  const absenceQuotaLeft = (dateKey: string): number => {
    const week = startOfWorkWeek(dateKey);
    if (!absenceUsedByWeek.has(week)) {
      absenceUsedByWeek.set(
        week,
        countReasonUsageInWeek(daysByDate, dateKey, Reason.SHIFT_ADJUSTMENT),
      );
    }
    return maxAbsencePerWeek - (absenceUsedByWeek.get(week) ?? 0);
  };

  const emit = (
    candidate: Candidate,
    segment: Segment,
    typeId: number,
    reasonId: number,
  ) => {
    const minutes = segment.end - segment.start;
    const label = candidate.covers === 'late' ? 'đi muộn' : 'về sớm';
    result.forms.push({
      date: candidate.day.date,
      typeId,
      reasonId,
      timeStart: toTimeString(segment.start),
      timeEnd: toTimeString(segment.end),
      minutes,
      covers: candidate.covers,
      description:
        typeId === FormType.ABSENCE
          ? `Thay đổi thời gian làm việc (${label} ${candidate.remaining} phút)`
          : `Nghỉ phép năm (${label} ${candidate.remaining} phút)`,
      usesAnnualLeave: typeId === FormType.LEAVE,
    });
    candidate.free = consume(candidate.free, segment);
    candidate.remaining -= minutes;
    result.coveredMinutes += minutes;
    if (typeId === FormType.ABSENCE) result.absenceMinutes += minutes;
    else result.leaveMinutes += minutes;
  };

  /** Ngày còn trong hạn nộp đơn của loại này không. */
  const withinDeadline = (dateKey: string, typeId: number): boolean => {
    const maxDaysAfter = rules.maxDaysAfterByType.get(typeId);
    if (maxDaysAfter == null) return true;
    return daysBetween(dateKey, today) <= maxDaysAfter + 1;
  };

  /*
   * Vòng 1 — đơn vắng mặt, dùng TỐI ĐA hạn mức tuần.
   *
   * Đây là quyền lợi cấp theo tuần và hết hạn: không dùng là mất, mà mất rồi
   * thì phần đi muộn / về sớm của những tuần sau chỉ còn cách bù bằng phép năm.
   * Vì vậy KHÔNG dừng lại khi tháng đã đủ dưới hạn mức — cứ tận dụng hết, phần
   * dư ra là đệm cho những ngày muộn phát sinh về sau.
   *
   * Mỗi ngày tối đa một đơn, vì `max_minutes_in_day` giới hạn theo NGÀY chứ
   * không theo từng đơn.
   */
  const absenceDays = new Set<string>();
  for (const candidate of candidates) {
    const date = candidate.day.date;
    if (absenceDays.has(date)) continue;
    if (!withinDeadline(date, FormType.ABSENCE)) continue;
    if (absenceQuotaLeft(date) <= 0) continue;
    if (!hasEnoughWorkHours(candidate.day, rules)) continue;

    const cap = Math.min(maxPerAbsence, candidate.remaining);
    const segment = takeSegment(candidate.free, cap, candidate.covers);
    if (!segment) continue;

    emit(candidate, segment, FormType.ABSENCE, Reason.SHIFT_ADJUSTMENT);
    absenceDays.add(date);

    const week = startOfWorkWeek(date);
    absenceUsedByWeek.set(week, (absenceUsedByWeek.get(week) ?? 0) + 1);
  }

  /*
   * Vòng 2 — nghỉ phép năm, CHỈ cho phần còn vượt hạn mức.
   *
   * Ngược với vòng 1: phép năm là tài nguyên tốn kém nên chỉ tiêu đúng phần bắt
   * buộc, không tiêu trước phòng xa.
   */
  let leaveNeeded = Math.max(
    0,
    currentTotal - result.absenceMinutes - allowedTotal,
  );

  for (const candidate of candidates) {
    if (leaveNeeded <= 0) break;
    if (candidate.remaining <= 0) continue;
    if (!withinDeadline(candidate.day.date, FormType.LEAVE)) continue;

    const cap = Math.min(candidate.remaining, leaveNeeded);
    const segment = takeSegment(candidate.free, cap, candidate.covers);
    if (!segment) continue;

    const before = result.leaveMinutes;
    emit(candidate, segment, FormType.LEAVE, Reason.ANNUAL_LEAVE);
    leaveNeeded -= result.leaveMinutes - before;
  }

  result.projectedTotal = Math.max(0, currentTotal - result.coveredMinutes);
  result.uncoveredMinutes = Math.max(0, result.projectedTotal - allowedTotal);
  return result;
}
