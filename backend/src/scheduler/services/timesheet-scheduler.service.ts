import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemTokenService } from '../../auth/services/system-token.service';
import { TimesheetService } from '../../timesheet/timesheet.service';
import { NotificationService } from '../../notification/services/notification.service';
import { AppConfigService } from '../../config/config.service';
import { UserWithValidToken } from '../../auth/interfaces/automation-user.interface';
import {
  JobType,
  PendingActionStatus,
} from '../../automation/constants/automation.constants';
import { TimesheetDayDto } from '../../timesheet/dto/timesheet-calendar.dto';
import dayjs from 'dayjs';

interface AutoCreateDayCandidate {
  date: string;
  data: TimesheetDayDto;
}

@Injectable()
export class TimesheetSchedulerService {
  private readonly logger = new Logger(TimesheetSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemTokenService: SystemTokenService,
    private readonly timesheetService: TimesheetService,
    private readonly notificationService: NotificationService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Cron job: Tự động kiểm tra timesheet và tạo đơn
   * Chạy vào 10h sáng hàng ngày (có thể điều chỉnh)
   */
  @Cron('0 10 * * *') // 10:00 AM every day
  async handleAutoCreateForms() {
    this.logger.log('Running auto-create forms cron job...');

    try {
      // Get users with automation enabled for auto-create-forms
      const { usersWithValidToken, usersWithInvalidToken } =
        await this.systemTokenService.getUsersWithAutomationEnabled(
          JobType.AUTO_CREATE_FORMS,
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
          await this.processUserFormCreation(userInfo);
        } catch (error) {
          this.logger.error(
            `Failed to process form creation for user ${userInfo.userId}:`,
            error,
          );
        }
      }

      this.logger.log('Auto-create forms cron job completed');
    } catch (error) {
      this.logger.error('Error in auto-create forms cron job:', error);
    }
  }

  /**
   * Process form creation for a single user
   */
  private async processUserFormCreation(userInfo: UserWithValidToken) {
    const { userId, token, setting } = userInfo;
    const params = setting.params as { lookbackDays?: number };
    const lookbackDays = params.lookbackDays || 7;

    this.logger.log(
      `Processing form creation for user ${userId} (lookbackDays: ${lookbackDays})`,
    );

    // Calculate months to check (current month and previous month if lookbackDays > 7)
    // HRM API month_year format: "MM-YYYY" (ví dụ: "01-2026", "10-2025")
    const today = dayjs();
    const monthsToCheck = new Set<string>();
    monthsToCheck.add(today.format('MM-YYYY')); // Current month

    // If lookbackDays goes into previous month, add it
    const oldestDate = today.subtract(lookbackDays, 'day');
    if (oldestDate.month() !== today.month()) {
      monthsToCheck.add(oldestDate.format('MM-YYYY'));
    }

    // Get timesheet data for all months
    const allDaysNeedingForms: AutoCreateDayCandidate[] = [];
    for (const monthYear of monthsToCheck) {
      try {
        const calendar = await this.timesheetService.getCalendar(
          token,
          monthYear,
        );

        // Find days that need forms (missing hours, etc.)
        for (const [dateStr, dayData] of Object.entries(calendar)) {
          // Check if date is within lookback range
          const dayDate = dayjs(dateStr);
          const daysAgo = today.diff(dayDate, 'day');

          if (daysAgo > 0 && daysAgo <= lookbackDays) {
            if (this.isDayNeedingForm(dayData)) {
              allDaysNeedingForms.push({
                date: dateStr,
                data: dayData,
              });
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to get calendar for ${monthYear}:`, error);
      }
    }

    if (allDaysNeedingForms.length === 0) {
      this.logger.log(`No days needing forms for user ${userId}`);
      return;
    }

    this.logger.log(
      `Found ${allDaysNeedingForms.length} days needing forms for user ${userId}`,
    );

    // Create PendingAction
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + setting.autoApproveAfterMinutes,
    );

    const pendingAction = await this.prisma.pendingAction.create({
      data: {
        userId,
        jobType: JobType.AUTO_CREATE_FORMS,
        payload: JSON.stringify({
          days: allDaysNeedingForms,
          lookbackDays,
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
      JobType.AUTO_CREATE_FORMS,
      allDaysNeedingForms.length,
      setting.autoApproveAfterMinutes,
      approveUrl,
      rejectUrl,
      this.buildAutoCreateFormsDetail(allDaysNeedingForms),
    );

    this.logger.log(`Sent notification to user ${userId}`);
  }

  /**
   * Check if a day needs a form
   * (Simple logic - can be enhanced based on business rules)
   */
  private isDayNeedingForm(dayData: TimesheetDayDto): boolean {
    // Skip weekends (workDays = 0 for weekends)
    if (!dayData.workDays || dayData.workDays === 0) {
      return false;
    }

    // If already has approved application forms, no need for new form
    if (
      dayData.approvedApplicationForms &&
      dayData.approvedApplicationForms.length > 0
    ) {
      return false;
    }

    // Check if day has issues: late, early, or insufficient hours
    const hasIssues =
      dayData.minutesLate > 0 ||
      dayData.minutesEarly > 0 ||
      (dayData.workHours < 8 && dayData.workHours > 0); // Less than 8 hours but worked

    return hasIssues;
  }

  /**
   * Build notification details for auto-create forms.
   * Show a compact list of days and basic issue summary.
   */
  private buildAutoCreateFormsDetail(days: AutoCreateDayCandidate[]): string {
    const maxLines = 8;
    const detailLines = days.slice(0, maxLines).map(({ date, data }) => {
      const basicIssues: string[] = [];

      if (data.minutesLate > 0) {
        basicIssues.push(`đi muộn ${data.minutesLate}p`);
      }
      if (data.minutesEarly > 0) {
        basicIssues.push(`về sớm ${data.minutesEarly}p`);
      }
      if (data.workHours > 0 && data.workHours < 8) {
        basicIssues.push(`làm ${data.workHours}h`);
      }

      const issueSummary =
        basicIssues.length > 0 ? basicIssues.join(', ') : 'cần tạo đơn';
      return `• ${dayjs(date).format('DD/MM/YYYY')}: ${issueSummary}`;
    });

    const remainingCount = days.length - maxLines;
    if (remainingCount > 0) {
      detailLines.push(`• ...và ${remainingCount} ngày khác`);
    }

    return `<b>Danh sách đơn cần tạo:</b>\n${detailLines.join('\n')}`;
  }
}
