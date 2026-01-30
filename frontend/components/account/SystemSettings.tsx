'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { SYSTEMS, type SystemName } from '@/lib/types/system';
import { LogOut, LogIn, User, Mail } from 'lucide-react';

interface SystemCardProps {
  systemName: SystemName;
  isLoggedIn: boolean;
  onLogin: () => void;
}

function SystemCard({
  systemName,
  isLoggedIn,
  onLogin,
}: SystemCardProps) {
  const systemInfo = systemName === 'ksystem' ? SYSTEMS.KSYSTEM : SYSTEMS.HRM;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{systemInfo.displayName}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {systemInfo.description}
            </CardDescription>
          </div>
          {isLoggedIn ? (
            <Badge variant="default" className="bg-green-500 ml-2">
              Đã đăng nhập
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              Chưa đăng nhập
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!isLoggedIn && (
          <div className="space-y-3 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground flex-1">
              Bạn chưa đăng nhập với hệ thống này. Vui lòng đăng nhập để sử dụng
              các chức năng liên quan.
            </p>
            <Button onClick={onLogin} className="w-full" size="sm">
              <LogIn className="h-3.5 w-3.5 mr-2" />
              Đăng nhập với {systemInfo.displayName}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SystemSettings() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const systems = useAuthStore((state) => state.systems);
  const appRefreshToken = useAuthStore((state) => state.appRefreshToken);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    if (appRefreshToken) {
      try {
        await authApi.logout(appRefreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    useAuthStore.getState().clearAuth();
    router.push('/login');
  };

  return (
    <div className="space-y-4">
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {user.name || user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate text-muted-foreground">
                {user.email}
              </span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        <SystemCard
          systemName="ksystem"
          isLoggedIn={systems.includes('ksystem')}
          onLogin={handleLogin}
        />
        <SystemCard
          systemName="hrm"
          isLoggedIn={systems.includes('hrm')}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
}
