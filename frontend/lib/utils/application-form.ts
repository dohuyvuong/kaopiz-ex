import dayjs from 'dayjs';
import { TimesheetDay } from '@/lib/types/timesheet';
import { DayDetailApplicationForm } from '@/lib/types/timesheet-day-detail';

/**
 * Kiểm tra hai khoảng thời gian có overlap không
 */
export function isTimeOverlapping(
  start1: string,
  end1: string,
  start2: string | null,
  end2: string | null,
): boolean {
  if (!start2 || !end2) {
    // Nếu đơn cũ không có thời gian cụ thể (cả ngày) -> overlap với mọi thời gian
    return true;
  }

  const newStart = dayjs(`2000-01-01 ${start1}`, 'YYYY-MM-DD HH:mm');
  const newEnd = dayjs(`2000-01-01 ${end1}`, 'YYYY-MM-DD HH:mm');
  const existingStart = dayjs(`2000-01-01 ${start2}`, 'YYYY-MM-DD HH:mm');
  const existingEnd = dayjs(`2000-01-01 ${end2}`, 'YYYY-MM-DD HH:mm');

  // Overlap: newStart < existingEnd && newEnd > existingStart
  return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
}

/**
 * Lấy tất cả đơn trong ngày (bao gồm cả chưa approve)
 */
export function getAllFormsInDay(
  calendarDay: TimesheetDay | null | undefined,
  dayDetail: { applicationForms?: DayDetailApplicationForm[] } | null | undefined,
): Array<{
  data?: {
    trackingTimes?: Array<{
      timeStart?: string;
      timeEnd?: string;
    }>;
  };
}> {
  const allForms: Array<{
    data?: {
      trackingTimes?: Array<{
        timeStart?: string;
        timeEnd?: string;
      }>;
    };
  }> = [];

  // Thêm đơn đã approve từ calendarDay
  if (calendarDay?.approvedApplicationForms) {
    allForms.push(...calendarDay.approvedApplicationForms);
  }

  // Thêm đơn từ day detail (bao gồm cả chưa approve)
  // Loại bỏ duplicate bằng cách kiểm tra id
  if (dayDetail?.applicationForms) {
    const approvedFormIds = new Set(
      calendarDay?.approvedApplicationForms?.map((f) => f.id) || [],
    );
    const uniqueForms = dayDetail.applicationForms.filter(
      (f) => !approvedFormIds.has(f.id),
    );
    allForms.push(...uniqueForms);
  }

  return allForms;
}

/**
 * Kiểm tra đơn có overlap với các đơn đã có trong ngày không
 */
export function checkOverlappingForms(
  timeStart: string,
  timeEnd: string,
  calendarDay: TimesheetDay | null | undefined,
  dayDetail: { applicationForms?: DayDetailApplicationForm[] } | null | undefined,
): boolean {
  if (!timeStart || !timeEnd) return false;

  const allForms = getAllFormsInDay(calendarDay, dayDetail);

  return allForms.some((form) => {
    if (!form.data?.trackingTimes || form.data.trackingTimes.length === 0) {
      return false;
    }

    // Kiểm tra từng trackingTime trong đơn
    return form.data.trackingTimes.some((tt) => {
      return isTimeOverlapping(
        timeStart,
        timeEnd,
        tt.timeStart || null,
        tt.timeEnd || null,
      );
    });
  });
}

/**
 * Kiểm tra đã có đơn vắng mặt (typeId 2) trong tuần chưa
 * Bao gồm cả approved và pending forms
 */
export function checkAbsenceFormInWeek(
  date: string,
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }> | undefined,
  dayDetailMap?: Map<string, { applicationForms?: DayDetailApplicationForm[] }>,
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>,
): boolean {
  if (!calendarDays || !date) return false;

  const selectedDate = dayjs(date);
  const weekStart = selectedDate.startOf('week'); // Chủ nhật
  const weekEnd = selectedDate.endOf('week'); // Thứ bảy

  return calendarDays.some(({ date: dayDate, timesheet }) => {
    if (!timesheet) return false;
    const day = dayjs(dayDate);
    // Kiểm tra trong cùng tuần (bao gồm cả weekStart và weekEnd)
    if (day.isBefore(weekStart, 'day') || day.isAfter(weekEnd, 'day')) return false;

    const dateStr = day.format('YYYY-MM-DD');

    // Kiểm tra approved forms
    // Đơn vắng mặt (typeId 2) với reasonId 21 (Thay đổi thời gian làm việc)
    const hasApprovedAbsenceForm =
      timesheet.approvedApplicationForms?.some(
        (form) =>
          form.typeId === 2 &&
          form.data?.trackingTimes?.some((tt) => tt.reasonId === 21),
      ) || false;

    if (hasApprovedAbsenceForm) return true;

    // Kiểm tra pending forms từ mergedDays (ưu tiên vì có data cho tất cả các ngày trong tuần)
    if (mergedDays) {
      const mergedDay = mergedDays.get(dateStr);
      if (mergedDay?.approvedApplicationForms) {
        const approvedFormIds = new Set(
          (timesheet.approvedApplicationForms || []).map((f) => f.id),
        );
        const hasPendingAbsenceForm = mergedDay.approvedApplicationForms.some(
          (form) =>
            form.typeId === 2 &&
            form.data?.trackingTimes?.some((tt) => tt.reasonId === 21) &&
            !approvedFormIds.has(form.id), // Chỉ lấy pending forms
        );
        if (hasPendingAbsenceForm) return true;
      }
    }

    // Kiểm tra pending forms từ dayDetailMap (fallback, chỉ có data cho ngày hiện tại)
    if (dayDetailMap) {
      const dayDetail = dayDetailMap.get(dateStr);
      const hasPendingAbsenceForm =
        dayDetail?.applicationForms?.some(
          (form) =>
            form.typeId === 2 &&
            form.status !== 3 && // Chưa approve
            form.data?.trackingTimes?.some((tt) => tt.reasonId === 21),
        ) || false;

      if (hasPendingAbsenceForm) return true;
    }

    return false;
  });
}

/**
 * Xác định khoảng thời gian thiếu chấm công
 */
export function getMissingTimeRanges(
  calendarDay: TimesheetDay | null | undefined,
  workingTime: { workStart: string; workEnd: string } | null | undefined,
): Array<{ start: string; end: string }> {
  if (!calendarDay || !workingTime) return [];

  const workStart = workingTime.workStart || '08:30';
  const workEnd = workingTime.workEnd || '17:30';
  const ranges: Array<{ start: string; end: string }> = [];

  // Nếu không có timeIn và timeOut -> thiếu cả ngày
  if (!calendarDay.timeIn && !calendarDay.timeOut) {
    return [{ start: workStart, end: workEnd }];
  }

  // Nếu có timeIn nhưng không có timeOut -> thiếu từ timeIn đến workEnd
  if (calendarDay.timeIn && !calendarDay.timeOut) {
    ranges.push({ start: calendarDay.timeIn, end: workEnd });
  }

  // Nếu có timeOut nhưng không có timeIn -> thiếu từ workStart đến timeOut
  if (!calendarDay.timeIn && calendarDay.timeOut) {
    ranges.push({ start: workStart, end: calendarDay.timeOut });
  }

  // Nếu có cả timeIn và timeOut, kiểm tra khoảng trống
  if (calendarDay.timeIn && calendarDay.timeOut) {
    const timeInTime = dayjs(`2000-01-01 ${calendarDay.timeIn}`, 'YYYY-MM-DD HH:mm');
    const timeOutTime = dayjs(`2000-01-01 ${calendarDay.timeOut}`, 'YYYY-MM-DD HH:mm');
    const workStartTime = dayjs(`2000-01-01 ${workStart}`, 'YYYY-MM-DD HH:mm');
    const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');

    // Thiếu từ workStart đến timeIn (nếu timeIn > workStart)
    if (timeInTime.isAfter(workStartTime)) {
      ranges.push({ start: workStart, end: calendarDay.timeIn });
    }

    // Thiếu từ timeOut đến workEnd (nếu timeOut < workEnd)
    if (timeOutTime.isBefore(workEndTime)) {
      ranges.push({ start: calendarDay.timeOut, end: workEnd });
    }
  }

  return ranges;
}

/**
 * Tính số phút giữa hai thời gian
 */
export function calculateMinutes(timeStart: string, timeEnd: string): number | null {
  if (!timeStart || !timeEnd) return null;
  const start = dayjs(`2000-01-01 ${timeStart}`, 'YYYY-MM-DD HH:mm');
  const end = dayjs(`2000-01-01 ${timeEnd}`, 'YYYY-MM-DD HH:mm');
  if (!start.isValid() || !end.isValid()) return null;
  return end.diff(start, 'minute');
}
