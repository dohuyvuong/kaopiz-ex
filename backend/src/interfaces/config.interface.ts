export interface AppConfig {
  // Microsoft Entra ID (Azure AD)
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret?: string;
  azureRedirectUri: string;
  azureScope: string;
  azureAuthority: string;
  azureTokenEndpoint: string;

  // Kaopiz
  kaopizSocialLoginEndpoint?: string;
  kaopizApiBaseUrl: string;
}
