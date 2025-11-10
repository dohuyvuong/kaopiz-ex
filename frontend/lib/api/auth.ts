const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface AuthorizeResponse {
  authUrl: string;
  redirectUri: string;
  instructions: string[];
}

export interface ExchangeTokenResponse {
  token: string;
  note: string;
}

export interface ExchangeTokenRequest {
  url: string;
}

export const authApi = {
  /**
   * Lấy authorization URL từ server
   */
  async getAuthorizationUrl(): Promise<AuthorizeResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/authorize`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get authorization URL');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Exchange authorization code thành JWT token
   */
  async exchangeToken(data: ExchangeTokenRequest): Promise<ExchangeTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to exchange token' }));
      throw new Error(error.message || 'Failed to exchange token');
    }

    const result = await response.json();
    return result.data;
  },
};
