export interface AppConfig {
  // Microsoft Entra ID (Azure AD) - Cho Ksystem
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret?: string;
  azureRedirectUri: string;
  azureScope: string;
  azureAuthority: string;
  azureTokenEndpoint: string;

  // Ksystem API
  ksystemSocialLoginEndpoint?: string;
  ksystemApiBaseUrl: string;

  // Ksystem OAuth - Cho HRM
  ksystemOAuthBaseUrl?: string;
  ksystemOAuthClientId?: string;
  ksystemOAuthRedirectUri?: string;

  // HRM API
  hrmApiBaseUrl?: string;

  // App JWT
  jwtSecret?: string;
  jwtExpiresIn?: string;
}
