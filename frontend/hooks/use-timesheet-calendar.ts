'use client';

/**
 * Nguồn dữ liệu duy nhất cho màn chấm công.
 *
 * Thiết kế:
 * - Calendar API cho khung tháng nhưng CHỈ kèm đơn đã duyệt.
 * - Day-detail API cho đơn chờ duyệt và danh sách lần quẹt máy, theo từng ngày.
 * - Hook giữ MỘT cache day-detail dùng chung cho cả lưới lẫn panel chi tiết, nên
 *   một ngày không bao giờ bị gọi hai lần (bản cũ gọi hai lần: một lần để trộn
 *   vào lưới, một lần nữa khi mở panel).
 *
 * Mọi tính toán nghiệp vụ nằm ở `lib/timesheet/*` — hook chỉ lo tải dữ liệu và
 * quản lý trạng thái React.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { timesheetApi } from '@/lib/api/timesheet';
import { applicationApi } from '@/lib/api/application';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';
import {
  CalendarDay,
  DayEstimate,
  LateEarly,
  MonthEstimate,
  TimesheetRules,
  buildRules,
  createDayFromDetail,
  estimateDay,
  estimateMonth,
  mergeDayDetailForms,
  normalizeCalendarDay,
} from '@kaopiz/timesheet';

/** Một ô trong lưới 6×7. */
export interface CalendarCell {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  /** `null` khi ngày ngoài tháng — calendar API chỉ trả các ngày trong tháng. */
  day: CalendarDay | null;
  estimate: DayEstimate | null;
  isLoadingDetail: boolean;
}

export interface UseTimesheetCalendarRouteOptions {
  routeMonth?: number;
  routeYear?: number;
  /** `null` = đóng panel. `undefined` = không điều khiển từ route. */
  routeSelectedDate?: string | null;
}

interface CalendarSnapshot {
  monthYear: string;
  days: CalendarDay[];
  rules: TimesheetRules;
  actualTotal: LateEarly;
  userId?: number;
  /** Số ngày phép năm còn lại — có thể ÂM nếu đã ứng trước. */
  annualLeaveAvailable: number;
}

const GRID_CELLS = 42;

/** "YYYY-MM-DD" của hôm nay theo giờ máy người dùng. */
function todayKey(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

/** 42 ngày của lưới, bắt đầu từ thứ Hai của tuần chứa ngày 1. */
function buildGridDates(month: number, year: number): string[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  // getUTCDay: 0 = CN. Lùi về thứ Hai.
  const lead = (first.getUTCDay() + 6) % 7;

  return Array.from({ length: GRID_CELLS }, (_, index) => {
    const date = new Date(first);
    date.setUTCDate(first.getUTCDate() - lead + index);
    return date.toISOString().slice(0, 10);
  });
}

export function useTimesheetCalendar(
  routeOptions: UseTimesheetCalendarRouteOptions = {},
) {
  const { routeMonth, routeYear, routeSelectedDate } = routeOptions;
  const appToken = useAuthStore((state) => state.appToken);

  const [viewDate, setViewDate] = useState(() => {
    if (
      routeMonth != null &&
      routeYear != null &&
      routeMonth >= 1 &&
      routeMonth <= 12
    ) {
      return new Date(routeYear, routeMonth - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(
    routeSelectedDate ?? null,
  );

  const [snapshot, setSnapshot] = useState<CalendarSnapshot | null>(null);
  const [details, setDetails] = useState<
    Map<string, TimesheetDayDetailResponse>
  >(new Map());
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Các ngày đang có request bay — chặn gọi trùng giữa các lần render. */
  const inFlight = useRef<Set<string>>(new Set());

  const month = viewDate.getMonth() + 1;
  const year = viewDate.getFullYear();
  const monthYear = `${String(month).padStart(2, '0')}-${year}`;
  const today = useMemo(todayKey, []);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const gridDates = useMemo(() => buildGridDates(month, year), [month, year]);

  /* ---------------------------------------------------------------- tải tháng */

  const reload = useCallback(async () => {
    if (!appToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    // Đổi tháng thì cache day-detail của tháng cũ không còn dùng tới.
    inFlight.current.clear();
    setDetails(new Map());
    setLoadingDates(new Set());

    try {
      const [calendar, reasons] = await Promise.all([
        timesheetApi.getCalendar(monthYear),
        loadReasonLimits(),
      ]);

      const days = calendar.timelines
        .map((timeline) => normalizeCalendarDay(timeline))
        .filter((day): day is CalendarDay => day !== null);

      setSnapshot({
        monthYear,
        days,
        userId: calendar.userId,
        actualTotal: {
          minutesLate: calendar.summary.minutesLate,
          minutesEarly: calendar.summary.minutesEarly,
        },
        annualLeaveAvailable:
          calendar.annualLeaveInfo?.availableThisYear ?? 0,
        rules: buildRules({
          workingTime: calendar.workingTime,
          reasons,
          maxDaysAfterByType: (calendar.applicationFormConfig?.types ?? []).map(
            (type) => ({
              typeId: type.typeId,
              maxDaysAfter: type.maxDaysAfter,
            }),
          ),
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      setSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, [appToken, monthYear]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /* ------------------------------------------------------- tải chi tiết ngày */

  const fetchDetail = useCallback(
    (date: string) => {
      if (!appToken || inFlight.current.has(date)) return;
      inFlight.current.add(date);
      setLoadingDates((prev) => new Set(prev).add(date));

      void timesheetApi
        .getDayDetail(date)
        .then((detail) => {
          setDetails((prev) => new Map(prev).set(date, detail));
        })
        .catch(() => {
          // Thiếu chi tiết một ngày không nên làm hỏng cả lưới. Ngày đó chỉ hiển
          // thị theo dữ liệu calendar (không thấy đơn chờ duyệt).
        })
        .finally(() => {
          inFlight.current.delete(date);
          setLoadingDates((prev) => {
            const next = new Set(prev);
            next.delete(date);
            return next;
          });
        });
    },
    [appToken],
  );

  /**
   * Ngày nào cần chi tiết:
   * - Ngày trong tháng có vi phạm hoặc thiếu chấm công → có thể đang có đơn chờ duyệt.
   * - Ngày ngoài tháng nhưng nằm trong lưới → cần để đếm đúng quota đơn theo TUẦN,
   *   vì tuần có thể vắt qua hai tháng.
   */
  useEffect(() => {
    if (!snapshot || snapshot.monthYear !== monthYear) return;

    const byDate = new Map(snapshot.days.map((day) => [day.date, day]));

    for (const date of gridDates) {
      if (details.has(date)) continue;

      const day = byDate.get(date);
      if (!day) {
        fetchDetail(date); // ngày ngoài tháng
        continue;
      }
      if (day.work !== '1') continue;

      const hasViolation =
        day.actual.minutesLate > 0 || day.actual.minutesEarly > 0;
      const missingPunch = !day.timeIn || !day.timeOut;
      if (hasViolation || missingPunch) fetchDetail(date);
    }
  }, [snapshot, monthYear, gridDates, details, fetchDetail]);

  // Mở panel một ngày chưa có chi tiết thì tải luôn.
  useEffect(() => {
    if (selectedDate && !details.has(selectedDate)) fetchDetail(selectedDate);
  }, [selectedDate, details, fetchDetail]);

  /* ------------------------------------------------------------- tổng hợp */

  const days = useMemo<CalendarDay[]>(() => {
    if (!snapshot) return [];

    const inMonth = snapshot.days.map((day) => {
      const detail = details.get(day.date);
      return detail ? mergeDayDetailForms(day, detail.applicationForms) : day;
    });

    // Ngày ngoài tháng nhưng nằm trong lưới: API calendar không trả chúng, nên
    // phải dựng từ day-detail. Thiếu bước này thì quota đơn theo TUẦN bị đếm
    // thiếu ở tuần vắt qua hai tháng, và panel chi tiết của ngày đó rỗng.
    const monthDates = new Set(snapshot.days.map((day) => day.date));
    const outsideMonth = gridDates
      .filter((date) => !monthDates.has(date) && details.has(date))
      .map((date) =>
        createDayFromDetail(date, details.get(date)!.applicationForms),
      );

    return [...inMonth, ...outsideMonth];
  }, [snapshot, details, gridDates]);

  const daysByDate = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );

  const monthEstimate = useMemo<MonthEstimate | null>(() => {
    if (!snapshot) return null;
    return estimateMonth(days, snapshot.rules, snapshot.actualTotal);
  }, [days, snapshot]);

  const cells = useMemo<CalendarCell[]>(() => {
    const rules = snapshot?.rules;
    return gridDates.map((date) => {
      const day = daysByDate.get(date) ?? null;
      return {
        date,
        isCurrentMonth: date.startsWith(monthPrefix),
        isToday: date === today,
        day,
        estimate: day && rules ? estimateDay(day, rules) : null,
        isLoadingDetail: loadingDates.has(date),
      };
    });
  }, [gridDates, daysByDate, snapshot, loadingDates, monthPrefix, today]);

  const selectedDay = selectedDate
    ? (daysByDate.get(selectedDate) ?? null)
    : null;
  const selectedDetail = selectedDate
    ? (details.get(selectedDate) ?? null)
    : null;
  const selectedEstimate =
    selectedDay && snapshot ? estimateDay(selectedDay, snapshot.rules) : null;

  /* ------------------------------------------------------ đồng bộ với route */

  useEffect(() => {
    if (routeMonth == null || routeYear == null) return;
    if (routeMonth < 1 || routeMonth > 12) return;
    setViewDate((prev) =>
      prev.getFullYear() === routeYear && prev.getMonth() === routeMonth - 1
        ? prev
        : new Date(routeYear, routeMonth - 1, 1),
    );
  }, [routeMonth, routeYear]);

  useEffect(() => {
    if (routeSelectedDate === undefined) return;
    setSelectedDate((prev) =>
      prev === routeSelectedDate ? prev : routeSelectedDate,
    );
  }, [routeSelectedDate]);

  /* -------------------------------------------------------------- hành động */

  /**
   * Tải lại sau khi tạo hoặc xoá đơn.
   *
   * Đơn ảnh hưởng tổng tháng nên phải tải lại calendar; nhưng panel chi tiết KHÔNG
   * cần đóng rồi mở lại. Bản cũ phải đóng panel, `await reload()`, rồi dùng
   * `setTimeout(…, 0)` để mở lại — vì trạng thái nằm rải ở nhiều nơi nên mở lại
   * sớm sẽ đọc phải dữ liệu cũ.
   */
  const refreshDate = useCallback(
    async () => {
      // `reload` đã xoá sạch cache day-detail và effect sẽ tải lại những ngày cần
      // thiết, nên không cần xoá riêng ngày vừa đổi.
      await reload();
    },
    [reload],
  );

  return {
    // dữ liệu
    days,
    daysByDate,
    cells,
    rules: snapshot?.rules ?? null,
    userId: snapshot?.userId,
    annualLeaveAvailable: snapshot?.annualLeaveAvailable ?? 0,
    monthEstimate,
    today,

    // trạng thái
    isLoading,
    error,
    isLoadingDetails: loadingDates.size > 0,

    // lưới
    viewDate,
    month,
    year,

    // chọn ngày
    selectedDate,
    selectedDay,
    selectedDetail,
    selectedEstimate,
    isLoadingSelected: selectedDate ? loadingDates.has(selectedDate) : false,

    // hành động
    selectDate: setSelectedDate,
    closeDetail: useCallback(() => setSelectedDate(null), []),
    goToPreviousMonth: useCallback(
      () => setViewDate(new Date(year, month - 2, 1)),
      [month, year],
    ),
    goToNextMonth: useCallback(
      () => setViewDate(new Date(year, month, 1)),
      [month, year],
    ),
    goToToday: useCallback(() => {
      const now = new Date();
      setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }, []),
    setMonthYear: useCallback(
      (nextMonth: number, nextYear: number) =>
        setViewDate(new Date(nextYear, nextMonth - 1, 1)),
      [],
    ),
    reload,
    refreshDate,
  };
}

/**
 * Giới hạn của từng lý do (số lần/tuần, số phút/lần) nằm ở master data của HRM.
 * Lấy cho các loại đơn màn này dùng tới; hỏng thì trả rỗng và `buildRules` dùng
 * mặc định — giới hạn chỉ để cảnh báo nên không đáng làm vỡ cả màn hình.
 */
async function loadReasonLimits() {
  const TYPES_IN_USE = [1, 2, 4];
  const responses = await Promise.all(
    TYPES_IN_USE.map((typeId) =>
      applicationApi.getReasons(typeId).catch(() => ({ items: [] })),
    ),
  );
  return responses.flatMap((response) => response.items ?? []);
}
