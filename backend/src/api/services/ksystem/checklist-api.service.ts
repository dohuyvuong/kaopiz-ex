import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from '../../../common/types/request.types';
import { KsystemService } from '../ksystem.service';

// Code Review interfaces
export interface CodeReviewReviewer {
  id: number;
  code_review_id: number;
  reviewer_id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CodeReviewProject {
  id: number;
  code: string;
  name: string;
  department_id: number;
  drive_name: string | null;
  total_project_size: number;
  total_re_estimate: number;
  [key: string]: unknown;
}

export interface CodeReviewAuthor {
  id: number;
  email: string;
  name?: string; // Có trong detail response
  department_names: string[];
  department_codes: string[];
  role_names: string[] | null;
  job_title_names: string[] | null;
  job_title_codes: string[] | null;
  department_short_name: string;
  level_names: string[] | null;
  department_job_titles: unknown[];
  departments: unknown[];
  [key: string]: unknown;
}

export interface CodeReviewReviewerUser {
  id: number;
  email: string;
  name?: string; // Có trong detail response
  department_names: string[];
  department_codes: string[];
  role_names: string[] | null;
  job_title_names: string[] | null;
  job_title_codes: string[] | null;
  department_short_name: string;
  level_names: string[] | null;
  pivot: {
    code_review_id: number;
    reviewer_id: number;
  };
  department_job_titles: unknown[];
  departments: unknown[];
  [key: string]: unknown;
}

export interface CodeReviewTag {
  id: number;
  name: string;
  pivot: {
    code_review_id: number;
    checklist_tag_id: number;
  };
}

export interface CodeReviewItemReviewResult {
  note: string | null;
  author_id?: number;
  reviewers: Array<{
    status: number;
    reviewer_id: number;
  }>;
  checklist_item_id: number;
  author_review_status: number;
}

export interface CodeReviewItem {
  id: number;
  code_review_id: number;
  repository_id: number;
  checklist_id: number;
  pull_request_url: string;
  checklist_items_ids: number[];
  review_results: CodeReviewItemReviewResult[];
  count_comments: number | null;
  count_line_code_change: number | null;
  comment_per_change_rate: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CodeReview {
  id: number;
  project_id: number;
  author_id: number;
  jira_url: string;
  description: string;
  status: number;
  reviewed_at: string;
  created_at: string;
  code_review_reviewers: CodeReviewReviewer[];
  project: CodeReviewProject;
  author: CodeReviewAuthor;
  reviewers: CodeReviewReviewerUser[];
  tags: CodeReviewTag[];
  code_review_items: CodeReviewItem[];
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

export interface CodeReviewDetailResponse {
  id: number;
  project_id: number;
  author_id: number;
  jira_url: string;
  description: string;
  status: number;
  reviewed_at: string;
  created_at: string;
  project: CodeReviewProject;
  author: CodeReviewAuthor;
  reviewers: CodeReviewReviewerUser[];
  tags: CodeReviewTag[];
  code_review_items: CodeReviewItem[];
  [key: string]: unknown;
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
  [key: string]: unknown;
}

// Checklist Item interfaces
export interface ChecklistItemTag {
  id: number;
  name: string;
  pivot: {
    checklist_item_id: number;
    checklist_tag_id: number;
  };
}

export interface ChecklistCategory {
  id: number;
  name: string;
}

export interface ChecklistItemCodeReviewDetail {
  note: string | null;
  author_id: number;
  reviewers: Array<{
    status: number;
    reviewer_id: number;
  }>;
  checklist_item_id: number;
  author_review_status: number;
}

export interface ChecklistItem {
  id: number;
  name: string;
  description: string;
  checklist_category_id: number;
  priority: number;
  checklist_id: number | null;
  code_review_detail: ChecklistItemCodeReviewDetail;
  checklist_category: ChecklistCategory;
  tags: ChecklistItemTag[];
  skills: unknown[];
  [key: string]: unknown;
}

export interface CodeReviewItemWithChecklist {
  id: number;
  pull_request_url: string;
  checklist_item: ChecklistItem[];
  [key: string]: unknown;
}

// Submit Review interfaces
export interface SubmitReviewResultReviewer {
  reviewer_id: number;
  status: number;
}

export interface SubmitReviewResult {
  checklist_item_id: number;
  author_review_status: number;
  reviewers: SubmitReviewResultReviewer[];
  note: string | null;
  author_id: number;
}

export interface SubmitReviewCodeReviewDetail {
  id: number;
  review_results: SubmitReviewResult[];
}

export interface SubmitReviewCodeReview {
  id: number;
  status: number;
  reviewed_at: string;
}

export interface SubmitReviewPayload {
  code_review: SubmitReviewCodeReview;
  code_review_details: SubmitReviewCodeReviewDetail[];
}

@Injectable()
export class ChecklistApiService {
  constructor(
    private readonly ksystemService: KsystemService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  /**
   * Lấy token từ request (đã được validate bởi JwtAuthSystemGuard)
   */
  private getToken(): string {
    return this.request.token;
  }

  /**
   * Lấy danh sách code reviews đang chờ tôi review từ Ksystem API
   * Sử dụng các tham số cố định: viewer=is_reviewer&status_in=3
   * @returns Raw data từ Ksystem API (snake_case)
   */
  async getMyPendingReviews(params?: {
    sort?: string;
    page?: number;
    per_page?: number;
    project_name?: string;
    author_email?: string;
    [key: string]: unknown;
  }): Promise<unknown> {
    const queryParams = new URLSearchParams();

    // Tham số cố định
    queryParams.append('viewer', 'is_reviewer');
    queryParams.append('status_in', '3');

    // Tham số mặc định
    if (!params?.sort) {
      queryParams.append('sort', 'created_at|desc');
    }

    // Tham số từ params (có thể override)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/code-reviews?${queryParams.toString()}`;
    return this.ksystemService.get<CodeReviewListResponse>(
      endpoint,
      this.getToken(),
    );
  }

  /**
   * Lấy danh sách code reviews với các tham số tùy chỉnh từ Ksystem API
   * @returns Raw data từ Ksystem API (snake_case)
   */
  async getCodeReviewsToReview(
    params?: GetCodeReviewsParams,
  ): Promise<unknown> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Xử lý trường hợp status_in là array
          if (key === 'status_in' && Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const endpoint = `/code-reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.ksystemService.get<CodeReviewListResponse>(
      endpoint,
      this.getToken(),
    );
  }

  /**
   * Lấy thông tin chi tiết của một code review từ Ksystem API
   * @returns Raw data từ Ksystem API (snake_case)
   */
  async getCodeReviewDetail(id: number): Promise<unknown> {
    const queryParams = new URLSearchParams();
    queryParams.append('id', String(id));
    queryParams.append('detail', 'true');

    const endpoint = `/code-reviews/${id}?${queryParams.toString()}`;
    return this.ksystemService.get<CodeReviewDetailResponse>(
      endpoint,
      this.getToken(),
    );
  }

  /**
   * Lấy checklist items của một code review từ Ksystem API
   * @param id - ID của code review
   * @param tagIds - Mảng các tag IDs để filter (optional)
   * @returns Raw data từ Ksystem API (snake_case)
   */
  async getCodeReviewChecklistItems(
    id: number,
    tagIds?: number[],
  ): Promise<unknown> {
    const queryParams = new URLSearchParams();

    // Xử lý tag_ids[] dạng array
    if (tagIds && tagIds.length > 0) {
      tagIds.forEach((tagId) => {
        queryParams.append('tag_ids[]', String(tagId));
      });
    }

    const endpoint = `/code-reviews/${id}/review${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.ksystemService.get<CodeReviewItemWithChecklist[]>(
      endpoint,
      this.getToken(),
    );
  }

  /**
   * Submit review code từ Ksystem API
   * @param id - ID của code review
   * @param payload - Payload chứa thông tin review (snake_case)
   * @returns Raw response từ Ksystem API
   */
  async submitReview(id: number, payload: unknown): Promise<unknown> {
    const endpoint = `/code-reviews/${id}/review`;
    return this.ksystemService.post<boolean>(
      endpoint,
      this.getToken(),
      payload,
    );
  }
}
