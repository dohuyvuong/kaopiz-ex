import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { AuthenticatedRequest } from '../../common/types/request.types';

/**
 * Simple JWT Guard - Only verifies App JWT without resolving system token
 * Use this for internal routes that don't need to call external APIs (Ksystem/HRM)
 */
@Injectable()
export class AppJwtGuard implements CanActivate {
  private readonly logger = new Logger(AppJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('No authorization header or invalid format');
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    const appToken = authHeader.substring(7); // Remove 'Bearer '

    try {
      // Verify App JWT using config service
      const config = this.configService.getConfig();
      const payload = this.jwtService.verify(appToken, {
        secret: config.jwtSecret,
      });

      // Attach user info to request (no token, no system)
      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      this.logger.error('JWT verification failed:', error.message);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
