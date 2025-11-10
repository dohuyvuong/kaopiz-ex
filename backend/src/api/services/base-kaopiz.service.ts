import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../interfaces/config.interface';
import { HttpMethod } from '../dto/kaopiz-api.dto';
import { AxiosError } from '../../common/types/error.types';

/**
 * Base service cho các Kaopiz API services
 * Cung cấp các HTTP methods chung (GET, POST, PUT, PATCH, DELETE)
 * Token được truyền vào như tham số trong mỗi method
 */
@Injectable()
export class BaseKaopizService {
  protected readonly logger: Logger;
  protected readonly baseURL: string;

  constructor(
    protected readonly httpService: HttpService,
    @Inject('APP_CONFIG') protected readonly config: AppConfig,
  ) {
    this.logger = new Logger(BaseKaopizService.name);
    this.baseURL = config.kaopizApiBaseUrl;
  }

  /**
   * Validate token bằng cách gọi API lấy thông tin user
   * @param token - JWT token cần validate
   * @returns true nếu token hợp lệ, throw error nếu không hợp lệ
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.callAPI<unknown>('/info?with_project_role=true', 'GET', token);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        this.logger.warn('Token không hợp lệ hoặc đã hết hạn');
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }
      throw error;
    }
  }

  /**
   * Gọi API với authentication
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param token - JWT token để authenticate
   * @param data - Request body (optional)
   */
  async callAPI<T = unknown>(
    endpoint: string,
    method: HttpMethod = 'GET',
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
        // API trả về lỗi
        this.logger.error(
          `API Error [${axiosError.response.status}]:`,
          axiosError.response.data,
        );
        throw new Error(
          `API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`,
        );
      } else if (axiosError.request) {
        // Request được gửi nhưng không có response
        const errorMessage =
          axiosError instanceof Error ? axiosError.message : 'Unknown error';
        this.logger.error('No response from API:', errorMessage);
        throw new Error(`Network Error: ${errorMessage}`);
      } else {
        // Lỗi khác
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
