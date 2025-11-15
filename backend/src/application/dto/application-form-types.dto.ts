import { Expose, Type } from 'class-transformer';

/**
 * DTO cho ApplicationFormReason data
 */
export class ApplicationFormReasonDataDto {
  @Expose({ name: 'need_log_work' })
  needLogWork?: number;

  @Expose({ name: 'max_times_in_week' })
  maxTimesInWeek?: number;

  @Expose({ name: 'max_minutes_in_day' })
  maxMinutesInDay?: number;

  @Expose({ name: 'is_calculate_salary' })
  isCalculateSalary?: number;

  @Expose({ name: 'type_leave' })
  typeLeave?: number;

  @Expose({ name: 'is_required_attachments' })
  isRequiredAttachments?: number;
}

/**
 * DTO cho ApplicationFormReason
 */
export class ApplicationFormReasonDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string | null;

  @Expose()
  @Type(() => ApplicationFormReasonDataDto)
  data?: ApplicationFormReasonDataDto;
}

/**
 * DTO cho ApplicationFormType
 */
export class ApplicationFormTypeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose({ name: 'order_max' })
  orderMax: number;
}

/**
 * DTO cho ApplicationFormTypesResponse
 */
export class ApplicationFormTypesResponseDto {
  @Expose()
  @Type(() => ApplicationFormTypeDto)
  items: ApplicationFormTypeDto[];
}

/**
 * DTO cho ApplicationFormReasonsResponse
 */
export class ApplicationFormReasonsResponseDto {
  @Expose()
  @Type(() => ApplicationFormReasonDto)
  items: ApplicationFormReasonDto[];
}
