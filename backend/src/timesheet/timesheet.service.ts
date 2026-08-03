import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TimesheetApiService } from '../api/services/hrm/timesheet-api.service';
import { TimesheetCalendarResponseDto } from './dto/timesheet-calendar.dto';
import { TimesheetDayDetailResponseDto } from './dto/timesheet-day-detail.dto';

/**
 * Service để xử lý logic timesheet
 * Sử dụng TimesheetApiService để lấy dữ liệu từ HRM
 * Có thể thêm custom logic ở đây sau này
 */
@Injectable()
export class TimesheetService {
  private readonly logger: Logger;

  constructor(private readonly timesheetApiService: TimesheetApiService) {
    this.logger = new Logger(TimesheetService.name);
  }

  /**
   * Lấy dữ liệu timesheet calendar cho một tháng
   * @param token HRM JWT token
   * @param monthYear Format: "MM-YYYY" (ví dụ: "10-2025")
   */
  async getCalendar(token: string, monthYear: string) {
    this.logger.log(`Getting calendar for month: ${monthYear}`);

    // Gọi API thông qua TimesheetApiService
    const rawData = await this.timesheetApiService.getCalendar(
      token,
      monthYear,
    );

    // Transform từ snake_case sang camelCase
    return plainToInstance(
      TimesheetCalendarResponseDto,
      {
        ...(rawData as Record<string, unknown>),
        application_form_config: this.extractApplicationFormConfig(rawData),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Rút cấu hình hạn nộp đơn ra khỏi chỗ HRM chôn nó.
   *
   * HRM lặp lại nguyên object `user` — kèm `application_form_config` — trong MỌI
   * đơn đã duyệt của mọi ngày. Ta bỏ `user` khỏi response (nặng và thừa) nên phải
   * nhặt cấu hình ra trước, nâng lên cấp response để client dùng trực tiếp.
   *
   * Trả `null` nếu tháng đó không có đơn nào đã duyệt — khi đó client tự dùng
   * mặc định. Chấp nhận được vì hạn nộp chỉ dùng để CẢNH BÁO, không chặn.
   */
  private extractApplicationFormConfig(rawData: unknown): unknown {
    const timelines = (rawData as { timelines?: unknown })?.timelines;
    if (!Array.isArray(timelines)) return null;

    for (const day of timelines) {
      const forms = (day as { approved_application_forms?: unknown })
        ?.approved_application_forms;
      if (!Array.isArray(forms)) continue;

      for (const form of forms) {
        const config = (
          form as { user?: { application_form_config?: unknown } }
        )?.user?.application_form_config;
        if (config) return config;
      }
    }

    return null;
  }

  /**
   * Lấy chi tiết timesheet cho một ngày cụ thể
   * @param token HRM JWT token
   * @param date Format: "YYYY-MM-DD" (ví dụ: "2025-10-16")
   */
  async getDayDetail(token: string, date: string) {
    this.logger.log(`Getting day detail for date: ${date}`);

    // Gọi API thông qua TimesheetApiService
    const rawData = await this.timesheetApiService.getDayDetail(token, date);

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      TimesheetDayDetailResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    // Có thể thêm custom logic ở đây sau này
    // Ví dụ: phân tích vi phạm, đề xuất đơn, v.v.

    return transformedData;
  }
}
