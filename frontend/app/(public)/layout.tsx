'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout cho các trang public (không cần token, không cần SystemProtectedRoute)
  return <DashboardLayout>{children}</DashboardLayout>;
}
