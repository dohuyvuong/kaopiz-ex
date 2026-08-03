'use client';

import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useCreateApplicationForm } from '@/hooks/use-create-application-form';
import type { CalendarDay, TimesheetRules } from '@kaopiz/timesheet';

interface CreateApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  day: CalendarDay | null;
  rules: TimesheetRules | null;
  daysByDate: Map<string, CalendarDay>;
  userId?: number;
  today: string;
  onCreated: () => void;
}

export function CreateApplicationFormDialog({
  open,
  onOpenChange,
  date,
  day,
  rules,
  daysByDate,
  userId,
  today,
  onCreated,
}: CreateApplicationFormDialogProps) {
  const form = useCreateApplicationForm({
    open,
    date,
    day,
    rules,
    daysByDate,
    userId,
    today,
  });

  const selectedReason = form.reasons.find(
    (reason) => reason.id === form.reasonId,
  );

  const handleSubmit = async () => {
    if (await form.submit()) {
      toast.success('Đã tạo đơn từ');
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tạo đơn từ</DialogTitle>
          <DialogDescription>
            Cho ngày {date}. Cảnh báo bên dưới chỉ để tham khảo — HRM mới là nơi
            quyết định đơn có được chấp nhận hay không.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="space-y-2">
            <Label htmlFor="typeId">Loại đơn</Label>
            <Select
              value={String(form.typeId)}
              onValueChange={(value) => form.setTypeId(Number(value))}
              disabled={form.isLoadingTypes}
            >
              <SelectTrigger id="typeId" className="w-full">
                <SelectValue placeholder="Chọn loại đơn" />
              </SelectTrigger>
              <SelectContent>
                {form.types.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonId">Lý do</Label>
            <Select
              value={form.reasonId != null ? String(form.reasonId) : ''}
              onValueChange={(value) => form.setReasonId(Number(value))}
            >
              <SelectTrigger id="reasonId" className="w-full">
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {form.reasons.map((reason) => (
                  <SelectItem key={reason.id} value={String(reason.id)}>
                    {reason.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* HRM ghi giới hạn ngay trong description, vd "Tối đa: 2 Lần / Tuần". */}
            {selectedReason?.description && (
              <p className="text-xs text-muted-foreground">
                {selectedReason.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeStart">Từ</Label>
              <Input
                id="timeStart"
                type="time"
                value={form.timeStart}
                onChange={(event) => form.setTimeStart(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeEnd">Đến</Label>
              <Input
                id="timeEnd"
                type="time"
                value={form.timeEnd}
                onChange={(event) => form.setTimeEnd(event.target.value)}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {form.minutes != null ? (
              <>
                Thời lượng: <strong>{form.minutes} phút</strong>
              </>
            ) : (
              <span className="text-destructive">
                Giờ kết thúc phải sau giờ bắt đầu
              </span>
            )}
          </div>

          {form.isLoadingApprovers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách người duyệt...
            </div>
          ) : (
            Array.from({ length: form.approverCount }, (_, order) => (
              <div key={order} className="space-y-2">
                <Label htmlFor={`approver-${order}`}>
                  Người duyệt {order + 1}
                </Label>
                <Select
                  value={
                    form.approverIds[order] != null
                      ? String(form.approverIds[order])
                      : ''
                  }
                  onValueChange={(value) =>
                    form.setApproverId(order, Number(value))
                  }
                >
                  <SelectTrigger id={`approver-${order}`} className="w-full">
                    <SelectValue placeholder="Chọn người duyệt" />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.approvers[order] ?? []).map((approver) => (
                      <SelectItem
                        key={approver.userId}
                        value={String(approver.userId)}
                      >
                        {approver.user?.name ?? `User ${approver.userId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}

          {form.warnings.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                Lưu ý trước khi gửi
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
                {form.warnings.map((warning) => (
                  <li key={warning.code}>{warning.message}</li>
                ))}
              </ul>
              <p className="text-xs text-amber-800">
                Vẫn gửi được — HRM sẽ quyết định.
              </p>
            </div>
          )}

          {form.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {form.error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.isSubmitting}
          >
            Huỷ
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={!form.canSubmit}
            title={
              form.missingApproverOrder >= 0
                ? `Chưa chọn người duyệt ${form.missingApproverOrder + 1}`
                : undefined
            }
          >
            {form.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            )}
            Tạo đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
