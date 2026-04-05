import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAuthStore } from '@/lib/stores/auth-store';
import { TimesheetDay } from '@/lib/types/timesheet';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';
import { timesheetApi } from '@/lib/api/timesheet';
import { calculateMinutesFromForms } from '@/lib/utils/auto-create-applications';

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

/**
 * Đầu vào từ định tuyến (URL hoặc nguồn “bên ngoài” tương đương).
 * Calendar không phụ thuộc Next — chỉ nhận số / chuỗi đã parse.
 */
export interface UseTimesheetCalendarRouteOptions {
  /** Tháng đang xem (1–12), từ route */
  routeMonth?: number;
  routeYear?: number;
  /**
   * Ngày mở chi tiết (YYYY-MM-DD). `null` = đóng sheet.
   * `undefined` = không điều khiển selection từ route (chỉ state nội bộ).
   */
  routeSelectedDate?: string | null;
}

export function useTimesheetCalendar(
  routeOptions: UseTimesheetCalendarRouteOptions = {},
): UseTimesheetCalendarReturn {
  const { routeMonth, routeYear, routeSelectedDate } = routeOptions;
  const appToken = useAuthStore((state) => state.appToken);
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    routeOptions.routeSelectedDate === undefined
      ? null
      : routeOptions.routeSelectedDate,
  );
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
  const [viewDate, setViewDate] = useState(() => {
    if (
      routeOptions.routeMonth != null &&
      routeOptions.routeYear != null &&
      routeOptions.routeMonth >= 1 &&
      routeOptions.routeMonth <= 12
    ) {
      return new Date(routeOptions.routeYear, routeOptions.routeMonth - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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
    try {
      setIsLoading(true);
      setError(null);
      const response = await timesheetApi.getCalendar(monthYear);
      const newCalendar = {
        timelines: response.timelines,
        workingTime: {
          workStart: response.workingTime.workStart,
          workEnd: response.workingTime.workEnd,
          timezone: response.workingTime.timezone,
          timezoneValue: response.workingTime.timezoneValue,
        },
        summary: response.summary,
        userId: response.userId,
      };
      setCalendar(newCalendar);
      // Gọi callback để update summary
      handleCalendarLoad(
        {
          timelines: response.timelines,
          summary: response.summary,
        },
        monthYear,
      );
      // Cập nhật selectedDay nếu đang có selectedDate
      if (selectedDate) {
        const day = response.timelines.find((t) => {
          if (!t.date) return false;
          const timesheetDate = dayjs(t.date).format('YYYY-MM-DD');
          return timesheetDate === selectedDate;
        });
        if (day) {
          setSelectedDay(day);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch calendar data khi monthYear hoặc appToken thay đổi
  useEffect(() => {
    if (!appToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
      setIsLoading(false);
      return;
    }

    onReload();
  }, [appToken, monthYear]);

  // Đồng bộ view / selection từ route (browser back, deep link)
  useEffect(() => {
    if (routeMonth == null || routeYear == null) return;
    if (routeMonth < 1 || routeMonth > 12) return;
    setViewDate((prev) => {
      const next = new Date(routeYear, routeMonth - 1, 1);
      if (
        prev.getFullYear() === next.getFullYear() &&
        prev.getMonth() === next.getMonth()
      ) {
        return prev;
      }
      return next;
    });
  }, [routeMonth, routeYear]);

  useEffect(() => {
    if (routeSelectedDate === undefined) return;
    setSelectedDate((prev) =>
      prev === routeSelectedDate ? prev : routeSelectedDate,
    );
    if (routeSelectedDate == null) {
      setSelectedDay(null);
    }
  }, [routeSelectedDate]);

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
  // Trừ theo số phút thực tế trong đơn (trackingTimes), không trừ cả ngày.
  const estimatedSummary = useMemo(() => {
    if (!summary) return null;

    let totalMinutesLate = summary.summary.minutesLate;
    let totalMinutesEarly = summary.summary.minutesEarly;

    mergedDays.forEach((day) => {
      if (!day.hasPendingForms || !day.date) return;

      const dateStr = dayjs(day.date).format('YYYY-MM-DD');
      const originalTimesheet = summary.timelines.find(
        (t) => t.date && dayjs(t.date).format('YYYY-MM-DD') === dateStr,
      );
      const approvedFormIds = new Set(
        (originalTimesheet?.approvedApplicationForms || []).map((f) => f.id),
      );
      const pendingForms = (day.approvedApplicationForms || []).filter(
        (form) =>
          (form.typeId === 1 || form.typeId === 2) &&
          !approvedFormIds.has(form.id),
      );
      if (pendingForms.length === 0) return;

      const pendingMinutes = calculateMinutesFromForms(pendingForms);
      const dayTotal = (day.minutesLate || 0) + (day.minutesEarly || 0);
      if (dayTotal <= 0) return;

      const lateRatio = (day.minutesLate || 0) / dayTotal;
      const earlyRatio = (day.minutesEarly || 0) / dayTotal;
      totalMinutesLate = Math.max(
        0,
        totalMinutesLate - Math.round(pendingMinutes * lateRatio),
      );
      totalMinutesEarly = Math.max(
        0,
        totalMinutesEarly - Math.round(pendingMinutes * earlyRatio),
      );
    });

    return {
      minutesLate: totalMinutesLate,
      minutesEarly: totalMinutesEarly,
    };
  }, [summary, mergedDays]);

  // Fetch day detail cho các ngày cần thiết
  useEffect(() => {
    if (!appToken || !summary || !viewMonthYear) return;

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
    const daysToFetch: Array<{ date: string; timesheet: TimesheetDay | null }> = [];

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

    // Bổ sung các ngày nằm ngoài tháng nhưng hiển thị trong lưới calendar (tuần vắt tháng).
    // Mục tiêu: lấy applicationForms để đếm đúng rule theo tuần khi auto-create.
    calendarDays.forEach(({ date: dayDate }) => {
      const d = dayjs(dayDate);
      const isOutsideViewMonth =
        d.month() + 1 !== month || d.year() !== year;
      if (!isOutsideViewMonth) return;

      const dateStr = d.format('YYYY-MM-DD');
      // Tránh push trùng với danh sách đã có
      const exists = daysToFetch.some(
        ({ date }) => dayjs(date).format('YYYY-MM-DD') === dateStr,
      );
      if (!exists) {
        daysToFetch.push({ date: dateStr, timesheet: null });
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
        .getDayDetail(dateStr)
        .then((response: TimesheetDayDetailResponse) => {
          const allTrackedForms = response.applicationForms.filter(
            (form) => form.typeId === 1 || form.typeId === 2,
          );

          // Kiểm tra xem có đơn chưa approve không (status !== 3)
          const pendingForms = allTrackedForms.filter(
            (form) => form.status !== 3, // Nghỉ phép hoặc vắng mặt
          );

          const formsToStore = timesheet ? pendingForms : allTrackedForms;

          if (formsToStore.length > 0) {
            // Merge đơn chưa approve vào timeline
            const mergedDay: TimesheetDay & { hasPendingForms?: boolean } = timesheet
              ? {
                  ...timesheet,
                  approvedApplicationForms: [
                    ...(timesheet.approvedApplicationForms || []),
                    ...formsToStore.map((form) => ({
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
                }
              : {
                  // Synthetic day cho ngày ngoài tháng (chỉ cần để đếm form theo tuần)
                  date,
                  timeIn: null,
                  timeOut: null,
                  symbol: null,
                  location: '',
                  timeInFinal: null,
                  timeOutFinal: null,
                  work: 'N',
                  workDays: 0,
                  workHours: 0,
                  workStart: null,
                  workEnd: null,
                  minutesLate: 0,
                  minutesEarly: 0,
                  approvedApplicationForms: formsToStore.map((form) => ({
                    id: form.id,
                    userId: 0,
                    typeId: form.typeId,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    data: form.data,
                    createdAt: null,
                    user: undefined,
                  })),
                  logWork: null,
                  logWorkDiff: 0,
                  logWorkNeeded: 0,
                  hasPendingForms: pendingForms.length > 0,
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
  }, [appToken, summary, viewMonthYear]);

  // Khi mở detail từ URL hoặc calendar vừa load: gắn selectedDay từ timeline
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDay(null);
      return;
    }
    if (!calendar?.timelines?.length) return;
    const day = calendar.timelines.find((t) => {
      if (!t.date) return false;
      return dayjs(t.date).format('YYYY-MM-DD') === selectedDate;
    });
    setSelectedDay(day ?? null);
  }, [selectedDate, calendar]);

  // Cập nhật selectedDay khi mergedDays thay đổi (nếu đang có selectedDate)
  useEffect(() => {
    if (selectedDate && mergedDays.has(selectedDate)) {
      const mergedDay = mergedDays.get(selectedDate);
      if (mergedDay) {
        setSelectedDay(mergedDay);
      }
    }
  }, [selectedDate, mergedDays]);

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
