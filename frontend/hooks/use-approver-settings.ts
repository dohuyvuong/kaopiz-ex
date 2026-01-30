import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useApplicationFormStore } from '@/lib/stores/application-form-store';
import { applicationApi } from '@/lib/api/application';
import {
  ApplicationFormType,
  ApprovalAssignment,
} from '@/lib/types/application';

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
  const savedApprovers = useApplicationFormStore((state) => state.approvers);
  const setApprover = useApplicationFormStore((state) => state.setApprover);

  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approversMap, setApproversMap] = useState<
    Record<number, Record<number, ApprovalAssignment[]>>
  >({});

  // Fetch types
  useEffect(() => {
    if (!appToken) {
      return;
    }

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
      .finally(() => {
        setLoading(false);
      });
  }, [appToken]);

  // Fetch approvers cho từng type
  useEffect(() => {
    if (!appToken || !userId || types.length === 0) {
      return;
    }

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
    (typeId: number, order: number, approverId: number | null) => {
      setApprover(typeId, order, approverId);
    },
    [setApprover],
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
