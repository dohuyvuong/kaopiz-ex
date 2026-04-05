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

function ApproveFlow({ actionId }: { actionId: number }) {
  const router = useRouter();
  const { approveAction } = usePendingActions();
  const [action, setAction] = useState<PendingAction | null>(null);
  const [status, setStatus] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch action detail (API có AppJwtGuard → 401 nếu chưa đăng nhập → redirect login)
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

  const handleApprove = async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      await approveAction(actionId);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Không thể duyệt. Vui lòng đăng nhập lại hoặc thử sau.');
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
            <CardTitle className="text-green-600">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hành động đã được duyệt và hệ thống đang xử lý.</p>
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
          <CardTitle>Xác nhận duyệt</CardTitle>
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
            Bạn có chắc muốn <strong>duyệt</strong> hành động này? Hệ thống sẽ
            thực hiện ngay sau khi bạn xác nhận.
          </p>
          <div className="flex gap-2">
            <Button disabled={status === 'loading'} onClick={handleApprove}>
              {status === 'loading' ? 'Đang xử lý...' : 'Có, duyệt'}
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

export default function AutomationApprovePage() {
  const params = useParams();
  const router = useRouter();
  const actionId = Number(params.id);

  if (Number.isNaN(actionId) || actionId <= 0) {
    return <InvalidIdError router={router} />;
  }

  return <ApproveFlow key={actionId} actionId={actionId} />;
}
