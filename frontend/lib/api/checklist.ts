import apiClient from './client';

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
   * Token được tự động attach bởi API client interceptor
   */
  async getMyPendingReviews(
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

    const queryString = queryParams.toString();
    const url = `/checklist/pending-reviews${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<{ data: CodeReviewListResponse }>(url);
    return response.data.data;
  },

  /**
   * Tự động review các checklist
   * Token được tự động attach bởi API client interceptor
   */
  async autoReview(
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

    const url = `/checklist/auto-review?${queryParams.toString()}`;

    const response = await apiClient.post<{
      data: {
        total: number;
        success: number;
        failed: number;
        results: Array<{
          codeReviewId: number;
          success: boolean;
          error?: string;
        }>;
      };
    }>(url);

    return response.data.data;
  },
};
