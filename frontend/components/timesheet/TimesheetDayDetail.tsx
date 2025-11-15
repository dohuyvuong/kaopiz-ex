'use client';

import { TimesheetDay } from '@/lib/types/timesheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, Briefcase, FileText, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTimesheetDayDetail } from '@/hooks/use-timesheet-day-detail';
import { CreateApplicationFormDialog } from './CreateApplicationFormDialog';
import { useState, useMemo } from 'react';

interface TimesheetDayDetailData {
  calendarDay?: TimesheetDay | null;
  workingTime?: { workStart: string; workEnd: string } | null;
  calendarDays?: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  userId?: number;
}

interface TimesheetDayDetailProps {
  date: string | null;
  data?: TimesheetDayDetailData;
  onClose: () => void;
}

export function TimesheetDayDetail({ date, data, onClose }: TimesheetDayDetailProps) {
  const calendarDay = data?.calendarDay;
  const workingTime = data?.workingTime;
  const calendarDays = data?.calendarDays;
  const userId = data?.userId;
  const {
    isLoading,
    error,
    day,
    checkIn,
    checkOut,
    parseISODate,
    formatDate,
    formatDateTime,
  } = useTimesheetDayDetail(date);
  const [showCreateFormDialog, setShowCreateFormDialog] = useState(false);

  // Kiểm tra xem có đơn chưa approve (status !== 3) và là typeId 1 hoặc 2 cho ngày đó không
  // Logic này giống với hasPendingForms trong calendar
  const hasPendingForms = useMemo(() => {
    // Kiểm tra từ day detail (tất cả đơn, bao gồm cả chưa approve)
    const hasPending = day?.applicationForms?.some(
      (form) => form.status !== 3 && (form.typeId === 1 || form.typeId === 2),
    );

    return hasPending || false;
  }, [day]);

  if (!date) return null;

  const handleCreateFormSuccess = () => {
    // Reload data sau khi tạo đơn thành công
    // Component sẽ tự động reload khi date thay đổi hoặc khi parent reload
    window.location.reload(); // Tạm thời dùng reload, có thể cải thiện sau
  };

  return (
    <Sheet open={!!date} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chi tiết chấm công - {formatDate(date)}</SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Đang tải...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {day && !isLoading && (
          <div className="space-y-4 p-4">
            {/* Thông tin check-in/check-out */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin chấm công</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Check-in</div>
                    <div className="text-lg font-semibold">
                      {checkIn ? formatDateTime(checkIn) : (
                        <span className="text-muted-foreground">Chưa check-in</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Check-out</div>
                    <div className="text-lg font-semibold">
                      {checkOut ? formatDateTime(checkOut) : (
                        <span className="text-muted-foreground">Chưa check-out</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin đi muộn/về sớm */}
                {calendarDay && (calendarDay.minutesLate > 0 || calendarDay.minutesEarly > 0) && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Đi muộn/Về sớm:</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateFormDialog(true)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tạo đơn
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {calendarDay.minutesLate > 0 && (
                        <Badge
                          variant={hasPendingForms ? 'secondary' : 'destructive'}
                          className={`text-sm ${
                            hasPendingForms
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : ''
                          }`}
                        >
                          Đi muộn: {calendarDay.minutesLate} phút
                        </Badge>
                      )}
                      {calendarDay.minutesEarly > 0 && (
                        <Badge
                          variant={hasPendingForms ? 'secondary' : 'destructive'}
                          className={`text-sm ${
                            hasPendingForms
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : ''
                          }`}
                        >
                          Về sớm: {calendarDay.minutesEarly} phút
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Danh sách tất cả các lần chấm công */}
                {day.timeSheets && day.timeSheets.length > 0 && (
                  <div className="pt-2 border-t">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="timeSheets" className="border-none">
                        <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline">
                          Tất cả các lần chấm công:
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1">
                            {day.timeSheets.map((record, index) => (
                              <div key={record.id || index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{record.time ? formatDateTime(record.time) : 'N/A'}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {record.machineCode}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work log từ calendar */}
            {calendarDay?.logWork && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Thời gian làm việc: </span>
                      <span className="font-semibold">{calendarDay.logWork.timeSpentHour} giờ</span>
                    </div>
                    {calendarDay.logWorkDiff !== 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Chênh lệch: </span>
                        <span className={calendarDay.logWorkDiff > 0 ? 'text-green-600 font-semibold' : 'text-destructive font-semibold'}>
                          {calendarDay.logWorkDiff > 0 ? '+' : ''}
                          {calendarDay.logWorkDiff.toFixed(2)} giờ
                        </span>
                      </div>
                    )}
                    {calendarDay.logWorkNeeded > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Cần log: </span>
                        <span className="font-semibold">{calendarDay.logWorkNeeded} giờ</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Các đơn */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Đơn
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateFormDialog(true)}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tạo đơn
                  </Button>
                </div>
              </CardHeader>
              {(day.applicationForms && day.applicationForms.length > 0) || (calendarDay?.approvedApplicationForms && calendarDay.approvedApplicationForms.length > 0) ? (
                <CardContent className="space-y-3">
                  {/* Đơn từ day detail API */}
                  {day.applicationForms && day.applicationForms.map((form, index) => (
                    <div
                      key={form.id || index}
                      className="p-3 border rounded-md space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">
                            {form.type.name}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {form.status === 3 ? 'Đã duyệt' : form.status === 1 ? 'Chờ duyệt' : form.status === 2 ? 'Chờ duyệt (bước 2)' : `Status ${form.status}`}
                        </Badge>
                      </div>
                      {form.data.trackingTimes && form.data.trackingTimes.length > 0 && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {form.data.trackingTimes.map((track, trackIndex) => (
                            <div key={trackIndex} className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {track.timeStart && track.timeEnd && (
                                <span>
                                  {track.timeStart} - {track.timeEnd}
                                </span>
                              )}
                              {track.date && (
                                <span className="text-foreground">
                                  ({parseISODate(track.date)?.format('DD/MM/YYYY') || track.date})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {form.startDate && form.endDate && (
                        <div className="text-xs text-muted-foreground">
                          Thời gian: {parseISODate(form.startDate)?.format('DD/MM/YYYY') || form.startDate}
                          {(() => {
                            const start = parseISODate(form.startDate);
                            const end = parseISODate(form.endDate);
                            if (!start || !end || start.isSame(end, 'day')) return null;
                            return <> - {end.format('DD/MM/YYYY')}</>;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Đơn từ calendar (nếu không có trong day detail) */}
                  {calendarDay?.approvedApplicationForms && calendarDay.approvedApplicationForms.map((form, index) => {
                    // Chỉ hiển thị nếu không có trong day.applicationForms
                    const existsInDetail = day.applicationForms?.some(f => f.id === form.id);
                    if (existsInDetail) return null;

                    return (
                      <div
                        key={form.id || index}
                        className="p-3 border rounded-md space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">
                              {form.typeId === 1 ? 'Nghỉ phép' : form.typeId === 2 ? 'Vắng mặt' : form.typeId === 3 ? 'Check-in/out' : `Loại ${form.typeId}`}
                            </span>
                          </div>
                          <Badge variant="outline">Đã duyệt</Badge>
                        </div>
                        {form.data?.trackingTimes && form.data.trackingTimes.length > 0 && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            {form.data.trackingTimes.map((track, trackIndex) => (
                              <div key={trackIndex} className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {track.timeStart && track.timeEnd && (
                                  <span>
                                    {track.timeStart} - {track.timeEnd}
                                  </span>
                                )}
                                {track.reason && (
                                  <span className="text-foreground">({track.reason})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {form.startDate && form.endDate && (
                          <div className="text-xs text-muted-foreground">
                            Thời gian: {parseISODate(form.startDate)?.format('DD/MM/YYYY') || form.startDate}
                            {(() => {
                              const start = parseISODate(form.startDate);
                              const end = parseISODate(form.endDate);
                              if (!start || !end || start.isSame(end, 'day')) return null;
                              return <> - {end.format('DD/MM/YYYY')}</>;
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              ) : (
                <CardContent>
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Chưa có đơn từ nào
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Create Application Form Dialog */}
               <CreateApplicationFormDialog
                 open={showCreateFormDialog}
                 onOpenChange={setShowCreateFormDialog}
                 data={{
                   date: date,
                   calendarDay,
                   workingTime,
                   calendarDays,
                   dayDetail: day ? { applicationForms: day.applicationForms } : null,
                   userId,
                 }}
                 onSuccess={handleCreateFormSuccess}
               />
      </SheetContent>
    </Sheet>
  );
}
