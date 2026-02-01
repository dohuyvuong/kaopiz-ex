'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getSystemRequirementForPathname, type SystemRequirement } from '@/lib/navigation';

interface SystemProtectedRouteProps {
  children: React.ReactNode;
  system?: SystemRequirement; // Nếu không truyền, sẽ tự động detect từ pathname
}

export function SystemProtectedRoute({
  children,
  system,
}: SystemProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const systems = useAuthStore((state) => state.systems);
  const [ready, setReady] = useState(false);

  // Trì hoãn kiểm tra auth 1 tick để persist kịp rehydrate từ localStorage (tránh F5 redirect sai)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const hasHydrated = ready;

  // Xác định system requirement
  const requiredSystem = useMemo(
    () => system || getSystemRequirementForPathname(pathname),
    [system, pathname],
  );

  // Kiểm tra token cho system cụ thể (chỉ khi có system requirement)
  // Chỉ đánh giá sau khi store đã rehydrate từ localStorage (tránh F5 bị redirect sai)
  const hasToken = useMemo(() => {
    if (!requiredSystem) {
      return true; // Public route - không cần token
    }
    return systems.includes(requiredSystem.name);
  }, [systems, requiredSystem]);

  useEffect(() => {
    if (!hasHydrated) return;
    // Nếu không có system requirement (public route), không cần kiểm tra
    if (!requiredSystem) {
      return;
    }

    // Kiểm tra token cho system cụ thể
    if (!hasToken) {
      // Redirect về login với thông báo
      const errorMessage = `Vui lòng đăng nhập với ${requiredSystem.description || requiredSystem.displayName} để truy cập trang này`;
      router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  }, [hasHydrated, requiredSystem, hasToken, router]);

  // Chưa rehydrate: không redirect, hiển thị loading để tránh flash + redirect sai khi F5
  if (!hasHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Nếu không có system requirement (public route), cho phép truy cập
  if (!requiredSystem) {
    return <>{children}</>;
  }

  // Kiểm tra token cho system cụ thể
  if (!hasToken) {
    return null; // Đã redirect trong useEffect
  }

  return <>{children}</>;
}
