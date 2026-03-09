import { Controller, Get, Post, Put, Body, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApproverPreferenceService } from './approver-preference.service';
import { CreateApplicationFormDto } from './dto/create-application-form.dto';
import { SaveApproverPreferencesDto } from './dto/approver-preferences.dto';
import { Auth } from '../auth/decorators';
import { Token } from '../auth/decorators/token.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('application')
@Auth('hrm')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly approverPreferenceService: ApproverPreferenceService,
  ) {}

  /**
   * GET /application/types
   * Lấy danh sách loại đơn
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Get('types')
  async getFormTypes(@Token() token: string) {
    const data = await this.applicationService.getFormTypes(token);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /application/reasons?typeId=1
   * Lấy danh sách lý do
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Get('reasons')
  async getReasons(@Token() token: string, @Query('typeId') typeId?: string) {
    const typeIdNumber = typeId ? Number(typeId) : undefined;
    const data = await this.applicationService.getReasons(token, typeIdNumber);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /application/approval-assignments?typeId=1&order=1&userId=861
   * Lấy danh sách người duyệt
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Get('approval-assignments')
  async getApprovalAssignments(
    @Token() token: string,
    @Query('typeId') typeId: string,
    @Query('order') order: string,
    @Query('userId') userId?: string,
  ) {
    const typeIdNumber = Number(typeId);
    const orderNumber = Number(order);
    const userIdNumber = userId ? Number(userId) : undefined;
    const data = await this.applicationService.getApprovalAssignments(
      token,
      typeIdNumber,
      orderNumber,
      userIdNumber,
    );
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /application/approver-preferences
   * Lấy cấu hình người duyệt mặc định của user
   * Response: { preferences: [{ typeId, order, approverUserId }, ...] }
   */
  @Get('approver-preferences')
  async getApproverPreferences(@User('id') userId: number) {
    const preferences = await this.approverPreferenceService.getAll(userId);
    return {
      success: true,
      data: { preferences },
    };
  }

  /**
   * PUT /application/approver-preferences
   * Lưu cấu hình người duyệt mặc định
   * Body: { preferences: [{ typeId, order, approverUserId }, ...] }
   */
  @Put('approver-preferences')
  async saveApproverPreferences(
    @User('id') userId: number,
    @Body() dto: SaveApproverPreferencesDto,
  ) {
    const preferences = dto.preferences ?? [];
    const data = await this.approverPreferenceService.saveAll(
      userId,
      preferences,
    );
    return {
      success: true,
      data: { preferences: data },
    };
  }

  /**
   * POST /application/forms
   * Tạo đơn từ (application form)
   * Yêu cầu: Authorization header với Bearer token (HRM token)
   */
  @Post('forms')
  async createApplicationForm(
    @Body() body: CreateApplicationFormDto,
    @Token() token: string,
  ) {
    const data = await this.applicationService.createApplicationForm(
      token,
      body,
    );
    return {
      success: true,
      data,
    };
  }
}
