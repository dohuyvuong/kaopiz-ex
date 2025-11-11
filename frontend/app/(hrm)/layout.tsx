'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SystemProtectedRoute } from '@/components/auth/SystemProtectedRoute';
import { SYSTEMS } from '@/lib/types/system';

export default function HRMGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout cho các trang yêu cầu HRM token
  return (
    <SystemProtectedRoute system={SYSTEMS.HRM}>
      <DashboardLayout>{children}</DashboardLayout>
    </SystemProtectedRoute>
  );
}
