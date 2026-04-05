/**
 * Query keys và parser cho màn timesheet.
 * Chỉ phụ thuộc `get` — có thể truyền URLSearchParams hoặc ReadonlyURLSearchParams từ Next.
 */
export const TIMESHEET_QUERY = {
  month: 'm',
  year: 'y',
  /** Ngày đang mở chi tiết, định dạng YYYY-MM-DD */
  date: 'date',
} as const;

export interface TimesheetUrlState {
  month: number;
  year: number;
  date: string | null;
}

/** Nguồn đọc query — DIP: không import next/navigation ở module parser */
export interface TimesheetSearchParamsSource {
  get(name: string): string | null;
}

function parseMonth(s: string | null): number | null {
  if (s == null || s === '') return null;
  const n = Number.parseInt(s, 10);
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return n;
}

function parseYear(s: string | null): number | null {
  if (s == null || s === '') return null;
  const n = Number.parseInt(s, 10);
  if (!Number.isInteger(n) || n < 1990 || n > 2100) return null;
  return n;
}

export const TIMESHEET_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateKey(s: string | null): string | null {
  if (s == null || s === '' || !TIMESHEET_ISO_DATE.test(s)) return null;
  return s;
}

/**
 * Đọc state hiển thị timesheet từ query.
 * - Có `date` nhưng thiếu m/y hợp lệ → lấy tháng/năm từ `date`.
 * - Thiếu hết → tháng/năm hiện tại (client), không mở detail.
 */
export function parseTimesheetSearchParams(
  source: TimesheetSearchParamsSource,
): TimesheetUrlState {
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  let month = parseMonth(source.get(TIMESHEET_QUERY.month));
  let year = parseYear(source.get(TIMESHEET_QUERY.year));
  const date = parseDateKey(source.get(TIMESHEET_QUERY.date));

  if (date && (month == null || year == null)) {
    const [y, m] = date.split('-').map((x) => Number.parseInt(x, 10));
    if (Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12) {
      month = m;
      year = y;
    }
  }

  if (month == null) month = defaultMonth;
  if (year == null) year = defaultYear;

  return { month, year, date };
}

/** Helper test / SSR: parse từ chuỗi query thuần */
export function parseTimesheetQueryString(search: string): TimesheetUrlState {
  return parseTimesheetSearchParams(new URLSearchParams(search));
}
