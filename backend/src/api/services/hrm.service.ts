import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../interfaces/config.interface';
import { AxiosError } from '../../common/types/error.types';

/**
 * Service để gọi HRM APIs
 * Sử dụng token từ Ksystem OAuth
 */
@Injectable()
export class HRMService {
  private readonly logger: Logger;
  private readonly baseURL: string;

  constructor(
    protected readonly httpService: HttpService,
    @Inject('APP_CONFIG') protected readonly config: AppConfig,
  ) {
    this.logger = new Logger(HRMService.name);
    this.baseURL = config.hrmApiBaseUrl || 'https://api.hrm.kaopiz.com';
  }

  /**
   * Validate token bằng cách gọi API lấy thông tin user từ HRM
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.callAPI<unknown>('/api/auth/me', 'GET', token);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        this.logger.warn('Token không hợp lệ hoặc đã hết hạn');
        return false;
      }
      throw error;
    }
  }

  /**
   * Gọi API với authentication
   */
  async callAPI<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    token: string,
    data?: unknown,
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as AxiosRequestConfig['method'],
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      };

      if (data) {
        config.data = data;
      }

      const response = await firstValueFrom(
        this.httpService.request<T>(config),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        this.logger.error(
          `API Error [${axiosError.response.status}]:`,
          axiosError.response.data,
        );
        throw new Error(
          `API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`,
        );
      } else if (axiosError.request) {
        const errorMessage =
          axiosError instanceof Error ? axiosError.message : 'Unknown error';
        this.logger.error('No response from API:', errorMessage);
        throw new Error(`Network Error: ${errorMessage}`);
      } else {
        const errorMessage =
          axiosError instanceof Error ? axiosError.message : 'Unknown error';
        this.logger.error('Error:', errorMessage);
        throw axiosError;
      }
    }
  }

  // Các phương thức tiện ích
  async get<T = unknown>(endpoint: string, token: string): Promise<T> {
    return this.callAPI<T>(endpoint, 'GET', token);
  }

  async post<T = unknown>(
    endpoint: string,
    token: string,
    data?: unknown,
  ): Promise<T> {
    return this.callAPI<T>(endpoint, 'POST', token, data);
  }

  async put<T = unknown>(
    endpoint: string,
    token: string,
    data?: unknown,
  ): Promise<T> {
    return this.callAPI<T>(endpoint, 'PUT', token, data);
  }

  async patch<T = unknown>(
    endpoint: string,
    token: string,
    data?: unknown,
  ): Promise<T> {
    return this.callAPI<T>(endpoint, 'PATCH', token, data);
  }

  async delete<T = unknown>(endpoint: string, token: string): Promise<T> {
    return this.callAPI<T>(endpoint, 'DELETE', token);
  }
}
