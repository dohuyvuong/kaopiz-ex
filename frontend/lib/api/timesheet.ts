import { TimesheetCalendarResponse } from '@/lib/types/timesheet';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';
import apiClient from './client';

export const timesheetApi = {
  /**
   * Lấy dữ liệu timesheet calendar cho một tháng
   * Token được tự động attach bởi API client interceptor
   * @param monthYear Format: "MM-YYYY" (ví dụ: "10-2025")
   */
  async getCalendar(monthYear: string): Promise<TimesheetCalendarResponse> {
    const response = await apiClient.get<{ data: TimesheetCalendarResponse }>(
      `/timesheet/calendar?monthYear=${monthYear}`
    );
    return response.data.data;
  },

  /**
   * Lấy chi tiết timesheet cho một ngày cụ thể
   * Token được tự động attach bởi API client interceptor
   * @param date Format: "YYYY-MM-DD" (ví dụ: "2025-10-16")
   */
  async getDayDetail(date: string): Promise<TimesheetDayDetailResponse> {
    const response = await apiClient.get<{ data: TimesheetDayDetailResponse }>(
      `/timesheet/day-detail?date=${date}`
    );
    return response.data.data;
  },
};
