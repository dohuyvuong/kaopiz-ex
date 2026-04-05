'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applySearchParamsPatch } from './apply-search-params-patch';

export interface UrlQuerySyncOptions {
  /** Mặc định true: không thêm bản ghi history */
  replace?: boolean;
}

/**
 * Đẩy state lên query string (một chiều UI → URL).
 * Dùng `applySearchParamsPatch` làm lõi; `getPatch` phải được bọc `useCallback` ở nơi gọi.
 */
export function useUrlQuerySync(
  getPatch: () => Readonly<Record<string, string | null | undefined>>,
  options: UrlQuerySyncOptions = {},
) {
  const { replace = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { queryString, changed } = applySearchParamsPatch(
      searchParams.toString(),
      getPatch(),
    );
    if (!changed) return;

    const url = queryString ? `${pathname}?${queryString}` : pathname;
    if (replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  }, [getPatch, pathname, replace, router, searchParams]);
}
