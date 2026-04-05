/**
 * Merge một patch vào query string hiện tại (không đụng key không nằm trong patch).
 * Thuần hàm — dễ test, không phụ thuộc React/Next.
 */
export interface ApplySearchParamsPatchResult {
  readonly queryString: string;
  readonly changed: boolean;
}

export function applySearchParamsPatch(
  currentQueryString: string,
  patch: Readonly<Record<string, string | null | undefined>>,
): ApplySearchParamsPatchResult {
  const next = new URLSearchParams(currentQueryString);
  let changed = false;

  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    } else if (next.get(key) !== value) {
      next.set(key, value);
      changed = true;
    }
  }

  return {
    queryString: next.toString(),
    changed,
  };
}
