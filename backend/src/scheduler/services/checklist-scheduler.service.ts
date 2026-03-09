import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemTokenService } from '../../auth/services/system-token.service';
import { ChecklistService } from '../../checklist/checklist.service';
import { NotificationService } from '../../notification/services/notification.service';
import { AppConfigService } from '../../config/config.service';
import { UserWithValidToken } from '../../auth/interfaces/automation-user.interface';
import {
  JobType,
  PendingActionStatus,
} from '../../automation/constants/automation.constants';

@Injectable()
export class ChecklistSchedulerService {
  private readonly logger = new Logger(ChecklistSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemTokenService: SystemTokenService,
    private readonly checklistService: ChecklistService,
    private readonly notificationService: NotificationService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Cron job: Tự động kiểm tra checklist cần duyệt
   * Chạy vào 9h sáng hàng ngày (có thể điều chỉnh)
   */
  @Cron('0 9 * * *') // 9:00 AM every day
  async handleAutoCheckChecklists() {
    this.logger.log('Running auto-check checklist cron job...');

    try {
      // Get users with automation enabled for auto-review-checklist
      const { usersWithValidToken, usersWithInvalidToken } =
        await this.systemTokenService.getUsersWithAutomationEnabled(
          JobType.AUTO_REVIEW_CHECKLIST,
        );

      this.logger.log(
        `Found ${usersWithValidToken.length} users with valid token and ${usersWithInvalidToken.length} users with invalid token`,
      );

      // Send notification to users with invalid token
      for (const userInfo of usersWithInvalidToken) {
        try {
          if (
            userInfo.setting.notificationChannel &&
            userInfo.setting.notificationTarget
          ) {
            await this.notificationService.sendInvalidTokenNotification(
              userInfo.setting.notificationChannel,
              userInfo.setting.notificationTarget,
              userInfo.system,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send invalid token notification to user ${userInfo.userId}:`,
            error,
          );
        }
      }

      // Process users with valid token
      for (const userInfo of usersWithValidToken) {
        try {
          await this.processUserChecklistReview(userInfo);
        } catch (error) {
          this.logger.error(
            `Failed to process checklist review for user ${userInfo.userId}:`,
            error,
          );
        }
      }

      this.logger.log('Auto-check checklist cron job completed');
    } catch (error) {
      this.logger.error('Error in auto-check checklist cron job:', error);
    }
  }

  /**
   * Process checklist review for a single user
   */
  private async processUserChecklistReview(userInfo: UserWithValidToken) {
    const { userId, token, setting } = userInfo;
    const params = setting.params as {
      maxReviews?: number;
      projectName?: string;
    };
    const maxReviews = params.maxReviews || 10;
    const projectName = params.projectName || '';

    this.logger.log(
      `Processing checklist review for user ${userId} (maxReviews: ${maxReviews}, projectName: ${projectName})`,
    );

    // Get pending checklists
    const response = await this.checklistService.getMyPendingReviews(token, {
      page: 1,
      perPage: maxReviews,
      projectName: projectName || undefined,
    });

    const checklists = response.data || [];

    if (checklists.length === 0) {
      this.logger.log(`No pending checklists for user ${userId}`);
      return;
    }

    this.logger.log(
      `Found ${checklists.length} pending checklists for user ${userId}`,
    );

    // Create PendingAction
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + setting.autoApproveAfterMinutes,
    );

    const pendingAction = await this.prisma.pendingAction.create({
      data: {
        userId,
        jobType: JobType.AUTO_REVIEW_CHECKLIST,
        payload: JSON.stringify({
          checklists: checklists.map((c) => ({
            id: c.id,
            projectId: c.projectId,
            description: c.description,
            status: c.status,
          })),
          maxReviews,
          projectName,
        }),
        status: PendingActionStatus.PENDING,
        expiresAt,
      },
    });

    this.logger.log(
      `Created pending action ${pendingAction.id} for user ${userId}`,
    );

    // Send notification (với nút Duyệt / Từ chối trên Telegram)
    const config = this.configService.getConfig();
    const approveUrl = `${config.appUrl}/automation/approve/${pendingAction.id}`;
    const rejectUrl = `${config.appUrl}/automation/reject/${pendingAction.id}`;

    await this.notificationService.sendPendingActionNotification(
      setting.notificationChannel,
      setting.notificationTarget,
      JobType.AUTO_REVIEW_CHECKLIST,
      checklists.length,
      setting.autoApproveAfterMinutes,
      approveUrl,
      rejectUrl,
    );

    this.logger.log(`Sent notification to user ${userId}`);
  }
}
