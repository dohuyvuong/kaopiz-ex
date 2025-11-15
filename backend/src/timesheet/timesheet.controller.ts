import { Controller, Get, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { GetCalendarQueryDto } from './dto/get-calendar.dto';
import { GetDayDetailQueryDto } from './dto/get-day-detail.dto';
import { Auth } from '../auth/decorators';
import { Token } from '../auth/decorators/token.decorator';

@Controller('timesheet')
@Auth('hrm')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  /**
   * GET /timesheet/calendar?monthYear=10-2025
   * Lấy dữ liệu timesheet calendar cho một tháng
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Get('calendar')
  async getCalendar(
    @Query() query: GetCalendarQueryDto,
    @Token() token: string,
  ) {
    const data = await this.timesheetService.getCalendar(
      token,
      query.monthYear,
    );
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /timesheet/day-detail?date=2025-10-16
   * Lấy chi tiết timesheet cho một ngày cụ thể
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Get('day-detail')
  async getDayDetail(
    @Query() query: GetDayDetailQueryDto,
    @Token() token: string,
  ) {
    const data = await this.timesheetService.getDayDetail(token, query.date);
    return {
      success: true,
      data,
    };
  }
}
