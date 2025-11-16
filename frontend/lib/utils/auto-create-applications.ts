import dayjs from 'dayjs';
import { TimesheetDay } from '@/lib/types/timesheet';

export interface ApplicationToCreate {
  date: string; // Format: "YYYY-MM-DD"
  typeId: number; // 1 = Nghỉ phép, 2 = Vắng mặt
  reasonId: number; // 4 = Nghỉ phép năm, 21 = Thay đổi thời gian làm việc
  timeStart: string; // Format: "HH:mm"
  timeEnd: string; // Format: "HH:mm"
  minutes: number; // Số phút được giảm
  description: string; // Mô tả đơn
}

interface DayViolation {
  date: string;
  dateObj: Date;
  minutesLate: number;
  minutesEarly: number;
  totalMinutes: number;
  timeIn: string | null;
  timeOut: string | null;
  workStart: string | null;
  workEnd: string | null;
}

/**
 * Kiểm tra đã có đơn vắng mặt trong tuần chưa (từ calendarDays và mergedDays)
 */
function hasAbsenceFormInWeek(
  date: string,
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>,
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>,
): boolean {
  const selectedDate = dayjs(date);
  const weekStart = selectedDate.startOf('week');
  const weekEnd = selectedDate.endOf('week');

  return calendarDays.some(({ date: dayDate, timesheet }) => {
    if (!timesheet) return false;
    const day = dayjs(dayDate);
    if (day.isBefore(weekStart) || day.isAfter(weekEnd)) return false;

    const dateStr = dayjs(dayDate).format('YYYY-MM-DD');

    // Kiểm tra từ timesheet (approved forms)
    const hasApprovedAbsence = timesheet.approvedApplicationForms?.some(
      (form) =>
        form.typeId === 2 &&
        form.data?.trackingTimes?.some((tt) => tt.reasonId === 21),
    ) || false;

    if (hasApprovedAbsence) return true;

    // Kiểm tra từ mergedDays (pending forms)
    if (mergedDays) {
      const mergedDay = mergedDays.get(dateStr);
      if (mergedDay?.approvedApplicationForms) {
        const approvedFormIds = new Set(
          (timesheet.approvedApplicationForms || []).map((f) => f.id),
        );
        const hasPendingAbsence = mergedDay.approvedApplicationForms.some(
          (form) =>
            form.typeId === 2 &&
            form.data?.trackingTimes?.some((tt) => tt.reasonId === 21) &&
            !approvedFormIds.has(form.id), // Chỉ lấy pending forms
        );
        if (hasPendingAbsence) return true;
      }
    }

    return false;
  });
}

/**
 * Kiểm tra đã có đơn nào cho ngày đó chưa (từ timesheet và mergedDays)
 */
function hasApplicationForDate(
  date: string,
  timesheet: TimesheetDay | null,
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>,
): boolean {
  if (!timesheet) return false;

  // Kiểm tra từ timesheet (approved forms)
  const hasApproved = (timesheet.approvedApplicationForms &&
    timesheet.approvedApplicationForms.length > 0) || false;

  if (hasApproved) return true;

  // Kiểm tra từ mergedDays (pending forms)
  if (mergedDays) {
    const mergedDay = mergedDays.get(date);
    if (mergedDay?.hasPendingForms && mergedDay.approvedApplicationForms) {
      const approvedFormIds = new Set(
        (timesheet.approvedApplicationForms || []).map((f) => f.id),
      );
      const hasPending = mergedDay.approvedApplicationForms.some(
        (form) => !approvedFormIds.has(form.id), // Chỉ lấy pending forms
      );
      if (hasPending) return true;
    }
  }

  return false;
}

/**
 * Tính số phút đã được giảm từ các đơn (approved hoặc pending)
 */
export function calculateMinutesFromForms(
  forms: Array<{
    typeId: number;
    data?: {
      trackingTimes?: Array<{
        timeStart?: string;
        timeEnd?: string;
        date?: string;
        dateStart?: string;
        dateEnd?: string;
      }>;
    };
  }>,
): number {
  let totalMinutes = 0;

  for (const form of forms) {
    if (!form.data?.trackingTimes) continue;

    for (const trackingTime of form.data.trackingTimes) {
      if (form.typeId === 2) {
        // Đơn vắng mặt: tính từ timeStart đến timeEnd
        if (trackingTime.timeStart && trackingTime.timeEnd) {
          const start = dayjs(`2000-01-01 ${trackingTime.timeStart}`, 'YYYY-MM-DD HH:mm');
          const end = dayjs(`2000-01-01 ${trackingTime.timeEnd}`, 'YYYY-MM-DD HH:mm');
          if (start.isValid() && end.isValid()) {
            totalMinutes += end.diff(start, 'minute');
          }
        }
      } else if (form.typeId === 1) {
        // Đơn nghỉ phép: tính từ timeStart đến timeEnd
        if (trackingTime.timeStart && trackingTime.timeEnd) {
          const start = dayjs(`2000-01-01 ${trackingTime.timeStart}`, 'YYYY-MM-DD HH:mm');
          const end = dayjs(`2000-01-01 ${trackingTime.timeEnd}`, 'YYYY-MM-DD HH:mm');
          if (start.isValid() && end.isValid()) {
            totalMinutes += end.diff(start, 'minute');
          }
        }
      }
    }
  }

  return totalMinutes;
}

/**
 * Tính toán các đơn cần tạo để giảm tổng đi muộn/về sớm xuống ≤ 90 phút
 * Logic: Chỉ tạo đơn cho phần vượt quá 90 phút (miễn phạt), ưu tiên để 90 phút đầu không cần làm đơn
 * Tính cả các đơn đang chờ duyệt (pending) như thể chúng đã được approve
 */
export function calculateApplicationsToCreate(
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>,
  workingTime: { workStart: string; workEnd: string },
  maxTotalMinutes: number = 90,
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>,
): ApplicationToCreate[] {
  const applications: ApplicationToCreate[] = [];
  const today = dayjs();
  const workStart = workingTime.workStart || '08:30';
  const workEnd = workingTime.workEnd || '17:30';

  // 1. Tính tổng minutesLate + minutesEarly hiện tại
  let totalMinutes = 0;
  const violations: DayViolation[] = [];
  let pendingMinutesReduced = 0; // Số phút đã được giảm từ các đơn pending

  calendarDays.forEach(({ date, timesheet }) => {
    if (!timesheet) return;

    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const dateObj = dayjs(date).toDate();
    const minutesLate = timesheet.minutesLate || 0;
    const minutesEarly = timesheet.minutesEarly || 0;
    const dayTotal = minutesLate + minutesEarly;

    // Tính số phút đã được giảm từ các đơn pending (nếu có)
    if (mergedDays) {
      const mergedDay = mergedDays.get(dateStr);
      if (mergedDay?.hasPendingForms && mergedDay.approvedApplicationForms) {
        // Lấy các đơn pending: tất cả đơn trong mergedDay trừ đi các đơn đã approved từ timesheet
        const approvedFormIds = new Set(
          (timesheet.approvedApplicationForms || []).map((f) => f.id),
        );
        const pendingForms = mergedDay.approvedApplicationForms.filter(
          (form) =>
            (form.typeId === 1 || form.typeId === 2) &&
            !approvedFormIds.has(form.id),
        );
        const dayPendingMinutes = calculateMinutesFromForms(pendingForms);
        pendingMinutesReduced += dayPendingMinutes;
      }
    }

    if (dayTotal > 0) {
      totalMinutes += dayTotal;
      violations.push({
        date: dateStr,
        dateObj,
        minutesLate,
        minutesEarly,
        totalMinutes: dayTotal,
        timeIn: timesheet.timeIn,
        timeOut: timesheet.timeOut,
        workStart: timesheet.workStart,
        workEnd: timesheet.workEnd,
      });
    }
  });

  // Trừ số phút đã được giảm từ các đơn pending
  // Coi như các đơn pending sẽ được approve, nên trừ khỏi tổng
  totalMinutes = Math.max(0, totalMinutes - pendingMinutesReduced);

  // 2. Lọc chỉ lấy các ngày trong vòng 1 tuần (theo yêu cầu)
  const violationsInWeek = violations.filter((v) => {
    const daysDiff = Math.abs(dayjs(v.date).diff(today, 'day'));
    return daysDiff <= 7;
  });

  // 3. Sắp xếp violations theo thứ tự ưu tiên:
  // - Ưu tiên ngày có vi phạm lớn nhất (để tận dụng đơn vắng mặt tối đa 60 phút)
  // - Ưu tiên ngày gần nhất
  violationsInWeek.sort((a, b) => {
    const aDaysDiff = Math.abs(dayjs(a.date).diff(today, 'day'));
    const bDaysDiff = Math.abs(dayjs(b.date).diff(today, 'day'));

    // Ưu tiên vi phạm lớn hơn
    if (a.totalMinutes !== b.totalMinutes) {
      return b.totalMinutes - a.totalMinutes;
    }

    // Cuối cùng, ưu tiên ngày gần hơn
    return aDaysDiff - bDaysDiff;
  });

  // 4. Tận dụng đơn vắng mặt (1 tuần 1 lần, tối đa 60 phút) ngay cả khi tổng chưa quá 90 phút
  // Vì đơn này không tốn phép năm, nên luôn nên tận dụng
  // Ưu tiên tạo cho ngày có vi phạm lớn nhất để tận dụng tối đa 60 phút
  const weekAbsenceMap = new Map<string, boolean>(); // key: ngày đầu tuần
  let remainingMinutes = totalMinutes > maxTotalMinutes ? totalMinutes - maxTotalMinutes : 0;

  // Luôn tạo đơn vắng mặt nếu có vi phạm trong tuần và chưa có đơn vắng mặt
  // Ưu tiên ngày có vi phạm lớn nhất (đã được sắp xếp ở trên)
  for (const violation of violationsInWeek) {
    const violationDate = dayjs(violation.date);
    const weekStart = violationDate.startOf('week');
    const weekKey = weekStart.format('YYYY-MM-DD');

    // Kiểm tra đã có đơn cho ngày này chưa
    const dayTimesheet = calendarDays.find(
      (d) => dayjs(d.date).format('YYYY-MM-DD') === violation.date,
    )?.timesheet;
    if (hasApplicationForDate(violation.date, dayTimesheet || null, mergedDays)) {
      continue; // Đã có đơn cho ngày này, bỏ qua
    }

    // Tận dụng đơn vắng mặt nếu chưa có trong tuần này
    if (
      !weekAbsenceMap.get(weekKey) &&
      !hasAbsenceFormInWeek(violation.date, calendarDays, mergedDays)
    ) {
      if (violation.minutesLate > 0 && violation.timeIn) {
        // Đi muộn: tạo đơn vắng mặt từ workStart đến timeIn (tối đa 60 phút)
        const minutesToCover = Math.min(violation.minutesLate, 60);
        const timeInTime = dayjs(`2000-01-01 ${violation.timeIn}`, 'YYYY-MM-DD HH:mm');
        const workStartTime = dayjs(`2000-01-01 ${workStart}`, 'YYYY-MM-DD HH:mm');
        const maxEndTime = workStartTime.add(60, 'minute');
        const finalEndTime = timeInTime.isBefore(maxEndTime) ? timeInTime : maxEndTime;

        applications.push({
          date: violation.date,
          typeId: 2,
          reasonId: 21,
          timeStart: workStart,
          timeEnd: finalEndTime.format('HH:mm'),
          minutes: minutesToCover,
          description: `Đi muộn ${violation.minutesLate} phút`,
        });

        weekAbsenceMap.set(weekKey, true);
        // Cập nhật remainingMinutes nếu tổng > 90 phút
        if (totalMinutes > maxTotalMinutes) {
          remainingMinutes = Math.max(0, remainingMinutes - minutesToCover);
        }
        continue;
      }

      if (violation.minutesEarly > 0 && violation.timeOut) {
        // Về sớm: tạo đơn vắng mặt từ timeOut đến workEnd (tối đa 60 phút)
        const minutesToCover = Math.min(violation.minutesEarly, 60);
        const timeOutTime = dayjs(`2000-01-01 ${violation.timeOut}`, 'YYYY-MM-DD HH:mm');
        const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');
        const minStartTime = workEndTime.subtract(60, 'minute');
        const finalStartTime = timeOutTime.isAfter(minStartTime) ? timeOutTime : minStartTime;

        applications.push({
          date: violation.date,
          typeId: 2,
          reasonId: 21,
          timeStart: finalStartTime.format('HH:mm'),
          timeEnd: workEnd,
          minutes: minutesToCover,
          description: `Về sớm ${violation.minutesEarly} phút`,
        });

        weekAbsenceMap.set(weekKey, true);
        // Cập nhật remainingMinutes nếu tổng > 90 phút
        if (totalMinutes > maxTotalMinutes) {
          remainingMinutes = Math.max(0, remainingMinutes - minutesToCover);
        }
        continue;
      }
    }
  }

  // 4. Nếu tổng đã ≤ maxTotalMinutes sau khi tận dụng đơn vắng mặt, không cần tạo thêm đơn nghỉ phép
  if (totalMinutes <= maxTotalMinutes && remainingMinutes <= 0) {
    return applications; // Trả về các đơn vắng mặt đã tạo
  }

  // 5. Tính số phút cần giảm thêm (chỉ phần vượt quá 90 phút, sau khi đã trừ đơn vắng mặt)
  if (totalMinutes > maxTotalMinutes) {
    remainingMinutes = totalMinutes - maxTotalMinutes;
    // Trừ đi các đơn vắng mặt đã tạo
    const absenceMinutes = applications.reduce((sum, app) => {
      return app.typeId === 2 ? sum + app.minutes : sum;
    }, 0);
    remainingMinutes = Math.max(0, remainingMinutes - absenceMinutes);
  } else {
    remainingMinutes = 0;
  }

  // 7. Tạo đơn nghỉ phép cho phần còn lại (nếu tổng > 90 phút)
  // violationsInWeek đã được sắp xếp ở bước 3, không cần sắp xếp lại
  for (const violation of violationsInWeek) {
    if (remainingMinutes <= 0) break;

    // Kiểm tra đã có đơn cho ngày này chưa
    const dayTimesheet = calendarDays.find(
      (d) => dayjs(d.date).format('YYYY-MM-DD') === violation.date,
    )?.timesheet;
    if (hasApplicationForDate(violation.date, dayTimesheet || null, mergedDays)) {
      continue; // Đã có đơn cho ngày này, bỏ qua
    }

    // Tạo đơn nghỉ phép cho phần còn lại
    const minutesToCover = Math.min(
      violation.totalMinutes,
      remainingMinutes,
    );

    // Nếu có chấm công, chỉ tạo đơn cho phần thiếu
    if (violation.timeIn && violation.timeOut) {
      // Có chấm công -> tạo đơn cho khoảng thiếu
      if (violation.minutesLate > 0 && remainingMinutes > 0) {
        // Thiếu từ workStart đến timeIn
        const workStartTime = dayjs(`2000-01-01 ${workStart}`, 'YYYY-MM-DD HH:mm');
        const timeInTime = dayjs(`2000-01-01 ${violation.timeIn}`, 'YYYY-MM-DD HH:mm');
        const minutesLate = Math.min(violation.minutesLate, remainingMinutes);

        // Tính timeEnd dựa trên số phút thực tế cần cover
        const actualEndTime = workStartTime.add(minutesLate, 'minute');
        // Không được vượt quá timeIn
        const finalEndTime = actualEndTime.isBefore(timeInTime) ? actualEndTime : timeInTime;

        applications.push({
          date: violation.date,
          typeId: 1,
          reasonId: 4,
          timeStart: workStart,
          timeEnd: finalEndTime.format('HH:mm'),
          minutes: minutesLate,
          description: `Nghỉ phép (đi muộn ${violation.minutesLate} phút)`,
        });

        remainingMinutes -= minutesLate;
      }

      if (violation.minutesEarly > 0 && remainingMinutes > 0) {
        // Thiếu từ timeOut đến workEnd
        const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');
        const timeOutTime = dayjs(`2000-01-01 ${violation.timeOut}`, 'YYYY-MM-DD HH:mm');
        const minutesEarly = Math.min(violation.minutesEarly, remainingMinutes);

        // Tính timeStart dựa trên số phút thực tế cần cover
        const actualStartTime = workEndTime.subtract(minutesEarly, 'minute');
        // Không được sớm hơn timeOut
        const finalStartTime = actualStartTime.isAfter(timeOutTime) ? actualStartTime : timeOutTime;

        applications.push({
          date: violation.date,
          typeId: 1,
          reasonId: 4,
          timeStart: finalStartTime.format('HH:mm'),
          timeEnd: workEnd,
          minutes: minutesEarly,
          description: `Nghỉ phép (về sớm ${violation.minutesEarly} phút)`,
        });

        remainingMinutes -= minutesEarly;
      }
    } else if (remainingMinutes > 0) {
      // Không có chấm công -> có thể làm đơn cả ngày
      applications.push({
        date: violation.date,
        typeId: 1,
        reasonId: 4,
        timeStart: workStart,
        timeEnd: workEnd,
        minutes: minutesToCover,
        description: `Nghỉ phép cả ngày`,
      });

      remainingMinutes -= minutesToCover;
    }
  }

  return applications;
}
