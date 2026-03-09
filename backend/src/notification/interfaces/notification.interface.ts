export interface InlineButton {
  text: string;
  url: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  actionUrl?: string;
  /** Inline buttons (e.g. Approve / Reject). Rendered as URL buttons in Telegram. */
  inlineButtons?: InlineButton[];
  metadata?: Record<string, unknown>;
}

export interface INotificationService {
  /**
   * Send notification to a target
   * @param target - Target identifier (e.g., chat_id for Telegram, email for Email)
   * @param payload - Notification content
   */
  sendNotification(target: string, payload: NotificationPayload): Promise<void>;
}
