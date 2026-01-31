import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';

/**
 * Decorator để extract user information từ request
 * User đã được validate và lưu vào request bởi AppJwtAuthGuard
 *
 * Sử dụng trong controller:
 * @Get()
 * async someMethod(@User() user: { id: number; email: string }) {
 *   // user đã được validate bởi Guard
 * }
 *
 * Hoặc extract một property cụ thể:
 * @Get()
 * async someMethod(@User('id') userId: number) {
 *   // userId đã được validate bởi Guard
 * }
 *
 * Lưu ý: Decorator này chỉ hoạt động khi request đã đi qua AppJwtAuthGuard
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    // Nếu data được cung cấp, trả về property cụ thể
    if (data) {
      return request.user[data];
    }

    // Ngược lại, trả về toàn bộ user object
    return request.user;
  },
);
