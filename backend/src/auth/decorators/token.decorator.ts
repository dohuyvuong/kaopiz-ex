import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';

/**
 * Decorator để extract JWT token từ request
 * Token đã được validate và lưu vào request bởi JwtAuthGuard
 *
 * Sử dụng trong controller:
 * @Get()
 * async someMethod(@Token() token: string) {
 *   // token đã được validate bởi Guard
 * }
 *
 * Lưu ý: Decorator này chỉ hoạt động khi request đã đi qua JwtAuthGuard
 */
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    // Lấy token từ request (đã được Guard validate và lưu)
    // TypeScript sẽ tự động biết request.token tồn tại
    return request.token;
  },
);
