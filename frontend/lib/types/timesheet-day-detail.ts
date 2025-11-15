// Types cho TimesheetDayDetailResponse - camelCase để match với backend DTOs

export interface TimeSheetRecord {
  id: number;
  time: string | null; // ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
  machineCode: string;
}

export interface ApplicationFormType {
  id: number;
  name: string;
}

export interface TrackingTime {
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  reasonId?: number;
}

export interface ApplicationFormData {
  trackingTimes?: TrackingTime[];
}

export interface DayDetailApplicationForm {
  id: number;
  typeId: number;
  projectId: number | null;
  startDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  endDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  status: number;
  data: ApplicationFormData;
  type: ApplicationFormType;
}

export interface TimesheetDayDetailResponse {
  timeSheets: TimeSheetRecord[];
  applicationForms: DayDetailApplicationForm[];
}
