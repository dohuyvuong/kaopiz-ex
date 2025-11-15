'use client';

import dayjs from 'dayjs';
import { TimesheetDay } from '@/lib/types/timesheet';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimesheetDayCellProps {
  date: Date;
  timesheet: TimesheetDay | null;
  month: number; // Tháng hiện tại (1-12)
  onDayClick: (date: string, dayData?: TimesheetDay) => void;
  isLoading: boolean;
  hasPendingForms: boolean;
}

export function TimesheetDayCell({
  date,
  timesheet,
  month,
  onDayClick,
  isLoading,
  hasPendingForms,
}: TimesheetDayCellProps) {
  const dateStr = dayjs(date).format('YYYY-MM-DD');

  // Tự tính isCurrentMonth và isToday từ date
  const isCurrentMonth = date.getMonth() === month - 1;
  const isToday = dayjs(date).isSame(dayjs(), 'day');

  const getDayStatus = () => {
    if (!timesheet) return 'empty';
    if (timesheet.work === 'NL') return 'holiday';
    if (timesheet.work === 'N') return 'non-working';

    if (hasPendingForms) {
      // Có đơn chưa approve - đánh dấu màu khác
      if (timesheet.minutesLate > 0 || timesheet.minutesEarly > 0) return 'violation-pending';
      return 'pending';
    }

    if (timesheet.minutesLate > 0 || timesheet.minutesEarly > 0) return 'violation';
    if (timesheet.symbol === 'V' || timesheet.symbol === 'P') return 'approved';
    if (!timesheet.timeIn || !timesheet.timeOut) return 'missing';
    return 'normal';
  };

  const status = getDayStatus();
  const isHoliday = timesheet?.work === 'NL';

  return (
    <button
      onClick={() => {
        if (isCurrentMonth && timesheet) {
          onDayClick(dateStr, timesheet);
        }
      }}
      disabled={!isCurrentMonth || !timesheet}
      className={cn(
        'flex flex-col items-start p-2 min-h-[80px] border rounded-md text-left transition-colors',
        !isCurrentMonth && 'opacity-30 cursor-not-allowed',
        isCurrentMonth && timesheet && 'cursor-pointer hover:bg-accent',
        isToday && 'ring-2 ring-emerald-300',
        status === 'empty' && 'bg-muted/30',
        status === 'holiday' && 'bg-purple-50 border-purple-300',
        status === 'non-working' && 'bg-muted/50',
        status === 'violation' && 'bg-destructive/10 border-destructive/30',
        status === 'violation-pending' && 'bg-orange-50 border-orange-300',
        status === 'pending' && 'bg-blue-50 border-blue-200',
        status === 'approved' && 'bg-green-50 border-green-200',
        status === 'missing' && 'bg-yellow-50 border-yellow-200',
        status === 'normal' && 'bg-green-50 border-green-200',
      )}
    >
      {/* Row 1: Ngày và badge nghỉ lễ */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className="text-sm font-medium">{dayjs(date).date()}</div>
        {isHoliday && (
          <Badge variant="outline" className="text-xs px-1 py-0 bg-purple-100 text-purple-800 border-purple-300">
            Nghỉ lễ
          </Badge>
        )}
      </div>

      {/* Row 2: Nội dung cố định - mỗi dòng luôn chiếm một dòng */}
      <div className="space-y-1 text-xs w-full">
        {/* Dòng 1: Time In và Time Out - trên màn hình lớn hiển thị cùng một dòng */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-2 h-4 md:h-4">
          {/* Trên màn hình lớn: một icon clock cho cả hai */}
          <div className="hidden md:flex items-center gap-1 h-4">
            {(timesheet?.timeIn || timesheet?.timeOut) ? (
              <>
                <Clock className="h-3 w-3 shrink-0" />
                {timesheet?.timeIn && <span>{timesheet.timeIn}</span>}
                {timesheet?.timeIn && timesheet?.timeOut && <span> - </span>}
                {timesheet?.timeOut && <span>{timesheet.timeOut}</span>}
              </>
            ) : (
              <span className="invisible">-</span>
            )}
          </div>
          {/* Trên màn hình nhỏ: Time In với icon riêng */}
          <div className="flex md:hidden items-center gap-1 h-4">
            {timesheet?.timeIn ? (
              <>
                <Clock className="h-3 w-3 shrink-0" />
                <span>{timesheet.timeIn}</span>
              </>
            ) : (
              <span className="invisible">-</span>
            )}
          </div>
          {/* Trên màn hình nhỏ: Time Out với icon riêng */}
          <div className="flex md:hidden items-center gap-1 h-4">
            {timesheet?.timeOut ? (
              <>
                <Clock className="h-3 w-3 shrink-0" />
                <span>{timesheet.timeOut}</span>
              </>
            ) : (
              <span className="invisible">-</span>
            )}
          </div>
        </div>

        {/* Dòng 3: Đi muộn/Về sớm */}
        <div className="flex items-center gap-1 flex-wrap h-4 min-h-[16px]">
          {timesheet && (timesheet.minutesLate > 0 || timesheet.minutesEarly > 0) ? (
            <>
              {timesheet.minutesLate > 0 && (
                <Badge
                  variant={hasPendingForms ? 'secondary' : 'destructive'}
                  className={`text-xs px-1 py-0 ${
                    hasPendingForms ? 'bg-orange-100 text-orange-800 border-orange-300' : ''
                  }`}
                >
                  Muộn {timesheet.minutesLate}p
                </Badge>
              )}
              {timesheet.minutesEarly > 0 && (
                <Badge
                  variant={hasPendingForms ? 'secondary' : 'destructive'}
                  className={`text-xs px-1 py-0 ${
                    hasPendingForms ? 'bg-orange-100 text-orange-800 border-orange-300' : ''
                  }`}
                >
                  Sớm {timesheet.minutesEarly}p
                </Badge>
              )}
            </>
          ) : (
            <span className="invisible">-</span>
          )}
        </div>

        {/* Dòng 4: Work log */}
        <div className="flex items-center gap-1 text-muted-foreground h-4">
          {timesheet?.logWork ? (
            <>
              <Briefcase className="h-3 w-3 shrink-0" />
              <span>{timesheet.logWork.timeSpentHour}h</span>
              {timesheet.logWorkDiff !== 0 && (
                <span
                  className={
                    timesheet.logWorkDiff > 0 ? 'text-green-600' : 'text-destructive'
                  }
                >
                  ({timesheet.logWorkDiff > 0 ? '+' : ''}
                  {timesheet.logWorkDiff.toFixed(1)}h)
                </span>
              )}
            </>
          ) : (
            <span className="invisible">-</span>
          )}
        </div>

        {/* Dòng 5: Đơn từ */}
        <div className="flex items-center justify-between gap-2 h-4 min-h-[16px]">
          <div className="flex items-center gap-2 flex-wrap">
            {timesheet && timesheet.approvedApplicationForms && timesheet.approvedApplicationForms.length > 0 ? (
              <>
                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {timesheet.approvedApplicationForms.length} đơn
                </span>
                {/* Hiển thị các badge symbol bên cạnh số đơn */}
                {timesheet.symbol && (
                  <>
                    {timesheet.symbol.split(',').map((s, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {s.trim()}
                      </Badge>
                    ))}
                  </>
                )}
              </>
            ) : timesheet?.symbol &&
              (!timesheet.approvedApplicationForms ||
                timesheet.approvedApplicationForms.length === 0) ? (
              // Nếu có symbol nhưng không có đơn (trường hợp đặc biệt)
              <>
                {timesheet.symbol.split(',').map((s, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                    {s.trim()}
                  </Badge>
                ))}
              </>
            ) : (
              <span className="invisible">-</span>
            )}
          </div>
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
