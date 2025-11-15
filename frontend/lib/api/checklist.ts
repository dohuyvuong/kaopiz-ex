const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface CodeReview {
  id: number;
  projectId: number;
  authorId: number;
  jiraUrl: string;
  description: string;
  status: number;
  reviewedAt: string | null;
  createdAt: string;
  project: {
    id: number;
    code: string;
    name: string;
    departmentId: number;
    driveName: string | null;
    totalProjectSize: number;
    totalReEstimate: number;
  };
  author: {
    id: number;
    email: string;
    name?: string;
    departmentNames: string[];
    departmentCodes: string[];
    roleNames: string[] | null;
    jobTitleNames: string[] | null;
    jobTitleCodes: string[] | null;
    departmentShortName: string;
    levelNames: string[] | null;
    departmentJobTitles: unknown[];
    departments: unknown[];
  };
  reviewers: Array<{
    id: number;
    email: string;
    name?: string;
    departmentNames: string[];
    departmentCodes: string[];
    roleNames: string[] | null;
    jobTitleNames: string[] | null;
    jobTitleCodes: string[] | null;
    departmentShortName: string;
    levelNames: string[] | null;
    pivot: {
      codeReviewId: number;
      reviewerId: number;
    };
    departmentJobTitles: unknown[];
    departments: unknown[];
  }>;
  tags: Array<{
    id: number;
    name: string;
    pivot: {
      codeReviewId: number;
      checklistTagId: number;
    };
  }>;
  codeReviewItems: Array<{
    id: number;
    codeReviewId: number;
    repositoryId: number;
    checklistId: number;
    pullRequestUrl: string;
    checklistItemsIds: number[];
    reviewResults: Array<{
      note: string | null;
      authorId?: number;
      reviewers: Array<{
        status: number;
        reviewerId: number;
      }>;
      checklistItemId: number;
      authorReviewStatus: number;
    }>;
    countComments: number | null;
    countLineCodeChange: number | null;
    commentPerChangeRate: number | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  [key: string]: unknown;
}

export interface CodeReviewListResponse {
  currentPage: number;
  data: CodeReview[];
  firstPageUrl: string;
  from: number;
  lastPage: number;
  lastPageUrl: string;
  nextPageUrl: string | null;
  path: string;
  perPage: number;
  prevPageUrl: string | null;
  to: number;
  total: number;
}

export interface GetCodeReviewsParams {
  projectName?: string;
  authorEmail?: string;
  reviewerEmail?: string;
  status?: string;
  viewer?: string;
  statusIn?: number | number[];
  sort?: string;
  page?: number;
  perPage?: number;
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
