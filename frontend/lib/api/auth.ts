import { SystemName } from '@/lib/types/system';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface Provider {
  name: string;
  system: SystemName;
}

export interface AuthorizeResponse {
  authUrl: string;
  redirectUri: string;
  redirectOAuth?: string;
  provider?: string;
  system?: SystemName;
  instructions: string[];
}

export interface ExchangeTokenResponse {
  token: string;
  system?: SystemName;
  provider?: string;
  userInfo?: unknown;
  expiresAt?: number;
  note: string;
}

export interface ExchangeTokenRequest {
  url?: string;
  code?: string;
  state?: string;
  session_state?: string;
}

export interface ProviderAuthorizeParams {
  redirectOAuth?: string;
}

export const authApi = {
  /**
   * Lấy danh sách các providers có sẵn
   */
  async getProviders(): Promise<Provider[]> {
    const response = await fetch(`${API_BASE_URL}/auth/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get providers');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Lấy authorization URL từ server cho provider cụ thể
   */
  async getAuthorizationUrl(
    provider: string,
    params?: ProviderAuthorizeParams,
  ): Promise<AuthorizeResponse> {
    const queryParams = new URLSearchParams();
    if (params?.redirectOAuth) {
      queryParams.append('redirectOAuth', params.redirectOAuth);
    }

    const url = `${API_BASE_URL}/auth/${provider}/authorize${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to get authorization URL',
      }));
      throw new Error(error.message || 'Failed to get authorization URL');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Exchange authorization code thành JWT token cho provider cụ thể
   */
  async exchangeToken(
    provider: string,
    data: ExchangeTokenRequest,
  ): Promise<ExchangeTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/${provider}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to exchange token',
      }));
      throw new Error(error.message || 'Failed to exchange token');
    }

    const result = await response.json();
    return result.data;
  },
};
