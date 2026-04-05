import { Suspense } from 'react';
import { TimesheetPageContent } from '@/components/timesheet/TimesheetPageContent';

export default function TimesheetPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải chấm công…</div>
      }
    >
      <TimesheetPageContent />
    </Suspense>
  );
}
