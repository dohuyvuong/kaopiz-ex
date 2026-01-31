import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsObject,
  ValidateIf,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { NotificationChannel } from '../constants/automation.constants';

export class UpdateAutomationSettingDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;

  // Required when enabled = true
  @ValidateIf((o) => o.enabled === true)
  @IsNotEmpty({
    message: 'notificationChannel là bắt buộc khi bật tự động hóa',
  })
  @IsEnum(NotificationChannel, {
    message: 'notificationChannel phải là telegram hoặc email',
  })
  notificationChannel: NotificationChannel;

  // Required when enabled = true
  @ValidateIf((o) => o.enabled === true)
  @IsNotEmpty({ message: 'notificationTarget là bắt buộc khi bật tự động hóa' })
  @IsString()
  notificationTarget: string;

  // Required when enabled = true
  @ValidateIf((o) => o.enabled === true)
  @IsNotEmpty({
    message: 'autoApproveAfterMinutes là bắt buộc khi bật tự động hóa',
  })
  @IsInt({ message: 'autoApproveAfterMinutes phải là số nguyên' })
  @Min(1, { message: 'autoApproveAfterMinutes phải lớn hơn 0' })
  autoApproveAfterMinutes: number;
}

export class AutomationSettingResponseDto {
  id: number;
  jobType: string;
  enabled: boolean;
  params: Record<string, unknown> | null;
  notificationChannel: NotificationChannel | null;
  notificationTarget: string | null;
  autoApproveAfterMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}
