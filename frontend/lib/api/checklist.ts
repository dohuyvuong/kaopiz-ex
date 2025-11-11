const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface CodeReview {
  id: number;
  project_id: number;
  author_id: number;
  jira_url: string;
  description: string;
  status: number;
  reviewed_at: string | null;
  created_at: string;
  project: {
    id: number;
    code: string;
    name: string;
  };
  author: {
    id: number;
    email: string;
  };
  reviewers: Array<{
    id: number;
    email: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
  [key: string]: unknown;
}

export interface CodeReviewListResponse {
  current_page: number;
  data: CodeReview[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface GetCodeReviewsParams {
  project_name?: string;
  author_email?: string;
  reviewer_email?: string;
  status?: string;
  viewer?: string;
  status_in?: number | number[];
  sort?: string;
  page?: number;
  per_page?: number;
}

export const checklistApi = {
  /**
   * Lấy danh sách code reviews đang chờ tôi review
   * Yêu cầu token từ Ksystem (microsoft-sso)
   */
  async getMyPendingReviews(
    token: string,
    params?: {
      sort?: string;
      page?: number;
      perPage?: number;
      projectName?: string;
      authorEmail?: string;
    },
  ): Promise<CodeReviewListResponse> {
    const queryParams = new URLSearchParams();

    // Tham số từ params (camelCase)
    if (params) {
      if (params.sort) {
        queryParams.append('sort', params.sort);
      }
      if (params.page) {
        queryParams.append('page', String(params.page));
      }
      if (params.perPage) {
        queryParams.append('perPage', String(params.perPage));
      }
      if (params.projectName) {
        queryParams.append('projectName', params.projectName);
      }
      if (params.authorEmail) {
        queryParams.append('authorEmail', params.authorEmail);
      }
    }

    const url = `${API_BASE_URL}/checklist/pending-reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get pending reviews',
      }));
      throw new Error(error.message || 'Failed to get pending reviews');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Tự động review các checklist
   * Yêu cầu token từ Ksystem (microsoft-sso)
   */
  async autoReview(
    token: string,
    params: {
      maxReviews: number;
      projectName: string;
    },
  ): Promise<{
    total: number;
    success: number;
    failed: number;
    results: Array<{
      codeReviewId: number;
      success: boolean;
      error?: string;
    }>;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('maxReviews', String(params.maxReviews));
    queryParams.append('projectName', params.projectName);

    const url = `${API_BASE_URL}/checklist/auto-review?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to auto review',
      }));
      throw new Error(error.message || 'Failed to auto review');
    }

    const result = await response.json();
    return result.data;
  },
};
