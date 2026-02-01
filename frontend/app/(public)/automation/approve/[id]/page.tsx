'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AutomationApprovePage() {
  const params = useParams();
  const router = useRouter();
  const actionId = Number(params.id);
  const { approveAction } = usePendingActions();
  const [status, setStatus] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(actionId) || actionId <= 0) {
      setStatus('error');
      setErrorMessage('ID hành động không hợp lệ.');
      return;
    }
    setStatus('confirm');
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
        <CardContent>
          <p className="mb-4">
            Bạn có chắc muốn <strong>duyệt</strong> hành động này? Hệ thống sẽ thực hiện ngay sau khi bạn xác nhận.
          </p>
          <div className="flex gap-2">
            <Button
              disabled={status === 'loading'}
              onClick={handleApprove}
            >
              {status === 'loading' ? 'Đang xử lý...' : 'Có, duyệt'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={status === 'loading'}>
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
