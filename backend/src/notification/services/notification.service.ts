import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { TelegramNotificationService } from './telegram-notification.service';
import { NotificationPayload } from '../interfaces/notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly telegramNotificationService: TelegramNotificationService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Send notification based on channel
   * @param channel - Notification channel (telegram, email, etc.)
   * @param target - Target identifier (chat_id, email, etc.)
   * @param payload - Notification content
   */
  async send(
    channel: string,
    target: string,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!target) {
      this.logger.warn(
        `Notification target not specified for channel ${channel}. Skipping.`,
      );
      return;
    }

    try {
      switch (channel) {
        case 'telegram':
          await this.telegramNotificationService.sendNotification(
            target,
            payload,
          );
          break;
        case 'email':
          // TODO: Implement email notification
          this.logger.warn('Email notification not implemented yet');
          break;
        default:
          this.logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification via ${channel} to ${target}:`,
        error,
      );
      // Don't throw - we don't want notification failures to break the main flow
    }
  }

  /**
   * Send notification about invalid token
   */
  async sendInvalidTokenNotification(
    channel: string,
    target: string,
    system: string,
  ): Promise<void> {
    const config = this.configService.getConfig();
    await this.send(channel, target, {
      title: '⚠️ Token không còn hợp lệ',
      message: `Token ${system.toUpperCase()} của bạn không còn hợp lệ hoặc đã hết hạn.\n\nVui lòng đăng nhập lại để tiếp tục sử dụng tính năng kiểm tra tự động.`,
      actionUrl: `${config.appUrl}/login`,
    });
  }

  /**
   * Send notification about pending action
   */
  async sendPendingActionNotification(
    channel: string,
    target: string,
    actionType: string,
    actionCount: number,
    autoApproveMinutes: number,
    approveUrl: string,
  ): Promise<void> {
    const actionTypeLabel =
      actionType === 'auto-review-checklist'
        ? 'checklist cần duyệt'
        : 'đơn cần tạo';

    await this.send(channel, target, {
      title: '🔔 Có hành động chờ xác nhận',
      message: `Bạn có <b>${actionCount} ${actionTypeLabel}</b>.\n\nVui lòng xác nhận trong <b>${autoApproveMinutes} phút</b>, nếu không hệ thống sẽ tự động thực hiện.`,
      actionUrl: approveUrl,
    });
  }
}
