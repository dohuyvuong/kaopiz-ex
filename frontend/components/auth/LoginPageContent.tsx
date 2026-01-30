'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authApi, type Provider } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { SYSTEMS } from '@/lib/types/system';

export function LoginPageContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const systems = useAuthStore((state) => state.systems);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('');
  const [redirectOAuth, setRedirectOAuth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Lấy error từ URL query params (nếu có)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, []);

  // Load providers khi component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providersList = await authApi.getProviders();
        setProviders(providersList);
        // Mặc định chọn provider đầu tiên
        if (providersList.length > 0) {
          setSelectedProvider(providersList[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load providers');
      }
    };
    loadProviders();
  }, []);

  // Set redirectOAuth mặc định cho Ksystem OAuth
  useEffect(() => {
    if (selectedProvider === 'ksystem-oauth') {
      setRedirectOAuth(
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : '',
      );
    } else {
      setRedirectOAuth('');
    }
  }, [selectedProvider]);

  const handleGetAuthUrl = async () => {
    if (!selectedProvider) {
      setError('Vui lòng chọn provider');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const params =
        selectedProvider === 'ksystem-oauth' && redirectOAuth
          ? { redirectOAuth }
          : undefined;
      const response = await authApi.getAuthorizationUrl(selectedProvider, params);
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

    if (!selectedProvider) {
      setError('Vui lòng chọn provider');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      useAuthStore.getState().setLoading(true);

      const response = await authApi.exchangeToken(selectedProvider, {
        url: callbackUrl,
      });

      // Lưu appToken, appRefreshToken, user và systems
      useAuthStore.getState().setAuth({
        appToken: response.appToken,
        appRefreshToken: response.appRefreshToken,
        expiresIn: response.expiresIn,
        user: response.user,
        systems: response.systems,
      });

      // Redirect về dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exchange token');
    } finally {
      setIsLoading(false);
      useAuthStore.getState().setLoading(false);
    }
  };

  const selectedProviderInfo = providers.find((p) => p.name === selectedProvider);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>
            Chọn hệ thống và đăng nhập để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Hiển thị trạng thái đăng nhập */}
          {user && systems.length > 0 && (
            <div className="p-3 text-sm bg-green-50 border border-green-200 rounded-md">
              <p className="font-medium text-green-800">Đã đăng nhập:</p>
              <p className="text-green-700 mt-1">
                User: {user.email} {user.name && `(${user.name})`}
              </p>
              <ul className="mt-1 space-y-1">
                {systems.map((system) => {
                  const systemInfo =
                    system === 'ksystem'
                      ? SYSTEMS.KSYSTEM
                      : system === 'hrm'
                        ? SYSTEMS.HRM
                        : null;
                  return (
                    <li key={system} className="text-green-700">
                      • {systemInfo?.displayName || system}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Chọn Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Chọn hệ thống</Label>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
              disabled={isLoading}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Chọn hệ thống..." />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => {
                  const systemInfo =
                    provider.system === 'ksystem'
                      ? SYSTEMS.KSYSTEM
                      : provider.system === 'hrm'
                        ? SYSTEMS.HRM
                        : null;
                  return (
                    <SelectItem key={provider.name} value={provider.name}>
                      {systemInfo?.description ||
                        `${provider.system} (${provider.name})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedProviderInfo && (
              <p className="text-xs text-gray-500">
                Hệ thống:{' '}
                {selectedProviderInfo.system === 'ksystem'
                  ? SYSTEMS.KSYSTEM.displayName
                  : selectedProviderInfo.system === 'hrm'
                    ? SYSTEMS.HRM.displayName
                    : selectedProviderInfo.system}{' '}
                | Provider: {selectedProviderInfo.name}
              </p>
            )}
          </div>

          {/* Redirect OAuth cho Ksystem OAuth */}
          {selectedProvider === 'ksystem-oauth' && (
            <div className="space-y-2">
              <Label htmlFor="redirect-oauth">
                Redirect OAuth (URL để nhận code sau khi đăng nhập)
              </Label>
              <Input
                id="redirect-oauth"
                type="text"
                placeholder="http://localhost:3000/auth/callback"
                value={redirectOAuth}
                onChange={(e) => setRedirectOAuth(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                URL này sẽ được dùng để redirect sau khi đăng nhập thành công.
                Code sẽ có trong query string của URL này.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleGetAuthUrl}
              disabled={isLoading || !selectedProvider}
              className="w-full"
            >
              {authUrl ? 'Lấy lại URL đăng nhập' : 'Lấy URL đăng nhập'}
            </Button>
            {authUrl && (
              <p className="text-xs text-gray-500">
                URL đã được mở trong tab mới. Vui lòng đăng nhập và copy URL
                callback.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="callback-url">URL Callback (sau khi đăng nhập)</Label>
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
              disabled={isLoading || !callbackUrl.trim() || !selectedProvider}
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
