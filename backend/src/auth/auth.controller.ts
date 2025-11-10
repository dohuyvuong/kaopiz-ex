import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { AppConfigService } from '../config/config.service';
import { extractAuthParams } from '../utils/extract-auth-params.util';
import { BadRequestException } from '../common/exceptions';
import { ExchangeTokenDto } from './dto/exchange-token.dto';
import {
  AuthorizeResponseDto,
  ExchangeTokenResponseDto,
} from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * GET /auth/authorize
   * Lấy authorization URL để client tự mở
   */
  @Get('authorize')
  async getAuthorizationUrl(): Promise<AuthorizeResponseDto> {
    const config = this.configService.getConfig();
    const authUrl = this.tokenService.getAuthorizationUrl();

    return {
      success: true,
      message: 'Vui lòng mở URL này trong trình duyệt để đăng nhập',
      data: {
        authUrl,
        redirectUri: config.azureRedirectUri,
        instructions: [
          '1. Mở URL authUrl trong trình duyệt',
          '2. Đăng nhập và cho phép ứng dụng',
          `3. Sau khi đăng nhập, bạn sẽ được redirect về: ${config.azureRedirectUri}`,
          '4. Copy TOÀN BỘ URL từ thanh địa chỉ',
          '5. Gọi POST /auth/token với URL đó để lấy JWT token',
        ],
      },
    };
  }

  /**
   * POST /auth/token
   * Nhận callback URL và đổi thành JWT token
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async exchangeToken(
    @Body() body: ExchangeTokenDto,
  ): Promise<ExchangeTokenResponseDto> {
    let code: string | null = null;
    let sessionState: string | null = null;

    // Nếu có URL, extract từ URL
    if (body.url) {
      const params = extractAuthParams(body.url);
      code = params.code;
      sessionState = params.sessionState;
    } else if (body.code) {
      // Nếu có code trực tiếp
      code = body.code;
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
    const token = await this.tokenService.getTokenFromAuthorizationCode(
      code,
      sessionState,
    );

    return {
      success: true,
      message: 'Đã lấy token thành công',
      data: {
        token,
        note: 'Lưu token này và gửi kèm trong header Authorization: Bearer <token> cho các API khác',
      },
    };
  }
}
