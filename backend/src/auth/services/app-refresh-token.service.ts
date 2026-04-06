import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppRefreshToken } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AppRefreshTokenService {
  private readonly logger = new Logger(AppRefreshTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a new refresh token for a user
   */
  async create(
    userId: number,
    expiresInDays: number = 30,
  ): Promise<AppRefreshToken> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = await this.prisma.appRefreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    this.logger.log(`Created refresh token for user ${userId}`);
    return refreshToken;
  }

  /**
   * Verify a refresh token and return the user ID if valid
   */
  async verify(token: string): Promise<number | null> {
    const refreshToken = await this.prisma.appRefreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      this.logger.warn('Refresh token not found');
      return null;
    }

    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      this.logger.warn('Refresh token expired');
      // Delete expired token
      await this.revoke(token);
      return null;
    }

    return refreshToken.userId;
  }

  /**
   * Revoke (delete) a refresh token
   */
  async revoke(token: string): Promise<void> {
    try {
      await this.prisma.appRefreshToken.delete({
        where: { token },
      });
      this.logger.log('Refresh token revoked');
    } catch {
      // Token might not exist, that's okay
      this.logger.warn('Failed to revoke refresh token (might not exist)');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllForUser(userId: number): Promise<void> {
    await this.prisma.appRefreshToken.deleteMany({
      where: { userId },
    });
    this.logger.log(`Revoked all refresh tokens for user ${userId}`);
  }

  /**
   * Rotate refresh token: create new one and revoke old one
   */
  async rotate(
    oldToken: string,
    expiresInDays: number = 30,
  ): Promise<AppRefreshToken | null> {
    const userId = await this.verify(oldToken);
    if (!userId) {
      return null;
    }

    // Create new token
    const newRefreshToken = await this.create(userId, expiresInDays);

    // Revoke old token
    await this.revoke(oldToken);

    this.logger.log(`Rotated refresh token for user ${userId}`);
    return newRefreshToken;
  }
}
