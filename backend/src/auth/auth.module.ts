import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthSystemGuard } from './guards/jwt-auth-system.guard';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { MicrosoftSSOProvider } from './providers/microsoft-sso.provider';
import { KsystemOAuthProvider } from './providers/ksystem-oauth.provider';
import { AuthService } from './services/auth.service';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [HttpModule, AppConfigModule, ApiModule],
  controllers: [AuthController],
  providers: [
    // Providers
    MicrosoftSSOProvider,
    KsystemOAuthProvider,
    // Services
    AuthService,
    // Guards
    JwtAuthGuard,
    JwtAuthSystemGuard,
    // Config
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [AuthService, JwtAuthGuard, JwtAuthSystemGuard],
})
export class AuthModule {}
