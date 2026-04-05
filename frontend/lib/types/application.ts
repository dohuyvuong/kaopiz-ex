// Types cho Application API - camelCase để match với backend DTOs

export interface TrackingTime {
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
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
  time?: string;
}

export interface ApplicationForm {
  id: number;
  userId: number;
  typeId: number; // 1: Nghỉ phép, 2: Vắng mặt, 3: Check-in/out, 4: Check-out, ...
  startDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  endDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  data: ApplicationFormData;
  createdAt: string | null; // ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
  user?: unknown;
}

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
