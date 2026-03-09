import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authApi } from './auth';
import { useAuthStore } from '@/lib/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper functions to access Zustand store
function getAppToken(): string | null {
  return useAuthStore.getState().appToken;
}

function getAppRefreshToken(): string | null {
  return useAuthStore.getState().appRefreshToken;
}

function updateAuthFromRefresh(data: {
  appToken: string;
  expiresIn: number;
  appRefreshToken?: string;
}) {
  useAuthStore.getState().updateAppToken({
    appToken: data.appToken,
    expiresIn: data.expiresIn,
    appRefreshToken: data.appRefreshToken,
  });
}

function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth();

  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
}

// Request interceptor - attach Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = getAppToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry for auth endpoints (prevent infinite loops)
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark as retrying
    originalRequest._retry = true;
    isRefreshing = true;

    // Try to refresh token
    const refreshToken = getAppRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await authApi.refreshToken(refreshToken);

      // Update store with new appToken, expiresIn and appRefreshToken (nếu backend rotate)
      updateAuthFromRefresh({
        appToken: refreshResponse.appToken,
        expiresIn: refreshResponse.expiresIn,
        appRefreshToken: refreshResponse.appRefreshToken,
      });

      // Update original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.appToken}`;
      }

      // Process queued requests
      processQueue(null, refreshResponse.appToken);
      isRefreshing = false;

      // Retry original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear auth and redirect
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
