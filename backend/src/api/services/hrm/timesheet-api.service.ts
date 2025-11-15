import { Injectable, Logger } from '@nestjs/common';
import { HRMService } from '../hrm.service';

/**
 * Service để gọi các API timesheet từ HRM
 * Chịu trách nhiệm gọi API và trả về raw data từ HRM
 */
@Injectable()
export class TimesheetApiService {
  private readonly logger: Logger;

  constructor(private readonly hrmService: HRMService) {
    this.logger = new Logger(TimesheetApiService.name);
  }

  /**
   * Lấy dữ liệu timesheet calendar cho một tháng từ HRM API
   * @param token HRM JWT token
   * @param monthYear Format: "MM-YYYY" (ví dụ: "10-2025")
   * @returns Raw data từ HRM API (snake_case)
   */
  async getCalendar(token: string, monthYear: string): Promise<unknown> {
    this.logger.log(`Calling HRM API: getCalendar for month: ${monthYear}`);

    const rawData = await this.hrmService.get(
      `/timesheets/owner-calendar?month_year=${monthYear}`,
      token,
    );

    return rawData;
  }

  /**
   * Lấy chi tiết timesheet cho một ngày cụ thể từ HRM API
   * @param token HRM JWT token
   * @param date Format: "YYYY-MM-DD" (ví dụ: "2025-10-16")
   * @returns Raw data từ HRM API (snake_case)
   */
  async getDayDetail(token: string, date: string): Promise<unknown> {
    this.logger.log(`Calling HRM API: getDayDetail for date: ${date}`);

    const rawData = await this.hrmService.get(
      `/timesheets/owner-calendar-details?date=${date}`,
      token,
    );

    return rawData;
  }
}
