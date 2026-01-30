import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { ChecklistApiService } from '../api/services/ksystem/checklist-api.service';
import {
  CodeReviewListResponseDto,
  CodeReviewDetailResponseDto,
  CodeReviewItemWithChecklistDto,
  SubmitReviewPayloadDto,
} from './dto/checklist-api.dto';

/**
 * Service để xử lý logic checklist
 * Sử dụng ChecklistApiService để lấy dữ liệu từ Ksystem
 * Transform từ snake_case sang camelCase
 */
@Injectable()
export class ChecklistService {
  private readonly logger: Logger;

  constructor(private readonly checklistApiService: ChecklistApiService) {
    this.logger = new Logger(ChecklistService.name);
  }

  /**
   * Lấy danh sách code reviews đang chờ tôi review
   * Sử dụng các tham số cố định: viewer=is_reviewer&status_in=3
   * @param token Ksystem JWT token
   * @param params Query parameters
   */
  async getMyPendingReviews(
    token: string,
    params?: {
      sort?: string;
      page?: number;
      perPage?: number;
      projectName?: string;
      authorEmail?: string;
      [key: string]: unknown;
    },
  ): Promise<CodeReviewListResponseDto> {
    this.logger.log('Getting my pending reviews');

    // Transform params từ camelCase sang snake_case cho API
    const apiParams: {
      sort?: string;
      page?: number;
      per_page?: number;
      project_name?: string;
      author_email?: string;
      [key: string]: unknown;
    } = {};

    if (params) {
      if (params.sort !== undefined) apiParams.sort = params.sort;
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.perPage !== undefined) apiParams.per_page = params.perPage;
      if (params.projectName !== undefined)
        apiParams.project_name = params.projectName;
      if (params.authorEmail !== undefined)
        apiParams.author_email = params.authorEmail;
    }

    // Gọi API thông qua ChecklistApiService
    const rawData = await this.checklistApiService.getMyPendingReviews(
      token,
      apiParams,
    );

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      CodeReviewListResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Lấy danh sách code reviews với các tham số tùy chỉnh
   * @param token Ksystem JWT token
   * @param params Query parameters
   */
  async getCodeReviewsToReview(
    token: string,
    params?: {
      projectName?: string;
      authorEmail?: string;
      reviewerEmail?: string;
      status?: string;
      viewer?: string;
      statusIn?: number | number[];
      sort?: string;
      page?: number;
      perPage?: number;
      [key: string]: unknown;
    },
  ): Promise<CodeReviewListResponseDto> {
    this.logger.log('Getting code reviews to review');

    // Transform params từ camelCase sang snake_case cho API
    const apiParams: {
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
    } = {};

    if (params) {
      if (params.projectName !== undefined)
        apiParams.project_name = params.projectName;
      if (params.authorEmail !== undefined)
        apiParams.author_email = params.authorEmail;
      if (params.reviewerEmail !== undefined)
        apiParams.reviewer_email = params.reviewerEmail;
      if (params.status !== undefined) apiParams.status = params.status;
      if (params.viewer !== undefined) apiParams.viewer = params.viewer;
      if (params.statusIn !== undefined) apiParams.status_in = params.statusIn;
      if (params.sort !== undefined) apiParams.sort = params.sort;
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.perPage !== undefined) apiParams.per_page = params.perPage;
    }

    // Gọi API thông qua ChecklistApiService
    const rawData = await this.checklistApiService.getCodeReviewsToReview(
      token,
      apiParams,
    );

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      CodeReviewListResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Lấy thông tin chi tiết của một code review
   * @param token Ksystem JWT token
   * @param id Code review ID
   */
  async getCodeReviewDetail(
    token: string,
    id: number,
  ): Promise<CodeReviewDetailResponseDto> {
    this.logger.log(`Getting code review detail for id: ${id}`);

    // Gọi API thông qua ChecklistApiService
    const rawData = await this.checklistApiService.getCodeReviewDetail(
      token,
      id,
    );

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      CodeReviewDetailResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Lấy checklist items của một code review
   * @param token Ksystem JWT token
   * @param id - ID của code review
   * @param tagIds - Mảng các tag IDs để filter (optional)
   */
  async getCodeReviewChecklistItems(
    token: string,
    id: number,
    tagIds?: number[],
  ): Promise<CodeReviewItemWithChecklistDto[]> {
    this.logger.log(
      `Getting checklist items for code review id: ${id}, tagIds: ${tagIds?.join(',') || 'all'}`,
    );

    // Gọi API thông qua ChecklistApiService
    const rawData = await this.checklistApiService.getCodeReviewChecklistItems(
      token,
      id,
      tagIds,
    );

    // Transform từ snake_case sang camelCase
    const transformedData = (rawData as unknown[]).map((item) =>
      plainToInstance(CodeReviewItemWithChecklistDto, item, {
        excludeExtraneousValues: true,
      }),
    );

    return transformedData;
  }

  /**
   * Submit review code
   * @param token Ksystem JWT token
   * @param id - ID của code review
   * @param payload - Payload chứa thông tin review (camelCase)
   */
  async submitReview(
    token: string,
    id: number,
    payload: SubmitReviewPayloadDto,
  ): Promise<boolean> {
    this.logger.log(`Submitting review for code review id: ${id}`);

    // Transform payload từ camelCase sang snake_case cho API
    const apiPayload = {
      code_review: {
        id: payload.codeReview.id,
        status: payload.codeReview.status,
        reviewed_at: payload.codeReview.reviewedAt
          ? dayjs(payload.codeReview.reviewedAt).format('YYYY-MM-DD HH:mm:ss')
          : dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      code_review_details: payload.codeReviewDetails.map((detail) => ({
        id: detail.id,
        review_results: detail.reviewResults.map((result) => ({
          checklist_item_id: result.checklistItemId,
          author_review_status: result.authorReviewStatus,
          reviewers: result.reviewers.map((r) => ({
            reviewer_id: r.reviewerId,
            status: r.status,
          })),
          note: result.note,
          author_id: result.authorId,
        })),
      })),
    };

    // Gọi API thông qua ChecklistApiService
    const result = await this.checklistApiService.submitReview(
      token,
      id,
      apiPayload,
    );

    // Transform response (có thể là boolean hoặc object)
    return typeof result === 'boolean' ? result : !!result;
  }
}
