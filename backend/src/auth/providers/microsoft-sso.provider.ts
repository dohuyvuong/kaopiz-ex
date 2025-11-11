import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../interfaces/config.interface';
import {
  KsystemLoginPayload,
  KsystemLoginResponse,
} from '../dto/ksystem-login.dto';
import { AxiosError } from '../../common/types/error.types';
import { SYSTEMS } from '../../common/types/system.types';
import { AuthProvider, TokenResponse } from './auth-provider.interface';

/**
 * Microsoft SSO Provider
 * Dùng để đăng nhập vào Ksystem thông qua Microsoft SSO
 */
@Injectable()
export class MicrosoftSSOProvider implements AuthProvider {
  readonly name = 'microsoft-sso';
  readonly system = SYSTEMS.KSYSTEM.name;
  private readonly logger = new Logger(MicrosoftSSOProvider.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject('APP_CONFIG') private readonly config: AppConfig,
  ) {}

  /**
   * Tạo URL để user thực hiện SSO và nhận authorization code
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.azureClientId,
      redirect_uri: this.config.azureRedirectUri,
      scope: this.config.azureScope,
      response_mode: 'fragment',
      prompt: 'select_account',
    });

    return `${this.config.azureAuthority}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Đổi authorization code và session_state thành JWT token của Ksystem
   */
  async exchangeCode(
    code: string,
    sessionState?: string | null,
  ): Promise<TokenResponse> {
    try {
      const ksystemLoginEndpoint =
        this.config.ksystemSocialLoginEndpoint ||
        `${this.config.ksystemApiBaseUrl}/sociallogin/microsoft`;

      if (!ksystemLoginEndpoint) {
        throw new Error(
          'KSYSTEM_SOCIAL_LOGIN_ENDPOINT hoặc KSYSTEM_API_BASE_URL chưa được cấu hình',
        );
      }

      const payload: KsystemLoginPayload = {
        code: code,
      };

      if (sessionState) {
        payload.session_state = sessionState;
      }

      const response = await firstValueFrom(
        this.httpService.post<KsystemLoginResponse>(
          ksystemLoginEndpoint,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const responseData: KsystemLoginResponse = response.data;

      // Extract token từ response
      // Response format: { user: {...}, token: "..." }
      if (!responseData.token) {
        throw new Error(
          'Không tìm thấy token trong response. Response: ' +
            JSON.stringify(responseData),
        );
      }

      return {
        token: responseData.token,
        userInfo: responseData.user,
      };
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
   * Validate token bằng cách gọi API lấy thông tin user từ Ksystem
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.ksystemApiBaseUrl}/info?with_project_role=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
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
}
