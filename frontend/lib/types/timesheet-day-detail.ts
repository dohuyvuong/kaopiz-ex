// Types cho TimesheetDayDetailResponse — khớp DTO backend (camelCase).

export interface TimeSheetRecord {
  id: number;
  time: string | null; // ISO, ví dụ "2026-04-16T08:45:17.000Z"
  machineCode: string;
}

export interface ApplicationFormType {
  id: number;
  name: string;
}

/**
 * HRM dùng ba shape tuỳ loại đơn — giữ nguyên cả ba, việc chuẩn hoá thuộc về
 * `lib/timesheet/normalize.ts`:
 * - đơn xin nghỉ:    `dateStart`/`dateEnd` + `timeStart`/`timeEnd`
 * - đơn vắng mặt:    `date` + `timeStart`/`timeEnd`
 * - đơn checkin/out: `date` + `time` (một mốc giờ, không phải khoảng)
 */
export interface TrackingTime {
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
  time?: string;
  countHour?: number;
  reasonId?: number;
}

export interface ApplicationFormData {
  /** Lý do ở cấp đơn — đơn xin nghỉ thường chỉ có ở đây. */
  reasonId?: number;
  trackingTimes?: TrackingTime[];
}

export interface DayDetailApplicationForm {
  id: number;
  typeId: number;
  projectId: number | null;
  startDate: string | null;
  endDate: string | null;
  /** 3 = đã duyệt, 1/2 = chờ duyệt. */
  status: number;
  data: ApplicationFormData;
  type: ApplicationFormType;
}

export interface TimesheetDayDetailResponse {
  timeSheets: TimeSheetRecord[];
  applicationForms: DayDetailApplicationForm[];
}
