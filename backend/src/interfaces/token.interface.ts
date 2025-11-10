export interface TokenData {
  access_token: string;
  refresh_token?: string | null;
  expires_at: string;
  token_type: string;
  cached_at?: string;
}

export interface AuthParams {
  code: string | null;
  sessionState: string | null;
}
