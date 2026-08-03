'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Briefcase, Clock, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { applicationApi } from '@/lib/api/application';
import { extractErrorMessage } from '@/lib/api/error-message';
import { CreateApplicationFormDialog } from './CreateApplicationFormDialog';
import type {
  CalendarDay,
  DayEstimate,
  DayForm,
  TimesheetRules,
} from '@kaopiz/timesheet';
import type { TimesheetDayDetailResponse } from '@/lib/types/timesheet-day-detail';

interface TimesheetDayDetailProps {
  date: string | null;
  day: CalendarDay | null;
  detail: TimesheetDayDetailResponse | null;
  estimate: DayEstimate | null;
  rules: TimesheetRules | null;
  daysByDate: Map<string, CalendarDay>;
  userId?: number;
  today: string;
  isLoading: boolean;
  onClose: () => void;
  /** Gọi sau khi tạo hoặc xoá đơn — panel không đóng, chỉ tải lại dữ liệu. */
  onChanged: () => void;
}

function formatDateHeading(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPunchTime(iso: string | null): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Mô tả khoảng / mốc giờ của đơn thành một dòng đọc được. */
function describeSchedule(form: DayForm): string {
  const parts = form.intervals.map(
    (interval) => `${interval.start} – ${interval.end}`,
  );
  parts.push(...form.punches.map((punch) => `bổ sung mốc ${punch}`));
  return parts.join(', ') || 'Cả ngày';
}

function FormCard({
  form,
  onDelete,
  isDeleting,
}: {
  form: DayForm;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="p-3 border rounded-md space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold truncate">
          {form.typeName ?? `Đơn loại ${form.typeId}`}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={form.isApproved ? 'outline' : 'secondary'}
            className={
              form.isApproved
                ? ''
                : 'bg-orange-100 text-orange-800 border-orange-300'
            }
          >
            {form.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={isDeleting}
            onClick={onDelete}
            aria-label="Xoá đơn"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span>{describeSchedule(form)}</span>
      </div>
    </div>
  );
}

function ViolationRow({
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

  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
      <Badge variant={covered > 0 ? 'secondary' : 'destructive'}>
        {label}: {actual} phút
      </Badge>
      {covered > 0 && (
        <span className="text-muted-foreground">
          đơn chờ duyệt che <strong>{covered}</strong> phút, còn{' '}
          <strong
            className={estimated > 0 ? 'text-destructive' : 'text-green-600'}
          >
            {estimated}
          </strong>{' '}
          phút
        </span>
      )}
    </div>
  );
}

export function TimesheetDayDetail({
  date,
  day,
  detail,
  estimate,
  rules,
  daysByDate,
  userId,
  today,
  isLoading,
  onClose,
  onChanged,
}: TimesheetDayDetailProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setPendingDeleteId(null);
  }, [date]);

  const confirmDelete = useCallback(async () => {
    if (!date || pendingDeleteId == null) return;
    setDeletingId(pendingDeleteId);
    try {
      await applicationApi.deleteApplicationForms([pendingDeleteId]);
      toast.success('Đã xoá đơn từ');
      setPendingDeleteId(null);
      onChanged();
    } catch (err) {
      // Hiển thị nguyên văn lỗi HRM — nó biết lý do từ chối, ta thì không.
      toast.error(extractErrorMessage(err, 'Không xoá được đơn từ'));
    } finally {
      setDeletingId(null);
    }
  }, [date, pendingDeleteId, onChanged]);

  if (!date) return null;

  const isDeleteBusy = pendingDeleteId != null && deletingId === pendingDeleteId;
  const punches = detail?.timeSheets ?? [];
  const hasViolation =
    (estimate?.actual.minutesLate ?? 0) > 0 ||
    (estimate?.actual.minutesEarly ?? 0) > 0;

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Chi tiết chấm công — {formatDateHeading(date)}
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin chấm công</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Giờ vào
                      </div>
                      <div className="text-lg font-semibold">
                        {day?.timeIn ?? (
                          <span className="text-muted-foreground text-base">
                            Chưa chấm công
                          </span>
                        )}
                      </div>
                      {day?.timeInFinal && day.timeInFinal !== day.timeIn && (
                        <div className="text-xs text-muted-foreground">
                          Sau khi áp đơn: {day.timeInFinal}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Giờ ra</div>
                      <div className="text-lg font-semibold">
                        {day?.timeOut ?? (
                          <span className="text-muted-foreground text-base">
                            Chưa chấm công
                          </span>
                        )}
                      </div>
                      {day?.timeOutFinal && day.timeOutFinal !== day.timeOut && (
                        <div className="text-xs text-muted-foreground">
                          Sau khi áp đơn: {day.timeOutFinal}
                        </div>
                      )}
                    </div>
                  </div>

                  {estimate && hasViolation && (
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Đi muộn / về sớm
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateDialog(true)}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tạo đơn
                        </Button>
                      </div>
                      <ViolationRow
                        label="Đi muộn"
                        actual={estimate.actual.minutesLate}
                        covered={estimate.covered.minutesLate}
                        estimated={estimate.estimated.minutesLate}
                      />
                      <ViolationRow
                        label="Về sớm"
                        actual={estimate.actual.minutesEarly}
                        covered={estimate.covered.minutesEarly}
                        estimated={estimate.estimated.minutesEarly}
                      />
                    </div>
                  )}

                  {punches.length > 0 && (
                    <div className="pt-2 border-t">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="punches" className="border-none">
                          <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline">
                            {punches.length} lần quẹt máy
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1">
                              {punches.map((punch) => (
                                <div
                                  key={punch.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatPunchTime(punch.time)}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {punch.machineCode}
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

              {day?.logWork && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      Đã log:{' '}
                      <span className="font-semibold">
                        {day.logWork.hours} giờ
                      </span>
                    </div>
                    {day.logWork.diff !== 0 && (
                      <div>
                        Chênh lệch:{' '}
                        <span
                          className={
                            day.logWork.diff > 0
                              ? 'text-green-600 font-semibold'
                              : 'text-destructive font-semibold'
                          }
                        >
                          {day.logWork.diff > 0 ? '+' : ''}
                          {day.logWork.diff.toFixed(2)} giờ
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Một danh sách đơn duy nhất — đã duyệt và chờ duyệt cùng chỗ. */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Đơn từ
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateDialog(true)}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tạo đơn
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day && day.forms.length > 0 ? (
                    day.forms.map((form) => (
                      <FormCard
                        key={form.id}
                        form={form}
                        isDeleting={deletingId === form.id}
                        onDelete={() => setPendingDeleteId(form.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Chưa có đơn từ nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <CreateApplicationFormDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            date={date}
            day={day}
            rules={rules}
            daysByDate={daysByDate}
            userId={userId}
            today={today}
            onCreated={() => {
              setShowCreateDialog(false);
              onChanged();
            }}
          />
        </SheetContent>
      </Sheet>

      <Dialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => {
          if (!open && !isDeleteBusy) setPendingDeleteId(null);
        }}
      >
        <DialogContent showCloseButton={!isDeleteBusy} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá đơn từ?</DialogTitle>
            <DialogDescription>
              Hành động này không hoàn tác được từ đây. HRM có thể từ chối nếu đơn
              không đủ điều kiện xoá.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteId(null)}
              disabled={isDeleteBusy}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={isDeleteBusy}
            >
              {isDeleteBusy && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Xoá đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
