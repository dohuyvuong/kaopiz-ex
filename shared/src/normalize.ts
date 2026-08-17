/**
 * Chuẩn hoá response HRM → model nghiệp vụ.
 *
 * Chịu trách nhiệm hấp thụ mọi điểm bất nhất của HRM để phần còn lại của hệ
 * thống chỉ thấy MỘT shape duy nhất:
 * - `tracking_times` có 3 shape tuỳ loại đơn (khoảng / mốc / nhiều ngày)
 * - `reason_id` nằm ở cấp form HOẶC trong từng tracking time
 * - ngày trả về dạng ISO UTC, không được parse qua timezone máy client
 */

import {
  CalendarDay,
  DayForm,
  FORM_STATUS_APPROVED,
  ReasonLimit,
  TimesheetRules,
  TimeInterval,
  WorkKind,
} from './types';

/** Shape thô như API trả (đã camelCase hoá ở backend). Cố ý lỏng. */
interface RawTrackingTime {
  date?: string | Date | null;
  dateStart?: string | Date | null;
  dateEnd?: string | Date | null;
  timeStart?: string | null;
  timeEnd?: string | null;
  /** Đơn checkin/out: một mốc giờ duy nhất. */
  time?: string | null;
  reasonId?: number | null;
}

interface RawFormData {
  reasonId?: number | null;
  trackingTimes?: RawTrackingTime[] | null;
}

interface RawForm {
  id: number;
  typeId: number;
  /** Chỉ day-detail mới có. Calendar chỉ trả đơn đã duyệt. */
  status?: number;
  data?: RawFormData | null;
  type?: { id: number; name: string } | null;
}

interface RawTimesheetDay {
  /**
   * Backend trả `Date` (class-transformer đã parse), còn frontend nhận `string`
   * qua JSON. Nhận cả hai để một hàm chuẩn hoá dùng được ở cả hai phía.
   */
  date?: string | Date | null;
  timeIn?: string | null;
  timeOut?: string | null;
  timeInFinal?: string | null;
  timeOutFinal?: string | null;
  work?: string | null;
  symbol?: string | null;
  minutesLate?: number | null;
  minutesEarly?: number | null;
  approvedApplicationForms?: RawForm[] | null;
  logWork?: { timeSpentHour?: number } | null;
  logWorkDiff?: number | null;
  logWorkNeeded?: number | null;
}

/**
 * Lấy phần ngày "YYYY-MM-DD" mà KHÔNG đi qua timezone máy client.
 *
 * HRM trả "2026-04-16T00:00:00.000Z". Parse bằng `new Date()` rồi format theo giờ
 * địa phương sẽ ra ngày 15 ở mọi timezone âm. Ngày ở đây là nhãn lịch, không phải
 * một thời điểm — nên cắt chuỗi là đúng, không phải là mẹo.
 */
export function toDateKey(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : null;
}

/** "HH:mm" hoặc "HH:mm:ss" → số phút từ 00:00. `null` nếu không parse được. */
export function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Số phút từ 00:00 → "HH:mm". */
export function toTimeString(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const hours = Math.floor(clamped / 60);
  return `${String(hours).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
}

function normalizeWorkKind(work: string | null | undefined): WorkKind {
  return work === '1' || work === 'NL' ? work : 'N';
}

/**
 * Chuẩn hoá một đơn.
 *
 * @param dateKey Ngày đang xét. Đơn nghỉ có thể trải nhiều ngày (`dateStart`/
 *   `dateEnd`), ta chỉ giữ phần rơi vào ngày này.
 */
export function normalizeForm(raw: RawForm, dateKey: string): DayForm {
  const trackingTimes = raw.data?.trackingTimes ?? [];
  const intervals: TimeInterval[] = [];
  const punches: string[] = [];
  let reasonId = raw.data?.reasonId ?? null;

  for (const tracking of trackingTimes) {
    // reason_id có thể chỉ xuất hiện ở cấp tracking time.
    if (reasonId == null && tracking.reasonId != null) {
      reasonId = tracking.reasonId;
    }

    if (!coversDate(tracking, dateKey)) continue;

    // Đơn checkin/out: một mốc giờ, không phải khoảng.
    if (tracking.time) {
      punches.push(tracking.time);
      continue;
    }

    if (tracking.timeStart && tracking.timeEnd) {
      intervals.push({ start: tracking.timeStart, end: tracking.timeEnd });
    }
  }

  return {
    id: raw.id,
    typeId: raw.typeId,
    // Calendar API chỉ trả đơn đã duyệt và không kèm `status`.
    isApproved: raw.status == null ? true : raw.status === FORM_STATUS_APPROVED,
    reasonId,
    typeName: raw.type?.name ?? null,
    intervals,
    punches,
  };
}

/**
 * Tracking time này có áp dụng cho ngày đang xét không.
 *
 * Không có thông tin ngày nào cả (`date`, `dateStart`, `dateEnd` đều trống) thì
 * coi là thuộc về ngày đang xét — đơn một ngày thường bỏ trống các field này.
 */
function coversDate(tracking: RawTrackingTime, dateKey: string): boolean {
  const single = toDateKey(tracking.date);
  if (single) return single === dateKey;

  const start = toDateKey(tracking.dateStart);
  const end = toDateKey(tracking.dateEnd);
  if (start && end) return start <= dateKey && dateKey <= end;
  if (start) return start === dateKey;
  if (end) return end === dateKey;

  return true;
}

/** Chuẩn hoá một ngày từ `timelines` của calendar API. */
export function normalizeCalendarDay(raw: RawTimesheetDay): CalendarDay | null {
  const date = toDateKey(raw.date);
  if (!date) return null;

  return {
    date,
    work: normalizeWorkKind(raw.work),
    timeIn: raw.timeIn ?? null,
    timeOut: raw.timeOut ?? null,
    timeInFinal: raw.timeInFinal ?? null,
    timeOutFinal: raw.timeOutFinal ?? null,
    actual: {
      minutesLate: raw.minutesLate ?? 0,
      minutesEarly: raw.minutesEarly ?? 0,
    },
    forms: (raw.approvedApplicationForms ?? []).map((form) =>
      normalizeForm(form, date),
    ),
    symbol: raw.symbol ?? null,
    logWork: raw.logWork
      ? {
          hours: raw.logWork.timeSpentHour ?? 0,
          diff: raw.logWorkDiff ?? 0,
          needed: raw.logWorkNeeded ?? 0,
        }
      : null,
  };
}

/**
 * Gộp đơn từ day-detail vào một ngày đã có từ calendar.
 *
 * Day-detail trả CẢ đơn đã duyệt lẫn chờ duyệt, calendar chỉ trả đã duyệt — nên
 * day-detail là nguồn đầy đủ hơn và được ưu tiên khi trùng `id`.
 */
export function mergeDayDetailForms(
  day: CalendarDay,
  detailForms: RawForm[],
): CalendarDay {
  const normalized = detailForms.map((form) => normalizeForm(form, day.date));
  const fromDetail = new Set(normalized.map((form) => form.id));
  const kept = day.forms.filter((form) => !fromDetail.has(form.id));

  return { ...day, forms: [...kept, ...normalized] };
}

/**
 * Dựng một ngày CHỈ từ day-detail, không có dữ liệu calendar.
 *
 * Dùng cho ngày nằm ngoài tháng đang xem nhưng vẫn thuộc lưới calendar: API
 * calendar chỉ trả các ngày trong tháng, trong khi quota đơn tính theo TUẦN nên
 * tuần vắt qua hai tháng vẫn phải đếm đủ. Không có `work` nên đặt 'N' để ngày
 * này không bao giờ bị chọn làm ứng viên tạo đơn — nó chỉ góp mặt để đếm quota.
 */
export function createDayFromDetail(
  dateKey: string,
  detailForms: RawForm[],
): CalendarDay {
  return {
    date: dateKey,
    work: 'N',
    timeIn: null,
    timeOut: null,
    timeInFinal: null,
    timeOutFinal: null,
    actual: { minutesLate: 0, minutesEarly: 0 },
    forms: detailForms.map((form) => normalizeForm(form, dateKey)),
    symbol: null,
    logWork: null,
  };
}

interface RawReason {
  id: number;
  name: string;
  data?: {
    maxTimesInWeek?: number | null;
    maxMinutesInDay?: number | null;
    needLogWork?: number | null;
    max_times_in_week?: number | null;
    max_minutes_in_day?: number | null;
    need_log_work?: number | null;
  } | null;
}

/** Chuẩn hoá `GET /master/all-reasons`, chấp nhận cả snake_case lẫn camelCase. */
export function normalizeReasonLimit(raw: RawReason): ReasonLimit {
  const data = raw.data ?? {};
  const pick = (
    camel: number | null | undefined,
    snake: number | null | undefined,
  ) => camel ?? snake ?? null;

  return {
    id: raw.id,
    name: raw.name,
    maxTimesInWeek: pick(data.maxTimesInWeek, data.max_times_in_week),
    maxMinutesInDay: pick(data.maxMinutesInDay, data.max_minutes_in_day),
    needLogWork: (pick(data.needLogWork, data.need_log_work) ?? 0) === 1,
  };
}

interface RawWorkingTime {
  workStart?: string | null;
  workEnd?: string | null;
  workingHoursPerDay?: number | null;
  lunchBreakTime?: number | null;
  minutesEarlyLateAllowed?: number | null;
}

/**
 * Dựng bộ ràng buộc từ dữ liệu HRM.
 *
 * Các giá trị mặc định chỉ là lưới an toàn khi API thiếu field — không phải
 * "rule". Rule thật luôn đến từ HRM.
 */
export function buildRules(input: {
  workingTime?: RawWorkingTime | null;
  reasons?: RawReason[];
  maxDaysAfterByType?: Array<{ typeId: number; maxDaysAfter: number }>;
  defaultMaxDaysAfter?: number;
}): TimesheetRules {
  const workingTime = input.workingTime ?? {};

  return {
    workStart: workingTime.workStart || '08:30',
    workEnd: workingTime.workEnd || '17:30',
    workingHoursPerDay: workingTime.workingHoursPerDay ?? 8,
    lunchBreakMinutes: workingTime.lunchBreakTime ?? 60,
    allowedMinutesPerMonth: workingTime.minutesEarlyLateAllowed ?? 90,
    reasonLimits: new Map(
      (input.reasons ?? []).map((reason) => {
        const limit = normalizeReasonLimit(reason);
        return [limit.id, limit];
      }),
    ),
    maxDaysAfterByType: new Map(
      (input.maxDaysAfterByType ?? []).map((entry) => [
        entry.typeId,
        entry.maxDaysAfter,
      ]),
    ),
    // HRM đang cấu hình 6 ngày sau + chính ngày đó = hạn 7 ngày.
    defaultMaxDaysAfter: input.defaultMaxDaysAfter ?? 6,
  };
}
