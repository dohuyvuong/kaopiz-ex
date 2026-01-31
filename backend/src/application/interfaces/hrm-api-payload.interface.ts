/**
 * Interfaces for HRM API snake_case payloads
 */

/**
 * TrackingTime object in HRM API (snake_case)
 */
export interface HrmTrackingTimePayload {
  date?: string;
  date_start?: string;
  date_end?: string;
  time_start?: string;
  time_end?: string;
  time_off?: string | null;
  reason_id?: number;
}

/**
 * Annual leave used object in HRM API (snake_case)
 */
export interface HrmAnnualLeaveUsedPayload {
  last_year: number;
  this_year: number;
}

/**
 * Data object in HRM API (snake_case)
 */
export interface HrmApplicationFormDataPayload {
  reason_id?: number;
  tracking_times?: HrmTrackingTimePayload[];
  annual_leave_used?: HrmAnnualLeaveUsedPayload;
  time?: string;
}
