import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';

export interface AppTokenPayload {
  sub: number; // userId
  email: string;
}

export interface AppTokenResponse {
  appToken: string;
  expiresIn: number; // seconds
}

@Injectable()
export class AppJwtService {
  private readonly logger = new Logger(AppJwtService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Sign an app JWT token
   */
  async sign(userId: number, email: string): Promise<AppTokenResponse> {
    const payload: AppTokenPayload = {
      sub: userId,
      email,
    };

    // Get JWT config from env (with defaults)
    const secret =
      process.env.JWT_SECRET ||
      this.configService.getConfig().jwtSecret ||
      'default-secret-change-in-production';
    const expiresInStr = process.env.JWT_EXPIRES_IN || '1h'; // 1 hour default

    const appToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInStr as any,
    });

    // Calculate expiresIn in seconds
    const expiresInSeconds = this.parseExpiresIn(expiresInStr);

    this.logger.log(`Signed app JWT for user ${userId}`);

    return {
      appToken,
      expiresIn: expiresInSeconds,
    };
  }

  /**
   * Verify an app JWT token
   */
  async verify(token: string): Promise<AppTokenPayload | null> {
    try {
      const secret =
        process.env.JWT_SECRET ||
        this.configService.getConfig().jwtSecret ||
        'default-secret-change-in-production';

      const payload = await this.jwtService.verifyAsync<AppTokenPayload>(
        token,
        {
          secret,
        },
      );

      return payload;
    } catch (error) {
      this.logger.warn(`Failed to verify app JWT: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse expiresIn string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    // Simple parser for common formats like '1h', '15m', '7d', '30d'
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default 1 hour
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}
