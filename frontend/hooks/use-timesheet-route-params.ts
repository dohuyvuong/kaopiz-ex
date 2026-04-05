'use client';

/**
 * Tách concern “định tuyến timesheet”: đọc / ghi query cho một màn.
 * Page chỉ compose: đọc → calendar; calendar state → ghi (một nơi duy nhất push lên URL).
 */

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  parseTimesheetSearchParams,
  TIMESHEET_QUERY,
  type TimesheetUrlState,
} from '@/lib/url-state/timesheet-query';
import { useUrlQuerySync } from '@/lib/url-state/use-url-query-sync';

/** State hiển thị lấy từ URL (back/forward, deep link, F5). */
export function useReadTimesheetRouteState(): TimesheetUrlState {
  const searchParams = useSearchParams();
  const serialized = searchParams.toString();

  return useMemo(
    () => parseTimesheetSearchParams(new URLSearchParams(serialized)),
    [serialized],
  );
}

/** Đồng bộ tháng/năm/ngày đang chọn từ calendar lên query (replace, giữ param khác). */
export function useWriteTimesheetRouteQuery(
  month: number,
  year: number,
  selectedDate: string | null,
): void {
  const getPatch = useCallback(
    () => ({
      [TIMESHEET_QUERY.month]: String(month),
      [TIMESHEET_QUERY.year]: String(year),
      [TIMESHEET_QUERY.date]: selectedDate ?? null,
    }),
    [month, year, selectedDate],
  );

  useUrlQuerySync(getPatch);
}
