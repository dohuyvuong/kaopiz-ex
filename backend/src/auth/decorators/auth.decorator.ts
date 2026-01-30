import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AppJwtAuthGuard } from '../guards/app-jwt-auth.guard';
import { SystemName } from '../../common/types/system.types';

export const AUTH_SYSTEM_KEY = 'auth:system';

/**
 * Decorator để tự động apply AppJwtAuthGuard
 *
 * Sử dụng:
 * @Controller('example')
 * @Auth('ksystem')  // App JWT + resolve ksystem token
 * @Auth('hrm')  // App JWT + resolve HRM token
 * export class ExampleController {
 *   @Get()
 *   async getData() {
 *     // Route này yêu cầu authentication
 *   }
 * }
 *
 * Hoặc có thể dùng ở method level:
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   @Auth('hrm')  // Chỉ route này yêu cầu HRM token
 *   async getData() {
 *     // ...
 *   }
 * }
 */
export function Auth(system: SystemName) {
  return applyDecorators(
    SetMetadata(AUTH_SYSTEM_KEY, system),
    UseGuards(AppJwtAuthGuard),
  );
}
