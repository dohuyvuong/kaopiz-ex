import { plainToInstance } from 'class-transformer';
import { TimesheetDayDetailResponseDto } from './timesheet-day-detail.dto';
import { TimesheetCalendarResponseDto } from './timesheet-calendar.dto';

/**
 * Chốt lại những field HRM trả về mà DTO từng làm rơi.
 *
 * Dữ liệu đầu vào lấy nguyên văn từ `fixtures/calendar/*.md` (response thật của
 * `owner-calendar-details?date=2026-04-16`), rút gọn còn phần liên quan.
 */
describe('DTO đơn từ giữ đủ dữ liệu HRM', () => {
  const rawDayDetail = {
    timeSheets: [
      { id: 3008335, time: '2026-04-16 08:45:17', machine_code: 'T4_aws_in' },
    ],
    application_forms: [
      {
        id: 102878,
        type_id: 4,
        project_id: null,
        start_date: '2026-04-16 00:00:00',
        end_date: '2026-04-16 00:00:00',
        status: 3,
        data: {
          tracking_times: [
            { date: '2026-04-16', time: '17:30', reason_id: 25 },
          ],
        },
        type: { id: 4, name: 'Đơn checkin/out' },
      },
      {
        id: 119164,
        type_id: 1,
        project_id: null,
        start_date: '2026-07-31 00:00:00',
        end_date: '2026-07-31 00:00:00',
        status: 1,
        data: {
          reason_id: 4,
          tracking_times: [
            {
              date_start: '2026-07-31',
              date_end: '2026-07-31',
              time_start: '15:55',
              time_end: '17:30',
              count_hour: 1.5833,
            },
          ],
        },
        type: { id: 1, name: 'Đơn xin nghỉ' },
      },
    ],
  };

  const transformDayDetail = () =>
    plainToInstance(TimesheetDayDetailResponseDto, rawDayDetail, {
      excludeExtraneousValues: true,
    });

  it('giữ mốc giờ `time` của đơn checkin/out', () => {
    // Trước đây bị rơi, nên client không thể biết đơn khai giờ nào.
    const [checkInOut] = transformDayDetail().applicationForms;
    expect(checkInOut.data.trackingTimes?.[0].time).toBe('17:30');
    expect(checkInOut.data.trackingTimes?.[0].reasonId).toBe(25);
  });

  it('giữ `reason_id` ở cấp đơn, nơi đơn xin nghỉ đặt lý do', () => {
    // Không có field này thì mọi rule theo lý do đều đếm sót.
    const [, leave] = transformDayDetail().applicationForms;
    expect(leave.data.reasonId).toBe(4);
  });

  it('giữ `date_start` / `date_end` của đơn nhiều ngày', () => {
    const [, leave] = transformDayDetail().applicationForms;
    const tracking = leave.data.trackingTimes?.[0];
    expect(tracking?.dateStart).toBe('2026-07-31');
    expect(tracking?.dateEnd).toBe('2026-07-31');
    expect(tracking?.countHour).toBeCloseTo(1.5833);
  });

  it('giữ `status` để phân biệt đã duyệt và chờ duyệt', () => {
    const forms = transformDayDetail().applicationForms;
    expect(forms.map((form) => form.status)).toEqual([3, 1]);
  });
});

describe('DTO calendar', () => {
  const rawCalendar = {
    user_id: 861,
    working_time: { work_start: '08:30', work_end: '17:30' },
    timelines: [
      {
        date: '2026-04-16 00:00:00',
        time_in: '08:45',
        time_out: '13:50',
        time_in_final: '08:30',
        time_out_final: '17:30',
        work: '1',
        minutes_late: 0,
        minutes_early: 0,
        approved_application_forms: [
          {
            id: 102878,
            user_id: 861,
            type_id: 4,
            data: {
              tracking_times: [
                { date: '2026-04-16', time: '17:30', reason_id: 25 },
              ],
            },
            user: {
              id: 861,
              email: 'vuongdh@kaopiz.com',
              application_form_config: {
                types: [
                  { type_id: 1, max_days_after: 6, max_days_before: 0 },
                  { type_id: 2, max_days_after: 6, max_days_before: 0 },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  const transform = (raw: unknown) =>
    plainToInstance(TimesheetCalendarResponseDto, raw, {
      excludeExtraneousValues: true,
    });

  it('giữ mốc giờ `time` trong trackingTimes (trước đây khai sai cấp)', () => {
    const day = transform(rawCalendar).timelines[0];
    const tracking = day.approvedApplicationForms[0].data.trackingTimes?.[0];
    expect(tracking?.time).toBe('17:30');
  });

  it('không trả object `user` khổng lồ kèm mỗi đơn', () => {
    const form =
      transform(rawCalendar).timelines[0].approvedApplicationForms[0];
    expect(form).not.toHaveProperty('user');
    expect(JSON.stringify(form)).not.toContain('vuongdh@kaopiz.com');
  });

  it('nhận `application_form_config` khi service nâng lên cấp response', () => {
    const withConfig = transform({
      ...rawCalendar,
      application_form_config:
        rawCalendar.timelines[0].approved_application_forms[0].user
          .application_form_config,
    });
    expect(withConfig.applicationFormConfig?.types).toEqual([
      { typeId: 1, maxDaysAfter: 6, maxDaysBefore: 0 },
      { typeId: 2, maxDaysAfter: 6, maxDaysBefore: 0 },
    ]);
  });
});
