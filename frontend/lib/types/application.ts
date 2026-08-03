// Types cho Application API - camelCase để match với backend DTOs

export interface TrackingTime {
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
  /** Mốc giờ đơn checkin/out khai bổ sung — một điểm, không phải khoảng. */
  time?: string;
  timeOff?: string | null;
  countHour?: number;
  reason?: string;
  reasonId?: number;
  isCalculateSalary?: number;
}

export interface ApplicationFormData {
  reasonId?: number;
  trackingTimes?: TrackingTime[];
  annualLeaveUsed?: {
    lastYear: number;
    thisYear: number;
  };
}

export interface ApplicationForm {
  id: number;
  userId: number;
  /**
   * Loại đơn HRM:
   * 1 Đơn xin nghỉ, 2 Đơn vắng mặt, 3 Đơn làm thêm,
   * 4 Đơn checkin/out, 5 Đơn làm theo chế độ, 6 Đơn đổi ca
   */
  typeId: number;
  startDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  endDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  data: ApplicationFormData;
  createdAt: string | null; // ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
}

/**
 * ID loại đơn theo API HRM `/master/all-types`.
 *
 * Cố ý KHÔNG có danh sách kiểu "loại nào ảnh hưởng chấm công". Việc một đơn có
 * che được phút vi phạm hay không do khoảng thời gian của nó quyết định, không
 * do loại đơn — xem `lib/timesheet/estimate.ts`.
 */
export const ApplicationFormTypeId = {
  LEAVE: 1,
  ABSENCE: 2,
  OVERTIME: 3,
  CHECK_IN_OUT: 4,
  SPECIAL_REGIME: 5,
  SHIFT_CHANGE: 6,
} as const;

export interface CreateTrackingTime {
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
  timeOff?: string | null;
  reasonId?: number;
}

export interface CreateApplicationFormData {
  reasonId?: number;
  trackingTimes?: CreateTrackingTime[];
  annualLeaveUsed?: {
    lastYear: number;
    thisYear: number;
  };
  time?: string;
}

export interface CreateApplicationApproval {
  userId: number;
  order: number;
}

export interface ApplicationFormReasonData {
  needLogWork?: number;
  maxTimesInWeek?: number;
  maxMinutesInDay?: number;
  isCalculateSalary?: number;
  typeLeave?: number;
  isRequiredAttachments?: number;
}

export interface ApplicationFormReason {
  id: number;
  name: string;
  description?: string | null;
  data?: ApplicationFormReasonData;
}

export interface ApplicationFormType {
  id: number;
  name: string;
  orderMax: number;
}

export interface ApplicationFormTypesResponse {
  items: ApplicationFormType[];
}

export interface ApplicationFormReasonsResponse {
  items: ApplicationFormReason[];
}

export interface ApprovalAssignmentUser {
  id: number;
  name: string;
  email: string;
}

export interface ApprovalAssignment {
  id: number;
  userId: number;
  order: number;
  user: ApprovalAssignmentUser;
}

export interface ApprovalAssignmentsResponse {
  items: ApprovalAssignment[];
}

import type { ApproverPreferences } from './approver-preferences';

export interface ApproverPreferencesResponse {
  preferences: ApproverPreferences;
}

export interface CreateApplicationFormPayload {
  typeId: number; // 1: Nghỉ phép, 2: Vắng mặt
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  data: CreateApplicationFormData;
  applicationApprovals?: CreateApplicationApproval[];
  description?: string;
}

/** Phản hồi ack khi xoá đơn (proxy từ HRM, thường { message: "OK" }) */
export interface DeleteApplicationFormsResponse {
  message?: string;
  [key: string]: unknown;
}
