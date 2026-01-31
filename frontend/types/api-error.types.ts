/**
 * API Error types for better error handling
 */

/**
 * Axios error response structure
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Axios error structure
 */
export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Đã xảy ra lỗi'): string {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
