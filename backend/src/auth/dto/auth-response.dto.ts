import { SystemName } from '../../common/types/system.types';

export interface AuthorizeResponseDto {
  success: boolean;
  message: string;
  data: {
    authUrl: string;
    redirectUri: string;
    redirectOAuth?: string;
    provider?: string;
    system?: SystemName;
    instructions: string[];
  };
}

export interface ExchangeTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    token: string;
    system?: SystemName;
    provider?: string;
    userInfo?: unknown;
    expiresAt?: number;
    note: string;
  };
}
