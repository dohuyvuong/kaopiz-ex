import { IsString, Matches } from 'class-validator';

/**
 * DTO cho query params của GET /timesheet/day-detail
 * date format: "YYYY-MM-DD" (ví dụ: "2025-10-16")
 */
export class GetDayDetailQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date phải có format YYYY-MM-DD (ví dụ: 2025-10-16)',
  })
  date: string;
}
