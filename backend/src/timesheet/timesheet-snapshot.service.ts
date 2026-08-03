import { Injectable, Logger } from '@nestjs/common';
import {
  buildRules,
  CalendarDay,
  createDayFromDetail,
  LateEarly,
  mergeDayDetailForms,
  normalizeCalendarDay,
  TimesheetRules,
  workWeekDates,
} from '@kaopiz/timesheet';
import { TimesheetService } from './timesheet.service';
import { ApplicationService } from '../application/application.service';

export interface TimesheetSnapshot {
  monthYear: string;
  days: CalendarDay[];
  rules: TimesheetRules;
  actualTotal: LateEarly;
}

/** Loại đơn màn chấm công quan tâm: nghỉ, vắng mặt, checkin/out. */
const REASON_TYPE_IDS = [1, 2, 4];

/**
 * Dựng dữ liệu đầu vào cho `@kaopiz/timesheet` từ các API HRM.
 *
 * Đây là bản song song phía server của phần tải dữ liệu trong
 * `frontend/hooks/use-timesheet-calendar.ts`. Chỉ phần TẢI là trùng lặp — toàn
 * bộ phần TÍNH TOÁN nằm chung ở `@kaopiz/timesheet`, nên hai bên không thể ra
 * kết quả khác nhau.
 */
@Injectable()
export class TimesheetSnapshotService {
  private readonly logger = new Logger(TimesheetSnapshotService.name);

  constructor(
    private readonly timesheetService: TimesheetService,
    private readonly applicationService: ApplicationService,
  ) {}

  async build(token: string, monthYear: string): Promise<TimesheetSnapshot> {
    const calendar = await this.timesheetService.getCalendar(token, monthYear);
    const reasons = await this.loadReasons(token);

    const days = (calendar.timelines ?? [])
      .map((timeline) => normalizeCalendarDay(timeline))
      .filter((day): day is CalendarDay => day !== null);

    // Đơn CHỜ DUYỆT chỉ có ở day-detail; calendar chỉ trả đơn đã duyệt. Không
    // gộp vào thì cron sẽ đề xuất lại đúng những đơn người dùng vừa tạo.
    const enriched = await Promise.all(
      days.map((day) => this.withPendingForms(token, day)),
    );

    const boundary = await this.loadBoundaryWeekDays(token, days);

    return {
      monthYear,
      days: [...enriched, ...boundary],
      rules: buildRules({
        workingTime: calendar.workingTime,
        reasons,
        maxDaysAfterByType: (calendar.applicationFormConfig?.types ?? []).map(
          (type) => ({
            typeId: type.typeId,
            maxDaysAfter: type.maxDaysAfter,
          }),
        ),
      }),
      actualTotal: {
        minutesLate: calendar.summary?.minutesLate ?? 0,
        minutesEarly: calendar.summary?.minutesEarly ?? 0,
      },
    };
  }

  /**
   * Các ngày thuộc tháng khác nhưng cùng TUẦN với đầu hoặc cuối tháng này.
   *
   * Quota đơn tính theo tuần (thứ Hai → Chủ nhật), trong khi API calendar chỉ
   * trả các ngày trong tháng. Bỏ qua bước này thì tuần vắt qua hai tháng bị đếm
   * thiếu và cron đề xuất vượt mức HRM cho phép.
   *
   * Các ngày này chỉ dùng để đếm quota — `createDayFromDetail` đặt `work: 'N'`
   * nên chúng không bao giờ được chọn làm ngày tạo đơn.
   */
  private async loadBoundaryWeekDays(
    token: string,
    days: CalendarDay[],
  ): Promise<CalendarDay[]> {
    if (days.length === 0) return [];

    const monthDates = new Set(days.map((day) => day.date));
    const first = days[0].date;
    const last = days[days.length - 1].date;
    const outside = [
      ...new Set([...workWeekDates(first), ...workWeekDates(last)]),
    ].filter((date) => !monthDates.has(date));

    const loaded = await Promise.all(
      outside.map(async (date) => {
        try {
          const detail = await this.timesheetService.getDayDetail(token, date);
          return createDayFromDetail(date, detail.applicationForms ?? []);
        } catch (error) {
          this.logger.warn(
            `Không lấy được chi tiết ngày ${date} (tuần vắt tháng): ${String(error)}`,
          );
          return null;
        }
      }),
    );

    return loaded.filter((day): day is CalendarDay => day !== null);
  }

  /** Chỉ gọi day-detail cho ngày thực sự có khả năng đang có đơn chờ duyệt. */
  private async withPendingForms(
    token: string,
    day: CalendarDay,
  ): Promise<CalendarDay> {
    const needsDetail =
      day.work === '1' &&
      (day.actual.minutesLate > 0 ||
        day.actual.minutesEarly > 0 ||
        !day.timeIn ||
        !day.timeOut);
    if (!needsDetail) return day;

    try {
      const detail = await this.timesheetService.getDayDetail(token, day.date);
      return mergeDayDetailForms(day, detail.applicationForms ?? []);
    } catch (error) {
      // Thiếu chi tiết một ngày chỉ làm ước tính thận trọng hơn, không sai lệch
      // theo hướng nguy hiểm — đề xuất thừa một đơn còn hơn bỏ sót cả tháng.
      this.logger.warn(
        `Không lấy được chi tiết ngày ${day.date}: ${String(error)}`,
      );
      return day;
    }
  }

  private async loadReasons(token: string) {
    const responses = await Promise.all(
      REASON_TYPE_IDS.map((typeId) =>
        this.applicationService
          .getReasons(token, typeId)
          .catch(() => ({ items: [] })),
      ),
    );
    return responses.flatMap((response) => response.items ?? []);
  }
}
