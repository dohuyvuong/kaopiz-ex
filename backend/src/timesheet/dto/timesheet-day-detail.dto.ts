import { Expose, Transform, Type } from 'class-transformer';
import {
  ApplicationFormDataDto,
  ApplicationFormTypeDto,
} from './application-form.dto';

/**
 * DTO cho TimeSheet record (một lần quẹt máy chấm công)
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
 * DTO cho ApplicationForm trong day detail.
 *
 * Khác calendar ở đúng một điểm: calendar chỉ trả đơn ĐÃ DUYỆT, còn day-detail
 * trả cả đơn chờ duyệt nên có thêm `status` (3 = đã duyệt).
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
