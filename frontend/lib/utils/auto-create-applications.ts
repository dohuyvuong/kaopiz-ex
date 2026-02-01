import dayjs from 'dayjs';
import { TimesheetDay } from '@/lib/types/timesheet';

/** Thời gian nghỉ trưa (phút) — không tính vào thời gian làm việc khi kiểm tra đủ 8h */
const LUNCH_BREAK_MINUTES = 60;

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
 * Đếm số đơn vắng mặt trong tuần (từ calendarDays và mergedDays)
 */
function countAbsenceFormsInWeek(
  date: string,
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>,
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>,
): number {
  const selectedDate = dayjs(date);
  const weekStart = selectedDate.startOf('week');
  const weekEnd = selectedDate.endOf('week');

  let count = 0;
  const processedDates = new Set<string>();

  calendarDays.forEach(({ date: dayDate, timesheet }) => {
    if (!timesheet) return;
    const day = dayjs(dayDate);
    if (day.isBefore(weekStart) || day.isAfter(weekEnd)) return;

    const dateStr = dayjs(dayDate).format('YYYY-MM-DD');
    if (processedDates.has(dateStr)) return;
    processedDates.add(dateStr);

    // Kiểm tra từ timesheet (approved forms)
    const hasApprovedAbsence = timesheet.approvedApplicationForms?.some(
      (form) =>
        form.typeId === 2 &&
        form.data?.trackingTimes?.some((tt) => tt.reasonId === 21),
    ) || false;

    if (hasApprovedAbsence) {
      count++;
      return;
    }

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
        if (hasPendingAbsence) {
          count++;
        }
      }
    }
  });

  return count;
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

  // 4. Bước 1: Kiểm tra đơn có thể được tạo (đã được lọc ở bước 2: violationsInWeek)

  // Bước 2: Tối đa 2 đơn vắng mặt (Thay đổi thời gian làm việc) mỗi tuần
  // Điều kiện: ngày đó làm đủ ít nhất 8 tiếng. Mỗi đơn thay đổi tối đa 1 tiếng (60 phút), ưu tiên càng nhiều càng tốt.
  const weekAbsenceCountMap = new Map<string, number>(); // key: ngày đầu tuần, value: số đơn đã tạo
  const absenceFormByDate = new Map<string, { late: number; early: number }>(); // key: date, value: số phút đã được cover bởi đơn vắng mặt
  const absenceFormTimeByDate = new Map<string, { timeStart: string; timeEnd: string; type: 'late' | 'early' }>(); // key: date, value: thời gian của đơn vắng mặt

  // Tạo tối đa 2 đơn vắng mặt mỗi tuần
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

    // Đếm số đơn vắng mặt hiện có + đã tạo trong tuần này
    const existingAbsenceCount = countAbsenceFormsInWeek(violation.date, calendarDays, mergedDays);
    const createdAbsenceCount = weekAbsenceCountMap.get(weekKey) || 0;
    const totalAbsenceCount = existingAbsenceCount + createdAbsenceCount;

    // Tận dụng đơn vắng mặt nếu chưa đủ 2 đơn trong tuần
    if (totalAbsenceCount < 2) {
      // Ưu tiên tạo đơn vắng mặt cho phần vi phạm lớn nhất (đi muộn hoặc về sớm)
      // Nhưng đơn vắng mặt do đi muộn cần điều kiện: phải về muộn ít nhất bằng số phút đi muộn (làm việc đủ ít nhất 8 tiếng)

      let canCreateAbsenceForLate = false;
      let canCreateAbsenceForEarly = false;
      let lateMinutesToCover = 0;
      let earlyMinutesToCover = 0;

      // Điều kiện tạo đơn vắng mặt (Thay đổi thời gian làm việc): ngày đó phải làm đủ ít nhất 8 tiếng (tính theo thời gian hiệu quả).
      // Thời gian hiệu quả = timeOut - timeIn - nghỉ trưa 1h - phút về sớm (nghỉ trưa không tính vào giờ làm).
      const requiredWorkMinutes = 8 * 60; // 8 tiếng = 480 phút
      let effectiveWorkMinutes = 0;
      if (violation.timeIn && violation.timeOut) {
        const timeInTime = dayjs(`2000-01-01 ${violation.timeIn}`, 'YYYY-MM-DD HH:mm');
        const timeOutTime = dayjs(`2000-01-01 ${violation.timeOut}`, 'YYYY-MM-DD HH:mm');
        const rawMinutes = timeOutTime.diff(timeInTime, 'minute');
        effectiveWorkMinutes =
          rawMinutes - LUNCH_BREAK_MINUTES - (violation.minutesEarly || 0);
      }

      // Kiểm tra điều kiện tạo đơn vắng mặt do đi muộn: thời gian hiệu quả >= 8h HOẶC về muộn bù giờ
      if (violation.minutesLate > 0 && violation.timeIn && violation.timeOut) {
        const timeOutTime = dayjs(`2000-01-01 ${violation.timeOut}`, 'YYYY-MM-DD HH:mm');
        const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');
        const minutesLateAfterWorkEnd = timeOutTime.diff(workEndTime, 'minute');
        const hasEnoughEffectiveWork =
          effectiveWorkMinutes >= requiredWorkMinutes ||
          minutesLateAfterWorkEnd >= violation.minutesLate;
        if (hasEnoughEffectiveWork) {
          canCreateAbsenceForLate = true;
          lateMinutesToCover = Math.min(violation.minutesLate, 60);
        }
      }

      // Kiểm tra điều kiện tạo đơn vắng mặt do về sớm: thời gian hiệu quả >= 8h (trừ phần về sớm rồi mới so)
      if (violation.minutesEarly > 0 && violation.timeIn && violation.timeOut) {
        if (effectiveWorkMinutes >= requiredWorkMinutes) {
          canCreateAbsenceForEarly = true;
          earlyMinutesToCover = Math.min(violation.minutesEarly, 60);
        }
      }

      // Ưu tiên đơn đi muộn, nếu không thỏa mới tạo đơn về sớm. Một tuần tối đa 2 đơn vắng mặt loại thay đổi thời gian làm việc.
      if (canCreateAbsenceForLate) {
        // Tạo đơn vắng mặt do đi muộn (ưu tiên)
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
          minutes: lateMinutesToCover,
          description: `Đi muộn ${violation.minutesLate} phút`,
        });

        weekAbsenceCountMap.set(weekKey, createdAbsenceCount + 1);
        absenceFormByDate.set(violation.date, { late: lateMinutesToCover, early: 0 });
        absenceFormTimeByDate.set(violation.date, {
          timeStart: workStart,
          timeEnd: finalEndTime.format('HH:mm'),
          type: 'late',
        });
        continue;
      } else if (canCreateAbsenceForEarly) {
        // Chỉ có thể tạo đơn vắng mặt do về sớm
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
          minutes: earlyMinutesToCover,
          description: `Về sớm ${violation.minutesEarly} phút`,
        });

        weekAbsenceCountMap.set(weekKey, createdAbsenceCount + 1);
        absenceFormByDate.set(violation.date, { late: 0, early: earlyMinutesToCover });
        absenceFormTimeByDate.set(violation.date, {
          timeStart: finalStartTime.format('HH:mm'),
          timeEnd: workEnd,
          type: 'early',
        });
        continue;
      }
    }
  }

  // Bước 3: Tính số phút cần làm đơn (chỉ phần vượt quá 90 phút, sau khi đã trừ đơn vắng mặt)
  // Logic: Tận dụng tối đa 90 phút đi muộn/về sớm không cần làm đơn
  const absenceMinutes = applications.reduce((sum, app) => {
    return app.typeId === 2 ? sum + app.minutes : sum;
  }, 0);

  // Tính số phút cần làm đơn nghỉ phép: tổng - 90 phút (miễn phạt) - đơn vắng mặt đã tạo
  let remainingMinutes = 0;
  if (totalMinutes > maxTotalMinutes) {
    remainingMinutes = totalMinutes - maxTotalMinutes - absenceMinutes;
    remainingMinutes = Math.max(0, remainingMinutes);
  }

  // Bước 4: Làm đơn xin nghỉ phép năm cho phần còn lại
  // violationsInWeek đã được sắp xếp ở bước 3, không cần sắp xếp lại
  for (const violation of violationsInWeek) {
    if (remainingMinutes <= 0) break;

    // Kiểm tra đã có đơn cho ngày này chưa (nhưng cho phép tạo đơn nghỉ phép cho phần còn lại sau đơn vắng mặt)
    const dayTimesheet = calendarDays.find(
      (d) => dayjs(d.date).format('YYYY-MM-DD') === violation.date,
    )?.timesheet;

    // Kiểm tra xem có đơn vắng mặt cho ngày này không
    const absenceCoveredCheck = absenceFormByDate.get(violation.date) || { late: 0, early: 0 };
    const hasAbsenceForm = absenceCoveredCheck.late > 0 || absenceCoveredCheck.early > 0;

    // Nếu không có đơn vắng mặt và đã có đơn khác, bỏ qua
    if (!hasAbsenceForm && hasApplicationForDate(violation.date, dayTimesheet || null, mergedDays)) {
      continue; // Đã có đơn cho ngày này (không phải đơn vắng mặt), bỏ qua
    }

    // Tính số phút còn lại của ngày này sau khi trừ đi phần đã được cover bởi đơn vắng mặt
    const absenceCovered = absenceFormByDate.get(violation.date) || { late: 0, early: 0 };
    const remainingLate = Math.max(0, violation.minutesLate - absenceCovered.late);
    const remainingEarly = Math.max(0, violation.minutesEarly - absenceCovered.early);
    const remainingTotal = remainingLate + remainingEarly;

    if (remainingTotal <= 0) continue; // Đã được cover hết bởi đơn vắng mặt

    // Tính số phút cần làm đơn nghỉ phép cho ngày này (không vượt quá remainingMinutes)
    const minutesToCover = Math.min(remainingTotal, remainingMinutes);

    // Nếu có chấm công, chỉ tạo đơn cho phần thiếu
    if (violation.timeIn && violation.timeOut) {
      // Có chấm công -> tạo đơn cho khoảng thiếu
      if (remainingLate > 0 && remainingMinutes > 0) {
        // Thiếu từ workStart đến timeIn (sau khi trừ đi phần đã được cover bởi đơn vắng mặt)
        const workStartTime = dayjs(`2000-01-01 ${workStart}`, 'YYYY-MM-DD HH:mm');
        const timeInTime = dayjs(`2000-01-01 ${violation.timeIn}`, 'YYYY-MM-DD HH:mm');
        const minutesLate = Math.min(remainingLate, remainingMinutes);

        // Tính timeStart: bắt đầu từ thời điểm kết thúc của đơn vắng mặt (nếu có)
        const absenceEndTime = absenceCovered.late > 0
          ? workStartTime.add(absenceCovered.late, 'minute')
          : workStartTime;
        const actualEndTime = absenceEndTime.add(minutesLate, 'minute');
        // Không được vượt quá timeIn
        const finalEndTime = actualEndTime.isBefore(timeInTime) ? actualEndTime : timeInTime;

        applications.push({
          date: violation.date,
          typeId: 1,
          reasonId: 4,
          timeStart: absenceEndTime.format('HH:mm'),
          timeEnd: finalEndTime.format('HH:mm'),
          minutes: minutesLate,
          description: `Nghỉ phép (đi muộn ${violation.minutesLate} phút)`,
        });

        remainingMinutes -= minutesLate;
      }

      if (remainingEarly > 0 && remainingMinutes > 0) {
        // Thiếu từ timeOut đến workEnd (sau khi trừ đi phần đã được cover bởi đơn vắng mặt)
        const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');
        const timeOutTime = dayjs(`2000-01-01 ${violation.timeOut}`, 'YYYY-MM-DD HH:mm');
        const minutesEarly = Math.min(remainingEarly, remainingMinutes);

        // Kiểm tra xem có đơn vắng mặt cho ngày này không
        const absenceFormTime = absenceFormTimeByDate.get(violation.date);
        let finalStartTime: dayjs.Dayjs;
        let finalEndTime: dayjs.Dayjs;

        if (absenceFormTime && absenceFormTime.type === 'early') {
          // Có đơn vắng mặt về sớm, đơn nghỉ phép nên cover từ timeOut đến thời điểm bắt đầu của đơn vắng mặt
          const absenceStartTime = dayjs(`2000-01-01 ${absenceFormTime.timeStart}`, 'YYYY-MM-DD HH:mm');
          // Đơn nghỉ phép cover từ timeOut đến absenceStartTime
          finalStartTime = timeOutTime;
          finalEndTime = absenceStartTime;

          // Đảm bảo không vượt quá số phút cần cover
          const actualMinutes = finalEndTime.diff(finalStartTime, 'minute');
          if (actualMinutes > minutesEarly) {
            finalEndTime = finalStartTime.add(minutesEarly, 'minute');
          }
        } else {
          // Không có đơn vắng mặt về sớm, tính bình thường
          const actualStartTime = workEndTime.subtract(minutesEarly, 'minute');
          finalStartTime = actualStartTime.isAfter(timeOutTime) ? actualStartTime : timeOutTime;
          finalEndTime = workEndTime;
        }

        applications.push({
          date: violation.date,
          typeId: 1,
          reasonId: 4,
          timeStart: finalStartTime.format('HH:mm'),
          timeEnd: finalEndTime.format('HH:mm'),
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
