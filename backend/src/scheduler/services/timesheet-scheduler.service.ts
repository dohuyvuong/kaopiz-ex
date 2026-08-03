import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SuggestedForm, suggestForms } from '@kaopiz/timesheet';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemTokenService } from '../../auth/services/system-token.service';
import { TimesheetSnapshotService } from '../../timesheet/timesheet-snapshot.service';
import { NotificationService } from '../../notification/services/notification.service';
import { AppConfigService } from '../../config/config.service';
import { UserWithValidToken } from '../../auth/interfaces/automation-user.interface';
import {
  JobType,
  PendingActionStatus,
} from '../../automation/constants/automation.constants';
import { FormCreationPayload } from '../../automation/interfaces/pending-action-payload.interface';

/**
 * Cron đề xuất đơn cần tạo để tổng đi muộn / về sớm của tháng không vượt hạn mức.
 *
 * Dùng đúng hàm `suggestForms` mà nút "Tự động tạo đơn" trên giao diện dùng
 * (package `@kaopiz/timesheet`), nên hai nơi luôn đề xuất giống nhau.
 */
@Injectable()
export class TimesheetSchedulerService {
  private readonly logger = new Logger(TimesheetSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemTokenService: SystemTokenService,
    private readonly snapshotService: TimesheetSnapshotService,
    private readonly notificationService: NotificationService,
    private readonly configService: AppConfigService,
  ) {}

  @Cron('0 10 * * *') // 10:00 hàng ngày
  async handleAutoCreateForms() {
    this.logger.log('Running auto-create forms cron job...');

    try {
      const { usersWithValidToken, usersWithInvalidToken } =
        await this.systemTokenService.getUsersWithAutomationEnabled(
          JobType.AUTO_CREATE_FORMS,
        );

      this.logger.log(
        `Found ${usersWithValidToken.length} users with valid token and ${usersWithInvalidToken.length} users with invalid token`,
      );

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

      for (const userInfo of usersWithValidToken) {
        try {
          await this.processUser(userInfo);
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

  private async processUser(userInfo: UserWithValidToken) {
    const { userId, token } = userInfo;

    const today = new Date();
    const todayKey = toDateKey(today);

    // Vi phạm được tính theo THÁNG nên phải xét trọn tháng, không phải N ngày
    // gần đây. Đầu tháng thì tháng trước vẫn còn trong hạn nộp đơn nên xét cả hai.
    const monthsToCheck = new Set<string>([toMonthYear(today)]);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    if (today.getDate() <= 10) monthsToCheck.add(toMonthYear(lastMonth));

    for (const monthYear of monthsToCheck) {
      try {
        const snapshot = await this.snapshotService.build(token, monthYear);
        const suggestion = suggestForms({
          days: snapshot.days,
          rules: snapshot.rules,
          actualTotal: snapshot.actualTotal,
          today: todayKey,
        });

        if (suggestion.forms.length === 0) {
          this.logger.log(
            `User ${userId} tháng ${monthYear}: không cần tạo đơn ` +
              `(tổng ${suggestion.currentTotal}/${suggestion.allowedTotal} phút)`,
          );
          continue;
        }

        await this.createPendingAction(userInfo, monthYear, suggestion);
      } catch (error) {
        this.logger.error(
          `Failed to build suggestions for user ${userId}, month ${monthYear}:`,
          error,
        );
      }
    }
  }

  private async createPendingAction(
    userInfo: UserWithValidToken,
    monthYear: string,
    suggestion: { forms: SuggestedForm[]; coveredMinutes: number },
  ) {
    const { userId, setting } = userInfo;

    // Đã có đề xuất chờ xử lý cho tháng này thì không gửi lại — cron chạy hằng
    // ngày, không chặn thì mỗi ngày một thông báo trùng.
    const existing = await this.prisma.pendingAction.findFirst({
      where: {
        userId,
        jobType: JobType.AUTO_CREATE_FORMS,
        status: PendingActionStatus.PENDING,
      },
    });
    if (existing) {
      this.logger.log(
        `User ${userId} đã có pending action ${existing.id}, bỏ qua tháng ${monthYear}`,
      );
      return;
    }

    const payload: FormCreationPayload = {
      forms: suggestion.forms,
      monthYear,
      coveredMinutes: suggestion.coveredMinutes,
    };

    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + setting.autoApproveAfterMinutes,
    );

    const pendingAction = await this.prisma.pendingAction.create({
      data: {
        userId,
        jobType: JobType.AUTO_CREATE_FORMS,
        payload: JSON.stringify(payload),
        status: PendingActionStatus.PENDING,
        expiresAt,
      },
    });

    this.logger.log(
      `Created pending action ${pendingAction.id} for user ${userId} ` +
        `(${suggestion.forms.length} đơn, ${suggestion.coveredMinutes} phút)`,
    );

    const config = this.configService.getConfig();
    await this.notificationService.sendPendingActionNotification(
      setting.notificationChannel,
      setting.notificationTarget,
      JobType.AUTO_CREATE_FORMS,
      suggestion.forms.length,
      setting.autoApproveAfterMinutes,
      `${config.appUrl}/automation/approve/${pendingAction.id}`,
      `${config.appUrl}/automation/reject/${pendingAction.id}`,
      buildDetail(monthYear, suggestion.forms),
    );
  }
}

/** "YYYY-MM-DD" theo giờ địa phương của server. */
function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** "MM-YYYY" — định dạng HRM dùng cho tham số tháng. */
function toMonthYear(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function buildDetail(monthYear: string, forms: SuggestedForm[]): string {
  const MAX_LINES = 8;
  const lines = forms.slice(0, MAX_LINES).map((form) => {
    const kind = form.usesAnnualLeave ? 'nghỉ phép' : 'vắng mặt';
    const covers = form.covers === 'late' ? 'đi muộn' : 'về sớm';
    return `• ${form.date}: ${kind} ${form.timeStart}–${form.timeEnd} (${form.minutes}p, che ${covers})`;
  });

  const remaining = forms.length - MAX_LINES;
  if (remaining > 0) lines.push(`• ...và ${remaining} đơn khác`);

  const annualLeave = forms
    .filter((form) => form.usesAnnualLeave)
    .reduce((sum, form) => sum + form.minutes, 0);
  if (annualLeave > 0) {
    lines.push(`\n<i>Trong đó ${annualLeave} phút dùng phép năm.</i>`);
  }

  return `<b>Đơn đề xuất cho tháng ${monthYear}:</b>\n${lines.join('\n')}`;
}
