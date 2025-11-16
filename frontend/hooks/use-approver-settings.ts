import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setApprover } from '@/lib/features/application-form/applicationFormSlice';
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
  const hrmToken = useAppSelector((state) => state.auth.tokens.hrm?.token);
  const userId = useAppSelector((state) => {
    const hrmUserInfo = state.auth.tokens.hrm?.userInfo;
    if (hrmUserInfo && 'info' in hrmUserInfo) {
      return hrmUserInfo.info.user_profile?.id;
    }
    return null;
  });
  const savedApprovers = useAppSelector(
    (state) => state.applicationForm.approvers,
  );
  const dispatch = useAppDispatch();

  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approversMap, setApproversMap] = useState<
    Record<number, Record<number, ApprovalAssignment[]>>
  >({});

  // Fetch types
  useEffect(() => {
    if (!hrmToken) {
      return;
    }

    setLoading(true);
    setError(null);
    applicationApi
      .getFormTypes(hrmToken)
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
  }, [hrmToken]);

  // Fetch approvers cho từng type
  useEffect(() => {
    if (!hrmToken || !userId || types.length === 0) {
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
                hrmToken,
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
  }, [hrmToken, userId, types]);

  const handleApproverChange = useCallback(
    (typeId: number, order: number, approverId: number | null) => {
      dispatch(setApprover({ typeId, order, userId: approverId }));
    },
    [dispatch],
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
