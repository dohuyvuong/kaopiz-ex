import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemToken } from '@prisma/client';
import { SystemName } from '../../common/types/system.types';

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
}
