import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { applicationApi } from '@/lib/api/application';
import {
  ApplicationFormType,
  ApprovalAssignment,
} from '@/lib/types/application';
import {
  ApproverPreferences,
  ApproverPreferencesHelper,
} from '@/lib/types/approver-preferences';

const STORAGE_KEY = 'application-form-storage';

/** Lấy preferences cũ từ localStorage để migrate */
function getLegacyApproversFromStorage(): ApproverPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const approvers = parsed?.state?.approvers;
    if (!approvers || typeof approvers !== 'object') return null;
    const prefs = ApproverPreferencesHelper.fromLegacyMap(approvers);
    return prefs.length > 0 ? prefs : null;
  } catch {
    return null;
  }
}

interface UseApproverSettingsReturn {
  types: ApplicationFormType[];
  approversMap: Record<number, Record<number, ApprovalAssignment[]>>;
  savedApprovers: Record<number, Record<number, number | null>>;
  loading: boolean;
  loadingApprovers: boolean;
  error: string | null;
  handleApproverChange: (
    typeId: number,
    order: number,
    approverId: number | null,
  ) => void;
}

export function useApproverSettings(): UseApproverSettingsReturn {
  const appToken = useAuthStore((state) => state.appToken);
  const userId = useAuthStore((state) => state.user?.id || null);
  const migrationDoneRef = useRef(false);

  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [preferences, setPreferences] = useState<ApproverPreferences>([]);
  const [loading, setLoading] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approversMap, setApproversMap] = useState<
    Record<number, Record<number, ApprovalAssignment[]>>
  >({});

  const savedApprovers = types.reduce(
    (acc, type) => {
      acc[type.id] = ApproverPreferencesHelper.getByTypeId(preferences, type.id);
      return acc;
    },
    {} as Record<number, Record<number, number | null>>,
  );

  // Fetch types
  useEffect(() => {
    if (!appToken) return;

    setLoading(true);
    setError(null);
    applicationApi
      .getFormTypes()
      .then((response) => {
        setTypes(response.items || []);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Lỗi khi tải danh sách loại đơn',
        );
      })
      .finally(() => setLoading(false));
  }, [appToken]);

  // Fetch approver preferences từ server (+ migrate từ localStorage nếu cần)
  useEffect(() => {
    if (!appToken) return;

    const fetchAndMaybeMigrate = async () => {
      try {
        const res = await applicationApi.getApproverPreferences();
        let prefs = res.preferences ?? [];

        if (!migrationDoneRef.current && prefs.length === 0) {
          const legacy = getLegacyApproversFromStorage();
          if (legacy && legacy.length > 0) {
            await applicationApi.saveApproverPreferences(legacy);
            prefs =
              (await applicationApi.getApproverPreferences()).preferences ?? [];
            migrationDoneRef.current = true;
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        setPreferences(prefs);
      } catch (err) {
        console.error('Failed to fetch approver preferences:', err);
        setPreferences([]);
      }
    };

    fetchAndMaybeMigrate();
  }, [appToken]);

  // Fetch approvers cho từng type
  useEffect(() => {
    if (!appToken || !userId || types.length === 0) return;

    const fetchApprovers = async () => {
      setLoadingApprovers(true);
      const map: Record<number, Record<number, ApprovalAssignment[]>> = {};

      try {
        for (const type of types) {
          map[type.id] = {};
          for (let order = 1; order <= type.orderMax; order++) {
            try {
              const response = await applicationApi.getApprovalAssignments(
                type.id,
                order,
                userId,
              );
              map[type.id][order] = response.items || [];
            } catch (err) {
              console.error(
                `Failed to fetch approvers for type ${type.id}, order ${order}:`,
                err,
              );
              map[type.id][order] = [];
            }
          }
        }
        setApproversMap(map);
      } finally {
        setLoadingApprovers(false);
      }
    };

    fetchApprovers();
  }, [appToken, userId, types]);

  const handleApproverChange = useCallback(
    async (typeId: number, order: number, approverId: number | null) => {
      setPreferences((prev) => {
        const next = ApproverPreferencesHelper.set(
          prev,
          typeId,
          order,
          approverId,
        );
        applicationApi.saveApproverPreferences(next).catch(console.error);
        return next;
      });
    },
    [],
  );

  return {
    types,
    approversMap,
    savedApprovers,
    loading,
    loadingApprovers,
    error,
    handleApproverChange,
  };
}
