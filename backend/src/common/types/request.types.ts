import { Request } from 'express';
import { SystemName } from './system.types';

/**
 * Request với JWT token đã được validate bởi JwtAuthGuard
 * Token được lưu vào request sau khi Guard validate thành công
 */
export interface AuthenticatedRequest extends Request {
  /**
   * JWT token đã được validate
   * Được set bởi JwtAuthGuard sau khi validate thành công
   */
  token: string;
  /**
   * Hệ thống mà token này dùng cho ('ksystem' | 'hrm')
   * Được set bởi JwtAuthSystemGuard
   */
  system?: SystemName;
}
