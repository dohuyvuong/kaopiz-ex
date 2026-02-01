'use client';

import { usePendingActions, type PendingAction } from '@/hooks/use-pending-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import dayjs from 'dayjs';

const JOB_TYPE_LABEL: Record<string, string> = {
  'auto-review-checklist': 'Duyệt checklist',
  'auto-create-forms': 'Tạo đơn',
};

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'secondary' },
  approved: { label: 'Đã duyệt', variant: 'default' },
  rejected: { label: 'Đã từ chối', variant: 'outline' },
  auto_approved: { label: 'Tự động duyệt', variant: 'default' },
};

function getPayloadSummary(payload: PendingAction['payload']): string {
  if (!payload) return '—';
  const p = payload as unknown as Record<string, unknown>;
  if (Array.isArray(p.checklists)) {
    return `${p.checklists.length} checklist`;
  }
  if (Array.isArray(p.forms)) {
    return `${p.forms.length} đơn`;
  }
  if (Array.isArray(p.days)) {
    return `${p.days.length} ngày cần tạo đơn`;
  }
  return '—';
}

function ActionCard({
  action,
  onApprove,
  onReject,
}: {
  action: PendingAction;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const statusInfo = STATUS_LABEL[action.status] ?? { label: action.status, variant: 'outline' as const };
  const isPending = action.status === 'pending';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {action.jobType === 'auto-review-checklist' ? '✓' : '📝'}
          </span>
          <div>
            <CardTitle className="text-base">
              {JOB_TYPE_LABEL[action.jobType] ?? action.jobType}
            </CardTitle>
            <CardDescription>
              {getPayloadSummary(action.payload)} · Hết hạn {dayjs(action.expiresAt).format('DD/MM/YYYY HH:mm')}
            </CardDescription>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Tạo lúc {dayjs(action.createdAt).format('DD/MM/YYYY HH:mm')}
        </span>
        {isPending && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(action.id)}
              className="gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(action.id)}
              className="gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Từ chối
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AutomationPendingPage() {
  const { actions, isLoading, error, approveAction, rejectAction, reload } = usePendingActions();
  const pendingOnly = actions.filter((a) => a.status === 'pending');

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Hành động chờ duyệt</h1>
          <p className="text-muted-foreground mt-2">
            Xem và xử lý các hành động tự động chờ xác nhận
          </p>
        </div>
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Hành động chờ duyệt</h1>
          <p className="text-muted-foreground mt-2">
            Xem và xử lý các hành động tự động chờ xác nhận
          </p>
        </div>
        <Card>
          <CardContent className="py-6">
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" variant="outline" onClick={reload}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hành động chờ duyệt</h1>
          <p className="text-muted-foreground mt-2">
            Xem và xử lý các hành động tự động chờ xác nhận
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          Làm mới
        </Button>
      </div>

      {pendingOnly.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Không có hành động nào đang chờ duyệt.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingOnly.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onApprove={approveAction}
              onReject={rejectAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
