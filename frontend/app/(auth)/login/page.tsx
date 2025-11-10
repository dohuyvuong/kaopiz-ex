'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import { useAppDispatch } from '@/lib/hooks';
import { setToken, setLoading } from '@/lib/features/auth/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [authUrl, setAuthUrl] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGetAuthUrl = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authApi.getAuthorizationUrl();
      setAuthUrl(response.authUrl);

      // Tự động mở URL trong tab mới
      window.open(response.authUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get authorization URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExchangeToken = async () => {
    if (!callbackUrl.trim()) {
      setError('Vui lòng nhập URL callback');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      dispatch(setLoading(true));

      const response = await authApi.exchangeToken({ url: callbackUrl });
      dispatch(setToken(response.token));

      // Redirect về dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exchange token');
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập bằng Microsoft SSO để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleGetAuthUrl}
              disabled={isLoading}
              className="w-full"
            >
              {authUrl ? 'Lấy lại URL đăng nhập' : 'Lấy URL đăng nhập'}
            </Button>
            {authUrl && (
              <p className="text-xs text-gray-500">
                URL đã được mở trong tab mới. Vui lòng đăng nhập và copy URL callback.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="callback-url" className="text-sm font-medium">
              URL Callback (sau khi đăng nhập)
            </label>
            <Input
              id="callback-url"
              type="text"
              placeholder="Dán URL callback vào đây..."
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleExchangeToken}
              disabled={isLoading || !callbackUrl.trim()}
              className="w-full"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận và lấy token'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
