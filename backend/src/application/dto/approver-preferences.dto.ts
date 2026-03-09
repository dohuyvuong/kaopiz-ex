import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO cho một preference item */
export class ApproverPreferenceItemDto {
  @IsNumber()
  typeId: number;

  @IsNumber()
  order: number;

  @IsNumber()
  approverUserId: number;
}

/** DTO cho request lưu approver preferences */
export class SaveApproverPreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproverPreferenceItemDto)
  preferences?: ApproverPreferenceItemDto[];
}
