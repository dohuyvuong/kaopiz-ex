import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AppJwtAuthGuard } from './guards';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { MicrosoftSSOProvider } from './providers/microsoft-sso.provider';
import { KsystemOAuthProvider } from './providers/ksystem-oauth.provider';
import {
  AuthService,
  SystemTokenService,
  AppRefreshTokenService,
  AppJwtService,
} from './services';
import { ApiModule } from '../api/api.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule,
    AppConfigModule,
    ApiModule,
    UserModule,
    JwtModule.register({}), // Global JWT module
  ],
  controllers: [AuthController],
  providers: [
    // Providers
    MicrosoftSSOProvider,
    KsystemOAuthProvider,
    // Services
    AuthService,
    SystemTokenService,
    AppRefreshTokenService,
    AppJwtService,
    // Guards
    AppJwtAuthGuard,
    // Config
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [
    AuthService,
    SystemTokenService,
    AppRefreshTokenService,
    AppJwtService,
    AppJwtAuthGuard,
  ],
})
export class AuthModule {}
