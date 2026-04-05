'use client';

import { useState, useEffect } from 'react';
import { TimesheetCalendar } from './TimesheetCalendar';
import { TimesheetDayDetail } from './TimesheetDayDetail';
import { AutoCreateApplicationsDialog } from './AutoCreateApplicationsDialog';
import { useTimesheetCalendar } from '@/hooks/use-timesheet-calendar';
import {
  useReadTimesheetRouteState,
  useWriteTimesheetRouteQuery,
} from '@/hooks/use-timesheet-route-params';

export function TimesheetPageContent() {
  const routeState = useReadTimesheetRouteState();

  const [showAutoCreateDialog, setShowAutoCreateDialog] = useState(false);
  const [pendingDetailDate, setPendingDetailDate] = useState<string | null>(null);
  const {
    selectedDate,
    selectedDay,
    mergedDays,
    dayDetailLoadingDates,
    estimatedSummary,
    summary,
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
  } = useTimesheetCalendar({
    routeMonth: routeState.month,
    routeYear: routeState.year,
    routeSelectedDate: routeState.date,
  });

  useWriteTimesheetRouteQuery(month, year, selectedDate);

  // Tự động mở lại day detail sau khi calendar load xong và mergedDays đã được cập nhật
  useEffect(() => {
    if (!pendingDetailDate || isLoading) return;

    // Kiểm tra xem ngày đó có trong calendar timelines không (đã có data từ calendar)
    const hasCalendarData = calendar?.timelines.some((t) => {
      if (!t.date) return false;
      const timesheetDate = new Date(t.date).toISOString().split('T')[0];
      return timesheetDate === pendingDetailDate;
    });

    // Kiểm tra xem ngày đó có đang được fetch detail không
    const isFetchingDetail = dayDetailLoadingDates.has(pendingDetailDate);

    // Kiểm tra xem ngày đó có cần merge không (có pending forms)
    // Nếu ngày đó có trong summary.timelines và thỏa điều kiện để fetch detail, thì cần đợi merge xong
    const needsMerge = summary?.timelines.some((t) => {
      if (!t.date) return false;
      const timesheetDate = new Date(t.date).toISOString().split('T')[0];
      if (timesheetDate !== pendingDetailDate) return false;

      // Kiểm tra điều kiện để fetch detail (giống logic trong use-timesheet-calendar.ts)
      const isWorkingDay = t.work === '1';
      const missingCheckInOut = !t.timeIn || !t.timeOut;
      const hasViolation = t.minutesLate > 0 || t.minutesEarly > 0;
      const hasNoApprovedForms = !t.approvedApplicationForms || t.approvedApplicationForms.length === 0;

      return isWorkingDay && (missingCheckInOut || hasViolation) && hasNoApprovedForms;
    });

    // Nếu ngày đó cần merge, phải đợi mergedDays có data
    // Nếu không cần merge, chỉ cần có calendar data là đủ
    const hasMergedDataIfNeeded = needsMerge ? mergedDays.has(pendingDetailDate) : true;

    // Chỉ mở lại khi:
    // 1. Calendar đã load xong (!isLoading)
    // 2. Có data từ calendar (hasCalendarData)
    // 3. Không đang fetch detail (!isFetchingDetail)
    // 4. Đã có merged data (nếu cần merge) hoặc không cần merge
    if (hasCalendarData && !isFetchingDetail && hasMergedDataIfNeeded) {
      const dateToOpen = pendingDetailDate;
      // Sử dụng setTimeout để tránh cascading renders
      setTimeout(() => {
        setPendingDetailDate(null);
        onDayClick(dateToOpen);
      }, 0);
    }
  }, [pendingDetailDate, isLoading, dayDetailLoadingDates, mergedDays, calendar, onDayClick]);

  // Tự động mở lại day detail sau khi calendar load xong
  const handleReloadAndReopenDetail = async (date: string) => {
    setPendingDetailDate(date);
    onCloseDetail();
    await onReload();
    // useEffect sẽ tự động mở lại detail khi isLoading = false và mergedDays đã được cập nhật
  };

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
        onAutoCreate={() => setShowAutoCreateDialog(true)}
      />
      <TimesheetDayDetail
        date={selectedDate}
        data={{
          calendarDay: selectedDay,
          workingTime: calendar?.workingTime || null,
          calendarDays,
          mergedDays,
          userId: calendar?.userId,
        }}
        onClose={onCloseDetail}
        onApplicationFormCreated={handleReloadAndReopenDetail}
        isLoadingCalendar={isLoading || (pendingDetailDate !== null && selectedDate === pendingDetailDate)}
      />
      <AutoCreateApplicationsDialog
        open={showAutoCreateDialog}
        onOpenChange={setShowAutoCreateDialog}
        calendarDays={calendarDays}
        workingTime={calendar?.workingTime || null}
        userId={calendar?.userId}
        mergedDays={mergedDays}
        summary={summary}
        onSuccess={() => {
          onReload();
        }}
      />
    </div>
  );
}
