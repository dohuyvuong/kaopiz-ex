'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export function AccountPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tokens } = useAppSelector((state) => state.auth);

  const handleLogin = () => {
    // Redirect đến login page
    router.push('/login');
  };

  const handleLogout = (systemName: SystemName) => {
    // Xóa token của system
    dispatch(clearToken(systemName));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tài khoản</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin đăng nhập và hệ thống
        </p>
      </div>

      <Tabs defaultValue="systems" className="w-full">
        <TabsList>
          <TabsTrigger value="systems">Hệ thống</TabsTrigger>
          {/* Có thể thêm các tabs khác sau */}
        </TabsList>

        <TabsContent value="systems" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Ksystem */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{SYSTEMS.KSYSTEM.displayName}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {SYSTEMS.KSYSTEM.description}
                    </CardDescription>
                  </div>
                  {tokens.ksystem ? (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      Đã đăng nhập
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">Chưa đăng nhập</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {tokens.ksystem ? (
                  <div className="space-y-3 flex-1">
                    {(() => {
                      const userInfo = extractUserInfo(tokens.ksystem.userInfo);
                      return userInfo ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{userInfo.name}</span>
                          </div>
                          {userInfo.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate text-muted-foreground">
                                {userInfo.email}
                              </span>
                            </div>
                          )}
                          {userInfo.department_short_name && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {userInfo.department_short_name}
                              </span>
                            </div>
                          )}
                          {userInfo.user_profile?.code && (
                            <div className="flex items-center gap-2">
                              <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {userInfo.user_profile.code}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                    {tokens.ksystem.expiresAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Hết hạn: {new Date(tokens.ksystem.expiresAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogout('ksystem')}
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
                      Bạn chưa đăng nhập với hệ thống này. Vui lòng đăng nhập để sử dụng các
                      chức năng liên quan.
                    </p>
                    <Button onClick={handleLogin} className="w-full" size="sm">
                      <LogIn className="h-3.5 w-3.5 mr-2" />
                      Đăng nhập với {SYSTEMS.KSYSTEM.displayName}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* HRM */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{SYSTEMS.HRM.displayName}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {SYSTEMS.HRM.description}
                    </CardDescription>
                  </div>
                  {tokens.hrm ? (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      Đã đăng nhập
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">Chưa đăng nhập</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {tokens.hrm ? (
                  <div className="space-y-3 flex-1">
                    {(() => {
                      const userInfo = extractUserInfo(tokens.hrm.userInfo);
                      return userInfo ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{userInfo.name}</span>
                          </div>
                          {userInfo.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate text-muted-foreground">
                                {userInfo.email}
                              </span>
                            </div>
                          )}
                          {userInfo.department_short_name && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {userInfo.department_short_name}
                              </span>
                            </div>
                          )}
                          {userInfo.user_profile?.code && (
                            <div className="flex items-center gap-2">
                              <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {userInfo.user_profile.code}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                    {tokens.hrm.expiresAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Hết hạn: {new Date(tokens.hrm.expiresAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogout('hrm')}
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
                      Bạn chưa đăng nhập với hệ thống này. Vui lòng đăng nhập để sử dụng các
                      chức năng liên quan.
                    </p>
                    <Button onClick={handleLogin} className="w-full" size="sm">
                      <LogIn className="h-3.5 w-3.5 mr-2" />
                      Đăng nhập với {SYSTEMS.HRM.displayName}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
