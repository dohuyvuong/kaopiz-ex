import { SystemName } from '../../common/types/system.types';
import {
  NotificationChannel,
  JobType,
} from '../../automation/constants/automation.constants';
import { AutomationParams } from '../../automation/interfaces/automation-params.interface';

/**
 * User automation setting structure
 */
export interface UserAutomationSetting {
  id: number;
  jobType: JobType;
  params: AutomationParams;
  notificationChannel: NotificationChannel;
  notificationTarget: string;
  autoApproveAfterMinutes: number;
}

/**
 * User info with valid token for automation
 */
export interface UserWithValidToken {
  userId: number;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  setting: UserAutomationSetting;
  token: string;
  system: SystemName;
}

/**
 * User info with invalid token (for notification)
 */
export interface UserWithInvalidToken {
  userId: number;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  setting: {
    id: number;
    jobType: JobType;
    notificationChannel: NotificationChannel;
    notificationTarget: string;
  };
  system: SystemName;
}
