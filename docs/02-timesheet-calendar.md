# Timesheet Calendar

## Tổng quan

Timesheet Calendar là module hiển thị lịch chấm công theo tháng, cho phép người dùng xem thông tin chấm công, đi muộn/về sớm, và các đơn từ đã được approve cho từng ngày.

## Component Structure

### Main Component

**File**: `frontend/components/timesheet/TimesheetPageContent.tsx`

Component này là container chính, quản lý:
- Calendar view
- Day detail view
- Auto-create applications dialog

**Code reference**: `frontend/components/timesheet/TimesheetPageContent.tsx:9-148`

### Calendar Component

**File**: `frontend/components/timesheet/TimesheetCalendar.tsx`

Hiển thị calendar grid với các ngày trong tháng.

### Day Cell Component

**File**: `frontend/components/timesheet/TimesheetDayCell.tsx`

Hiển thị thông tin cho một ngày cụ thể trong calendar.

## Custom Hook: useTimesheetCalendar

**File**: `frontend/hooks/use-timesheet-calendar.ts`

Hook này quản lý toàn bộ logic của calendar:

### State Management

#### Calendar State

```typescript
const [calendar, setCalendar] = useState<{
  timelines: TimesheetDay[];
  workingTime: { workStart: string; workEnd: string; timezone: string; timezoneValue: string };
  summary: { minutesLate: number; minutesEarly: number };
  userId?: number;
} | null>(null);
```

- `timelines`: Danh sách các ngày trong tháng với thông tin chấm công
- `workingTime`: Thời gian làm việc (workStart, workEnd, timezone)
- `summary`: Tổng hợp đi muộn/về sớm của tháng
- `userId`: ID của user

Code reference: `frontend/hooks/use-timesheet-calendar.ts:78-83`

#### Loading & Error State

```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### View State

```typescript
const [viewDate, setViewDate] = useState(new Date());
```

`viewDate` quyết định tháng/năm hiển thị trên calendar.

#### Selection State

```typescript
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [selectedDay, setSelectedDay] = useState<TimesheetDay | null>(null);
```

- `selectedDate`: Ngày được chọn (format: "YYYY-MM-DD")
- `selectedDay`: Thông tin chấm công của ngày được chọn

#### Merged State

```typescript
const [mergedDays, setMergedDays] = useState<Map<string, TimesheetDay & { hasPendingForms?: boolean }>>(new Map());
const [dayDetailLoadingDates, setDayDetailLoadingDates] = useState<Set<string>>(new Set());
const [summary, setSummary] = useState<{
  timelines: TimesheetDay[];
  summary: { minutesLate: number; minutesEarly: number };
} | null>(null);
```

- `mergedDays`: Map chứa các ngày đã được merge với pending forms
- `dayDetailLoadingDates`: Set các ngày đang được fetch detail
- `summary`: Summary data từ calendar response

Code reference: `frontend/hooks/use-timesheet-calendar.ts:65-72`

### Data Fetching

#### Fetch Calendar Data

**Function**: `onReload`

**API**: `GET /timesheet/calendar?monthYear=MM-YYYY`

**Logic**:

1. Kiểm tra HRM token
2. Gọi API với `monthYear` format "MM-YYYY"
3. Lưu response vào `calendar` state
4. Update `summary` và `viewMonthYear`
5. Reset `mergedDays` và `dayDetailLoadingDates`
6. Update `selectedDay` nếu có `selectedDate`

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:106-153`

```typescript
const onReload = async () => {
  if (!hrmToken) {
    setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    setError(null);
    const response = await timesheetApi.getCalendar(hrmToken, monthYear);
    const newCalendar = {
      timelines: response.timelines,
      workingTime: {
        workStart: response.workingTime.workStart,
        workEnd: response.workingTime.workEnd,
        timezone: response.workingTime.timezone,
        timezoneValue: response.workingTime.timezoneValue,
      },
      summary: response.summary,
      userId: response.userId,
    };
    setCalendar(newCalendar);
    handleCalendarLoad(
      {
        timelines: response.timelines,
        summary: response.summary,
      },
      monthYear,
    );
    // Update selectedDay nếu có selectedDate
    if (selectedDate) {
      const day = response.timelines.find((t) => {
        if (!t.date) return false;
        const timesheetDate = dayjs(t.date).format('YYYY-MM-DD');
        return timesheetDate === selectedDate;
      });
      if (day) {
        setSelectedDay(day);
      }
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
  } finally {
    setIsLoading(false);
  }
};
```

#### Auto-fetch Calendar khi monthYear thay đổi

**useEffect**: Tự động fetch calendar khi `monthYear` hoặc `hrmToken` thay đổi

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:156-164`

```typescript
useEffect(() => {
  if (!hrmToken) {
    setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập trước.');
    setIsLoading(false);
    return;
  }

  onReload();
}, [hrmToken, monthYear]);
```

### Calendar Grid Generation

#### Tính toán các giá trị cần thiết

```typescript
const month = viewDate.getMonth() + 1;
const year = viewDate.getFullYear();
const monthYear = `${month.toString().padStart(2, '0')}-${year}`;
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:86-88`

#### Tạo calendar days array

Logic tạo calendar grid:

1. Tính ngày đầu tháng và ngày cuối tháng
2. Tính weekday của ngày đầu tháng (0 = Chủ nhật, 1 = Thứ 2, ...)
3. Thêm các ngày trống ở đầu tháng (từ tháng trước)
4. Thêm các ngày trong tháng
5. Thêm các ngày trống ở cuối tháng để đủ 6 tuần (42 ngày)

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:184-214`

```typescript
const firstDayOfMonth = dayjs(new Date(year, month - 1, 1));
const lastDayOfMonth = dayjs(new Date(year, month, 0));
const firstDayWeekday = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1;
const daysInMonth = lastDayOfMonth.date();

const calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }> = [];

// Thêm các ngày trống ở đầu tháng
for (let i = 0; i < firstDayWeekday; i++) {
  const date = firstDayOfMonth.subtract(firstDayWeekday - i, 'day').toDate();
  calendarDays.push({ date, timesheet: null });
}

// Thêm các ngày trong tháng
for (let day = 1; day <= daysInMonth; day++) {
  const date = dayjs(new Date(year, month - 1, day)).toDate();
  const timesheet = calendar?.timelines.find((t) => {
    if (!t.date) return false;
    const timesheetDate = dayjs(t.date);
    const currentDate = dayjs(date);
    return timesheetDate.isSame(currentDate, 'day');
  }) || null;
  calendarDays.push({ date, timesheet });
}

// Thêm các ngày trống ở cuối tháng để đủ 6 tuần (42 ngày)
const remainingDays = 42 - calendarDays.length;
for (let day = 1; day <= remainingDays; day++) {
  const date = dayjs(new Date(year, month - 1, daysInMonth)).add(day, 'day').toDate();
  calendarDays.push({ date, timesheet: null });
}
```

### Navigation

#### Previous Month

```typescript
const onPreviousMonth = () => {
  setViewDate(new Date(year, month - 2, 1));
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:167-169`

#### Next Month

```typescript
const onNextMonth = () => {
  setViewDate(new Date(year, month, 1));
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:171-173`

#### Today

```typescript
const onToday = () => {
  setViewDate(new Date());
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:175-177`

#### Month/Year Change

```typescript
const onMonthYearChange = (newMonth: number, newYear: number) => {
  setViewDate(new Date(newYear, newMonth - 1, 1));
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:179-181`

### Day Selection

#### onDayClick

```typescript
const onDayClick = (date: string, day?: TimesheetDay) => {
  setSelectedDate(date);
  setSelectedDay(day || null);
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:365-368`

#### onCloseDetail

```typescript
const onCloseDetail = () => {
  setSelectedDate(null);
  setSelectedDay(null);
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:370-373`

### Auto-fetch Day Details

#### Logic tự động fetch day details

**useEffect**: Tự động fetch day details cho các ngày cần thiết

**Điều kiện fetch**:

1. Chỉ fetch cho tháng hiện tại hoặc tháng trước
2. Chỉ fetch cho ngày làm việc (`work === '1'`)
3. Chỉ fetch nếu:
   - Thiếu check-in hoặc check-out HOẶC
   - Có đi muộn/về sớm (`minutesLate > 0 || minutesEarly > 0`)
4. Chỉ fetch nếu chưa có đơn đã approve

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:251-353`

```typescript
useEffect(() => {
  if (!hrmToken || !summary || !viewMonthYear) return;

  // Kiểm tra xem tháng hiện tại có phải tháng hiện tại hoặc tháng trước không
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [month, year] = viewMonthYear.split('-').map(Number);
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const isCurrentOrPreviousMonth =
    (month === currentMonth && year === currentYear) ||
    (month === previousMonth && year === previousYear);

  if (!isCurrentOrPreviousMonth) return;

  // Tìm các ngày cần fetch detail
  const daysToFetch: Array<{ date: string; timesheet: TimesheetDay }> = [];

  summary.timelines.forEach((timesheet) => {
    if (!timesheet.date) return;

    const isWorkingDay = timesheet.work === '1';
    const missingCheckInOut = !timesheet.timeIn || !timesheet.timeOut;
    const hasViolation = timesheet.minutesLate > 0 || timesheet.minutesEarly > 0;
    const hasNoApprovedForms = !timesheet.approvedApplicationForms || timesheet.approvedApplicationForms.length === 0;

    if (isWorkingDay && (missingCheckInOut || hasViolation) && hasNoApprovedForms) {
      daysToFetch.push({ date: timesheet.date, timesheet });
    }
  });

  // Fetch tất cả day details
  const fetchPromises = daysToFetch.map(({ date, timesheet }) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');

    // Đã có merged thì không fetch lại
    if (mergedDays.has(dateStr)) {
      return Promise.resolve(null);
    }

    // Đánh dấu đang loading
    setDayDetailLoadingDates((prev) => new Set(prev).add(dateStr));

    return timesheetApi
      .getDayDetail(hrmToken, dateStr)
      .then((response: TimesheetDayDetailResponse) => {
        // Kiểm tra xem có đơn chưa approve không (status !== 3)
        const pendingForms = response.applicationForms.filter(
          (form) => form.status !== 3 && (form.typeId === 1 || form.typeId === 2),
        );

        if (pendingForms.length > 0) {
          // Merge đơn chưa approve vào timeline
          const mergedDay: TimesheetDay & { hasPendingForms?: boolean } = {
            ...timesheet,
            approvedApplicationForms: [
              ...(timesheet.approvedApplicationForms || []),
              ...pendingForms.map((form) => ({
                id: form.id,
                userId: 0,
                typeId: form.typeId,
                startDate: form.startDate,
                endDate: form.endDate,
                data: form.data,
                createdAt: null,
                user: undefined,
              })),
            ],
            hasPendingForms: true,
          };

          setMergedDays((prev) => {
            const newMap = new Map(prev);
            newMap.set(dateStr, mergedDay);
            return newMap;
          });
        }

        return null;
      })
      .catch(() => {
        // Ignore errors khi fetch day detail
        return null;
      })
      .finally(() => {
        // Bỏ đánh dấu loading
        setDayDetailLoadingDates((prev) => {
          const newSet = new Set(prev);
          newSet.delete(dateStr);
          return newSet;
        });
      });
  });

  // Chờ tất cả promises hoàn thành
  Promise.all(fetchPromises);
}, [hrmToken, summary, viewMonthYear]);
```

### Data Merging

#### Merge Pending Forms vào Calendar

Khi fetch day detail, nếu có pending forms (status !== 3), merge vào `mergedDays`:

1. Lọc pending forms (typeId === 1 hoặc 2, status !== 3)
2. Convert sang format `ApplicationForm` (giống approved forms)
3. Merge vào `approvedApplicationForms` của day
4. Đánh dấu `hasPendingForms: true`
5. Lưu vào `mergedDays` Map

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:304-332`

### Estimated Summary

#### Tính toán estimated summary

**useMemo**: Tính toán summary sau khi các đơn pending được approve

**Logic**:

1. Lấy summary hiện tại
2. Trừ đi `minutesLate` và `minutesEarly` của các ngày có pending forms

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:228-248`

```typescript
const estimatedSummary = useMemo(() => {
  if (!summary) return null;

  let totalMinutesLate = summary.summary.minutesLate;
  let totalMinutesEarly = summary.summary.minutesEarly;

  // Tính toán lại dựa trên các ngày có đơn chưa approve
  mergedDays.forEach((day) => {
    if (day.hasPendingForms) {
      // Nếu có đơn chưa approve, trừ đi muộn/về sớm của ngày đó khỏi tổng
      // (vì nếu đơn được approve thì sẽ không bị tính phạt)
      totalMinutesLate = Math.max(0, totalMinutesLate - day.minutesLate);
      totalMinutesEarly = Math.max(0, totalMinutesEarly - day.minutesEarly);
    }
  });

  return {
    minutesLate: totalMinutesLate,
    minutesEarly: totalMinutesEarly,
  };
}, [summary, mergedDays]);
```

### Helper Functions

#### formatMonthYear

```typescript
const formatMonthYear = (date: Date) => {
  return dayjs(date).format('MMMM YYYY');
};
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:217-219`

#### monthOptions, yearOptions, weekDayLabels

```typescript
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
```

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:222-225`

## API Integration

### GET /timesheet/calendar

**Endpoint**: `GET /timesheet/calendar?monthYear=MM-YYYY`

**Headers**:
```
Authorization: Bearer <hrm_token>
```

**Response**:

```typescript
interface TimesheetCalendarResponse {
  timelines: TimesheetDay[];
  workingTime: {
    workStart: string; // "08:30"
    workEnd: string; // "17:30"
    timezone: string;
    timezoneValue: string;
  };
  summary: {
    minutesLate: number;
    minutesEarly: number;
  };
  userId?: number;
}
```

**Code reference**: `frontend/lib/api/timesheet.ts:12-37`

## Data Flow

```
User Action → Hook Handler → API Call →
Update State → Re-render Components →
Display Updated Data
```

### Example: Change Month

1. User click "Previous Month" button
2. `onPreviousMonth()` được gọi
3. `setViewDate(new Date(year, month - 2, 1))` update `viewDate`
4. `monthYear` được tính lại từ `viewDate`
5. `useEffect` detect `monthYear` thay đổi
6. `onReload()` được gọi
7. API call `GET /timesheet/calendar?monthYear=...`
8. Response được lưu vào `calendar` state
9. `calendarDays` được tính lại
10. Calendar component re-render với data mới

## Loading States

### Calendar Loading

- `isLoading`: Đang fetch calendar data
- Disable navigation buttons khi loading
- Hiển thị loading indicator

### Day Detail Loading

- `dayDetailLoadingDates`: Set các ngày đang fetch detail
- Disable click vào day cell khi đang loading
- Hiển thị visual feedback (opacity, cursor)

**Code reference**: `frontend/components/timesheet/TimesheetDayCell.tsx` (check `isLoading` prop)

## Error Handling

### API Errors

- Catch errors trong `onReload()`
- Set error message vào `error` state
- Hiển thị error message trong UI

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:148-150`

### Day Detail Fetch Errors

- Ignore errors khi fetch day detail (không block UI)
- Log errors để debug

**Code reference**: `frontend/hooks/use-timesheet-calendar.ts:337-340`

## Performance Considerations

1. **Auto-fetch Day Details**: Chỉ fetch cho tháng hiện tại và tháng trước
2. **Caching**: `mergedDays` Map cache các ngày đã fetch
3. **Parallel Fetching**: Fetch tất cả day details song song với `Promise.all`
4. **Conditional Fetching**: Chỉ fetch khi thỏa điều kiện (working day, missing check-in/out, etc.)
