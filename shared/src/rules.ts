/**
 * Kiểm tra ràng buộc khi tạo đơn.
 *
 * NGUYÊN TẮC: mọi thứ ở đây đều là CẢNH BÁO, không chặn. HRM mới là nơi quyết
 * định đơn có hợp lệ hay không — nó biết những thứ ta không biết (đơn ở tháng
 * khác, cấu hình riêng, ngoại lệ do quản lý duyệt). Ta đoán sai mà chặn thì
 * người dùng không làm được việc; ta đoán sai mà cảnh báo thì họ chỉ phải đọc
 * thêm một dòng. Nếu HRM từ chối, hiển thị nguyên văn lỗi của HRM.
 */

import { toMinutes } from './normalize';
import { CalendarDay, DayForm, Reason, TimesheetRules } from './types';

export type WarningCode =
  | 'reason-week-limit'
  | 'reason-minutes-limit'
  | 'submission-deadline'
  | 'insufficient-work-hours'
  | 'overlapping-form';

export interface RuleWarning {
  code: WarningCode;
  message: string;
}

/**
 * Đầu tuần theo thứ Hai.
 *
 * Không dùng `dayjs().startOf('week')`: mặc định của dayjs là Chủ nhật, lệch một
 * ngày so với tuần làm việc của Kaopiz và so với chính lưới calendar (T2→CN).
 * Tính tay trên chuỗi "YYYY-MM-DD" để khỏi phụ thuộc locale.
 */
export function startOfWorkWeek(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  // getUTCDay: 0 = CN, 1 = T2 … 6 = T7. Lùi về thứ Hai gần nhất.
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

/** Bảy ngày của tuần chứa `dateKey`, thứ Hai → Chủ nhật. */
export function workWeekDates(dateKey: string): string[] {
  const monday = new Date(`${startOfWorkWeek(dateKey)}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + index);
    return day.toISOString().slice(0, 10);
  });
}

/** Chênh lệch số ngày giữa hai nhãn ngày, không đi qua timezone. */
export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

/**
 * Số ngày còn được nộp đơn cho một ngày, tính cả chính ngày đó.
 *
 * HRM cấu hình `max_days_after` (số ngày SAU ngày áp dụng), nên hạn thực tế là
 * `max_days_after + 1`. Ví dụ cấu hình 6 → đơn cho ngày 27/07 nộp muộn nhất
 * ngày 03/08.
 */
export function submissionDeadlineDays(
  rules: TimesheetRules,
  typeId: number,
): number {
  return (
    (rules.maxDaysAfterByType.get(typeId) ?? rules.defaultMaxDaysAfter) + 1
  );
}

/**
 * Ngày làm việc đã kết thúc chưa — có lần chấm công nào sau giờ tan ca không.
 *
 * Dùng để không gợi ý đơn cho ngày HÔM NAY khi người dùng còn đang làm: số phút
 * về sớm lúc này chỉ là tạm, ở lại thêm là tự hết.
 */
export function hasWorkdayEnded(
  day: CalendarDay,
  rules: TimesheetRules,
): boolean {
  const timeOut = toMinutes(day.timeOut);
  const workEnd = toMinutes(rules.workEnd);
  if (timeOut == null || workEnd == null) return false;
  return timeOut > workEnd;
}

/**
 * Đếm số lần đã dùng một lý do trong tuần chứa `dateKey`.
 * Tính cả đơn chờ duyệt — chúng vẫn chiếm chỗ.
 */
export function countReasonUsageInWeek(
  daysByDate: Map<string, CalendarDay>,
  dateKey: string,
  reasonId: number,
  options: { excludeFormIds?: ReadonlySet<number> } = {},
): number {
  const exclude = options.excludeFormIds ?? new Set<number>();
  let count = 0;

  for (const date of workWeekDates(dateKey)) {
    const day = daysByDate.get(date);
    if (!day) continue;
    for (const form of day.forms) {
      if (form.reasonId === reasonId && !exclude.has(form.id)) count += 1;
    }
  }

  return count;
}

/**
 * Ngày đó đã làm đủ số giờ yêu cầu chưa — điều kiện của lý do "Thay đổi thời
 * gian làm việc (Vẫn đảm bảo đủ 8 tiếng)".
 *
 * Chấp nhận theo HAI cách, chỉ cần thoả một:
 * - Giờ làm hiệu quả (`timeOut − timeIn − nghỉ trưa`) đạt đủ định mức, HOẶC
 * - Về muộn bù đủ số phút đã đi muộn (`timeOut − workEnd ≥ minutesLate`)
 */
export function hasEnoughWorkHours(
  day: CalendarDay,
  rules: TimesheetRules,
): boolean {
  const timeIn = toMinutes(day.timeIn);
  const timeOut = toMinutes(day.timeOut);
  if (timeIn == null || timeOut == null) return false;

  const effective = timeOut - timeIn - rules.lunchBreakMinutes;
  if (effective >= rules.workingHoursPerDay * 60) return true;

  const workEnd = toMinutes(rules.workEnd);
  if (workEnd == null) return false;
  return timeOut - workEnd >= day.actual.minutesLate;
}

/** Hai khoảng "HH:mm" có giao nhau không. */
export function intervalsOverlap(
  a: { start: string; end: string },
  b: { start: string; end: string },
): boolean {
  const aStart = toMinutes(a.start);
  const aEnd = toMinutes(a.end);
  const bStart = toMinutes(b.start);
  const bEnd = toMinutes(b.end);
  if (aStart == null || aEnd == null || bStart == null || bEnd == null) {
    return false;
  }
  return aStart < bEnd && aEnd > bStart;
}

export interface DraftForm {
  date: string;
  typeId: number;
  reasonId: number | null;
  timeStart: string;
  timeEnd: string;
  /** Đơn đang sửa — không tự tính nó là trùng với chính nó. */
  editingFormId?: number;
}

/**
 * Soát một đơn sắp tạo và trả về mọi cảnh báo áp dụng được.
 * Danh sách rỗng nghĩa là không thấy vấn đề gì — KHÔNG đảm bảo HRM sẽ chấp nhận.
 */
export function checkDraftForm(
  draft: DraftForm,
  context: {
    daysByDate: Map<string, CalendarDay>;
    rules: TimesheetRules;
    /** Hôm nay dạng "YYYY-MM-DD". Truyền vào để test được, không gọi `new Date()`. */
    today: string;
  },
): RuleWarning[] {
  const { daysByDate, rules, today } = context;
  const warnings: RuleWarning[] = [];
  const day = daysByDate.get(draft.date);
  const limit =
    draft.reasonId != null ? rules.reasonLimits.get(draft.reasonId) : undefined;

  const excludeFormIds = new Set(
    draft.editingFormId != null ? [draft.editingFormId] : [],
  );

  // 1. Số lần dùng lý do trong tuần, vd lý do 21 tối đa 2 lần/tuần.
  if (limit?.maxTimesInWeek != null && draft.reasonId != null) {
    const used = countReasonUsageInWeek(daysByDate, draft.date, draft.reasonId, {
      excludeFormIds,
    });
    if (used >= limit.maxTimesInWeek) {
      warnings.push({
        code: 'reason-week-limit',
        message:
          `Tuần này đã dùng ${used}/${limit.maxTimesInWeek} lần lý do ` +
          `"${limit.name}". Tạo thêm có thể bị HRM từ chối.`,
      });
    }
  }

  // 2. Số phút tối đa mỗi lần, vd lý do 21 không quá 60 phút.
  const minutes = durationMinutes(draft.timeStart, draft.timeEnd);
  if (limit?.maxMinutesInDay != null && minutes != null) {
    if (minutes > limit.maxMinutesInDay) {
      warnings.push({
        code: 'reason-minutes-limit',
        message:
          `Đơn dài ${minutes} phút, vượt mức ${limit.maxMinutesInDay} phút ` +
          `mỗi lần của lý do "${limit.name}".`,
      });
    }
  }

  // 3. Hạn nộp đơn tính từ ngày áp dụng. Chỉ CẢNH BÁO — người dùng tự tạo đơn
  // thì không chặn, HRM mới là nơi quyết định.
  const deadline = submissionDeadlineDays(rules, draft.typeId);
  const elapsed = daysBetween(draft.date, today);
  if (elapsed > deadline) {
    warnings.push({
      code: 'submission-deadline',
      message:
        `Đã quá ${elapsed} ngày kể từ ${draft.date}, hạn nộp là ${deadline} ngày. ` +
        `HRM có thể từ chối đơn này.`,
    });
  }

  // 4. Điều kiện đủ giờ làm.
  //
  // Chỉ lý do 21 yêu cầu điều này — nó nằm ngay trong tên lý do phía HRM:
  // "Thay đổi thời gian làm việc (Vẫn đảm bảo đủ 8 tiếng)". Không có field dữ
  // liệu nào biểu diễn ràng buộc đó, nên phải nhận diện theo id thay vì suy ra
  // từ tổ hợp `maxMinutesInDay` + `needLogWork` như trước — tổ hợp ấy đúng một
  // cách tình cờ và sẽ sai khi HRM thêm lý do mới.
  if (
    day &&
    draft.reasonId === Reason.SHIFT_ADJUSTMENT &&
    !hasEnoughWorkHours(day, rules)
  ) {
    warnings.push({
      code: 'insufficient-work-hours',
      message:
        `Ngày ${draft.date} có thể chưa đủ ${rules.workingHoursPerDay} tiếng làm việc ` +
        `(đã trừ ${rules.lunchBreakMinutes} phút nghỉ trưa), trong khi lý do ` +
        `"${limit?.name ?? 'Thay đổi thời gian làm việc'}" yêu cầu đủ giờ.`,
    });
  }

  // 5. Trùng giờ với đơn đã có trong ngày.
  if (day) {
    const overlapping = day.forms.filter(
      (form) =>
        !excludeFormIds.has(form.id) &&
        form.intervals.some((interval) =>
          intervalsOverlap(interval, {
            start: draft.timeStart,
            end: draft.timeEnd,
          }),
        ),
    );
    if (overlapping.length > 0) {
      warnings.push({
        code: 'overlapping-form',
        message: `Trùng thời gian với ${describeForms(overlapping)} đã có trong ngày.`,
      });
    }
  }

  return warnings;
}

function durationMinutes(start: string, end: string): number | null {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null || to <= from) return null;
  return to - from;
}

function describeForms(forms: DayForm[]): string {
  const names = forms.map((form) => form.typeName ?? `đơn #${form.id}`);
  return names.join(', ');
}
