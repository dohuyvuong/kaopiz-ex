'use client';

import { useEffect, useMemo } from 'react';
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

  // Xác định system requirement
  const requiredSystem = useMemo(
    () => system || getSystemRequirementForPathname(pathname),
    [system, pathname],
  );

  // Kiểm tra token cho system cụ thể (chỉ khi có system requirement)
  const hasToken = useMemo(() => {
    if (!requiredSystem) {
      return true; // Public route - không cần token
    }
    return systems.includes(requiredSystem.name);
  }, [systems, requiredSystem]);

  useEffect(() => {
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
  }, [requiredSystem, hasToken, router]);

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
