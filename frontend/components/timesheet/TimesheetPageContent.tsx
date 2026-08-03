'use client';

import { useState } from 'react';
import { TimesheetCalendar } from './TimesheetCalendar';
import { TimesheetDayDetail } from './TimesheetDayDetail';
import { AutoCreateApplicationsDialog } from './AutoCreateApplicationsDialog';
import { useTimesheetCalendar } from '@/hooks/use-timesheet-calendar';
import {
  useReadTimesheetRouteState,
  useWriteTimesheetRouteQuery,
} from '@/hooks/use-timesheet-route-params';

export function TimesheetPageContent() {
  const route = useReadTimesheetRouteState();
  const [showAutoCreate, setShowAutoCreate] = useState(false);

  const calendar = useTimesheetCalendar({
    routeMonth: route.month,
    routeYear: route.year,
    routeSelectedDate: route.date,
  });

  useWriteTimesheetRouteQuery(
    calendar.month,
    calendar.year,
    calendar.selectedDate,
  );

  return (
    <div className="space-y-6">
      <TimesheetCalendar
        cells={calendar.cells}
        monthEstimate={calendar.monthEstimate}
        workingHours={
          calendar.rules
            ? {
                workStart: calendar.rules.workStart,
                workEnd: calendar.rules.workEnd,
              }
            : null
        }
        month={calendar.month}
        year={calendar.year}
        isLoading={calendar.isLoading}
        isLoadingDetails={calendar.isLoadingDetails}
        error={calendar.error}
        onSelectDate={calendar.selectDate}
        onPreviousMonth={calendar.goToPreviousMonth}
        onNextMonth={calendar.goToNextMonth}
        onToday={calendar.goToToday}
        onMonthYearChange={calendar.setMonthYear}
        onReload={() => void calendar.reload()}
        onAutoCreate={() => setShowAutoCreate(true)}
      />

      <TimesheetDayDetail
        date={calendar.selectedDate}
        day={calendar.selectedDay}
        detail={calendar.selectedDetail}
        estimate={calendar.selectedEstimate}
        rules={calendar.rules}
        daysByDate={calendar.daysByDate}
        userId={calendar.userId}
        today={calendar.today}
        isLoading={calendar.isLoadingSelected}
        onClose={calendar.closeDetail}
        onChanged={() => void calendar.refreshDate()}
      />

      <AutoCreateApplicationsDialog
        open={showAutoCreate}
        onOpenChange={setShowAutoCreate}
        days={calendar.days}
        rules={calendar.rules}
        actualTotal={calendar.monthEstimate?.actual ?? null}
        userId={calendar.userId}
        today={calendar.today}
        annualLeaveAvailable={calendar.annualLeaveAvailable}
        onCreated={() => void calendar.reload()}
      />
    </div>
  );
}
