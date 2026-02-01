import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { automationApi } from '@/lib/api/automation';
import { toast } from 'sonner';
import type { PendingAction } from '@/types/automation.types';

export function useAllActions() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await automationApi.getAllActions();
      setActions(data);
    } catch (err) {
      const errorMessage = 'Lỗi khi tải danh sách hành động';
      setError(errorMessage);
      console.error('Error loading all actions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveAction = useCallback(async (actionId: number) => {
    try {
      await apiClient.post('/automation/approve', { actionId });
      toast.success('Đã duyệt hành động');
      await loadAllActions();
    } catch (err) {
      console.error('Error approving action:', err);
      toast.error('Lỗi khi duyệt hành động');
      throw err;
    }
  }, [loadAllActions]);

  const rejectAction = useCallback(async (actionId: number) => {
    try {
      await apiClient.post('/automation/reject', { actionId });
      toast.success('Đã từ chối hành động');
      await loadAllActions();
    } catch (err) {
      console.error('Error rejecting action:', err);
      toast.error('Lỗi khi từ chối hành động');
      throw err;
    }
  }, [loadAllActions]);

  useEffect(() => {
    loadAllActions();
  }, [loadAllActions]);

  return {
    actions,
    isLoading,
    error,
    approveAction,
    rejectAction,
    reload: loadAllActions,
  };
}
