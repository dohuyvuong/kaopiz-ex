import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { BaseKaopizService } from '../../api/services/base-kaopiz.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly baseKaopizService: BaseKaopizService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('Request thiếu Authorization header');
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

    const token = parts[1];
    if (!token || token.trim().length === 0) {
      this.logger.warn('Token không tồn tại trong Authorization header');
      throw new UnauthorizedException('Token không tồn tại');
    }

    // Validate JWT format cơ bản (có 3 parts)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      this.logger.warn('Token không đúng định dạng JWT');
      throw new UnauthorizedException('Token không đúng định dạng JWT');
    }

    // Validate token bằng cách gọi API Kaopiz
    try {
      await this.baseKaopizService.validateToken(token);
      this.logger.log('Token đã được validate thành công');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Token validation failed: ${errorMessage}`);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Lưu token vào request để sử dụng sau
    request.token = token;

    return true;
  }
}
