import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../interfaces/config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): AppConfig {
    return {
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
      kaopizSocialLoginEndpoint: this.configService.get<string>(
        'KAOPIZ_SOCIAL_LOGIN_ENDPOINT',
      ),
      kaopizApiBaseUrl:
        this.configService.get<string>('KAOPIZ_API_BASE_URL') ||
        'https://ksystem.kaopiz.com/api',
    };
  }
}
