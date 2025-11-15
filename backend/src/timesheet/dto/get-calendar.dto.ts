import { IsString, Matches } from 'class-validator';

/**
 * DTO cho query params của GET /timesheet/calendar
 * monthYear format: "MM-YYYY" (ví dụ: "10-2025")
 */
export class GetCalendarQueryDto {
  @IsString()
  @Matches(/^\d{2}-\d{4}$/, {
    message: 'monthYear phải có format MM-YYYY (ví dụ: 10-2025)',
  })
  monthYear: string;
}
