import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho TrackingTime trong CreateApplicationForm
 */
export class CreateTrackingTimeDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dateStart?: string;

  @IsOptional()
  @IsString()
  dateEnd?: string;

  @IsOptional()
  @IsString()
  timeStart?: string;

  @IsOptional()
  @IsString()
  timeEnd?: string;

  @IsOptional()
  @IsString()
  timeOff?: string | null;

  @IsOptional()
  @IsNumber()
  reasonId?: number;
}

/**
 * DTO cho ApplicationFormData trong CreateApplicationForm
 */
export class CreateApplicationFormDataDto {
  @IsOptional()
  @IsNumber()
  reasonId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackingTimeDto)
  trackingTimes?: CreateTrackingTimeDto[];

  @IsOptional()
  @IsObject()
  annualLeaveUsed?: {
    lastYear: number;
    thisYear: number;
  };

  @IsOptional()
  @IsString()
  time?: string;
}

/**
 * DTO cho ApplicationApproval trong CreateApplicationForm
 */
export class CreateApplicationApprovalDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  order: number;
}

/**
 * DTO cho CreateApplicationForm request
 */
export class CreateApplicationFormDto {
  @IsNumber()
  typeId: number; // 1: Nghỉ phép, 2: Vắng mặt

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateApplicationFormDataDto)
  data: CreateApplicationFormDataDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateApplicationApprovalDto)
  applicationApprovals?: CreateApplicationApprovalDto[];

  @IsOptional()
  @IsString()
  description?: string;
}
