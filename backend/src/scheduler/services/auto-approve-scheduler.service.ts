import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AutomationService } from '../../automation/automation.service';

@Injectable()
export class AutoApproveSchedulerService {
  private readonly logger = new Logger(AutoApproveSchedulerService.name);

  constructor(private readonly automationService: AutomationService) {}

  /**
   * Cron job: Tự động duyệt các pending action đã hết hạn
   * Chạy mỗi 5 phút
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAutoApproveExpiredActions() {
    this.logger.log('Running auto-approve cron job for expired actions...');

    try {
      const expiredActions =
        await this.automationService.findExpiredPendingActions();

      if (expiredActions.length === 0) {
        this.logger.log('No expired actions to auto-approve');
        return;
      }

      this.logger.log(
        `Found ${expiredActions.length} expired actions to auto-approve`,
      );

      // Process each expired action
      for (const action of expiredActions) {
        try {
          await this.automationService.autoApproveExpiredAction(action.id);
        } catch (error) {
          this.logger.error(
            `Failed to auto-approve action ${action.id}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Auto-approve cron job completed. Processed ${expiredActions.length} actions.`,
      );
    } catch (error) {
      this.logger.error('Error in auto-approve cron job:', error);
    }
  }
}
