'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApproverSettings } from './ApproverSettings';
import { SystemSettings } from './SystemSettings';

export function AccountPageContent() {

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
          <TabsTrigger value="approvers">Người duyệt</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="mt-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="approvers" className="mt-6">
          <ApproverSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
