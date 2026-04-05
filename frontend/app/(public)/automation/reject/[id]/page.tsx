'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { automationApi } from '@/lib/api/automation';
import type { PendingAction } from '@/types/automation.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const JOB_TYPE_LABEL: Record<string, string> = {
  'auto-review-checklist': 'Duyệt checklist',
  'auto-create-forms': 'Tạo đơn',
};

function getPayloadSummary(payload: PendingAction['payload']): string {
  if (!payload) return '—';
  const p = payload as unknown as Record<string, unknown>;
  if (Array.isArray(p.checklists)) return `${p.checklists.length} checklist`;
  if (Array.isArray(p.forms)) return `${p.forms.length} đơn`;
  if (Array.isArray(p.days)) return `${p.days.length} ngày cần tạo đơn`;
  return '—';
}

function InvalidIdError({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Lỗi</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ID hành động không hợp lệ.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => router.push('/login')}>
              Đăng nhập
            </Button>
            <Button onClick={() => router.push('/dashboard')}>Về Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RejectFlow({ actionId }: { actionId: number }) {
  const router = useRouter();
  const { rejectAction } = usePendingActions();
  const [action, setAction] = useState<PendingAction | null>(null);
  const [status, setStatus] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    automationApi
      .getActionById(actionId)
      .then((data) => {
        if (!cancelled) {
          setAction(data);
          setStatus(data.status === 'pending' ? 'confirm' : 'error');
          setErrorMessage(
            data.status !== 'pending'
              ? `Hành động này đã được xử lý (${data.status}).`
              : null,
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            err.response?.status === 404
              ? 'Không tìm thấy hành động.'
              : 'Không thể tải thông tin. Vui lòng đăng nhập lại hoặc thử sau.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [actionId]);

  const handleReject = async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      await rejectAction(actionId);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Không thể từ chối. Vui lòng đăng nhập lại hoặc thử sau.');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (status === 'idle') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">Đã từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hành động đã được từ chối và sẽ không được thực hiện.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{errorMessage}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Đăng nhập
              </Button>
              <Button onClick={() => router.push('/dashboard')}>Về Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Xác nhận từ chối</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {action && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="font-medium">
                {JOB_TYPE_LABEL[action.jobType] ?? action.jobType}
              </p>
              <p className="text-muted-foreground">
                {getPayloadSummary(action.payload)}
              </p>
            </div>
          )}
          <p>
            Bạn có chắc muốn <strong>từ chối</strong> hành động này? Hệ thống sẽ
            không thực hiện.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={status === 'loading'}
              onClick={handleReject}
            >
              {status === 'loading' ? 'Đang xử lý...' : 'Có, từ chối'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={status === 'loading'}
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AutomationRejectPage() {
  const params = useParams();
  const router = useRouter();
  const actionId = Number(params.id);

  if (Number.isNaN(actionId) || actionId <= 0) {
    return <InvalidIdError router={router} />;
  }

  return <RejectFlow key={actionId} actionId={actionId} />;
}
