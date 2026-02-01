'use client';

import { AutomationSettings } from '@/components/account/AutomationSettings';

export default function AutomationSettingsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tự động hóa</h1>
        <p className="text-muted-foreground mt-2">
          Cài đặt kiểm tra tự động và kênh thông báo
        </p>
      </div>
      <AutomationSettings />
    </div>
  );
}
