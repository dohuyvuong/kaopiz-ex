import { Expose, Transform, Type } from 'class-transformer';
import {
  ApplicationFormConfigDto,
  ApplicationFormDataDto,
} from './application-form.dto';

/**
 * DTO cho WorkingTime từ HRM API
 * Transform từ snake_case sang camelCase
 */
export class WorkingTimeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose({ name: 'work_start' })
  workStart: string;

  @Expose({ name: 'work_end' })
  workEnd: string;

  @Expose({ name: 'lunch_start' })
  lunchStart: string;

  @Expose({ name: 'lunch_end' })
  lunchEnd: string;

  @Expose({ name: 'dinner_start' })
  dinnerStart: string;

  @Expose({ name: 'dinner_end' })
  dinnerEnd: string;

  @Expose({ name: 'working_hours_per_day' })
  workingHoursPerDay: number;

  @Expose({ name: 'working_hours_per_shift' })
  workingHoursPerShift: number;

  @Expose({ name: 'minutes_early_late_allowed' })
  minutesEarlyLateAllowed: number;

  @Expose()
  timezone: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date | null;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt: Date | null;

  @Expose({ name: 'lunch_break_time' })
  lunchBreakTime: number;

  @Expose({ name: 'dinner_break_time' })
  dinnerBreakTime: number;

  @Expose({ name: 'day_of_week' })
  dayOfWeek: number;

  @Expose({ name: 'timezone_value' })
  timezoneValue: string;
}

/**
 * DTO cho ApplicationForm.
 *
 * Không expose `user`: HRM nhồi nguyên object user (kèm cấu hình, phòng ban,
 * email) vào MỖI đơn — nặng và thừa. Phần duy nhất cần dùng là
 * `application_form_config`, đã được nâng lên cấp response.
 */
export class ApplicationFormDto {
  @Expose()
  id: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'type_id' })
  typeId: number;

  @Expose({ name: 'start_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  startDate: Date | null;

  @Expose({ name: 'end_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  endDate: Date | null;

  @Expose()
  @Type(() => ApplicationFormDataDto)
  data: ApplicationFormDataDto;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date | null;
}

/**
 * DTO cho LogWork
 */
export class LogWorkDto {
  @Expose()
  id: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'time_spent' })
  timeSpent: number;

  @Expose()
  @Transform(({ value }) => (value ? new Date(value) : null))
  date: Date | null;

  @Expose({ name: 'time_spent_hour' })
  timeSpentHour: number;
}

/**
 * DTO cho TimesheetDay
 */
export class TimesheetDayDto {
  @Expose()
  @Transform(({ value }) => (value ? new Date(value) : null))
  date: Date | null;

  @Expose({ name: 'time_in' })
  timeIn: string | null;

  @Expose({ name: 'time_out' })
  timeOut: string | null;

  @Expose()
  symbol: string | null;

  @Expose()
  location: string;

  @Expose({ name: 'time_in_final' })
  timeInFinal: string | null;

  @Expose({ name: 'time_out_final' })
  timeOutFinal: string | null;

  @Expose()
  work: string;

  @Expose({ name: 'work_days' })
  workDays: number;

  @Expose({ name: 'work_hours' })
  workHours: number;

  @Expose({ name: 'work_start' })
  workStart: string | null;

  @Expose({ name: 'work_end' })
  workEnd: string | null;

  @Expose({ name: 'minutes_late' })
  minutesLate: number;

  @Expose({ name: 'minutes_early' })
  minutesEarly: number;

  @Expose({ name: 'approved_application_forms' })
  @Type(() => ApplicationFormDto)
  approvedApplicationForms: ApplicationFormDto[];

  @Expose({ name: 'log_work' })
  @Type(() => LogWorkDto)
  logWork: LogWorkDto | null;

  @Expose({ name: 'log_work_diff' })
  logWorkDiff: number;

  @Expose({ name: 'log_work_needed' })
  logWorkNeeded: number;
}

/**
 * DTO cho LeaveInfo
 */
export class LeaveInfoDto {
  @Expose({ name: 'health_insurance_leave' })
  healthInsuranceLeave: number;

  @Expose({ name: 'marriage_leave' })
  marriageLeave: number;

  @Expose({ name: 'filial_leave' })
  filialLeave: number;

  @Expose({ name: 'unpaid_leave' })
  unpaidLeave: number;

  @Expose({ name: 'annual_leave' })
  annualLeave: number;

  @Expose({ name: 'unpaid_leave_without_application' })
  unpaidLeaveWithoutApplication: number;

  @Expose({ name: 'total_unpaid' })
  totalUnpaid: number;
}

/**
 * DTO cho AnnualLeaveInfo
 */
export class AnnualLeaveInfoDto {
  @Expose()
  used: number;

  @Expose({ name: 'used_this_year' })
  usedThisYear: number;

  @Expose({ name: 'available_this_year' })
  availableThisYear: number;

  @Expose({ name: 'remaining_last_year' })
  remainingLastYear: number;
}

/**
 * DTO cho OvertimeInfo
 */
export class OvertimeInfoDto {
  @Expose()
  actual: number;

  @Expose({ name: 'multiplied_by_rate' })
  multipliedByRate: number;

  @Expose({ name: 'compensatory_leave' })
  compensatoryLeave: number;
}

/**
 * DTO cho AbsenceInfo
 */
export class AbsenceInfoDto {
  @Expose({ name: 'absence_compensatory_leave' })
  absenceCompensatoryLeave: number;
}

/**
 * DTO cho TimesheetSummary
 */
export class TimesheetSummaryDto {
  @Expose({ name: 'minutes_late' })
  minutesLate: number;

  @Expose({ name: 'minutes_early' })
  minutesEarly: number;

  @Expose({ name: 'numbers_late' })
  numbersLate: number;

  @Expose({ name: 'numbers_early' })
  numbersEarly: number;

  @Expose()
  fines: number;

  @Expose()
  bonus: number;

  @Expose({ name: 'actual_working_day' })
  actualWorkingDay: number;

  @Expose({ name: 'timekeeping_holidays' })
  timekeepingHolidays: number;

  @Expose({ name: 'numbers_log_work_diff' })
  numbersLogWorkDiff: number;
}

/**
 * DTO cho TimesheetTotal
 */
export class TimesheetTotalDto {
  @Expose({ name: 'work_hour' })
  workHour: number;

  @Expose({ name: 'work_day' })
  workDay: number;

  @Expose({ name: 'standard_workday' })
  standardWorkday: number;

  @Expose({ name: 'log_work_hour' })
  logWorkHour: number;

  @Expose({ name: 'log_work_diff' })
  logWorkDiff: number;
}

/**
 * DTO cho TimesheetCalendarResponse từ HRM API
 */
export class TimesheetCalendarResponseDto {
  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'user_code' })
  userCode: string;

  @Expose({ name: 'user_full_name' })
  userFullName: string;

  @Expose({ name: 'user_full_name_katakana' })
  userFullNameKatakana: string;

  @Expose({ name: 'user_email' })
  userEmail: string;

  @Expose({ name: 'department_id' })
  departmentId: number;

  @Expose({ name: 'contract_department_id' })
  contractDepartmentId: number;

  @Expose({ name: 'senior_managements' })
  seniorManagements: unknown | null;

  @Expose({ name: 'working_time' })
  @Type(() => WorkingTimeDto)
  workingTime: WorkingTimeDto;

  @Expose()
  @Type(() => TimesheetDayDto)
  timelines: TimesheetDayDto[];

  @Expose()
  @Type(() => LeaveInfoDto)
  leave: LeaveInfoDto;

  @Expose({ name: 'annual_leave_info' })
  @Type(() => AnnualLeaveInfoDto)
  annualLeaveInfo: AnnualLeaveInfoDto;

  @Expose()
  @Type(() => OvertimeInfoDto)
  overtime: OvertimeInfoDto;

  @Expose()
  @Type(() => AbsenceInfoDto)
  absence: AbsenceInfoDto;

  @Expose({ name: 'working_start_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  workingStartDate: Date | null;

  @Expose({ name: 'working_end_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  workingEndDate: Date | null;

  @Expose()
  @Type(() => TimesheetSummaryDto)
  summary: TimesheetSummaryDto;

  @Expose()
  @Type(() => TimesheetTotalDto)
  total: TimesheetTotalDto;

  /**
   * Hạn nộp đơn theo loại. HRM chôn cấu hình này trong `user` của từng đơn đã
   * duyệt; service nâng lên đây để client không phải đào, và để nó vẫn còn khi
   * đơn bị lược bỏ. Vắng nếu tháng đó không có đơn nào đã duyệt.
   */
  @Expose({ name: 'application_form_config' })
  @Type(() => ApplicationFormConfigDto)
  applicationFormConfig: ApplicationFormConfigDto | null;
}
