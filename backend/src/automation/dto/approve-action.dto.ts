import { IsInt } from 'class-validator';

export class ApproveActionDto {
  @IsInt()
  actionId: number;
}

export class RejectActionDto {
  @IsInt()
  actionId: number;
}
