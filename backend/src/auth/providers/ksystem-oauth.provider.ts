import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../interfaces/config.interface';
import { AxiosError } from '../../common/types/error.types';
import { SYSTEMS } from '../../common/types/system.types';
import { AuthProvider, TokenResponse } from './auth-provider.interface';

/**
 * Ksystem OAuth Provider
 * Dùng để đăng nhập vào HRM thông qua Ksystem OAuth
 */
@Injectable()
export class KsystemOAuthProvider implements AuthProvider {
  readonly name = 'ksystem-oauth';
  readonly system = SYSTEMS.HRM.name;
  private readonly logger = new Logger(KsystemOAuthProvider.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject('APP_CONFIG') private readonly config: AppConfig,
  ) {}

  /**
   * Tạo URL để user thực hiện OAuth và nhận authorization code
   * @param redirectOAuth - URL để redirect sau khi đăng nhập thành công (optional)
   */
  getAuthorizationUrl(redirectOAuth?: string): string {
    if (!this.config.ksystemOAuthClientId) {
      throw new Error('KSYSTEM_OAUTH_CLIENT_ID chưa được cấu hình');
    }

    const params = new URLSearchParams({
      client_id: String(this.config.ksystemOAuthClientId),
      redirect_uri: this.config.ksystemOAuthRedirectUri || '',
      response_type: 'code',
      scope: '',
      state: this.generateState(),
    });

    if (redirectOAuth) {
      params.append('redirect_oauth', redirectOAuth);
    }

    return `${this.config.ksystemOAuthBaseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Đổi authorization code thành token thông qua HRM API callback
   * Flow: Ksystem OAuth → HRM API callback → Token
   * @param code - Authorization code từ Ksystem OAuth
   * @param state - State parameter (optional, dùng cho CSRF protection - chưa implement validation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exchangeCode(code: string, state?: string): Promise<TokenResponse> {
    try {
      // Gọi HRM API callback endpoint để exchange code thành token
      // HRM API sẽ tự xử lý với Ksystem OAuth và trả về token
      const hrmApiBaseUrl =
        this.config.hrmApiBaseUrl || 'https://api.hrm.kaopiz.com';
      let callbackUrl = `${hrmApiBaseUrl}/api/auth/callback?code=${encodeURIComponent(code)}`;

      if (state) {
        callbackUrl += `&state=${encodeURIComponent(state)}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(callbackUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const responseData = response.data;

      // HRM API callback trả về { user: {...}, token: "..." } hoặc tương tự
      // Cần kiểm tra format thực tế từ response
      if (responseData.token) {
        return {
          token: responseData.token,
          userInfo: responseData.user,
          expiresAt: responseData.expires_in
            ? Date.now() + responseData.expires_in * 1000
            : undefined,
        };
      }

      // Nếu không có token trực tiếp, có thể token được set trong cookie/session
      // Trong trường hợp này, cần gọi /api/auth/me để lấy user info và token
      // Nhưng vì không có token, nên cần kiểm tra response format thực tế
      throw new Error(
        'Không tìm thấy token trong response. Response: ' +
          JSON.stringify(responseData),
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage =
        axiosError.response?.data || axiosError.message || 'Unknown error';
      this.logger.error(
        'Lỗi khi đổi authorization code thành token:',
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Validate token bằng cách gọi API HRM
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const hrmApiBaseUrl =
        this.config.hrmApiBaseUrl || 'https://api.hrm.kaopiz.com';
      const response = await firstValueFrom(
        this.httpService.get(`${hrmApiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return !!response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        this.logger.warn('Token không hợp lệ hoặc đã hết hạn');
        return false;
      }
      throw error;
    }
  }

  /**
   * Generate state parameter cho CSRF protection
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
