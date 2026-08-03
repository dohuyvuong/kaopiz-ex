/**
 * Model nghiệp vụ chấm công — thuần TypeScript, không dính React, không gọi API.
 *
 * Nguyên tắc:
 * - Mọi ràng buộc (90 phút, 2 đơn/tuần, 60 phút/đơn, 8 tiếng, hạn nộp) đều là DỮ LIỆU
 *   lấy từ HRM, không hardcode. Xem `TimesheetRules`.
 * - `actual` là số HRM trả về (đã trừ đơn ĐÃ DUYỆT). `estimated` là số ta tự tính
 *   thêm cho đơn CHỜ DUYỆT. Hai thứ không trộn vào nhau.
 */

/** Loại đơn HRM — `GET /master/all-types` */
export const FormType = {
  LEAVE: 1,
  ABSENCE: 2,
  OVERTIME: 3,
  CHECK_IN_OUT: 4,
  SPECIAL_REGIME: 5,
  SHIFT_CHANGE: 6,
} as const;

export type FormTypeId = (typeof FormType)[keyof typeof FormType];

/**
 * Trạng thái đơn. HRM dùng số: 1 = chờ duyệt bước 1, 2 = chờ duyệt bước 2,
 * 3 = đã duyệt. Ta chỉ quan tâm đã duyệt hay chưa.
 */
export const FORM_STATUS_APPROVED = 3;

/**
 * Một đơn đã được chuẩn hoá về một shape duy nhất.
 *
 * HRM trả `tracking_times` theo BA shape khác nhau tuỳ loại đơn:
 * - nghỉ (1):        `{ date_start, date_end, time_start, time_end }`
 * - vắng mặt (2):    `{ date, time_start, time_end }`
 * - checkin/out (4): `{ date, time }`  ← một MỐC giờ, không phải khoảng
 *
 * `reason_id` cũng nằm khi thì ở cấp form (`data.reason_id`), khi thì trong từng
 * `tracking_times[]`. Chuẩn hoá gộp cả hai.
 */
export interface DayForm {
  id: number;
  typeId: number;
  /** Đã duyệt chưa. Calendar API chỉ trả đơn đã duyệt nên luôn true ở đó. */
  isApproved: boolean;
  /** Lý do — quyết định ràng buộc áp dụng (vd 21 = thay đổi giờ làm, 2 lần/tuần). */
  reasonId: number | null;
  /** Tên loại đơn nếu API trả về, để hiển thị mà không cần bảng tra cứu. */
  typeName: string | null;
  /** Các khoảng thời gian đơn xin nghỉ/vắng trong NGÀY đang xét. */
  intervals: TimeInterval[];
  /** Mốc giờ đơn checkin/out khai bổ sung (type 4). */
  punches: string[];
}

/** Khoảng "HH:mm" – "HH:mm" trong cùng một ngày. */
export interface TimeInterval {
  start: string;
  end: string;
}

/** Số phút đi muộn / về sớm. */
export interface LateEarly {
  minutesLate: number;
  minutesEarly: number;
}

/** Ngày làm việc: '1' = ngày làm, 'N' = nghỉ tuần, 'NL' = nghỉ lễ. */
export type WorkKind = '1' | 'N' | 'NL';

export interface CalendarDay {
  /** "YYYY-MM-DD" — luôn là ngày theo lịch địa phương, không phải ISO UTC. */
  date: string;
  work: WorkKind;

  /** Giờ chấm công thô từ máy. */
  timeIn: string | null;
  timeOut: string | null;
  /** Giờ sau khi HRM áp dụng các đơn ĐÃ DUYỆT. */
  timeInFinal: string | null;
  timeOutFinal: string | null;

  /** Số phút vi phạm HRM tính — ĐÃ trừ đơn đã duyệt. */
  actual: LateEarly;

  /** Mọi đơn của ngày này, đã duyệt lẫn chờ duyệt. */
  forms: DayForm[];

  /** Ký hiệu HRM ("V", "P", "I/O,V", …) — chỉ để hiển thị. */
  symbol: string | null;

  logWork: { hours: number; diff: number; needed: number } | null;
}

/**
 * Ràng buộc lấy từ HRM, không hardcode.
 * - `workingTime` từ `GET /timesheet/calendar`
 * - `reasonLimits` từ `GET /master/all-reasons`
 * - `formDeadlines` từ `user.application_form_config` trong calendar
 */
export interface TimesheetRules {
  workStart: string;
  workEnd: string;
  /** `working_hours_per_day` — số giờ phải làm đủ trong ngày. */
  workingHoursPerDay: number;
  /** `lunch_break_time` — phút nghỉ trưa, không tính vào giờ làm. */
  lunchBreakMinutes: number;
  /** `minutes_early_late_allowed` — hạn mức muộn+sớm miễn phạt mỗi THÁNG. */
  allowedMinutesPerMonth: number;
  /** reasonId → ràng buộc của lý do đó. */
  reasonLimits: Map<number, ReasonLimit>;
  /** typeId → số ngày còn được nộp đơn sau ngày áp dụng. */
  maxDaysAfterByType: Map<number, number>;
}

export interface ReasonLimit {
  id: number;
  name: string;
  /** `max_times_in_week` — vd lý do 21 chỉ 2 lần/tuần. */
  maxTimesInWeek: number | null;
  /** `max_minutes_in_day` — vd lý do 21 tối đa 60 phút/lần. */
  maxMinutesInDay: number | null;
  needLogWork: boolean;
}

/** Lý do HRM quen dùng. Chỉ là hằng số tra cứu — ràng buộc vẫn đọc từ API. */
export const Reason = {
  /** Nghỉ phép năm (type 1) — tốn phép. */
  ANNUAL_LEAVE: 4,
  /** OT hôm trước sau 21:00, cho phép đi muộn 30' (type 2) — không tốn phép. */
  PREVIOUS_DAY_OT: 20,
  /** Thay đổi thời gian làm việc (type 2) — không tốn phép, 2 lần/tuần. */
  SHIFT_ADJUSTMENT: 21,
} as const;
