import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../interfaces/config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): AppConfig {
    return {
      // Microsoft Entra ID (Azure AD) - Cho Ksystem
      azureTenantId: this.configService.get<string>('AZURE_TENANT_ID') || '',
      azureClientId: this.configService.get<string>('AZURE_CLIENT_ID') || '',
      azureClientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET'),
      azureRedirectUri:
        this.configService.get<string>('AZURE_REDIRECT_URI') || '',
      azureScope:
        this.configService.get<string>('AZURE_SCOPE') ||
        'user.read openid profile offline_access',
      azureAuthority: this.configService.get<string>('AZURE_AUTHORITY') || '',
      azureTokenEndpoint:
        this.configService.get<string>('AZURE_TOKEN_ENDPOINT') || '',

      // Ksystem API
      ksystemSocialLoginEndpoint: this.configService.get<string>(
        'KSYSTEM_SOCIAL_LOGIN_ENDPOINT',
      ),
      ksystemApiBaseUrl:
        this.configService.get<string>('KSYSTEM_API_BASE_URL') ||
        'https://ksystem.kaopiz.com/api',

      // Ksystem OAuth - Cho HRM
      ksystemOAuthBaseUrl:
        this.configService.get<string>('KSYSTEM_OAUTH_BASE_URL') ||
        'https://ksystem.kaopiz.com',
      ksystemOAuthClientId: this.configService.get<string>(
        'KSYSTEM_OAUTH_CLIENT_ID',
      ),
      ksystemOAuthRedirectUri:
        this.configService.get<string>('KSYSTEM_OAUTH_REDIRECT_URI') ||
        'https://api.hrm.kaopiz.com/api/auth/callback',

      // HRM API
      hrmApiBaseUrl:
        this.configService.get<string>('HRM_API_BASE_URL') ||
        'https://api.hrm.kaopiz.com',
    };
  }
}
