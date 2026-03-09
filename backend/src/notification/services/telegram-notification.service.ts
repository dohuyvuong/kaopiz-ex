import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import axios from 'axios';
import {
  INotificationService,
  NotificationPayload,
} from '../interfaces/notification.interface';

@Injectable()
export class TelegramNotificationService implements INotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);
  private readonly botToken: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: AppConfigService) {
    const config = this.configService.getConfig();
    this.botToken = config.telegramBotToken || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not configured. Telegram notifications will not work.',
      );
    }
  }

  /**
   * Send notification via Telegram
   * @param chatId - Telegram chat ID
   * @param payload - Notification content
   */
  async sendNotification(
    chatId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!this.botToken) {
      this.logger.warn(
        'Telegram bot token not configured. Skipping notification.',
      );
      return;
    }

    try {
      const message = this.formatMessage(payload);

      const body: Record<string, unknown> = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      };

      // Telegram không chấp nhận URL localhost trong nút inline → bỏ qua buttons nếu có localhost
      const hasLocalhostUrl =
        payload.inlineButtons?.some(
          (btn) =>
            btn.url.includes('localhost') ||
            btn.url.startsWith('http://127.0.0.1'),
        ) ?? false;

      if (
        payload.inlineButtons &&
        payload.inlineButtons.length > 0 &&
        !hasLocalhostUrl
      ) {
        body.reply_markup = JSON.stringify({
          inline_keyboard: [
            payload.inlineButtons.map((btn) => ({
              text: btn.text,
              url: btn.url,
            })),
          ],
        });
      } else if (hasLocalhostUrl) {
        this.logger.warn(
          'APP_URL đang là localhost. Telegram không hỗ trợ nút inline với URL localhost, đã bỏ qua nút Duyệt/Từ chối. Để dùng nút, cấu hình APP_URL là URL public (VD: https://your-app.example.com).',
        );
      }

      const response = await axios.post(`${this.apiUrl}/sendMessage`, body);

      if (response.data.ok) {
        this.logger.log(`Notification sent to Telegram chat ${chatId}`);
      } else {
        this.logger.error(
          `Failed to send Telegram notification: ${response.data.description}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending Telegram notification to chat ${chatId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Format notification payload into Telegram message
   */
  private formatMessage(payload: NotificationPayload): string {
    let message = `<b>${payload.title}</b>\n\n${payload.message}`;

    if (payload.actionUrl) {
      message += `\n\n<a href="${payload.actionUrl}">🔗 Xem chi tiết</a>`;
    }

    return message;
  }

  /**
   * Test notification (for debugging)
   */
  async testNotification(chatId: string): Promise<void> {
    await this.sendNotification(chatId, {
      title: '🧪 Test Notification',
      message: 'This is a test notification from ChecklistReview system.',
    });
  }
}
