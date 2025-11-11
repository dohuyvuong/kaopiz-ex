'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SystemProtectedRoute } from '@/components/auth/SystemProtectedRoute';
import { SYSTEMS } from '@/lib/types/system';

export default function KsystemGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout cho các trang yêu cầu Ksystem token
  return (
    <SystemProtectedRoute system={SYSTEMS.KSYSTEM}>
      <DashboardLayout>{children}</DashboardLayout>
    </SystemProtectedRoute>
  );
}
