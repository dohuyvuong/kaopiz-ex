import { Expose, Transform, Type } from 'class-transformer';

/**
 * DTO cho TimeSheet record (check-in/check-out)
 */
export class TimeSheetRecordDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }) => (value ? new Date(value) : null))
  time: Date | null;

  @Expose({ name: 'machine_code' })
  machineCode: string;
}

/**
 * DTO cho TrackingTime trong day detail
 */
export class TrackingTimeDto {
  @Expose()
  date?: string;

  @Expose({ name: 'time_start' })
  timeStart?: string;

  @Expose({ name: 'time_end' })
  timeEnd?: string;

  @Expose({ name: 'reason_id' })
  reasonId?: number;
}

/**
 * DTO cho ApplicationFormData trong day detail
 */
export class ApplicationFormDataDto {
  @Expose({ name: 'tracking_times' })
  @Type(() => TrackingTimeDto)
  trackingTimes?: TrackingTimeDto[];
}

/**
 * DTO cho ApplicationFormType
 */
export class ApplicationFormTypeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

/**
 * DTO cho ApplicationForm trong day detail
 */
export class DayDetailApplicationFormDto {
  @Expose()
  id: number;

  @Expose({ name: 'type_id' })
  typeId: number;

  @Expose({ name: 'project_id' })
  projectId: number | null;

  @Expose({ name: 'start_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  startDate: Date | null;

  @Expose({ name: 'end_date' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  endDate: Date | null;

  @Expose()
  status: number;

  @Expose()
  @Type(() => ApplicationFormDataDto)
  data: ApplicationFormDataDto;

  @Expose()
  @Type(() => ApplicationFormTypeDto)
  type: ApplicationFormTypeDto;
}

/**
 * DTO cho TimesheetDayDetailResponse từ HRM API
 */
export class TimesheetDayDetailResponseDto {
  @Expose({ name: 'timeSheets' })
  @Type(() => TimeSheetRecordDto)
  timeSheets: TimeSheetRecordDto[];

  @Expose({ name: 'application_forms' })
  @Type(() => DayDetailApplicationFormDto)
  applicationForms: DayDetailApplicationFormDto[];
}
