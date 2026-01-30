import {
  CreateApplicationFormPayload,
  ApplicationForm,
  ApplicationFormTypesResponse,
  ApplicationFormReasonsResponse,
  ApprovalAssignmentsResponse,
} from '@/lib/types/application';
import apiClient from './client';

export const applicationApi = {
  /**
   * Lấy danh sách loại đơn
   * Token được tự động attach bởi API client interceptor
   */
  async getFormTypes(): Promise<ApplicationFormTypesResponse> {
    const response = await apiClient.get<{ data: ApplicationFormTypesResponse }>(
      '/application/types'
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách lý do
   * Token được tự động attach bởi API client interceptor
   */
  async getReasons(typeId?: number): Promise<ApplicationFormReasonsResponse> {
    const queryParams = typeId ? `?typeId=${typeId}` : '';
    const response = await apiClient.get<{ data: ApplicationFormReasonsResponse }>(
      `/application/reasons${queryParams}`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách người duyệt
   * Token được tự động attach bởi API client interceptor
   */
  async getApprovalAssignments(
    typeId: number,
    order: number,
    userId?: number,
  ): Promise<ApprovalAssignmentsResponse> {
    let queryParams = `?typeId=${typeId}&order=${order}`;
    if (userId) {
      queryParams += `&userId=${userId}`;
    }

    const response = await apiClient.get<{ data: ApprovalAssignmentsResponse }>(
      `/application/approval-assignments${queryParams}`
    );
    return response.data.data;
  },

  /**
   * Tạo đơn từ (application form)
   * Token được tự động attach bởi API client interceptor
   */
  async createApplicationForm(
    payload: CreateApplicationFormPayload,
  ): Promise<ApplicationForm> {
    const response = await apiClient.post<{ data: ApplicationForm }>(
      '/application/forms',
      payload
    );
    return response.data.data;
  },
};
