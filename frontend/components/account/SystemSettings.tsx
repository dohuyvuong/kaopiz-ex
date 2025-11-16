'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearToken } from '@/lib/features/auth/authSlice';
import { SYSTEMS, type SystemName } from '@/lib/types/system';
import { CommonUserInfo, HrmUserInfoResponse } from '@/lib/types/userInfo';
import { LogOut, LogIn, User, Calendar, Mail, Building2, Hash } from 'lucide-react';

// Helper function để extract CommonUserInfo từ userInfo
function extractUserInfo(
  userInfo: CommonUserInfo | HrmUserInfoResponse | undefined,
): CommonUserInfo | null {
  if (!userInfo) return null;
  // HRM wrap userInfo trong object có key "info"
  if ('info' in userInfo) {
    return userInfo.info;
  }
  // Ksystem trả về trực tiếp CommonUserInfo
  return userInfo as CommonUserInfo;
}

interface SystemCardProps {
  systemName: SystemName;
  token: typeof SYSTEMS.KSYSTEM | typeof SYSTEMS.HRM;
  userInfo: CommonUserInfo | HrmUserInfoResponse | undefined;
  expiresAt?: number | string | null;
  onLogin: () => void;
  onLogout: (systemName: SystemName) => void;
}

function SystemCard({
  systemName,
  token,
  userInfo,
  expiresAt,
  onLogin,
  onLogout,
}: SystemCardProps) {
  const extractedUserInfo = extractUserInfo(userInfo);
  const isLoggedIn = !!userInfo;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{token.displayName}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {token.description}
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
        {isLoggedIn ? (
          <div className="space-y-3 flex-1">
            {extractedUserInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{extractedUserInfo.name}</span>
                </div>
                {extractedUserInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-muted-foreground">
                      {extractedUserInfo.email}
                    </span>
                  </div>
                )}
                {extractedUserInfo.department_short_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {extractedUserInfo.department_short_name}
                    </span>
                  </div>
                )}
                {extractedUserInfo.user_profile?.code && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {extractedUserInfo.user_profile.code}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
            {expiresAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Hết hạn:{' '}
                  {new Date(
                    typeof expiresAt === 'number' ? expiresAt * 1000 : expiresAt,
                  ).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLogout(systemName)}
                className="w-full"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground flex-1">
              Bạn chưa đăng nhập với hệ thống này. Vui lòng đăng nhập để sử dụng
              các chức năng liên quan.
            </p>
            <Button onClick={onLogin} className="w-full" size="sm">
              <LogIn className="h-3.5 w-3.5 mr-2" />
              Đăng nhập với {token.displayName}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SystemSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tokens } = useAppSelector((state) => state.auth);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = (systemName: SystemName) => {
    dispatch(clearToken(systemName));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SystemCard
        systemName="ksystem"
        token={SYSTEMS.KSYSTEM}
        userInfo={tokens.ksystem?.userInfo}
        expiresAt={tokens.ksystem?.expiresAt}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <SystemCard
        systemName="hrm"
        token={SYSTEMS.HRM}
        userInfo={tokens.hrm?.userInfo}
        expiresAt={tokens.hrm?.expiresAt}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </div>
  );
}
