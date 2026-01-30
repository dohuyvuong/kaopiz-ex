import { Request } from 'express';
import { SystemName } from './system.types';

/**
 * Request với authentication info đã được validate bởi AppJwtAuthGuard
 * User, token, và system được set sau khi Guard validate thành công
 */
export interface AuthenticatedRequest extends Request {
  /**
   * User info từ App JWT payload
   * Được set bởi AppJwtAuthGuard sau khi verify App JWT
   */
  user: {
    id: number;
    email: string;
  };
  /**
   * System token (Ksystem hoặc HRM token) đã được validate
   * Được set bởi AppJwtAuthGuard từ database
   */
  token: string;
  /**
   * Hệ thống mà token này dùng cho ('ksystem' | 'hrm')
   * Được set bởi AppJwtAuthGuard từ @Auth() decorator
   */
  system: SystemName;
}
