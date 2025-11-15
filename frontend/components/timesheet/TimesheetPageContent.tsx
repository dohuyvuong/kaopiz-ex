'use client';

import { TimesheetCalendar } from './TimesheetCalendar';
import { TimesheetDayDetail } from './TimesheetDayDetail';
import { useTimesheetCalendar } from '@/hooks/use-timesheet-calendar';

export function TimesheetPageContent() {
  const {
    selectedDate,
    selectedDay,
    mergedDays,
    dayDetailLoadingDates,
    estimatedSummary,
    onDayClick,
    onCloseDetail,
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
  } = useTimesheetCalendar();

  return (
    <div className="space-y-6">
      <TimesheetCalendar
        onDayClick={onDayClick}
        mergedDays={mergedDays}
        dayDetailLoadingDates={dayDetailLoadingDates}
        estimatedSummary={estimatedSummary}
        isLoading={isLoading}
        error={error}
        viewDate={viewDate}
        calendar={calendar}
        month={month}
        year={year}
        calendarDays={calendarDays}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        weekDayLabels={weekDayLabels}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
        onMonthYearChange={onMonthYearChange}
        onReload={onReload}
        formatMonthYear={formatMonthYear}
      />
      <TimesheetDayDetail
        date={selectedDate}
        data={{
          calendarDay: selectedDay,
          workingTime: calendar?.workingTime || null,
          calendarDays,
          userId: calendar?.userId,
        }}
        onClose={onCloseDetail}
      />
    </div>
  );
}
