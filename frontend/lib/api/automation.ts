import apiClient from './client';

// Types
export interface AutomationSetting {
  id?: number;
  jobType: string;
  enabled: boolean;
  params: Record<string, unknown> | null;
  notificationChannel: string | null;
  notificationTarget: string | null;
  autoApproveAfterMinutes: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateAutomationSettingDto {
  enabled: boolean;
  params?: Record<string, unknown>;
  // Required when enabled = true
  notificationChannel?: string;
  notificationTarget?: string;
  autoApproveAfterMinutes?: number;
}

import type { PendingAction } from '@/types/automation.types';

export const automationApi = {
  /**
   * Get all automation settings for current user
   */
  getAllSettings: async (): Promise<AutomationSetting[]> => {
    const response = await apiClient.get('/automation/settings');
    return response.data;
  },

  /**
   * Get all actions for current user (all statuses)
   */
  getAllActions: async (): Promise<PendingAction[]> => {
    const response = await apiClient.get('/automation/actions');
    return response.data;
  },

  /**
   * Get one action by id (để hiển thị chi tiết trang approve/reject; 401 nếu chưa đăng nhập)
   */
  getActionById: async (actionId: number): Promise<PendingAction> => {
    const response = await apiClient.get(`/automation/actions/${actionId}`);
    return response.data;
  },

  /**
   * Get automation setting for a specific jobType
   */
  getSetting: async (jobType: string): Promise<AutomationSetting> => {
    const response = await apiClient.get(`/automation/settings/${jobType}`);
    return response.data;
  },

  /**
   * Update automation setting for a specific jobType
   */
  updateSetting: async (
    jobType: string,
    dto: UpdateAutomationSettingDto
  ): Promise<AutomationSetting> => {
    const response = await apiClient.put(`/automation/settings/${jobType}`, dto);
    return response.data;
  },
};
