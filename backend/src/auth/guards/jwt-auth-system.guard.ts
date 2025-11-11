import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { SystemName, SYSTEMS } from '../../common/types/system.types';
import { KsystemService } from '../../api/services/ksystem.service';
import { HRMService } from '../../api/services/hrm.service';
import { SYSTEM_KEY } from '../decorators/system.decorator';

/**
 * Guard để validate token cho một hệ thống cụ thể
 * Sử dụng decorator @System() để chỉ định system
 */
@Injectable()
export class JwtAuthSystemGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthSystemGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly ksystemService: KsystemService,
    private readonly hrmService: HRMService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    // Lấy system từ metadata (decorator) hoặc default là 'ksystem'
    const system: SystemName =
      this.reflector.get<SystemName>(SYSTEM_KEY, context.getHandler()) ||
      SYSTEMS.KSYSTEM.name;

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

    // Validate token bằng cách gọi API của hệ thống tương ứng
    try {
      if (system === SYSTEMS.KSYSTEM.name) {
        await this.ksystemService.validateToken(token);
      } else if (system === SYSTEMS.HRM.name) {
        await this.hrmService.validateToken(token);
      } else {
        throw new UnauthorizedException(
          `Hệ thống '${system}' không được hỗ trợ`,
        );
      }
      const systemInfo =
        system === SYSTEMS.KSYSTEM.name ? SYSTEMS.KSYSTEM : SYSTEMS.HRM;
      this.logger.log(
        `Token đã được validate thành công cho hệ thống: ${systemInfo.displayName}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Token validation failed cho ${system}: ${errorMessage}`,
      );
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Lưu token và system vào request để sử dụng sau
    request.token = token;
    request.system = system;

    return true;
  }
}
