import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Decorator để tự động apply JwtAuthGuard
 *
 * Sử dụng:
 * @Controller('example')
 * @Auth()  // Tự động apply JwtAuthGuard cho tất cả routes trong controller
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
 *   @Auth()  // Chỉ route này yêu cầu authentication
 *   async getData() {
 *     // ...
 *   }
 * }
 */
export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
