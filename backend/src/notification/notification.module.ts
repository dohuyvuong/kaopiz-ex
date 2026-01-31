import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { NotificationService } from './services/notification.service';
import { TelegramNotificationService } from './services/telegram-notification.service';

@Module({
  imports: [AppConfigModule],
  providers: [NotificationService, TelegramNotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
