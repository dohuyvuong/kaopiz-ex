import { Injectable, Logger } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import {
  CodeReviewDetailResponseDto,
  CodeReviewItemWithChecklistDto,
  SubmitReviewPayloadDto,
  SubmitReviewCodeReviewDto,
  SubmitReviewCodeReviewDetailDto,
  SubmitReviewResultDto,
  SubmitReviewResultReviewerDto,
} from './dto/checklist-api.dto';

@Injectable()
export class ChecklistAutoReviewService {
  private readonly logger = new Logger(ChecklistAutoReviewService.name);

  constructor(private readonly checklistService: ChecklistService) {}

  /**
   * Tự động review tất cả các checklist đang chờ review
   * @param maxReviews - Số lượng checklist tối đa sẽ review (optional)
   * @param projectName - Tên project để lọc checklist (optional, API sẽ search like)
   */
  async autoReviewAll(
    maxReviews?: number,
    projectName?: string,
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
    const limitMessage = maxReviews ? ` (giới hạn tối đa: ${maxReviews})` : '';
    const projectMessage = projectName ? ` cho project: ${projectName}` : '';
    this.logger.log(
      `Bắt đầu tự động review checklist${projectMessage}${limitMessage}...`,
    );

    const results: Array<{
      codeReviewId: number;
      success: boolean;
      error?: string;
    }> = [];

    let processed = 0;
    let success = 0;
    let failed = 0;
    let currentPage = 1;
    let hasMore = true;

    // Lấy tất cả các trang
    while (hasMore) {
      try {
        const response = await this.checklistService.getMyPendingReviews({
          page: currentPage,
          perPage: 20,
          projectName: projectName,
        });

        // Filter chỉ lấy những review có status = 3 (Đã self reviewed)
        const reviewsToProcess = response.data.filter(
          (review) => review.status === 3,
        );

        this.logger.log(
          `Trang ${currentPage}: Tìm thấy ${reviewsToProcess.length} reviews cần xử lý (tổng ${response.data.length} reviews)`,
        );

        // Xử lý từng review
        for (const review of reviewsToProcess) {
          // Kiểm tra giới hạn số lượng
          if (maxReviews && processed >= maxReviews) {
            this.logger.log(
              `Đã đạt giới hạn ${maxReviews} reviews. Dừng xử lý.`,
            );
            hasMore = false;
            break;
          }

          try {
            await this.autoReviewSingle(review.id);
            results.push({
              codeReviewId: review.id,
              success: true,
            });
            success++;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              `Lỗi khi review code review ${review.id}:`,
              errorMessage,
            );
            results.push({
              codeReviewId: review.id,
              success: false,
              error: errorMessage,
            });
            failed++;
          }
          processed++;
        }

        // Kiểm tra lại sau khi xử lý xong trang này
        if (maxReviews && processed >= maxReviews) {
          hasMore = false;
        } else {
          hasMore = currentPage < response.lastPage;
        }
        currentPage++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Lỗi khi lấy danh sách trang ${currentPage}:`,
          errorMessage,
        );
        hasMore = false;
      }
    }

    const summary = {
      total: processed,
      success,
      failed,
      results,
    };

    this.logger.log(
      `Hoàn thành tự động review: ${success} thành công, ${failed} thất bại trên tổng ${processed} reviews`,
    );

    return summary;
  }

  /**
   * Tự động review một code review cụ thể
   */
  async autoReviewSingle(codeReviewId: number): Promise<boolean> {
    this.logger.log(`Bắt đầu review code review ${codeReviewId}...`);

    // 1. Lấy chi tiết code review
    const detail: CodeReviewDetailResponseDto =
      await this.checklistService.getCodeReviewDetail(codeReviewId);

    // Kiểm tra status = 3
    if (detail.status !== 3) {
      throw new Error(
        `Code review ${codeReviewId} không có status = 3 (status hiện tại: ${detail.status})`,
      );
    }

    // 2. Extract tags từ code review
    const tagIds = detail.tags.map((tag) => tag.id);
    this.logger.log(
      `Code review ${codeReviewId} có ${tagIds.length} tags: [${tagIds.join(', ')}]`,
    );

    // 3. Lấy checklist items với tags
    const checklistItems: CodeReviewItemWithChecklistDto[] =
      await this.checklistService.getCodeReviewChecklistItems(
        codeReviewId,
        tagIds.length > 0 ? tagIds : undefined,
      );

    if (checklistItems.length === 0) {
      this.logger.warn(
        `Code review ${codeReviewId} không có checklist items nào`,
      );
      return false;
    }

    this.logger.log(
      `Code review ${codeReviewId} có ${checklistItems.length} code review items`,
    );

    // 4. Build payload để submit review
    const payload = this.buildSubmitReviewPayload(
      codeReviewId,
      detail,
      checklistItems,
    );

    // 5. Submit review
    const result = await this.checklistService.submitReview(
      codeReviewId,
      payload,
    );

    if (result) {
      this.logger.log(`✅ Đã review thành công code review ${codeReviewId}`);
    } else {
      this.logger.warn(
        `⚠️ Submit review code review ${codeReviewId} trả về false`,
      );
    }

    return result;
  }

  /**
   * Build payload để submit review
   */
  private buildSubmitReviewPayload(
    codeReviewId: number,
    detail: CodeReviewDetailResponseDto,
    checklistItems: CodeReviewItemWithChecklistDto[],
  ): SubmitReviewPayloadDto {
    const now = new Date();

    // Build code_review_details
    const codeReviewDetails: SubmitReviewCodeReviewDetailDto[] =
      checklistItems.map((item) => {
        // Lấy review_results từ checklist items
        const reviewResults: SubmitReviewResultDto[] = item.checklistItem.map(
          (checklistItem) => {
            const codeReviewDetail = checklistItem.codeReviewDetail;

            // Tìm reviewer_id của current user (cần lấy từ detail.reviewers)
            // Giả sử reviewer_id là reviewer đầu tiên trong danh sách
            const reviewerId =
              detail.reviewers.length > 0 ? detail.reviewers[0].id : null;

            if (!reviewerId) {
              throw new Error(
                `Không tìm thấy reviewer_id cho code review ${codeReviewId}`,
              );
            }

            // Set reviewer status = author_review_status
            const reviewers: SubmitReviewResultReviewerDto[] = [
              {
                reviewerId: reviewerId,
                status: codeReviewDetail.authorReviewStatus,
              },
            ];

            // Lấy author_id từ code_review_detail, nếu không có thì lấy từ detail.authorId
            const authorId = codeReviewDetail.authorId ?? detail.authorId;

            return {
              checklistItemId: checklistItem.id,
              authorReviewStatus: codeReviewDetail.authorReviewStatus,
              reviewers,
              note: codeReviewDetail.note,
              authorId: authorId,
            };
          },
        );

        return {
          id: item.id,
          reviewResults: reviewResults,
        };
      });

    // Build code_review
    const codeReview: SubmitReviewCodeReviewDto = {
      id: codeReviewId,
      status: 1, // Pass checklist review
      reviewedAt: now,
    };

    return {
      codeReview: codeReview,
      codeReviewDetails: codeReviewDetails,
    };
  }
}
