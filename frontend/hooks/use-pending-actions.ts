import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import {
  JobType,
  PendingActionStatus,
  PendingActionPayload,
} from '@/types/automation.types';

export interface PendingAction {
  id: number;
  jobType: JobType;
  payload: PendingActionPayload;
  status: PendingActionStatus;
  notifiedAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export function usePendingActions() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/automation/pending-actions');
      setActions(response.data);
    } catch (err) {
      const errorMessage = 'Lỗi khi tải danh sách hành động chờ xử lý';
      setError(errorMessage);
      console.error('Error loading pending actions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveAction = useCallback(async (actionId: number) => {
    try {
      await apiClient.post('/automation/approve', { actionId });
      toast.success('Đã duyệt hành động');
      // Reload actions after approval
      await loadPendingActions();
    } catch (err) {
      console.error('Error approving action:', err);
      toast.error('Lỗi khi duyệt hành động');
      throw err;
    }
  }, [loadPendingActions]);

  const rejectAction = useCallback(async (actionId: number) => {
    try {
      await apiClient.post('/automation/reject', { actionId });
      toast.success('Đã từ chối hành động');
      // Reload actions after rejection
      await loadPendingActions();
    } catch (err) {
      console.error('Error rejecting action:', err);
      toast.error('Lỗi khi từ chối hành động');
      throw err;
    }
  }, [loadPendingActions]);

  useEffect(() => {
    loadPendingActions();
  }, [loadPendingActions]);

  return {
    actions,
    isLoading,
    error,
    approveAction,
    rejectAction,
    reload: loadPendingActions,
  };
}
