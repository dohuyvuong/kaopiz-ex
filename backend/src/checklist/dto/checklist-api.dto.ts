import { Expose, Transform, Type } from 'class-transformer';

/**
 * DTO cho CodeReviewReviewer
 */
export class CodeReviewReviewerDto {
  @Expose()
  id: number;

  @Expose({ name: 'code_review_id' })
  codeReviewId: number;

  @Expose({ name: 'reviewer_id' })
  reviewerId: number;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date | null;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt: Date | null;

  @Expose({ name: 'deleted_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  deletedAt: Date | null;
}

/**
 * DTO cho CodeReviewProject
 */
export class CodeReviewProjectDto {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose({ name: 'department_id' })
  departmentId: number;

  @Expose({ name: 'drive_name' })
  driveName: string | null;

  @Expose({ name: 'total_project_size' })
  totalProjectSize: number;

  @Expose({ name: 'total_re_estimate' })
  totalReEstimate: number;
}

/**
 * DTO cho CodeReviewAuthor
 */
export class CodeReviewAuthorDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose({ name: 'department_names' })
  departmentNames: string[];

  @Expose({ name: 'department_codes' })
  departmentCodes: string[];

  @Expose({ name: 'role_names' })
  roleNames: string[] | null;

  @Expose({ name: 'job_title_names' })
  jobTitleNames: string[] | null;

  @Expose({ name: 'job_title_codes' })
  jobTitleCodes: string[] | null;

  @Expose({ name: 'department_short_name' })
  departmentShortName: string;

  @Expose({ name: 'level_names' })
  levelNames: string[] | null;

  @Expose({ name: 'department_job_titles' })
  departmentJobTitles: unknown[];

  @Expose()
  departments: unknown[];
}

/**
 * DTO cho CodeReviewReviewerUser
 */
export class CodeReviewReviewerUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose({ name: 'department_names' })
  departmentNames: string[];

  @Expose({ name: 'department_codes' })
  departmentCodes: string[];

  @Expose({ name: 'role_names' })
  roleNames: string[] | null;

  @Expose({ name: 'job_title_names' })
  jobTitleNames: string[] | null;

  @Expose({ name: 'job_title_codes' })
  jobTitleCodes: string[] | null;

  @Expose({ name: 'department_short_name' })
  departmentShortName: string;

  @Expose({ name: 'level_names' })
  levelNames: string[] | null;

  @Expose()
  @Transform(({ obj }) => ({
    codeReviewId: obj.pivot?.code_review_id,
    reviewerId: obj.pivot?.reviewer_id,
  }))
  pivot: {
    codeReviewId: number;
    reviewerId: number;
  };

  @Expose({ name: 'department_job_titles' })
  departmentJobTitles: unknown[];

  @Expose()
  departments: unknown[];
}

/**
 * DTO cho CodeReviewTag
 */
export class CodeReviewTagDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => ({
    codeReviewId: obj.pivot?.code_review_id,
    checklistTagId: obj.pivot?.checklist_tag_id,
  }))
  pivot: {
    codeReviewId: number;
    checklistTagId: number;
  };
}

/**
 * DTO cho CodeReviewItemReviewResult
 */
export class CodeReviewItemReviewResultDto {
  @Expose()
  note: string | null;

  @Expose({ name: 'author_id' })
  authorId?: number;

  @Expose()
  @Transform(({ value }) =>
    value?.map((r: { status: number; reviewer_id: number }) => ({
      status: r.status,
      reviewerId: r.reviewer_id,
    })),
  )
  reviewers: Array<{
    status: number;
    reviewerId: number;
  }>;

  @Expose({ name: 'checklist_item_id' })
  checklistItemId: number;

  @Expose({ name: 'author_review_status' })
  authorReviewStatus: number;
}

/**
 * DTO cho CodeReviewItem
 */
export class CodeReviewItemDto {
  @Expose()
  id: number;

  @Expose({ name: 'code_review_id' })
  codeReviewId: number;

  @Expose({ name: 'repository_id' })
  repositoryId: number;

  @Expose({ name: 'checklist_id' })
  checklistId: number;

  @Expose({ name: 'pull_request_url' })
  pullRequestUrl: string;

  @Expose({ name: 'checklist_items_ids' })
  checklistItemsIds: number[];

  @Expose({ name: 'review_results' })
  @Type(() => CodeReviewItemReviewResultDto)
  reviewResults: CodeReviewItemReviewResultDto[];

  @Expose({ name: 'count_comments' })
  countComments: number | null;

  @Expose({ name: 'count_line_code_change' })
  countLineCodeChange: number | null;

  @Expose({ name: 'comment_per_change_rate' })
  commentPerChangeRate: number | null;

  @Expose({ name: 'deleted_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  deletedAt: Date | null;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt: Date;
}

/**
 * DTO cho CodeReview
 */
export class CodeReviewDto {
  @Expose()
  id: number;

  @Expose({ name: 'project_id' })
  projectId: number;

  @Expose({ name: 'author_id' })
  authorId: number;

  @Expose({ name: 'jira_url' })
  jiraUrl: string;

  @Expose()
  description: string;

  @Expose()
  status: number;

  @Expose({ name: 'reviewed_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  reviewedAt: Date;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date;

  @Expose({ name: 'code_review_reviewers' })
  @Type(() => CodeReviewReviewerDto)
  codeReviewReviewers: CodeReviewReviewerDto[];

  @Expose()
  @Type(() => CodeReviewProjectDto)
  project: CodeReviewProjectDto;

  @Expose()
  @Type(() => CodeReviewAuthorDto)
  author: CodeReviewAuthorDto;

  @Expose()
  @Type(() => CodeReviewReviewerUserDto)
  reviewers: CodeReviewReviewerUserDto[];

  @Expose()
  @Type(() => CodeReviewTagDto)
  tags: CodeReviewTagDto[];

  @Expose({ name: 'code_review_items' })
  @Type(() => CodeReviewItemDto)
  codeReviewItems: CodeReviewItemDto[];
}

/**
 * DTO cho CodeReviewListResponse
 */
export class CodeReviewListResponseDto {
  @Expose({ name: 'current_page' })
  currentPage: number;

  @Expose()
  @Type(() => CodeReviewDto)
  data: CodeReviewDto[];

  @Expose({ name: 'first_page_url' })
  firstPageUrl: string;

  @Expose()
  from: number;

  @Expose({ name: 'last_page' })
  lastPage: number;

  @Expose({ name: 'last_page_url' })
  lastPageUrl: string;

  @Expose({ name: 'next_page_url' })
  nextPageUrl: string | null;

  @Expose()
  path: string;

  @Expose({ name: 'per_page' })
  perPage: number;

  @Expose({ name: 'prev_page_url' })
  prevPageUrl: string | null;

  @Expose()
  to: number;

  @Expose()
  total: number;
}

/**
 * DTO cho CodeReviewDetailResponse
 */
export class CodeReviewDetailResponseDto {
  @Expose()
  id: number;

  @Expose({ name: 'project_id' })
  projectId: number;

  @Expose({ name: 'author_id' })
  authorId: number;

  @Expose({ name: 'jira_url' })
  jiraUrl: string;

  @Expose()
  description: string;

  @Expose()
  status: number;

  @Expose({ name: 'reviewed_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  reviewedAt: Date;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt: Date;

  @Expose()
  @Type(() => CodeReviewProjectDto)
  project: CodeReviewProjectDto;

  @Expose()
  @Type(() => CodeReviewAuthorDto)
  author: CodeReviewAuthorDto;

  @Expose()
  @Type(() => CodeReviewReviewerUserDto)
  reviewers: CodeReviewReviewerUserDto[];

  @Expose()
  @Type(() => CodeReviewTagDto)
  tags: CodeReviewTagDto[];

  @Expose({ name: 'code_review_items' })
  @Type(() => CodeReviewItemDto)
  codeReviewItems: CodeReviewItemDto[];
}

/**
 * DTO cho ChecklistItemTag
 */
export class ChecklistItemTagDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => ({
    checklistItemId: obj.pivot?.checklist_item_id,
    checklistTagId: obj.pivot?.checklist_tag_id,
  }))
  pivot: {
    checklistItemId: number;
    checklistTagId: number;
  };
}

/**
 * DTO cho ChecklistCategory
 */
export class ChecklistCategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

/**
 * DTO cho ChecklistItemCodeReviewDetail
 */
export class ChecklistItemCodeReviewDetailDto {
  @Expose()
  note: string | null;

  @Expose({ name: 'author_id' })
  authorId: number;

  @Expose()
  @Transform(({ value }) =>
    value?.map((r: { status: number; reviewer_id: number }) => ({
      status: r.status,
      reviewerId: r.reviewer_id,
    })),
  )
  reviewers: Array<{
    status: number;
    reviewerId: number;
  }>;

  @Expose({ name: 'checklist_item_id' })
  checklistItemId: number;

  @Expose({ name: 'author_review_status' })
  authorReviewStatus: number;
}

/**
 * DTO cho ChecklistItem
 */
export class ChecklistItemDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose({ name: 'checklist_category_id' })
  checklistCategoryId: number;

  @Expose()
  priority: number;

  @Expose({ name: 'checklist_id' })
  checklistId: number | null;

  @Expose({ name: 'code_review_detail' })
  @Type(() => ChecklistItemCodeReviewDetailDto)
  codeReviewDetail: ChecklistItemCodeReviewDetailDto;

  @Expose({ name: 'checklist_category' })
  @Type(() => ChecklistCategoryDto)
  checklistCategory: ChecklistCategoryDto;

  @Expose()
  @Type(() => ChecklistItemTagDto)
  tags: ChecklistItemTagDto[];

  @Expose()
  skills: unknown[];
}

/**
 * DTO cho CodeReviewItemWithChecklist
 */
export class CodeReviewItemWithChecklistDto {
  @Expose()
  id: number;

  @Expose({ name: 'pull_request_url' })
  pullRequestUrl: string;

  @Expose({ name: 'checklist_item' })
  @Type(() => ChecklistItemDto)
  checklistItem: ChecklistItemDto[];
}

/**
 * DTO cho SubmitReviewResultReviewer
 */
export class SubmitReviewResultReviewerDto {
  @Expose({ name: 'reviewer_id' })
  reviewerId: number;

  @Expose()
  status: number;
}

/**
 * DTO cho SubmitReviewResult
 */
export class SubmitReviewResultDto {
  @Expose({ name: 'checklist_item_id' })
  checklistItemId: number;

  @Expose({ name: 'author_review_status' })
  authorReviewStatus: number;

  @Expose()
  @Type(() => SubmitReviewResultReviewerDto)
  reviewers: SubmitReviewResultReviewerDto[];

  @Expose()
  note: string | null;

  @Expose({ name: 'author_id' })
  authorId: number;
}

/**
 * DTO cho SubmitReviewCodeReviewDetail
 */
export class SubmitReviewCodeReviewDetailDto {
  @Expose()
  id: number;

  @Expose({ name: 'review_results' })
  @Type(() => SubmitReviewResultDto)
  reviewResults: SubmitReviewResultDto[];
}

/**
 * DTO cho SubmitReviewCodeReview
 */
export class SubmitReviewCodeReviewDto {
  @Expose()
  id: number;

  @Expose()
  status: number;

  @Expose({ name: 'reviewed_at' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  reviewedAt: Date;
}

/**
 * DTO cho SubmitReviewPayload
 */
export class SubmitReviewPayloadDto {
  @Expose({ name: 'code_review' })
  @Type(() => SubmitReviewCodeReviewDto)
  codeReview: SubmitReviewCodeReviewDto;

  @Expose({ name: 'code_review_details' })
  @Type(() => SubmitReviewCodeReviewDetailDto)
  codeReviewDetails: SubmitReviewCodeReviewDetailDto[];
}
