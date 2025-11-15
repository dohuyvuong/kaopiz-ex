import { Expose, Type } from 'class-transformer';

/**
 * DTO cho TrackingTime trong ApplicationForm
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

  @Expose({ name: 'time_off' })
  timeOff?: string | null;

  @Expose({ name: 'count_hour' })
  countHour?: number;

  @Expose()
  reason?: string;

  @Expose({ name: 'reason_id' })
  reasonId?: number;

  @Expose({ name: 'is_calculate_salary' })
  isCalculateSalary?: number;
}

/**
 * DTO cho ApplicationForm data
 */
export class ApplicationFormDataDto {
  @Expose({ name: 'reason_id' })
  reasonId?: number;

  @Expose({ name: 'tracking_times' })
  @Type(() => TrackingTimeDto)
  trackingTimes?: TrackingTimeDto[];

  @Expose({ name: 'annual_leave_used' })
  annualLeaveUsed?: {
    lastYear: number;
    thisYear: number;
  };

  @Expose()
  time?: string;
}

/**
 * DTO cho ApplicationForm
 */
export class ApplicationFormDto {
  @Expose()
  id: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'type_id' })
  typeId: number;

  @Expose({ name: 'start_date' })
  startDate: string | null;

  @Expose({ name: 'end_date' })
  endDate: string | null;

  @Expose()
  @Type(() => ApplicationFormDataDto)
  data: ApplicationFormDataDto;

  @Expose({ name: 'created_at' })
  createdAt: string;
}
