'use client';

import dayjs from 'dayjs';
import { TimesheetDay } from '@/lib/types/timesheet';
import { TimesheetDayCell } from './TimesheetDayCell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface TimesheetCalendarProps {
  onDayClick: (date: string, day?: TimesheetDay) => void;
  mergedDays: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  dayDetailLoadingDates: Set<string>;
  estimatedSummary: { minutesLate: number; minutesEarly: number } | null;
  isLoading: boolean;
  error: string | null;
  viewDate: Date;
  calendar: {
    timelines: TimesheetDay[];
    workingTime: { workStart: string; workEnd: string; timezone: string; timezoneValue: string };
    summary: { minutesLate: number; minutesEarly: number };
  } | null;
  month: number;
  year: number;
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  monthOptions: number[];
  yearOptions: number[];
  weekDayLabels: string[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthYearChange: (newMonth: number, newYear: number) => void;
  onReload: () => Promise<void>;
  formatMonthYear: (date: Date) => string;
  onAutoCreate?: () => void;
}

export function TimesheetCalendar({
  onDayClick,
  mergedDays,
  dayDetailLoadingDates,
  estimatedSummary,
  isLoading,
  error,
  viewDate,
  calendar,
  month,
  year,
  calendarDays,
  monthOptions,
  yearOptions,
  weekDayLabels,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onMonthYearChange,
  onReload,
  formatMonthYear,
  onAutoCreate,
}: TimesheetCalendarProps) {

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
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
          <CardTitle>Chấm công tháng {formatMonthYear(viewDate)}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chọn tháng/năm nhanh */}
            <div className="flex items-center gap-2">
              <Select
                value={String(month)}
                onValueChange={(value) => onMonthYearChange(Number(value), year)}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
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
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Nút điều hướng */}
            <div className="flex items-center gap-2">
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
                disabled={isLoading}
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        {calendar && (
          <div className="flex items-center justify-end mt-2">
            <Button
              variant="default"
              size="sm"
              onClick={onAutoCreate}
              disabled={isLoading || dayDetailLoadingDates.size > 0}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Tự động tạo đơn
            </Button>
          </div>
        )}
        {calendar && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
            <div>
              Tổng đi muộn: <span className="font-semibold text-foreground">{calendar.summary.minutesLate} phút</span>
            </div>
            <div>
              Tổng về sớm: <span className="font-semibold text-foreground">{calendar.summary.minutesEarly} phút</span>
            </div>
            {estimatedSummary && (estimatedSummary.minutesLate !== calendar.summary.minutesLate || estimatedSummary.minutesEarly !== calendar.summary.minutesEarly) && (
              <>
                <div className="text-muted-foreground">|</div>
                <div>
                  Tổng đi muộn (nếu approve): <span className="font-semibold text-blue-600">{estimatedSummary.minutesLate} phút</span>
                </div>
                <div>
                  Tổng về sớm (nếu approve): <span className="font-semibold text-blue-600">{estimatedSummary.minutesEarly} phút</span>
                </div>
              </>
            )}
            <div className="text-muted-foreground">|</div>
            <div>
              Giờ làm: <span className="font-semibold text-foreground">
                {calendar.workingTime.workStart} - {calendar.workingTime.workEnd}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Header: Tên các ngày trong tuần */}
          {weekDayLabels.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => {
            const { date, timesheet } = dayData;
            const dateStr = dayjs(date).format('YYYY-MM-DD');
            const mergedData = mergedDays.get(dateStr);
            const isLoading = dayDetailLoadingDates.has(dateStr);

            return (
              <TimesheetDayCell
                key={index}
                date={date}
                timesheet={mergedData || timesheet}
                month={month}
                onDayClick={onDayClick}
                isLoading={isLoading}
                hasPendingForms={mergedData?.hasPendingForms || false}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
