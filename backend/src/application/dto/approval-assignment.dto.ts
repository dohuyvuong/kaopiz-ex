import { Expose, Type } from 'class-transformer';

/**
 * DTO cho User trong ApprovalAssignment
 */
export class ApprovalAssignmentUserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;
}

/**
 * DTO cho ApprovalAssignment
 */
export class ApprovalAssignmentDto {
  @Expose()
  id: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose()
  order: number;

  @Expose()
  @Type(() => ApprovalAssignmentUserDto)
  user: ApprovalAssignmentUserDto;
}

/**
 * DTO cho ApprovalAssignmentsResponse
 */
export class ApprovalAssignmentsResponseDto {
  @Expose()
  @Type(() => ApprovalAssignmentDto)
  items: ApprovalAssignmentDto[];
}
