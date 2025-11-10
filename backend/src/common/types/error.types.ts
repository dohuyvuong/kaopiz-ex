export interface AxiosErrorResponse {
  status: number;
  data: unknown;
}

export interface AxiosError extends Error {
  response?: AxiosErrorResponse;
  request?: unknown;
  code?: string;
}
