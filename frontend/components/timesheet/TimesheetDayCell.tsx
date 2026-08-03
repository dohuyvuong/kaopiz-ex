'use client';

import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarCell } from '@/hooks/use-timesheet-calendar';

interface TimesheetDayCellProps {
  cell: CalendarCell;
  onSelect: (date: string) => void;
}

/**
 * Trạng thái ô, xét theo thứ tự ưu tiên hiển thị.
 * Tách khỏi JSX để đọc được thành một câu chuyện thay vì chuỗi ternary.
 */
type CellStatus =
  | 'holiday'
  | 'non-working'
  | 'violation'
  | 'violation-covered'
  | 'missing-punch'
  | 'has-form'
  | 'normal'
  | 'empty';

function resolveStatus(cell: CalendarCell): CellStatus {
  const { day, estimate } = cell;
  if (!day) return 'empty';
  if (day.work === 'NL') return 'holiday';
  if (day.work === 'N') return 'non-working';

  const hasViolation =
    day.actual.minutesLate > 0 || day.actual.minutesEarly > 0;

  if (hasViolation) {
    // Còn vi phạm sau khi tính cả đơn chờ duyệt thì vẫn là đỏ.
    const remaining =
      (estimate?.estimated.minutesLate ?? day.actual.minutesLate) +
      (estimate?.estimated.minutesEarly ?? day.actual.minutesEarly);
    return remaining > 0 && !estimate?.hasPendingCoverage
      ? 'violation'
      : 'violation-covered';
  }

  if (!day.timeIn || !day.timeOut) return 'missing-punch';
  if (day.forms.length > 0) return 'has-form';
  return 'normal';
}

const STATUS_CLASS: Record<CellStatus, string> = {
  holiday: 'bg-purple-50 border-purple-300',
  'non-working': 'bg-muted/50',
  violation: 'bg-destructive/10 border-destructive/30',
  'violation-covered': 'bg-orange-50 border-orange-300',
  'missing-punch': 'bg-yellow-50 border-yellow-200',
  'has-form': 'bg-green-50 border-green-200',
  normal: 'bg-green-50 border-green-200',
  empty: 'bg-muted/30',
};

/**
 * Badge số phút vi phạm.
 *
 * Hiển thị cả ba con số khi có đơn chờ duyệt che một phần: vi phạm thực tế, số
 * phút đơn che được, và số còn lại — để người dùng thấy ngay đơn mình tạo có
 * khớp với số phút bị tính hay không.
 */
function ViolationBadge({
  label,
  actual,
  covered,
  estimated,
}: {
  label: string;
  actual: number;
  covered: number;
  estimated: number;
}) {
  if (actual <= 0) return null;
  const isCovered = covered > 0;

  return (
    <Badge
      variant={isCovered ? 'secondary' : 'destructive'}
      className={cn(
        'text-xs px-1 py-0',
        isCovered && 'bg-orange-100 text-orange-800 border-orange-300',
      )}
      title={
        isCovered
          ? `${label} ${actual} phút, đơn chờ duyệt che ${covered} phút, còn ${estimated} phút`
          : `${label} ${actual} phút`
      }
    >
      {label} {actual}p
      {isCovered && <span className="ml-1 font-normal">→ {estimated}p</span>}
    </Badge>
  );
}

export function TimesheetDayCell({ cell, onSelect }: TimesheetDayCellProps) {
  const { day, estimate, isCurrentMonth, isToday, isLoadingDetail } = cell;
  const status = resolveStatus(cell);
  const dayOfMonth = Number(cell.date.slice(8, 10));

  // Ngày ngoài tháng vẫn bấm được: panel chi tiết lấy dữ liệu từ day-detail API,
  // không phụ thuộc vào việc ngày đó có trong lưới tháng này hay không.
  const canSelect = !isLoadingDetail;

  return (
    <button
      type="button"
      onClick={() => canSelect && onSelect(cell.date)}
      disabled={!canSelect}
      className={cn(
        'flex flex-col items-start p-2 min-h-[80px] border rounded-md text-left transition-colors',
        !isCurrentMonth && 'opacity-40',
        canSelect && 'cursor-pointer hover:bg-accent',
        isLoadingDetail && 'cursor-wait opacity-60',
        isToday && 'ring-2 ring-emerald-300',
        STATUS_CLASS[status],
      )}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <div className="text-sm font-medium">{dayOfMonth}</div>
        {status === 'holiday' && (
          <Badge
            variant="outline"
            className="text-xs px-1 py-0 bg-purple-100 text-purple-800 border-purple-300"
          >
            Nghỉ lễ
          </Badge>
        )}
      </div>

      <div className="space-y-1 text-xs w-full">
        {/* Giờ vào / ra */}
        <div className="flex items-center gap-1 h-4">
          {day?.timeIn || day?.timeOut ? (
            <>
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {day.timeIn ?? '--:--'} - {day.timeOut ?? '--:--'}
              </span>
            </>
          ) : (
            <span className="invisible">-</span>
          )}
        </div>

        {/* Đi muộn / về sớm */}
        <div className="flex items-center gap-1 flex-wrap min-h-4">
          {day && (day.actual.minutesLate > 0 || day.actual.minutesEarly > 0) ? (
            <>
              <ViolationBadge
                label="Muộn"
                actual={day.actual.minutesLate}
                covered={estimate?.covered.minutesLate ?? 0}
                estimated={estimate?.estimated.minutesLate ?? 0}
              />
              <ViolationBadge
                label="Sớm"
                actual={day.actual.minutesEarly}
                covered={estimate?.covered.minutesEarly ?? 0}
                estimated={estimate?.estimated.minutesEarly ?? 0}
              />
            </>
          ) : (
            <span className="invisible">-</span>
          )}
        </div>

        {/* Work log */}
        <div className="flex items-center gap-1 text-muted-foreground h-4">
          {day?.logWork ? (
            <>
              <Briefcase className="h-3 w-3 shrink-0" />
              <span>{day.logWork.hours}h</span>
              {day.logWork.diff !== 0 && (
                <span
                  className={
                    day.logWork.diff > 0 ? 'text-green-600' : 'text-destructive'
                  }
                >
                  ({day.logWork.diff > 0 ? '+' : ''}
                  {day.logWork.diff.toFixed(1)}h)
                </span>
              )}
            </>
          ) : (
            <span className="invisible">-</span>
          )}
        </div>

        {/* Đơn từ */}
        <div className="flex items-center justify-between gap-2 min-h-4">
          <div className="flex items-center gap-1 flex-wrap text-muted-foreground">
            {day && day.forms.length > 0 ? (
              <>
                <FileText className="h-3 w-3 shrink-0" />
                <span>{day.forms.length} đơn</span>
                {day.forms.some((form) => !form.isApproved) && (
                  <span className="text-orange-700">(có đơn chờ duyệt)</span>
                )}
              </>
            ) : (
              <span className="invisible">-</span>
            )}
          </div>
          {isLoadingDetail && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
