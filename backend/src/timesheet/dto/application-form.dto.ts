import { Expose, Type } from 'class-transformer';

/**
 * DTO đơn từ dùng chung cho cả `/timesheet/calendar` và `/timesheet/day-detail`.
 *
 * Trước đây hai endpoint có hai bản DTO riêng và lệch nhau: day-detail làm rơi
 * `reason_id`, `date_start`/`date_end` và `time`, khiến frontend không thể biết
 * đơn checkin/out khai giờ nào hay đơn thuộc lý do gì. Gộp lại một chỗ để hai
 * endpoint không thể lệch nữa.
 */

/**
 * Một mục thời gian trong đơn. HRM dùng BA shape khác nhau tuỳ loại đơn:
 *
 * - Đơn xin nghỉ (type 1):    `date_start`/`date_end` + `time_start`/`time_end`
 * - Đơn vắng mặt (type 2):    `date` + `time_start`/`time_end`
 * - Đơn checkin/out (type 4): `date` + `time` — một MỐC giờ, không phải khoảng
 *
 * Giữ nguyên cả ba, không cố ép về một shape ở tầng này — việc chuẩn hoá thuộc
 * về `frontend/lib/timesheet/normalize.ts`, nơi có đủ ngữ cảnh ngày đang xét.
 */
export class TrackingTimeDto {
  @Expose()
  date?: string;

  @Expose({ name: 'date_start' })
  dateStart?: string;

  @Expose({ name: 'date_end' })
  dateEnd?: string;

  @Expose({ name: 'time_start' })
  timeStart?: string;

  @Expose({ name: 'time_end' })
  timeEnd?: string;

  /** Mốc giờ đơn checkin/out khai bổ sung, ví dụ "17:30". */
  @Expose()
  time?: string;

  @Expose({ name: 'time_off' })
  timeOff?: string | null;

  @Expose({ name: 'count_hour' })
  countHour?: number;

  @Expose()
  reason?: string;

  /** Có thể vắng ở đây và chỉ có ở cấp `data.reason_id`. Đọc cả hai. */
  @Expose({ name: 'reason_id' })
  reasonId?: number;

  @Expose({ name: 'is_calculate_salary' })
  isCalculateSalary?: number;
}

export class AnnualLeaveUsedDto {
  @Expose({ name: 'last_year' })
  lastYear: number;

  @Expose({ name: 'this_year' })
  thisYear: number;
}

export class ApplicationFormDataDto {
  /** Lý do ở cấp đơn. Đơn xin nghỉ thường chỉ có ở đây, không có trong tracking. */
  @Expose({ name: 'reason_id' })
  reasonId?: number;

  @Expose({ name: 'tracking_times' })
  @Type(() => TrackingTimeDto)
  trackingTimes?: TrackingTimeDto[];

  @Expose({ name: 'annual_leave_used' })
  @Type(() => AnnualLeaveUsedDto)
  annualLeaveUsed?: AnnualLeaveUsedDto;
}

export class ApplicationFormTypeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

/** Hạn nộp đơn theo từng loại, cấu hình theo user phía HRM. */
export class ApplicationFormTypeConfigDto {
  @Expose({ name: 'type_id' })
  typeId: number;

  /** Số ngày còn được nộp đơn tính từ ngày áp dụng. */
  @Expose({ name: 'max_days_after' })
  maxDaysAfter: number;

  /** 0 nghĩa là không giới hạn ngày tương lai. */
  @Expose({ name: 'max_days_before' })
  maxDaysBefore: number;

  @Expose({ name: 'max_application_form_in_month' })
  maxApplicationFormInMonth?: number;
}

export class ApplicationFormConfigDto {
  @Expose()
  @Type(() => ApplicationFormTypeConfigDto)
  types: ApplicationFormTypeConfigDto[];
}
