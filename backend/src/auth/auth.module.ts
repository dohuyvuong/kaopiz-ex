import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenService } from './token.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiModule } from '../api/api.module';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [HttpModule, ApiModule, AppConfigModule],
  controllers: [AuthController],
  providers: [
    TokenService,
    JwtAuthGuard,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [TokenService, JwtAuthGuard],
})
export class AuthModule {}
