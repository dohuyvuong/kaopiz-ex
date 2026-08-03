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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useAutoCreateApplications } from '@/hooks/use-auto-create-applications';
import type { CalendarDay, LateEarly, TimesheetRules } from '@kaopiz/timesheet';

interface AutoCreateApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: CalendarDay[];
  rules: TimesheetRules | null;
  actualTotal: LateEarly | null;
  userId?: number;
  today: string;
  annualLeaveAvailable: number;
  onCreated: () => void;
}

export function AutoCreateApplicationsDialog({
  open,
  onOpenChange,
  days,
  rules,
  actualTotal,
  userId,
  today,
  annualLeaveAvailable,
  onCreated,
}: AutoCreateApplicationsDialogProps) {
  const auto = useAutoCreateApplications({
    open,
    days,
    rules,
    actualTotal,
    userId,
    today,
    annualLeaveAvailable,
  });

  const { suggestion } = auto;

  const handleCreate = async () => {
    const allSucceeded = await auto.createAll();
    if (allSucceeded) {
      toast.success('Đã tạo xong các đơn');
      onOpenChange(false);
      onCreated();
    } else {
      toast.error('Một số đơn không tạo được, xem chi tiết trong danh sách');
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Tự động tạo đơn
          </DialogTitle>
          <DialogDescription>
            Ưu tiên đơn vắng mặt (không tốn phép năm), chỉ dùng phép cho phần còn
            lại. Chỉ tạo vừa đủ để về dưới hạn mức miễn phạt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {suggestion && (
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div>
                Hiện tại:{' '}
                <strong>{suggestion.currentTotal} phút</strong> / hạn mức{' '}
                {suggestion.allowedTotal} phút
              </div>
              {suggestion.neededMinutes > 0 ? (
                <div>
                  Cần che thêm:{' '}
                  <strong className="text-destructive">
                    {suggestion.neededMinutes} phút
                  </strong>
                </div>
              ) : (
                <div className="text-green-700">
                  Chưa vượt hạn mức — không cần tạo đơn nào.
                </div>
              )}
              {auto.annualLeaveMinutes > 0 && (
                <div className="text-muted-foreground">
                  Trong đó <strong>{auto.annualLeaveMinutes} phút</strong> dùng
                  phép năm (~{auto.annualLeaveDays.toFixed(2)} ngày). Số dư:{' '}
                  <strong>{auto.annualLeaveAvailable.toFixed(2)}</strong> →{' '}
                  <strong
                    className={
                      auto.annualLeaveAfter < 0 ? 'text-destructive' : ''
                    }
                  >
                    {auto.annualLeaveAfter.toFixed(2)}
                  </strong>{' '}
                  ngày.
                </div>
              )}
            </div>
          )}

          {suggestion && suggestion.uncoveredMinutes > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Còn {suggestion.uncoveredMinutes} phút không che được
              </div>
              <p className="text-xs mt-1">
                Các ngày còn lại đã hết quota đơn vắng mặt trong tuần, không đủ giờ
                làm, hoặc đã quá hạn nộp đơn.
              </p>
            </div>
          )}

          {auto.exceedsAnnualLeave && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Vượt quá số phép năm còn lại
              </div>
              <p className="text-xs mt-1">
                Sau khi tạo, số phép năm sẽ là{' '}
                {auto.annualLeaveAfter.toFixed(2)} ngày — phần âm là phép ứng
                trước. Bạn có thể bỏ bớt các đơn nghỉ phép bên dưới và chấp nhận
                bị phạt phần tương ứng.
              </p>
            </div>
          )}

          {auto.missingApprovers.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Chưa chọn người duyệt
              </div>
              <ul className="list-disc pl-5 mt-1">
                {auto.missingApprovers.map((item) => (
                  <li key={item.typeName}>
                    {item.typeName}: thiếu người duyệt{' '}
                    {item.orders.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {auto.forms.length > 0 && (
            <div className="space-y-2">
              {auto.forms.map((form) => {
                const key = auto.formKey(form);
                const failure = auto.failures.find(
                  (item) => auto.formKey(item.form) === key,
                );
                return (
                  <div
                    key={key}
                    className={
                      failure
                        ? 'rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-1'
                        : 'rounded-md border p-3 space-y-1'
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{form.date}</span>
                        <Badge
                          variant={form.usesAnnualLeave ? 'default' : 'secondary'}
                        >
                          {form.usesAnnualLeave ? 'Nghỉ phép năm' : 'Vắng mặt'}
                        </Badge>
                        <Badge variant="outline">
                          {form.covers === 'late' ? 'Che đi muộn' : 'Che về sớm'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => auto.removeForm(form)}
                        disabled={auto.isCreating}
                        aria-label="Bỏ đơn này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {form.timeStart} – {form.timeEnd} ({form.minutes} phút)
                    </div>
                    {failure && (
                      <div className="text-sm text-destructive">
                        {failure.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {auto.isCreating && auto.progress.total > 0 && (
            <div className="space-y-2">
              <Progress
                value={(auto.progress.current / auto.progress.total) * 100}
              />
              <div className="text-sm text-muted-foreground text-center">
                Đang tạo đơn {auto.progress.current}/{auto.progress.total}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={auto.isCreating}
          >
            Đóng
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={auto.isCreating || auto.forms.length === 0}
          >
            {auto.isCreating && (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            )}
            Tạo {auto.forms.length} đơn ({auto.totalMinutes} phút)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
