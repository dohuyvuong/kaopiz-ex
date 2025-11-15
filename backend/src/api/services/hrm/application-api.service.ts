import { Injectable, Logger } from '@nestjs/common';
import { HRMService } from '../hrm.service';

/**
 * Service để gọi các API application forms từ HRM
 * Chịu trách nhiệm gọi API và trả về raw data từ HRM
 */
@Injectable()
export class ApplicationApiService {
  private readonly logger: Logger;

  constructor(private readonly hrmService: HRMService) {
    this.logger = new Logger(ApplicationApiService.name);
  }

  /**
   * Lấy danh sách loại đơn từ HRM API
   * @param token HRM JWT token
   * @returns Raw data từ HRM API (snake_case)
   */
  async getFormTypes(token: string): Promise<unknown> {
    this.logger.log(`Calling HRM API: getFormTypes`);

    const rawData = await this.hrmService.get(`/master/all-types`, token);

    return rawData;
  }

  /**
   * Lấy danh sách lý do từ HRM API
   * @param token HRM JWT token
   * @param typeId ID của loại đơn (optional)
   * @returns Raw data từ HRM API (snake_case)
   */
  async getReasons(token: string, typeId?: number): Promise<unknown> {
    this.logger.log(
      `Calling HRM API: getReasons${typeId ? ` for typeId: ${typeId}` : ''}`,
    );

    const queryParams = typeId
      ? `?type_id_equal=${typeId}&is_use_equal=1`
      : '?is_use_equal=1';
    const rawData = await this.hrmService.get(
      `/master/all-reasons${queryParams}`,
      token,
    );

    return rawData;
  }

  /**
   * Lấy danh sách người duyệt từ HRM API
   * @param token HRM JWT token
   * @param typeId ID của loại đơn
   * @param order Thứ tự duyệt (1 hoặc 2)
   * @param userId ID của user hiện tại (để loại trừ)
   * @returns Raw data từ HRM API (snake_case)
   */
  async getApprovalAssignments(
    token: string,
    typeId: number,
    order: number,
    userId?: number,
  ): Promise<unknown> {
    this.logger.log(
      `Calling HRM API: getApprovalAssignments for typeId: ${typeId}, order: ${order}`,
    );

    let queryParams = `?type_id_equal=${typeId}&order_equal=${order}`;
    if (userId) {
      queryParams += `&user_id_not_equal=${userId}`;
    }

    const rawData = await this.hrmService.get(
      `/master/all-approval-assignments${queryParams}`,
      token,
    );

    return rawData;
  }

  /**
   * Tạo đơn từ (application form) từ HRM API
   * @param token HRM JWT token
   * @param payload Form data (multipart/form-data format)
   * @returns Raw data từ HRM API (snake_case)
   */
  async createApplicationForm(
    token: string,
    payload: FormData,
  ): Promise<unknown> {
    this.logger.log(`Calling HRM API: createApplicationForm`);

    const rawData = await this.hrmService.postFormData(
      `/application-form`,
      payload,
      token,
    );

    return rawData;
  }
}
