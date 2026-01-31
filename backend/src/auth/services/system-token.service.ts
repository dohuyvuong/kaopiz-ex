import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemToken } from '@prisma/client';
import { SystemName } from '../../common/types/system.types';
import {
  UserWithValidToken,
  UserWithInvalidToken,
} from '../interfaces/automation-user.interface';
import {
  JobType,
  NotificationChannel,
} from '../../automation/constants/automation.constants';

export interface UpsertSystemTokenData {
  token: string;
  expiresAt?: Date | null;
  userInfo?: object | null;
}

@Injectable()
export class SystemTokenService {
  private readonly logger = new Logger(SystemTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert system token for a user
   */
  async upsert(
    userId: number,
    system: SystemName,
    data: UpsertSystemTokenData,
  ): Promise<SystemToken> {
    this.logger.log(
      `Upserting system token for user ${userId}, system ${system}`,
    );

    const systemToken = await this.prisma.systemToken.upsert({
      where: {
        userId_system: {
          userId,
          system,
        },
      },
      create: {
        userId,
        system,
        token: data.token,
        expiresAt: data.expiresAt,
        userInfo: data.userInfo ? JSON.stringify(data.userInfo) : null,
      },
      update: {
        token: data.token,
        expiresAt: data.expiresAt,
        userInfo: data.userInfo ? JSON.stringify(data.userInfo) : null,
      },
    });

    this.logger.log(`System token upserted: ${systemToken.id}`);
    return systemToken;
  }

  /**
   * Get system token for a user
   */
  async getToken(userId: number, system: SystemName): Promise<string | null> {
    const systemToken = await this.prisma.systemToken.findUnique({
      where: {
        userId_system: {
          userId,
          system,
        },
      },
    });

    if (!systemToken) {
      this.logger.warn(
        `No system token found for user ${userId}, system ${system}`,
      );
      return null;
    }

    // Check if token is expired
    if (systemToken.expiresAt && systemToken.expiresAt < new Date()) {
      this.logger.warn(
        `System token expired for user ${userId}, system ${system}`,
      );
      return null;
    }

    return systemToken.token;
  }

  /**
   * Get system token record with metadata
   */
  async getSystemToken(
    userId: number,
    system: SystemName,
  ): Promise<SystemToken | null> {
    return this.prisma.systemToken.findUnique({
      where: {
        userId_system: {
          userId,
          system,
        },
      },
    });
  }

  /**
   * Get all systems that a user has tokens for
   */
  async getUserSystems(userId: number): Promise<SystemName[]> {
    const tokens = await this.prisma.systemToken.findMany({
      where: { userId },
      select: { system: true },
    });

    return tokens.map((t) => t.system as SystemName);
  }

  /**
   * Delete system token
   */
  async deleteToken(userId: number, system: SystemName): Promise<void> {
    await this.prisma.systemToken.delete({
      where: {
        userId_system: {
          userId,
          system,
        },
      },
    });

    this.logger.log(
      `Deleted system token for user ${userId}, system ${system}`,
    );
  }

  /**
   * Get users with automation enabled for a specific job type
   * Returns users with valid tokens and users with invalid tokens (for notification)
   */
  async getUsersWithAutomationEnabled(jobType: string): Promise<{
    usersWithValidToken: UserWithValidToken[];
    usersWithInvalidToken: UserWithInvalidToken[];
  }> {
    // Determine system based on jobType
    const system: SystemName =
      jobType === 'auto-review-checklist' ? 'ksystem' : 'hrm';

    // Get all users with automation enabled for this jobType
    const settings = await this.prisma.userAutomationSetting.findMany({
      where: {
        jobType,
        enabled: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const usersWithValidToken: UserWithValidToken[] = [];
    const usersWithInvalidToken: UserWithInvalidToken[] = [];

    for (const setting of settings) {
      // Get token for this user
      const token = await this.getToken(setting.userId, system);

      if (token) {
        // Valid token
        usersWithValidToken.push({
          userId: setting.userId,
          user: setting.user,
          setting: {
            id: setting.id,
            jobType: setting.jobType as JobType,
            params: setting.params ? JSON.parse(setting.params) : {},
            notificationChannel:
              setting.notificationChannel as NotificationChannel,
            notificationTarget: setting.notificationTarget!,
            autoApproveAfterMinutes: setting.autoApproveAfterMinutes!,
          },
          token,
          system,
        });
      } else {
        // Invalid or missing token
        usersWithInvalidToken.push({
          userId: setting.userId,
          user: setting.user,
          setting: {
            id: setting.id,
            jobType: setting.jobType as JobType,
            notificationChannel:
              setting.notificationChannel as NotificationChannel,
            notificationTarget: setting.notificationTarget!,
          },
          system,
        });
      }
    }

    this.logger.log(
      `Found ${usersWithValidToken.length} users with valid token and ${usersWithInvalidToken.length} users with invalid token for jobType: ${jobType}`,
    );

    return { usersWithValidToken, usersWithInvalidToken };
  }
}
