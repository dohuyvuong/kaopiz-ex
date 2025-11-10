export interface AuthorizeResponseDto {
  success: boolean;
  message: string;
  data: {
    authUrl: string;
    redirectUri: string;
    instructions: string[];
  };
}

export interface ExchangeTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    token: string;
    note: string;
  };
}
