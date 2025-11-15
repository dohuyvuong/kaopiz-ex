import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChecklistAutoReviewService } from './checklist-auto-review.service';
import { ChecklistService } from './checklist.service';
import { AutoReviewQueryDto } from './dto/auto-review.dto';
import { GetPendingReviewsQueryDto } from './dto/get-pending-reviews.dto';
import { Auth } from '../auth/decorators';

@Controller('checklist')
@Auth('ksystem')
export class ChecklistController {
  constructor(
    private readonly autoReviewService: ChecklistAutoReviewService,
    private readonly checklistService: ChecklistService,
  ) {}

  /**
   * POST /checklist/auto-review?maxReviews=10&projectName=DECAL_16
   * Tự động review tất cả các checklist đang chờ review
   * Yêu cầu: Authorization header với Bearer token
   */
  @Post('auto-review')
  async autoReviewAll(@Query() query: AutoReviewQueryDto) {
    const result = await this.autoReviewService.autoReviewAll(
      query.maxReviews,
      query.projectName,
    );
    return {
      success: true,
      message: 'Đã hoàn thành tự động review',
      data: result,
    };
  }

  /**
   * POST /checklist/auto-review/:id
   * Tự động review một code review cụ thể
   */
  @Post('auto-review/:id')
  async autoReviewSingle(@Param('id', ParseIntPipe) id: number) {
    const success = await this.autoReviewService.autoReviewSingle(id);
    return {
      success,
      message: success ? 'Đã review thành công' : 'Review không thành công',
      data: {
        codeReviewId: id,
      },
    };
  }

  /**
   * GET /checklist/pending-reviews
   * Lấy danh sách code reviews đang chờ tôi review
   * Yêu cầu: Authorization header với Bearer token
   */
  @Get('pending-reviews')
  async getPendingReviews(@Query() query: GetPendingReviewsQueryDto) {
    const result = await this.checklistService.getMyPendingReviews({
      sort: query.sort,
      page: query.page,
      perPage: query.perPage,
      projectName: query.projectName,
      authorEmail: query.authorEmail,
    });
    return {
      success: true,
      data: result,
    };
  }
}
