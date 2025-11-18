# Timesheet Day Detail

## Tổng quan

Timesheet Day Detail hiển thị thông tin chi tiết của một ngày chấm công cụ thể, bao gồm:
- Thông tin check-in/check-out
- Đi muộn/về sớm
- Tất cả các lần chấm công
- Work log (nếu có)
- Danh sách đơn từ (approved và pending)

## Component Structure

### Main Component

**File**: `frontend/components/timesheet/TimesheetDayDetail.tsx`

Component này sử dụng Sheet (side panel) để hiển thị chi tiết ngày.

**Props**:

```typescript
interface TimesheetDayDetailProps {
  date: string | null; // Format: "YYYY-MM-DD"
  data?: TimesheetDayDetailData;
  onClose: () => void;
  onApplicationFormCreated?: (date: string) => void;
  isLoadingCalendar?: boolean;
}
```

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:22-28`

### Custom Hook: useTimesheetDayDetail

**File**: `frontend/hooks/use-timesheet-day-detail.ts`

Hook này quản lý việc fetch và xử lý day detail data.

## Data Fetching

### API Call

**API**: `GET /timesheet/day-detail?date=YYYY-MM-DD`

**Hook Logic**:

```typescript
useEffect(() => {
  if (!date || !hrmToken) {
    setDay(null);
    setError(null);
    setIsLoading(false);
    return;
  }

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timesheetApi.getDayDetail(hrmToken, date);
      setDay(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết');
    } finally {
      setIsLoading(false);
    }
  };

  fetchDetail();
}, [date, hrmToken]);
```

**Code reference**: `frontend/hooks/use-timesheet-day-detail.ts:31-53`

### Response Structure

```typescript
interface TimesheetDayDetailResponse {
  applicationForms: DayDetailApplicationForm[];
  timeSheets: Array<{
    id: number;
    time: string; // ISO date string
    machineCode: string;
  }>;
}
```

## Data Display

### Check-in/Check-out

**Logic**: Tìm check-in đầu tiên và check-out cuối cùng từ `timeSheets`

```typescript
const getCheckInOut = () => {
  if (!day?.timeSheets || day.timeSheets.length === 0) {
    return { checkIn: null, checkOut: null };
  }

  const sorted = [...day.timeSheets].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    const dateA = parseISODate(a.time);
    const dateB = parseISODate(b.time);
    if (!dateA || !dateB) return 0;
    return dateA.valueOf() - dateB.valueOf();
  });

  return {
    checkIn: sorted[0]?.time || null,
    checkOut: sorted[sorted.length - 1]?.time || null,
  };
};
```

**Code reference**: `frontend/hooks/use-timesheet-day-detail.ts:79-96`

**Display**: Hiển thị trong Card với format `HH:mm:ss`

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:102-119`

### Đi muộn/Về sớm

**Data Source**: `calendarDay.minutesLate` và `calendarDay.minutesEarly`

**Display Logic**:

- Hiển thị Badge với màu:
  - `destructive` (đỏ) nếu không có pending forms
  - `secondary` (cam) nếu có pending forms
- Hiển thị button "Tạo đơn" nếu có đi muộn/về sớm

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:122-163`

### Tất cả các lần chấm công

**Data Source**: `day.timeSheets`

**Display**: Accordion với danh sách tất cả các lần chấm công, hiển thị:
- Thời gian (format: `HH:mm:ss`)
- Machine code

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:165-191`

### Work Log

**Data Source**: `calendarDay.logWork`

**Display**: Card hiển thị:
- Thời gian làm việc: `logWork.timeSpentHour` giờ
- Chênh lệch: `logWorkDiff` giờ (màu xanh nếu > 0, đỏ nếu < 0)
- Cần log: `logWorkNeeded` giờ (nếu > 0)

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:195-228`

### Danh sách đơn từ

**Data Sources**:
1. `day.applicationForms` - Tất cả đơn từ day detail API (bao gồm cả pending)
2. `calendarDay.approvedApplicationForms` - Đơn đã approve từ calendar

**Display Logic**:

1. Hiển thị tất cả đơn từ `day.applicationForms` (bao gồm cả pending)
2. Hiển thị đơn từ `calendarDay.approvedApplicationForms` nếu không có trong `day.applicationForms` (tránh duplicate)

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:230-359`

**Form Display**:

Mỗi đơn hiển thị:
- Type name (từ `form.type.name` hoặc hardcode nếu không có)
- Status badge:
  - `status === 3`: "Đã duyệt"
  - `status === 1`: "Chờ duyệt"
  - `status === 2`: "Chờ duyệt (bước 2)"
- Tracking times: `timeStart - timeEnd` và `date`
- Date range: `startDate` đến `endDate`

## Pending Forms Detection

### Logic

```typescript
const hasPendingForms = useMemo(() => {
  const hasPending = day?.applicationForms?.some(
    (form) => form.status !== 3 && (form.typeId === 1 || form.typeId === 2),
  );
  return hasPending || false;
}, [day]);
```

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:56-63`

### Usage

- Badge đi muộn/về sớm chuyển sang màu cam nếu có pending forms
- Indicate rằng đơn đang chờ duyệt sẽ giải quyết vi phạm

## Reload và Reopen Mechanism

### Flow

Khi tạo đơn thành công:

1. Đóng day detail (`onClose()`)
2. Gọi `onApplicationFormCreated(date)` để notify parent
3. Parent reload calendar
4. Parent tự động mở lại day detail sau khi calendar load xong và mergedDays đã được cập nhật

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:67-72`

**Parent Logic** (TimesheetPageContent):

```typescript
const handleReloadAndReopenDetail = async (date: string) => {
  setPendingDetailDate(date);
  onCloseDetail();
  await onReload();
  // useEffect sẽ tự động mở lại detail khi isLoading = false và mergedDays đã được cập nhật
};
```

**Code reference**: `frontend/components/timesheet/TimesheetPageContent.tsx:89-94`

**Auto-reopen Logic**:

```typescript
useEffect(() => {
  if (!pendingDetailDate || isLoading) return;

  const hasCalendarData = calendar?.timelines.some((t) => {
    if (!t.date) return false;
    const timesheetDate = new Date(t.date).toISOString().split('T')[0];
    return timesheetDate === pendingDetailDate;
  });

  const isFetchingDetail = dayDetailLoadingDates.has(pendingDetailDate);
  const needsMerge = summary?.timelines.some((t) => {
    // ... check conditions
  });
  const hasMergedDataIfNeeded = needsMerge ? mergedDays.has(pendingDetailDate) : true;

  if (hasCalendarData && !isFetchingDetail && hasMergedDataIfNeeded) {
    const dateToOpen = pendingDetailDate;
    setTimeout(() => {
      setPendingDetailDate(null);
      onDayClick(dateToOpen);
    }, 0);
  }
}, [pendingDetailDate, isLoading, dayDetailLoadingDates, mergedDays, calendar, onDayClick]);
```

**Code reference**: `frontend/components/timesheet/TimesheetPageContent.tsx:40-86`

## Loading States

### Day Detail Loading

- `isLoading`: Đang fetch day detail từ API
- Hiển thị "Đang tải..." khi loading

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:81-85`

### Calendar Loading

- `isLoadingCalendar`: Calendar đang reload
- Hiển thị "Đang tải..." khi calendar loading
- Disable tương tác khi loading

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:81-85, 132`

## Error Handling

### API Errors

- Catch errors trong `useTimesheetDayDetail` hook
- Set error message vào `error` state
- Hiển thị error message trong UI với AlertCircle icon

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:87-92`

## Date/Time Formatting

### Helper Functions

**parseISODate**: Parse ISO date string và convert sang timezone của client

```typescript
const parseISODate = (dateStr: string | null): dayjs.Dayjs | null => {
  if (!dateStr) return null;
  return dayjs(dateStr);
};
```

**Code reference**: `frontend/hooks/use-timesheet-day-detail.ts:56-61`

**formatDate**: Format date string thành "dddd, DD MMMM YYYY"

```typescript
const formatDate = (dateStr: string) => {
  const parsed = parseISODate(dateStr);
  if (!parsed) return dateStr;
  return parsed.format('dddd, DD MMMM YYYY');
};
```

**Code reference**: `frontend/hooks/use-timesheet-day-detail.ts:63-68`

**formatDateTime**: Format date string thành "HH:mm:ss"

```typescript
const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const parsed = parseISODate(dateStr);
  if (!parsed) return dateStr;
  return parsed.format('HH:mm:ss');
};
```

**Code reference**: `frontend/hooks/use-timesheet-day-detail.ts:70-76`

## Create Application Form Integration

### Button "Tạo đơn"

- Hiển thị ở 2 vị trí:
  1. Trong phần "Đi muộn/Về sớm" (nếu có vi phạm)
  2. Trong header của Card "Đơn"

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:126-134, 238-246`

### Dialog Integration

Khi click "Tạo đơn", mở `CreateApplicationFormDialog` với data:

```typescript
<CreateApplicationFormDialog
  open={showCreateFormDialog}
  onOpenChange={setShowCreateFormDialog}
  data={{
    date: date,
    calendarDay,
    workingTime,
    calendarDays,
    mergedDays,
    dayDetail: day ? { applicationForms: day.applicationForms } : null,
    userId,
  }}
  onSuccess={handleCreateFormSuccess}
/>
```

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:364-377`

## Data Merging

### Merged Days

Day detail component nhận `mergedDays` từ parent (TimesheetPageContent), chứa các ngày đã được merge với pending forms từ calendar.

**Usage**: Truyền vào `CreateApplicationFormDialog` để validation có thể check pending forms trong tuần.

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:372`

## API Integration

### GET /timesheet/day-detail

**Endpoint**: `GET /timesheet/day-detail?date=YYYY-MM-DD`

**Headers**:
```
Authorization: Bearer <hrm_token>
```

**Response**:

```typescript
interface TimesheetDayDetailResponse {
  applicationForms: DayDetailApplicationForm[];
  timeSheets: Array<{
    id: number;
    time: string; // ISO date string
    machineCode: string;
  }>;
}
```

**Code reference**: `frontend/lib/api/timesheet.ts:44-69`

## Performance Considerations

1. **Conditional Fetching**: Chỉ fetch khi `date` và `hrmToken` có giá trị
2. **Memoization**: `hasPendingForms` sử dụng `useMemo` để tránh tính toán lại không cần thiết
3. **Lazy Loading**: Day detail chỉ được fetch khi user click vào day cell
