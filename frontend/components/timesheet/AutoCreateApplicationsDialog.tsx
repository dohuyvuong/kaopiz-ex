'use client';

import { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAutoCreateApplications } from '@/hooks/use-auto-create-applications';
import { ApplicationToCreate } from '@/lib/utils/auto-create-applications';
import { TimesheetDay } from '@/lib/types/timesheet';

interface AutoCreateApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  workingTime: { workStart: string; workEnd: string } | null;
  userId?: number;
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  summary?: {
    timelines: TimesheetDay[];
    summary: { minutesLate: number; minutesEarly: number };
  } | null;
  onSuccess?: () => void;
}

export function AutoCreateApplicationsDialog({
  open,
  onOpenChange,
  calendarDays,
  workingTime,
  userId,
  mergedDays,
  summary,
  onSuccess,
}: AutoCreateApplicationsDialogProps) {
  const {
    applications,
    loading,
    error,
    calculateApplications,
    createApplications,
    totalMinutesReduced,
    updateApplication,
    removeApplication,
    progress,
    previewAfterApprove,
    missingApprovers,
    createSummary,
    resetCreateFeedback,
  } = useAutoCreateApplications({
    calendarDays,
    workingTime,
    userId,
    mergedDays,
    summary,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ApplicationToCreate | null>(null);
  const prevOpenRef = useRef(open);

  // Tự động tính toán khi mở dialog
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Dialog vừa mở (chuyển từ false sang true)
      calculateApplications();
    }
    prevOpenRef.current = open;
  }, [open, calculateApplications]);

  // Reset edit state khi dialog mở
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Sử dụng setTimeout để tránh lỗi linter
      setTimeout(() => {
        setEditingIndex(null);
        setEditForm(null);
      }, 0);
    }
  }, [open]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetCreateFeedback();
      setEditingIndex(null);
      setEditForm(null);
    }
    onOpenChange(nextOpen);
  };

  const handleCreate = async () => {
    const totalToCreate = applications.length;
    const success = await createApplications();
    if (success) {
      toast.success(`Đã tạo thành công ${totalToCreate} đơn`);
      onSuccess?.();
      handleDialogOpenChange(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...applications[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editForm) {
      updateApplication(editingIndex, editForm);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleDelete = (index: number) => {
    if (confirm('Bạn có chắc muốn xóa đơn này?')) {
      removeApplication(index);
    }
  };

  const getTypeName = (typeId: number): string => {
    return typeId === 1 ? 'Nghỉ phép' : 'Vắng mặt';
  };

  const getReasonName = (reasonId: number): string => {
    return reasonId === 4 ? 'Nghỉ phép năm' : 'Thay đổi thời gian làm việc';
  };

  const calculateMinutes = (
    timeStart: string,
    timeEnd: string,
  ): number | null => {
    if (!timeStart || !timeEnd) return null;
    try {
      const start = dayjs(`2000-01-01 ${timeStart}`, 'YYYY-MM-DD HH:mm');
      const end = dayjs(`2000-01-01 ${timeEnd}`, 'YYYY-MM-DD HH:mm');
      if (!start.isValid() || !end.isValid()) return null;
      const diff = end.diff(start, 'minute');
      return diff > 0 ? diff : null;
    } catch {
      return null;
    }
  };

  const totalViolationMinutes =
    (summary?.summary.minutesLate || 0) + (summary?.summary.minutesEarly || 0);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tự động tạo đơn</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động tạo các đơn cần thiết cho phần vượt quá 90 phút
            (miễn phạt). 90 phút đầu tiên không cần làm đơn vì không bị phạt.
          </DialogDescription>
        </DialogHeader>

        {loading && applications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Đang tính toán các đơn cần tạo...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              </div>
            )}
            {createSummary && createSummary.created > 0 && createSummary.failed > 0 && (
              <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-950/20 dark:border-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Đã tạo thành công {createSummary.created} đơn
                  </p>
                </div>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {totalViolationMinutes > 90
                    ? 'Không có đơn cần tạo thêm trong phạm vi 7 ngày gần nhất.'
                    : 'Không cần tạo đơn. Tổng đi muộn/về sớm đã ≤ 90 phút.'}
                </span>
              </div>
            ) : (
              <>
              {/* Cảnh báo thiếu người duyệt */}
              {missingApprovers.length > 0 && (
                <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      Thiếu người duyệt cho các loại đơn sau:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                      {missingApprovers.map((missing) => (
                        <li key={missing.typeId}>
                          <strong>{missing.typeName}</strong>: Thiếu người duyệt bước{' '}
                          {missing.missingOrders.join(', ')}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                      Vui lòng cấu hình người duyệt mặc định trước khi tạo đơn.
                    </p>
                  </div>
                </div>
              )}

              {/* Preview sau khi tất cả đơn được approve */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Preview sau khi tất cả đơn được approve:
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Đi muộn:</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {previewAfterApprove.minutesLate} phút
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Về sớm:</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {previewAfterApprove.minutesEarly} phút
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tổng:</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {previewAfterApprove.total} phút
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">
                  Tổng số đơn sẽ tạo:
                </span>
                <Badge variant="secondary">{applications.length} đơn</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">
                  Tổng số phút sẽ giảm:
                </span>
                <Badge variant="secondary">{totalMinutesReduced} phút</Badge>
              </div>

              {/* Progress bar khi đang tạo */}
              {loading && progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Đang tạo đơn {progress.current}/{progress.total}
                    </span>
                    <span className="font-medium">
                      {Math.round((progress.current / progress.total) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={progress.current}
                    max={progress.total}
                    className="h-2"
                  />
                  {progress.currentApp && (
                    <div className="text-xs text-muted-foreground">
                      Đang tạo: {dayjs(progress.currentApp.date).format('DD/MM/YYYY')} - {getTypeName(progress.currentApp.typeId)}
                    </div>
                  )}
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {applications.map((app, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md space-y-2"
                    >
                      {editingIndex === index ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Chỉnh sửa đơn
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveEdit}
                              >
                                Lưu
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Thời gian bắt đầu</Label>
                              <Input
                                type="time"
                                value={editForm?.timeStart || ''}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, timeStart: e.target.value }
                                      : null,
                                  )
                                }
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Thời gian kết thúc</Label>
                              <Input
                                type="time"
                                value={editForm?.timeEnd || ''}
                                onChange={(e) => {
                                  const newTimeEnd = e.target.value;
                                  setEditForm((prev) => {
                                    if (!prev) return null;
                                    const newMinutes =
                                      calculateMinutes(
                                        prev.timeStart,
                                        newTimeEnd,
                                      ) || 0;
                                    return {
                                      ...prev,
                                      timeEnd: newTimeEnd,
                                      minutes: newMinutes,
                                    };
                                  });
                                }}
                                className="h-8"
                              />
                            </div>
                          </div>
                          {editForm &&
                            calculateMinutes(
                              editForm.timeStart,
                              editForm.timeEnd,
                            ) !== null && (
                              <div className="text-xs text-muted-foreground">
                                Số phút: {calculateMinutes(editForm.timeStart, editForm.timeEnd)} phút
                              </div>
                            )}
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  app.typeId === 2 ? 'default' : 'secondary'
                                }
                              >
                                {getTypeName(app.typeId)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {dayjs(app.date).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                -{app.minutes} phút
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(index)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(index)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <span className="font-medium">Lý do:</span>{' '}
                              {getReasonName(app.reasonId)}
                            </div>
                            <div>
                              <span className="font-medium">Thời gian:</span>{' '}
                              {app.timeStart} - {app.timeEnd}
                            </div>
                            <div>
                              <span className="font-medium">Mô tả:</span>{' '}
                              {app.description}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          {applications.length > 0 && (
            <Button
              onClick={handleCreate}
              disabled={loading || editingIndex !== null || missingApprovers.length > 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo đơn...
                </>
              ) : (
                'Xác nhận và tạo đơn'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
