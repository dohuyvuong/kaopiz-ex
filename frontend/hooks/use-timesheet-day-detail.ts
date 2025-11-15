import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAppSelector } from '@/lib/hooks';
import { timesheetApi } from '@/lib/api/timesheet';
import { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface UseTimesheetDayDetailReturn {
  isLoading: boolean;
  error: string | null;
  day: TimesheetDayDetailResponse | null;
  checkIn: string | null;
  checkOut: string | null;
  parseISODate: (dateStr: string | null) => dayjs.Dayjs | null;
  formatDate: (dateStr: string) => string;
  formatDateTime: (dateStr: string | null) => string;
}

export function useTimesheetDayDetail(date: string | null): UseTimesheetDayDetailReturn {
  const hrmToken = useAppSelector((state) => state.auth.tokens.hrm?.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<TimesheetDayDetailResponse | null>(null);

  // Fetch day detail khi date hoặc hrmToken thay đổi
  useEffect(() => {
    if (!date || !hrmToken) {
      setDay(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await timesheetApi.getDayDetail(hrmToken, date);
        setDay(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [date, hrmToken]);

  // Helper để parse ISO date string và convert sang timezone của client
  const parseISODate = (dateStr: string | null): dayjs.Dayjs | null => {
    if (!dateStr) return null;
    // Parse ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
    // dayjs tự động parse ISO string và convert sang local timezone
    return dayjs(dateStr);
  };

  const formatDate = (dateStr: string) => {
    const parsed = parseISODate(dateStr);
    if (!parsed) return dateStr;
    // Format theo timezone của client
    return parsed.format('dddd, DD MMMM YYYY');
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const parsed = parseISODate(dateStr);
    if (!parsed) return dateStr;
    // Format theo timezone của client
    return parsed.format('HH:mm:ss');
  };

  // Tìm check-in đầu tiên và check-out cuối cùng
  const getCheckInOut = () => {
    if (!day?.timeSheets || day.timeSheets.length === 0) {
      return { checkIn: null, checkOut: null };
    }

    const sorted = [...day.timeSheets].sort((a, b) => {
      if (!a.time || !b.time) return 0;
      const dateA = parseISODate(a.time);
      const dateB = parseISODate(b.time);
      if (!dateA || !dateB) return 0;
      return dateA.valueOf() - dateB.valueOf();
    });

    return {
      checkIn: sorted[0]?.time || null,
      checkOut: sorted[sorted.length - 1]?.time || null,
    };
  };

  const { checkIn, checkOut } = getCheckInOut();

  return {
    isLoading,
    error,
    day,
    checkIn,
    checkOut,
    parseISODate,
    formatDate,
    formatDateTime,
  };
}
