import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { UpdateAutomationSettingDto } from './dto/automation-setting.dto';
import { ApproveActionDto, RejectActionDto } from './dto/approve-action.dto';
import { AppJwtGuard } from '../auth/guards/app-jwt.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('automation')
@UseGuards(AppJwtGuard)
export class AutomationController {
  private readonly logger = new Logger(AutomationController.name);

  constructor(private readonly automationService: AutomationService) {}

  /**
   * GET /api/automation/settings
   * Get all automation settings for current user
   */
  @Get('settings')
  async getAllSettings(@User('id') userId: number) {
    this.logger.log(`Getting all automation settings for user ${userId}`);
    return this.automationService.getAllSettings(userId);
  }

  /**
   * GET /api/automation/settings/:jobType
   * Get automation setting for a specific jobType
   */
  @Get('settings/:jobType')
  async getSetting(
    @User('id') userId: number,
    @Param('jobType') jobType: string,
  ) {
    this.logger.log(
      `Getting automation setting for user ${userId}, jobType ${jobType}`,
    );
    return this.automationService.getSetting(userId, jobType);
  }

  /**
   * PUT /api/automation/settings/:jobType
   * Update automation setting for a specific jobType
   */
  @Put('settings/:jobType')
  async updateSetting(
    @User('id') userId: number,
    @Param('jobType') jobType: string,
    @Body() dto: UpdateAutomationSettingDto,
  ) {
    this.logger.log(
      `Updating automation setting for user ${userId}, jobType ${jobType}`,
    );
    return this.automationService.updateSetting(userId, jobType, dto);
  }

  /**
   * GET /api/automation/pending-actions
   * Get pending actions for current user (status = pending only)
   */
  @Get('pending-actions')
  async getPendingActions(@User('id') userId: number) {
    this.logger.log(`Getting pending actions for user ${userId}`);
    return this.automationService.getPendingActions(userId);
  }

  /**
   * GET /api/automation/actions
   * Get all actions for current user (all statuses)
   */
  @Get('actions')
  async getAllActions(@User('id') userId: number) {
    this.logger.log(`Getting all actions for user ${userId}`);
    return this.automationService.getAllActions(userId);
  }

  /**
   * POST /api/automation/approve
   * Approve a pending action
   */
  @Post('approve')
  async approvePendingAction(
    @User('id') userId: number,
    @Body() dto: ApproveActionDto,
  ) {
    this.logger.log(`User ${userId} approving action ${dto.actionId}`);
    return this.automationService.approvePendingAction(userId, dto.actionId);
  }

  /**
   * POST /api/automation/reject
   * Reject a pending action
   */
  @Post('reject')
  async rejectPendingAction(
    @User('id') userId: number,
    @Body() dto: RejectActionDto,
  ) {
    this.logger.log(`User ${userId} rejecting action ${dto.actionId}`);
    return this.automationService.rejectPendingAction(userId, dto.actionId);
  }
}
