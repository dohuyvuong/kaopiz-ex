import { SystemName } from '../../common/types/system.types';

/**
 * Interface cho các authentication providers
 */
export interface TokenResponse {
  token: string;
  userInfo?: unknown;
  expiresAt?: number;
}

export interface AuthProvider {
  /**
   * Tên provider (ví dụ: 'microsoft-sso', 'ksystem-oauth')
   */
  readonly name: string;

  /**
   * Tên hệ thống mà provider này phục vụ (ví dụ: 'ksystem', 'hrm')
   */
  readonly system: SystemName;

  /**
   * Tạo URL để user thực hiện authentication
   */
  getAuthorizationUrl(): string;

  /**
   * Đổi authorization code thành token
   * @param code - Authorization code từ OAuth provider
   * @param state - State parameter (optional, dùng cho CSRF protection)
   */
  exchangeCode(code: string, state?: string): Promise<TokenResponse>;

  /**
   * Validate token bằng cách gọi API của hệ thống
   * @param token - Token cần validate
   */
  validateToken(token: string): Promise<boolean>;
}
