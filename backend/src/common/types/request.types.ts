import { Request } from 'express';

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
}
