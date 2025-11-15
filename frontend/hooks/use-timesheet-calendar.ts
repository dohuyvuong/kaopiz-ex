import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAppSelector } from '@/lib/hooks';
import { TimesheetDay } from '@/lib/types/timesheet';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';
import { timesheetApi } from '@/lib/api/timesheet';

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface UseTimesheetCalendarReturn {
  // Selection state
  selectedDate: string | null;
  selectedDay: TimesheetDay | null;

  // Merged state
  mergedDays: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  dayDetailLoadingDates: Set<string>;
  summary: {
    timelines: TimesheetDay[];
    summary: { minutesLate: number; minutesEarly: number };
  } | null;
  viewMonthYear: string;
  estimatedSummary: { minutesLate: number; minutesEarly: number } | null;

  // Calendar state
  isLoading: boolean;
  error: string | null;
  viewDate: Date;
  calendar: {
    timelines: TimesheetDay[];
    workingTime: { workStart: string; workEnd: string; timezone: string; timezoneValue: string };
    summary: { minutesLate: number; minutesEarly: number };
    userId?: number;
  } | null;

  // Calendar computed values
  month: number;
  year: number;
  monthYear: string;
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  monthOptions: number[];
  yearOptions: number[];
  weekDayLabels: string[];

  // Handlers
  onDayClick: (date: string, day?: TimesheetDay) => void;
  onCloseDetail: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthYearChange: (newMonth: number, newYear: number) => void;
  onReload: () => Promise<void>;
  formatMonthYear: (date: Date) => string;
}

export function useTimesheetCalendar(): UseTimesheetCalendarReturn {
  const hrmToken = useAppSelector((state) => state.auth.tokens.hrm?.token);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<TimesheetDay | null>(null);

  // Merged state
  const [mergedDays, setMergedDays] = useState<Map<string, TimesheetDay & { hasPendingForms?: boolean }>>(new Map());
  const [dayDetailLoadingDates, setDayDetailLoadingDates] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<{
    timelines: TimesheetDay[];
    summary: { minutesLate: number; minutesEarly: number };
  } | null>(null);
  const [viewMonthYear, setViewMonthYear] = useState<string>('');

  // Calendar state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [calendar, setCalendar] = useState<{
    timelines: TimesheetDay[];
    workingTime: { workStart: string; workEnd: string; timezone: string; timezoneValue: string };
    summary: { minutesLate: number; minutesEarly: number };
    userId?: number;
  } | null>(null);

  // Calendar computed values
  const month = viewDate.getMonth() + 1;
  const year = viewDate.getFullYear();
  const monthYear = `${month.toString().padStart(2, '0')}-${year}`;

  // Internal callback khi calendar được load
  const handleCalendarLoad = (
    summaryData: {
      timelines: TimesheetDay[];
      summary: { minutesLate: number; minutesEarly: number };
    },
    monthYear: string,
  ) => {
    setSummary(summaryData);
    setViewMonthYear(monthYear);
    // Reset merged state khi calendar thay đổi
    setMergedDays(new Map());
    setDayDetailLoadingDates(new Set());
  };

  // Hàm fetch calendar data
  const onReload = async () => {
    if (!hrmToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await timesheetApi.getCalendar(hrmToken, monthYear);
      setCalendar({
        timelines: response.timelines,
        workingTime: {
          workStart: response.workingTime.workStart,
          workEnd: response.workingTime.workEnd,
          timezone: response.workingTime.timezone,
          timezoneValue: response.workingTime.timezoneValue,
        },
        summary: response.summary,
        userId: response.userId,
      });
      // Gọi callback để update summary
      handleCalendarLoad(
        {
          timelines: response.timelines,
          summary: response.summary,
        },
        monthYear,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch calendar data khi monthYear hoặc hrmToken thay đổi
  useEffect(() => {
    if (!hrmToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
      setIsLoading(false);
      return;
    }

    onReload();
  }, [hrmToken, monthYear]);

  // Navigation handlers
  const onPreviousMonth = () => {
    setViewDate(new Date(year, month - 2, 1));
  };

  const onNextMonth = () => {
    setViewDate(new Date(year, month, 1));
  };

  const onToday = () => {
    setViewDate(new Date());
  };

  const onMonthYearChange = (newMonth: number, newYear: number) => {
    setViewDate(new Date(newYear, newMonth - 1, 1));
  };

  // Calendar grid generation
  const firstDayOfMonth = dayjs(new Date(year, month - 1, 1));
  const lastDayOfMonth = dayjs(new Date(year, month, 0));
  const firstDayWeekday = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1;
  const daysInMonth = lastDayOfMonth.date();

  const calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }> = [];

  // Thêm các ngày trống ở đầu tháng
  for (let i = 0; i < firstDayWeekday; i++) {
    const date = firstDayOfMonth.subtract(firstDayWeekday - i, 'day').toDate();
    calendarDays.push({ date, timesheet: null });
  }

  // Thêm các ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(new Date(year, month - 1, day)).toDate();
    const timesheet = calendar?.timelines.find((t) => {
      if (!t.date) return false;
      const timesheetDate = dayjs(t.date);
      const currentDate = dayjs(date);
      return timesheetDate.isSame(currentDate, 'day');
    }) || null;
    calendarDays.push({ date, timesheet });
  }

  // Thêm các ngày trống ở cuối tháng để đủ 6 tuần (42 ngày)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = dayjs(new Date(year, month - 1, daysInMonth)).add(day, 'day').toDate();
    calendarDays.push({ date, timesheet: null });
  }

  // Helper functions
  const formatMonthYear = (date: Date) => {
    return dayjs(date).format('MMMM YYYY');
  };

  // Tạo danh sách tháng và năm
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Tính toán estimated summary (nếu các đơn chưa approve được approve)
  const estimatedSummary = useMemo(() => {
    if (!summary) return null;

    let totalMinutesLate = summary.summary.minutesLate;
    let totalMinutesEarly = summary.summary.minutesEarly;

    // Tính toán lại dựa trên các ngày có đơn chưa approve
    mergedDays.forEach((day) => {
      if (day.hasPendingForms) {
        // Nếu có đơn chưa approve, trừ đi muộn/về sớm của ngày đó khỏi tổng
        // (vì nếu đơn được approve thì sẽ không bị tính phạt)
        totalMinutesLate = Math.max(0, totalMinutesLate - day.minutesLate);
        totalMinutesEarly = Math.max(0, totalMinutesEarly - day.minutesEarly);
      }
    });

    return {
      minutesLate: totalMinutesLate,
      minutesEarly: totalMinutesEarly,
    };
  }, [summary, mergedDays]);

  // Fetch day detail cho các ngày cần thiết
  useEffect(() => {
    if (!hrmToken || !summary || !viewMonthYear) return;

    // Kiểm tra xem tháng hiện tại có phải tháng hiện tại hoặc tháng trước không
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const [month, year] = viewMonthYear.split('-').map(Number);
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const isCurrentOrPreviousMonth =
      (month === currentMonth && year === currentYear) ||
      (month === previousMonth && year === previousYear);

    if (!isCurrentOrPreviousMonth) return;

    // Tìm các ngày cần fetch detail
    const daysToFetch: Array<{ date: string; timesheet: TimesheetDay }> = [];

    summary.timelines.forEach((timesheet) => {
      if (!timesheet.date) return;

      // Chỉ fetch nếu:
      // 1. Là ngày làm việc (work === '1')
      // 2. Thiếu check-in hoặc check-out HOẶC có đi muộn/về sớm
      // 3. Chưa có đơn đã approve
      const isWorkingDay = timesheet.work === '1';
      const missingCheckInOut = !timesheet.timeIn || !timesheet.timeOut;
      const hasViolation = timesheet.minutesLate > 0 || timesheet.minutesEarly > 0;
      const hasNoApprovedForms = !timesheet.approvedApplicationForms || timesheet.approvedApplicationForms.length === 0;

      if (isWorkingDay && (missingCheckInOut || hasViolation) && hasNoApprovedForms) {
        daysToFetch.push({ date: timesheet.date, timesheet });
      }
    });

    // Fetch tất cả day details
    const fetchPromises = daysToFetch.map(({ date, timesheet }) => {
      const dateStr = dayjs(date).format('YYYY-MM-DD');

      // Đã có merged thì không fetch lại
      if (mergedDays.has(dateStr)) {
        return Promise.resolve(null);
      }

      // Đánh dấu đang loading
      setDayDetailLoadingDates((prev) => new Set(prev).add(dateStr));

      return timesheetApi
        .getDayDetail(hrmToken, dateStr)
        .then((response: TimesheetDayDetailResponse) => {
          // Kiểm tra xem có đơn chưa approve không (status !== 3)
          const pendingForms = response.applicationForms.filter(
            (form) => form.status !== 3 && (form.typeId === 1 || form.typeId === 2), // Nghỉ phép hoặc vắng mặt
          );

          if (pendingForms.length > 0) {
            // Merge đơn chưa approve vào timeline
            const mergedDay: TimesheetDay & { hasPendingForms?: boolean } = {
              ...timesheet,
              approvedApplicationForms: [
                ...(timesheet.approvedApplicationForms || []),
                ...pendingForms.map((form) => ({
                  id: form.id,
                  userId: 0, // Không có trong day detail
                  typeId: form.typeId,
                  startDate: form.startDate,
                  endDate: form.endDate,
                  data: form.data,
                  createdAt: null,
                  user: undefined,
                })),
              ],
              hasPendingForms: true,
            };

            setMergedDays((prev) => {
              const newMap = new Map(prev);
              newMap.set(dateStr, mergedDay);
              return newMap;
            });
          }

          return null;
        })
        .catch(() => {
          // Ignore errors khi fetch day detail
          return null;
        })
        .finally(() => {
          // Bỏ đánh dấu loading
          setDayDetailLoadingDates((prev) => {
            const newSet = new Set(prev);
            newSet.delete(dateStr);
            return newSet;
          });
        });
    });

    // Chờ tất cả promises hoàn thành
    Promise.all(fetchPromises);
  }, [hrmToken, summary, viewMonthYear]);

  const onDayClick = (date: string, day?: TimesheetDay) => {
    setSelectedDate(date);
    setSelectedDay(day || null);
  };

  const onCloseDetail = () => {
    setSelectedDate(null);
    setSelectedDay(null);
  };

  return {
    // Selection state
    selectedDate,
    selectedDay,

    // Merged state
    mergedDays,
    dayDetailLoadingDates,
    summary,
    viewMonthYear,
    estimatedSummary,

    // Calendar state
    isLoading,
    error,
    viewDate,
    calendar,

    // Calendar computed values
    month,
    year,
    monthYear,
    calendarDays,
    monthOptions,
    yearOptions,
    weekDayLabels,

    // Handlers
    onDayClick,
    onCloseDetail,
    onPreviousMonth,
    onNextMonth,
    onToday,
    onMonthYearChange,
    onReload,
    formatMonthYear,
  };
}
