// Types cho Timesheet API - camelCase để match với backend DTOs

export interface WorkingTime {
  id: number;
  name: string;
  workStart: string; // "08:30"
  workEnd: string; // "17:30"
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
  workingHoursPerDay: number;
  workingHoursPerShift: number;
  minutesEarlyLateAllowed: number; // 90
  timezone: string;
  createdAt: string | null; // ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
  updatedAt: string | null; // ISO date string (ví dụ: "2025-10-16T08:30:00.000Z")
  lunchBreakTime: number;
  dinnerBreakTime: number;
  dayOfWeek: number;
  timezoneValue: string;
}

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

export interface LogWork {
  id: number;
  userId: number;
  timeSpent: number; // seconds
  date: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  timeSpentHour: number;
}

export interface TimesheetDay {
  date: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  timeIn: string | null; // "08:45" hoặc null
  timeOut: string | null; // "18:42" hoặc null
  symbol: string | null; // "V", "P", "I/O", null
  location: string;
  timeInFinal: string | null; // Giờ check-in sau khi áp dụng đơn
  timeOutFinal: string | null; // Giờ check-out sau khi áp dụng đơn
  work: string; // "1" (working day), "N" (non-working day/weekend), "NL" (holiday/nghỉ lễ)
  workDays: number;
  workHours: number;
  workStart: string | null;
  workEnd: string | null;
  minutesLate: number;
  minutesEarly: number;
  approvedApplicationForms: ApplicationForm[];
  logWork: LogWork | null;
  logWorkDiff: number;
  logWorkNeeded: number;
}

export interface TimesheetSummary {
  minutesLate: number;
  minutesEarly: number;
  numbersLate: number;
  numbersEarly: number;
  fines: number;
  bonus: number;
  actualWorkingDay: number;
  timekeepingHolidays: number;
  numbersLogWorkDiff: number;
}

export interface TimesheetTotal {
  workHour: number;
  workDay: number;
  standardWorkday: number;
  logWorkHour: number;
  logWorkDiff: number;
}

export interface LeaveInfo {
  healthInsuranceLeave: number;
  marriageLeave: number;
  filialLeave: number;
  unpaidLeave: number;
  annualLeave: number;
  unpaidLeaveWithoutApplication: number;
  totalUnpaid: number;
}

export interface AnnualLeaveInfo {
  used: number;
  usedThisYear: number;
  availableThisYear: number;
  remainingLastYear: number;
}

export interface OvertimeInfo {
  actual: number;
  multipliedByRate: number;
  compensatoryLeave: number;
}

export interface AbsenceInfo {
  absenceCompensatoryLeave: number;
}

export interface TimesheetCalendarResponse {
  userId: number;
  userCode: string;
  userFullName: string;
  userFullNameKatakana: string;
  userEmail: string;
  departmentId: number;
  contractDepartmentId: number;
  seniorManagements: unknown | null;
  workingTime: WorkingTime;
  timelines: TimesheetDay[];
  leave: LeaveInfo;
  annualLeaveInfo: AnnualLeaveInfo;
  overtime: OvertimeInfo;
  absence: AbsenceInfo;
  workingStartDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  workingEndDate: string | null; // ISO date string (ví dụ: "2025-10-16T00:00:00.000Z")
  summary: TimesheetSummary;
  total: TimesheetTotal;
}
