import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AppConfigService } from '../config/config.service';
import { extractAuthParams } from '../utils/extract-auth-params.util';
import { BadRequestException, NotFoundException } from '../common/exceptions';
import { ProviderAuthorizeQueryDto } from './dto/provider-authorize.dto';
import { ProviderExchangeTokenDto } from './dto/provider-exchange-token.dto';
import {
  AuthorizeResponseDto,
  ExchangeTokenResponseDto,
} from './dto/auth-response.dto';
import { KsystemOAuthProvider } from './providers/ksystem-oauth.provider';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * GET /auth/providers
   * Lấy danh sách các providers có sẵn
   */
  @Get('providers')
  async getProviders() {
    const providers = this.authService.getAllProviders();
    return {
      success: true,
      message: 'Danh sách providers',
      data: providers.map((p) => ({
        name: p.name,
        system: p.system,
      })),
    };
  }

  /**
   * GET /auth/:provider/authorize
   * Lấy authorization URL cho provider cụ thể
   */
  @Get(':provider/authorize')
  async getProviderAuthorizationUrl(
    @Param('provider') providerName: string,
    @Query() query: ProviderAuthorizeQueryDto,
  ): Promise<AuthorizeResponseDto> {
    const provider = this.authService.getProvider(providerName);
    if (!provider) {
      throw new NotFoundException(`Provider '${providerName}' không tồn tại`);
    }

    let authUrl: string;
    const config = this.configService.getConfig();

    // Ksystem OAuth có thể nhận redirectOAuth parameter
    if (providerName === 'ksystem-oauth' && 'getAuthorizationUrl' in provider) {
      const ksystemProvider = provider as KsystemOAuthProvider;
      authUrl = ksystemProvider.getAuthorizationUrl(query.redirectOAuth);
    } else {
      authUrl = provider.getAuthorizationUrl();
    }

    const instructions =
      providerName === 'ksystem-oauth'
        ? [
            '1. Mở URL authUrl trong trình duyệt',
            '2. Đăng nhập và cho phép ứng dụng',
            `3. Sau khi đăng nhập, bạn sẽ được redirect về redirectOAuth (nếu có) hoặc redirectUri`,
            '4. Copy TOÀN BỘ URL từ thanh địa chỉ (URL sẽ chứa code)',
            `5. Gọi POST /auth/${providerName}/token với URL đó để lấy token`,
            '6. Lưu ý: Nếu không có redirectOAuth, có thể cần truyền redirectOAuth parameter khi gọi GET /auth/ksystem-oauth/authorize?redirectOAuth=http://localhost:3000/auth/callback',
          ]
        : [
            '1. Mở URL authUrl trong trình duyệt',
            '2. Đăng nhập và cho phép ứng dụng',
            `3. Sau khi đăng nhập, bạn sẽ được redirect về redirectUri`,
            '4. Copy TOÀN BỘ URL từ thanh địa chỉ',
            `5. Gọi POST /auth/${providerName}/token với URL đó để lấy token`,
          ];

    return {
      success: true,
      message: `Vui lòng mở URL này trong trình duyệt để đăng nhập với ${providerName}`,
      data: {
        authUrl,
        redirectUri:
          providerName === 'microsoft-sso'
            ? config.azureRedirectUri
            : config.ksystemOAuthRedirectUri || '',
        redirectOAuth: query.redirectOAuth,
        provider: providerName,
        system: provider.system,
        instructions,
      },
    };
  }

  /**
   * POST /auth/:provider/token
   * Nhận callback URL và đổi thành token cho provider cụ thể
   */
  @Post(':provider/token')
  @HttpCode(HttpStatus.OK)
  async exchangeProviderToken(
    @Param('provider') providerName: string,
    @Body() body: ProviderExchangeTokenDto,
  ): Promise<ExchangeTokenResponseDto> {
    const provider = this.authService.getProvider(providerName);
    if (!provider) {
      throw new NotFoundException(`Provider '${providerName}' không tồn tại`);
    }

    let code: string | null = null;
    let state: string | null = null;
    let sessionState: string | null = null;

    // Nếu có URL, extract từ URL
    if (body.url) {
      const params = extractAuthParams(body.url);
      code = params.code;
      state = params.state || null;
      sessionState = params.sessionState || null;
    } else if (body.code) {
      // Nếu có code trực tiếp
      code = body.code;
      state = body.state || null;
      sessionState = body.session_state || null;
    } else {
      throw new BadRequestException(
        'Cần cung cấp "url" hoặc "code" trong body',
      );
    }

    if (!code) {
      throw new BadRequestException('Không tìm thấy authorization code');
    }

    // Đổi code thành token
    const tokenResponse = await provider.exchangeCode(
      code,
      state || sessionState || undefined,
    );

    return {
      success: true,
      message: `Đã lấy token thành công cho ${provider.system}`,
      data: {
        token: tokenResponse.token,
        system: provider.system,
        provider: providerName,
        userInfo: tokenResponse.userInfo,
        expiresAt: tokenResponse.expiresAt,
        note: `Lưu token này và gửi kèm trong header Authorization: Bearer <token> cho các API của ${provider.system}`,
      },
    };
  }
}
