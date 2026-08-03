'use client';

import { TimesheetDayCell } from './TimesheetDayCell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { CalendarCell } from '@/hooks/use-timesheet-calendar';
import type { MonthEstimate } from '@kaopiz/timesheet';

const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

interface TimesheetCalendarProps {
  cells: CalendarCell[];
  monthEstimate: MonthEstimate | null;
  workingHours: { workStart: string; workEnd: string } | null;
  month: number;
  year: number;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  onSelectDate: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthYearChange: (month: number, year: number) => void;
  onReload: () => void;
  onAutoCreate: () => void;
}

/** Tổng hợp tháng: thực tế, ước tính sau khi duyệt, và mức vượt hạn. */
function MonthSummary({
  estimate,
  workingHours,
}: {
  estimate: MonthEstimate;
  workingHours: { workStart: string; workEnd: string } | null;
}) {
  const actualTotal = estimate.actual.minutesLate + estimate.actual.minutesEarly;
  const estimatedTotal =
    estimate.estimated.minutesLate + estimate.estimated.minutesEarly;
  const hasPending = estimatedTotal !== actualTotal;

  return (
    <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2 flex-wrap">
      <div>
        Đi muộn:{' '}
        <span className="font-semibold text-foreground">
          {estimate.actual.minutesLate} phút
        </span>
      </div>
      <div>
        Về sớm:{' '}
        <span className="font-semibold text-foreground">
          {estimate.actual.minutesEarly} phút
        </span>
      </div>
      <div>
        Tổng{' '}
        <span
          className={
            actualTotal > estimate.allowedMinutes
              ? 'font-semibold text-destructive'
              : 'font-semibold text-foreground'
          }
        >
          {actualTotal}
        </span>
        /{estimate.allowedMinutes} phút miễn phạt
      </div>

      {hasPending && (
        <>
          <div className="text-muted-foreground">|</div>
          <div>
            Nếu duyệt hết đơn chờ:{' '}
            <span className="font-semibold text-blue-600">
              {estimatedTotal} phút
            </span>
          </div>
        </>
      )}

      {estimate.estimatedOverage > 0 && (
        <div className="text-destructive font-medium">
          Vượt {estimate.estimatedOverage} phút
        </div>
      )}

      {workingHours && (
        <>
          <div className="text-muted-foreground">|</div>
          <div>
            Giờ làm:{' '}
            <span className="font-semibold text-foreground">
              {workingHours.workStart} - {workingHours.workEnd}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function TimesheetCalendar({
  cells,
  monthEstimate,
  workingHours,
  month,
  year,
  isLoading,
  isLoadingDetails,
  error,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onMonthYearChange,
  onReload,
  onAutoCreate,
}: TimesheetCalendarProps) {
  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => new Date().getFullYear() - 2 + index,
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>
            Chấm công tháng {month}/{year}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={String(month)}
              onValueChange={(value) => onMonthYearChange(Number(value), year)}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    Tháng {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(year)}
              onValueChange={(value) => onMonthYearChange(month, Number(value))}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToday}>
              Hôm nay
            </Button>
            <Button variant="outline" size="sm" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReload}
              title="Tải lại dữ liệu"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={onAutoCreate}
              disabled={isLoadingDetails}
              className="gap-2"
              title={
                isLoadingDetails
                  ? 'Đang tải chi tiết các ngày, chờ một chút để tính đúng'
                  : undefined
              }
            >
              <Sparkles className="h-4 w-4" />
              Tự động tạo đơn
            </Button>
          </div>
        </div>

        {monthEstimate && (
          <MonthSummary
            estimate={monthEstimate}
            workingHours={workingHours}
          />
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {WEEK_DAY_LABELS.map((label) => (
            <div
              key={label}
              className="p-2 text-center text-sm font-semibold text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {cells.map((cell) => (
            <TimesheetDayCell
              key={cell.date}
              cell={cell}
              onSelect={onSelectDate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
