'use client';

import { TimesheetDay } from '@/lib/types/timesheet';
import { DayDetailApplicationForm } from '@/lib/types/timesheet-day-detail';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { AlertCircle, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useCreateApplicationForm } from '@/hooks/use-create-application-form';

interface CreateApplicationFormDialogData {
  date: string; // Format: "YYYY-MM-DD"
  calendarDay?: TimesheetDay | null;
  workingTime?: { workStart: string; workEnd: string } | null;
  calendarDays?: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  dayDetail?: { applicationForms?: DayDetailApplicationForm[] } | null;
  userId?: number; // User ID từ calendar response
}

interface CreateApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CreateApplicationFormDialogData;
  onSuccess: () => void;
}

export function CreateApplicationFormDialog({
  open,
  onOpenChange,
  data,
  onSuccess,
}: CreateApplicationFormDialogProps) {
  const {
    typeId,
    setTypeId,
    reasonId,
    setReasonId,
    approverIds,
    setApproverId,
    timeStart,
    setTimeStart,
    timeEnd,
    setTimeEnd,
    types,
    selectedType,
    availableReasons,
    selectedReason,
    selectedReasonDisplayName,
    approvers,
    loadingApprovers,
    loading,
    loadingTypes,
    error,
    validationError,
    warningMessage,
    minutes,
    handleSubmit: handleSubmitInternal,
  } = useCreateApplicationForm({
    open,
    date: data.date,
    calendarDay: data.calendarDay,
    workingTime: data.workingTime,
    calendarDays: data.calendarDays,
    mergedDays: data.mergedDays,
    dayDetail: data.dayDetail,
    userId: data.userId,
  });

  const handleSubmit = async () => {
    const success = await handleSubmitInternal();
    if (success) {
      toast.success('Tạo đơn từ thành công');
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo đơn từ</DialogTitle>
          <DialogDescription>
            Tạo đơn từ cho ngày {dayjs(data.date).format('DD/MM/YYYY')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingTypes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Đang tải danh sách loại đơn...
              </span>
            </div>
          ) : (
            <>
              {/* Loại đơn */}
              <div className="space-y-2">
                <Label htmlFor="typeId">Loại đơn</Label>
                <Select
                  value={String(typeId)}
                  onValueChange={(value) => setTypeId(Number(value))}
                >
                  <SelectTrigger id="typeId" className="w-full">
                    <SelectValue placeholder="Chọn loại đơn" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lý do */}
              {selectedType && availableReasons.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="reasonId">Lý do</Label>
                  <Select
                    value={reasonId ? String(reasonId) : ''}
                    onValueChange={(value) =>
                      setReasonId(value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger id="reasonId" className="w-full">
                      <SelectValue placeholder="Chọn lý do">
                        {selectedReasonDisplayName || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableReasons.map((reason) => (
                        <SelectItem key={reason.id} value={String(reason.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{reason.name}</span>
                            {reason.description && (
                              <span className="text-xs text-muted-foreground">
                                {reason.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Hiển thị description của reason đã chọn */}
                  {selectedReason?.description && (
                    <p className="text-xs text-muted-foreground">
                      {selectedReason.description}
                    </p>
                  )}
                </div>
              )}

              {/* Người duyệt */}
              {selectedType && selectedType.orderMax > 0 && (
                <div className="space-y-4">
                  {loadingApprovers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải danh sách người duyệt...
                    </div>
                  ) : (
                    // Loop từ 0 đến orderMax - 1
                    Array.from({ length: selectedType.orderMax }, (_, index) => {
                      const order = index; // 0-based
                      const approverId = approverIds[order] || null;
                      const approversList = approvers[order] || [];

                      // Chuyển đổi sang format cho Combobox
                      const comboboxOptions = approversList.map((approver) => ({
                        value: String(approver.userId),
                        label: `${approver.user.name} (${approver.user.email})`,
                      }));

                      return (
                        <div key={order} className="space-y-2">
                          <Label htmlFor={`approver-${order}`}>
                            Người duyệt {order + 1} *
                          </Label>
                          <Combobox
                            options={comboboxOptions}
                            value={approverId ? String(approverId) : undefined}
                            onValueChange={(value) =>
                              setApproverId(
                                order,
                                value ? Number(value) : null,
                              )
                            }
                            placeholder={`Chọn người duyệt ${order + 1}`}
                            searchPlaceholder="Tìm kiếm người duyệt..."
                            emptyText="Không tìm thấy người duyệt."
                            disabled={loadingApprovers}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}

          {/* Thời gian (cho đơn Vắng mặt) */}
          {typeId === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-700 mb-2">
                  Thời gian đã được tự động xác định dựa trên dữ liệu chấm công
                </div>
                {data.calendarDay && data.calendarDay.minutesLate > 0 && (
                  <div className="text-xs text-blue-600">
                    Đi muộn {data.calendarDay.minutesLate} phút: từ {data.workingTime?.workStart || '08:30'} đến tối đa 1 tiếng (hoặc {data.calendarDay.timeIn} nếu sớm hơn)
                  </div>
                )}
                {data.calendarDay && data.calendarDay.minutesEarly > 0 && (
                  <div className="text-xs text-blue-600">
                    Về sớm {data.calendarDay.minutesEarly} phút: từ tối đa 1 tiếng trước {data.workingTime?.workEnd || '17:30'} (hoặc {data.calendarDay.timeOut} nếu muộn hơn) đến {data.workingTime?.workEnd || '17:30'}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeStart">Thời gian bắt đầu</Label>
                  <Input
                    id="timeStart"
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    placeholder="08:30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeEnd">Thời gian kết thúc</Label>
                  <Input
                    id="timeEnd"
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    placeholder="09:00"
                  />
                </div>
              </div>
              {minutes !== null && (
                <div className="text-sm text-muted-foreground">
                  Số phút: <span className="font-semibold">{minutes} phút</span>
                  {minutes > 60 && (
                    <span className="text-destructive ml-2">
                      (Vượt quá 60 phút)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Thời gian (cho đơn Nghỉ phép - optional) */}
          {typeId === 1 && (
            <div className="space-y-4">
              {timeStart && timeEnd ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-xs text-blue-700">
                    Thời gian đã được tự động xác định: {timeStart} - {timeEnd}
                    {timeStart === (data.workingTime?.workStart || '08:30') && timeEnd === (data.workingTime?.workEnd || '17:30') ? ' (cả ngày)' : ''}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-xs text-blue-700">
                    Vui lòng nhập thời gian nghỉ phép. Thời gian mặc định: {data.workingTime?.workStart || '08:30'} - {data.workingTime?.workEnd || '17:30'} (cả ngày)
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeStart">Thời gian bắt đầu (tùy chọn)</Label>
                  <Input
                    id="timeStart"
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    placeholder="08:30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeEnd">Thời gian kết thúc (tùy chọn)</Label>
                  <Input
                    id="timeEnd"
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    placeholder="17:30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Warning message */}
          {warningMessage && (
            <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {warningMessage}
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {validationError}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tạo đơn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
