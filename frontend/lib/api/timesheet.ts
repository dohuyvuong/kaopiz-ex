import { TimesheetCalendarResponse } from '@/lib/types/timesheet';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const timesheetApi = {
  /**
   * Lấy dữ liệu timesheet calendar cho một tháng
   * @param token HRM JWT token
   * @param monthYear Format: "MM-YYYY" (ví dụ: "10-2025")
   */
  async getCalendar(token: string, monthYear: string): Promise<TimesheetCalendarResponse> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/timesheet/calendar?monthYear=${monthYear}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get timesheet calendar',
      }));
      throw new Error(error.message || 'Failed to get timesheet calendar');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Lấy chi tiết timesheet cho một ngày cụ thể
   * @param token HRM JWT token
   * @param date Format: "YYYY-MM-DD" (ví dụ: "2025-10-16")
   */
  async getDayDetail(token: string, date: string): Promise<TimesheetDayDetailResponse> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/timesheet/day-detail?date=${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get timesheet day detail',
      }));
      throw new Error(error.message || 'Failed to get timesheet day detail');
    }

    const result = await response.json();
    return result.data;
  },
};
