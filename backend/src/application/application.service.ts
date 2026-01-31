import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApplicationApiService } from '../api/services/hrm/application-api.service';
import { CreateApplicationFormDto } from './dto/create-application-form.dto';
import { ApplicationFormDto } from './dto/application-form.dto';
import {
  ApplicationFormTypesResponseDto,
  ApplicationFormReasonsResponseDto,
} from './dto/application-form-types.dto';
import { ApprovalAssignmentsResponseDto } from './dto/approval-assignment.dto';
import {
  HrmApplicationFormDataPayload,
  HrmTrackingTimePayload,
} from './interfaces/hrm-api-payload.interface';

/**
 * Service để xử lý logic application forms
 * Sử dụng ApplicationApiService để gọi API HRM
 */
@Injectable()
export class ApplicationService {
  private readonly logger: Logger;

  constructor(private readonly applicationApiService: ApplicationApiService) {
    this.logger = new Logger(ApplicationService.name);
  }

  /**
   * Lấy danh sách loại đơn
   * @param token HRM JWT token
   */
  async getFormTypes(token: string) {
    this.logger.log(`Getting application form types`);

    // Gọi API thông qua ApplicationApiService
    const rawData = await this.applicationApiService.getFormTypes(token);

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      ApplicationFormTypesResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Lấy danh sách lý do
   * @param token HRM JWT token
   * @param typeId ID của loại đơn (optional)
   */
  async getReasons(token: string, typeId?: number) {
    this.logger.log(
      `Getting application form reasons${typeId ? ` for typeId: ${typeId}` : ''}`,
    );

    // Gọi API thông qua ApplicationApiService
    const rawData = await this.applicationApiService.getReasons(token, typeId);

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      ApplicationFormReasonsResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Lấy danh sách người duyệt
   * @param token HRM JWT token
   * @param typeId ID của loại đơn
   * @param order Thứ tự duyệt (1 hoặc 2)
   * @param userId ID của user hiện tại (để loại trừ)
   */
  async getApprovalAssignments(
    token: string,
    typeId: number,
    order: number,
    userId?: number,
  ) {
    this.logger.log(
      `Getting approval assignments for typeId: ${typeId}, order: ${order}`,
    );

    // Gọi API thông qua ApplicationApiService
    const rawData = await this.applicationApiService.getApprovalAssignments(
      token,
      typeId,
      order,
      userId,
    );

    // Transform từ snake_case sang camelCase
    const transformedData = plainToInstance(
      ApprovalAssignmentsResponseDto,
      rawData,
      {
        excludeExtraneousValues: true,
      },
    );

    return transformedData;
  }

  /**
   * Tạo đơn từ (application form)
   * @param token HRM JWT token
   * @param payload CreateApplicationFormDto (camelCase)
   */
  async createApplicationForm(
    token: string,
    payload: CreateApplicationFormDto,
  ) {
    this.logger.log(`Creating application form with typeId: ${payload.typeId}`);

    // Tạo FormData từ payload (transform camelCase sang snake_case)
    const formData = new FormData();

    // type_id
    formData.append('type_id', String(payload.typeId));

    // data (JSON string với snake_case)
    const dataObj: HrmApplicationFormDataPayload = {};
    if (payload.data.reasonId !== undefined) {
      dataObj.reason_id = payload.data.reasonId;
    }
    if (payload.data.trackingTimes && payload.data.trackingTimes.length > 0) {
      dataObj.tracking_times = payload.data.trackingTimes.map((tt) => {
        const trackingTime: HrmTrackingTimePayload = {};
        if (tt.date !== undefined) trackingTime.date = tt.date;
        if (tt.dateStart !== undefined) trackingTime.date_start = tt.dateStart;
        if (tt.dateEnd !== undefined) trackingTime.date_end = tt.dateEnd;
        if (tt.timeStart !== undefined) trackingTime.time_start = tt.timeStart;
        if (tt.timeEnd !== undefined) trackingTime.time_end = tt.timeEnd;
        if (tt.timeOff !== undefined) trackingTime.time_off = tt.timeOff;
        if (tt.reasonId !== undefined) trackingTime.reason_id = tt.reasonId;
        return trackingTime;
      });
    }
    if (payload.data.annualLeaveUsed) {
      dataObj.annual_leave_used = {
        last_year: payload.data.annualLeaveUsed.lastYear,
        this_year: payload.data.annualLeaveUsed.thisYear,
      };
    }
    if (payload.data.time !== undefined) {
      dataObj.time = payload.data.time;
    }
    formData.append('data', JSON.stringify(dataObj));

    // application_approvals
    if (
      payload.applicationApprovals &&
      payload.applicationApprovals.length > 0
    ) {
      payload.applicationApprovals.forEach((approval, index) => {
        formData.append(
          `application_approvals[${index}][user_id]`,
          String(approval.userId),
        );
        formData.append(
          `application_approvals[${index}][order]`,
          String(approval.order),
        );
      });
    }

    // description
    if (payload.description) {
      formData.append('description', payload.description);
    }

    // Gọi API thông qua ApplicationApiService
    const rawData = await this.applicationApiService.createApplicationForm(
      token,
      formData,
    );

    // Transform response từ snake_case sang camelCase
    const transformedData = plainToInstance(ApplicationFormDto, rawData, {
      excludeExtraneousValues: true,
    });

    return transformedData;
  }
}
