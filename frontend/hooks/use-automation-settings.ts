import { useState, useEffect, useCallback } from 'react';
import { automationApi, type AutomationSetting } from '@/lib/api/automation';
import { toast } from 'sonner';

export function useAutomationSettings() {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await automationApi.getAllSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = 'Lỗi khi tải cài đặt tự động';
      setError(errorMessage);
      console.error('Error loading automation settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSetting = useCallback(
    (jobType: string) => {
      return settings.find((s) => s.jobType === jobType);
    },
    [settings]
  );

  const updateSetting = useCallback(
    async (
      jobType: string,
      update: {
        enabled: boolean;
        params?: Record<string, unknown>;
        notificationChannel?: string;
        notificationTarget?: string;
        autoApproveAfterMinutes?: number;
      }
    ) => {
      try {
        const updated = await automationApi.updateSetting(jobType, update);
        setSettings((prev) =>
          prev.map((s) => (s.jobType === jobType ? updated : s))
        );
        toast.success('Đã lưu cài đặt');
        return updated;
      } catch (err) {
        console.error('Error updating automation setting:', err);
        toast.error('Lỗi khi lưu cài đặt');
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    getSetting,
    updateSetting,
    reload: loadSettings,
  };
}
