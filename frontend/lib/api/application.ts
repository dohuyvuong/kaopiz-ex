import {
  CreateApplicationFormPayload,
  ApplicationForm,
  ApplicationFormTypesResponse,
  ApplicationFormReasonsResponse,
  ApprovalAssignmentsResponse,
} from '@/lib/types/application';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const applicationApi = {
  /**
   * Lấy danh sách loại đơn
   */
  async getFormTypes(token: string): Promise<ApplicationFormTypesResponse> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    const response = await fetch(`${API_BASE_URL}/application/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get form types',
      }));
      throw new Error(error.message || 'Failed to get form types');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Lấy danh sách lý do
   */
  async getReasons(
    token: string,
    typeId?: number,
  ): Promise<ApplicationFormReasonsResponse> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    const queryParams = typeId ? `?typeId=${typeId}` : '';
    const response = await fetch(
      `${API_BASE_URL}/application/reasons${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get reasons',
      }));
      throw new Error(error.message || 'Failed to get reasons');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Lấy danh sách người duyệt
   */
  async getApprovalAssignments(
    token: string,
    typeId: number,
    order: number,
    userId?: number,
  ): Promise<ApprovalAssignmentsResponse> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    let queryParams = `?typeId=${typeId}&order=${order}`;
    if (userId) {
      queryParams += `&userId=${userId}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/application/approval-assignments${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get approval assignments',
      }));
      throw new Error(error.message || 'Failed to get approval assignments');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Tạo đơn từ (application form)
   */
  async createApplicationForm(
    token: string,
    payload: CreateApplicationFormPayload,
  ): Promise<ApplicationForm> {
    if (!token) {
      throw new Error('HRM token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/application/forms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to create application form',
      }));
      throw new Error(error.message || 'Failed to create application form');
    }

    const result = await response.json();
    return result.data;
  },
};
