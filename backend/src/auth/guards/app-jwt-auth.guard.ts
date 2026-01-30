import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppJwtService } from '../services/app-jwt.service';
import { SystemTokenService } from '../services/system-token.service';
import { SystemName } from '../../common/types/system.types';
import { AUTH_SYSTEM_KEY } from '../decorators/auth.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';

/**
 * Guard to validate App JWT and resolve system token
 */
@Injectable()
export class AppJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(AppJwtAuthGuard.name);

  constructor(
    private readonly appJwtService: AppJwtService,
    private readonly systemTokenService: SystemTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Get system from decorator (check both method and class level)
    const system =
      this.reflector.get<SystemName>(AUTH_SYSTEM_KEY, context.getHandler()) ||
      this.reflector.get<SystemName>(AUTH_SYSTEM_KEY, context.getClass());

    if (!system) {
      this.logger.error(
        'System not specified. Please use @Auth(system) decorator to specify system.',
      );
      throw new InternalServerErrorException(
        'System not specified. Please use @Auth(system) decorator to specify system.',
      );
    }

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Request missing Authorization header');
      throw new UnauthorizedException('Authorization header không tồn tại');
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn('Authorization header không đúng format');
      throw new UnauthorizedException(
        'Authorization header không đúng format. Cần: Bearer <token>',
      );
    }

    const appToken = parts[1];
    if (!appToken || appToken.trim().length === 0) {
      this.logger.warn('Token không tồn tại trong Authorization header');
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // Verify app JWT
    const payload = await this.appJwtService.verify(appToken);
    if (!payload) {
      this.logger.warn('App JWT verification failed');
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = payload.sub;
    const email = payload.email;

    this.logger.log(
      `App JWT verified for user ${userId} (${email}), system: ${system}`,
    );

    // Get system token from DB
    const systemToken = await this.systemTokenService.getToken(userId, system);

    if (!systemToken) {
      this.logger.warn(
        `No system token found for user ${userId}, system ${system}`,
      );
      throw new UnauthorizedException(`Chưa đăng nhập hệ thống ${system}`);
    }

    // Attach user and token to request (now type-safe)
    request.user = {
      id: userId,
      email,
    };
    request.token = systemToken;
    request.system = system;

    return true;
  }
}
