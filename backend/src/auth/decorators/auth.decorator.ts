import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthSystemGuard } from '../guards/jwt-auth-system.guard';
import { System } from './system.decorator';
import { SystemName } from '../../common/types/system.types';

/**
 * Decorator để tự động apply JwtAuthSystemGuard
 *
 * Sử dụng:
 * @Controller('example')
 * @Auth('ksystem')  // Ksystem token
 * @Auth('hrm')  // HRM token
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
  return applyDecorators(System(system), UseGuards(JwtAuthSystemGuard));
}
