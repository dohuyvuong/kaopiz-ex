import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../interfaces/config.interface';
import {
  KaopizLoginPayload,
  KaopizLoginResponse,
} from './dto/kaopiz-login.dto';
import { AxiosError } from '../common/types/error.types';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject('APP_CONFIG') private readonly config: AppConfig,
  ) {}

  /**
   * Đổi authorization code và session_state thành JWT token của Kaopiz
   * Không lưu token ở server, chỉ trả về cho client
   */
  async getTokenFromAuthorizationCode(
    authorizationCode: string,
    sessionState?: string | null,
  ): Promise<string> {
    try {
      const kaopizLoginEndpoint =
        this.config.kaopizSocialLoginEndpoint ||
        `${this.config.kaopizApiBaseUrl}/sociallogin/microsoft`;

      if (!kaopizLoginEndpoint) {
        throw new Error(
          'KAOPIZ_SOCIAL_LOGIN_ENDPOINT hoặc KAOPIZ_API_BASE_URL chưa được cấu hình',
        );
      }

      const payload: KaopizLoginPayload = {
        code: authorizationCode,
      };

      if (sessionState) {
        payload.session_state = sessionState;
      }

      const response = await firstValueFrom(
        this.httpService.post<KaopizLoginResponse>(
          kaopizLoginEndpoint,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const responseData: KaopizLoginResponse = response.data;

      // Extract token từ response
      // Response format: { user: {...}, token: "..." }
      if (!responseData.token) {
        throw new Error(
          'Không tìm thấy token trong response. Response: ' +
            JSON.stringify(responseData),
        );
      }

      const accessToken = responseData.token;
      // Không lưu token ở server, chỉ trả về cho client
      return accessToken;
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
}
