'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useApproverSettings } from '@/hooks/use-approver-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ApproverSettings() {
  const appToken = useAuthStore((state) => state.appToken);

  const {
    types,
    approversMap,
    savedApprovers,
    loading,
    loadingApprovers,
    error,
    handleApproverChange,
  } = useApproverSettings();

  if (!appToken) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vui lòng đăng nhập với HRM để cấu hình người duyệt.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading && types.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Đang tải danh sách loại đơn...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cấu hình người duyệt mặc định</h2>
        <p className="text-muted-foreground mt-2">
          Cấu hình người duyệt mặc định cho từng loại đơn. Các cấu hình này sẽ
          được sử dụng khi tạo đơn tự động.
        </p>
      </div>

      <div className="space-y-4">
        {loadingApprovers && types.length > 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Đang tải danh sách người duyệt...
            </span>
          </div>
        ) : (
          types.map((type) => {
            const savedTypeApprovers = savedApprovers[type.id] || {};
            const typeApprovers = approversMap[type.id] || {};

            return (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle>{type.name}</CardTitle>
                  <CardDescription>
                    Số bước duyệt: {type.orderMax}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: type.orderMax }, (_, index) => {
                    const order = index + 1;
                    const approvers = typeApprovers[order] || [];
                    const selectedApproverId =
                      savedTypeApprovers[order] || null;

                    return (
                      <div key={order} className="space-y-2">
                        <Label>
                          Người duyệt bước {order}
                          {type.orderMax > 1 && ` (${order}/${type.orderMax})`}
                        </Label>
                        <Combobox
                          options={approvers.map((a) => ({
                            value: a.userId.toString(),
                            label: `${a.user.name} (${a.user.email})`,
                          }))}
                          value={
                            selectedApproverId
                              ? selectedApproverId.toString()
                              : ''
                          }
                          onValueChange={(value) => {
                            handleApproverChange(
                              type.id,
                              order,
                              value ? parseInt(value, 10) : null,
                            );
                          }}
                          placeholder="Chọn người duyệt..."
                          searchPlaceholder="Tìm kiếm người duyệt..."
                          emptyText="Không tìm thấy người duyệt."
                          disabled={loadingApprovers}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
