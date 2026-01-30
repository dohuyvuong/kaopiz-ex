import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SystemTokenService } from './services/system-token.service';
import { AppRefreshTokenService } from './services/app-refresh-token.service';
import { AppJwtService } from './services/app-jwt.service';
import { UserService } from '../user/user.service';
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
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly systemTokenService: SystemTokenService,
    private readonly appRefreshTokenService: AppRefreshTokenService,
    private readonly appJwtService: AppJwtService,
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

    // Extract email from userInfo
    let email: string | undefined;
    let name: string | undefined;
    const userInfo = tokenResponse.userInfo as any;

    if (provider.system === 'ksystem') {
      // Ksystem: userInfo.email
      email = userInfo?.email;
      name = userInfo?.name;
    } else if (provider.system === 'hrm') {
      // HRM: userInfo.info.email
      email = userInfo?.info?.email;
      name = userInfo?.info?.name;
    }

    if (!email) {
      throw new BadRequestException(
        'Không tìm thấy email trong thông tin user',
      );
    }

    this.logger.log(`User logged in: ${email} via ${providerName}`);

    // Find or create user
    const user = await this.userService.findOrCreateByEmail(email, name);

    // Save system token
    await this.systemTokenService.upsert(user.id, provider.system, {
      token: tokenResponse.token,
      expiresAt: tokenResponse.expiresAt
        ? new Date(tokenResponse.expiresAt)
        : null,
      userInfo: tokenResponse.userInfo as object | null,
    });

    // Get all systems for this user
    const systems = await this.systemTokenService.getUserSystems(user.id);

    // Create app JWT
    const { appToken, expiresIn } = await this.appJwtService.sign(
      user.id,
      user.email,
    );

    // Create refresh token
    const refreshToken = await this.appRefreshTokenService.create(user.id, 30); // 30 days

    return {
      success: true,
      message: `Đăng nhập thành công`,
      data: {
        appToken,
        appRefreshToken: refreshToken.token,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        systems,
      },
    } as any;
  }

  /**
   * POST /auth/refresh
   * Refresh app JWT using refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { appRefreshToken: string }) {
    if (!body.appRefreshToken) {
      throw new BadRequestException('appRefreshToken is required');
    }

    // Verify refresh token
    const userId = await this.appRefreshTokenService.verify(
      body.appRefreshToken,
    );

    if (!userId) {
      throw new BadRequestException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create new app JWT
    const { appToken, expiresIn } = await this.appJwtService.sign(
      user.id,
      user.email,
    );

    // Optional: Rotate refresh token (create new, revoke old)
    const newRefreshToken = await this.appRefreshTokenService.rotate(
      body.appRefreshToken,
      30,
    );

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        appToken,
        expiresIn,
        appRefreshToken: newRefreshToken?.token || body.appRefreshToken,
      },
    };
  }

  /**
   * POST /auth/logout
   * Revoke refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { appRefreshToken: string }) {
    if (!body.appRefreshToken) {
      throw new BadRequestException('appRefreshToken is required');
    }

    // Revoke refresh token
    await this.appRefreshTokenService.revoke(body.appRefreshToken);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
