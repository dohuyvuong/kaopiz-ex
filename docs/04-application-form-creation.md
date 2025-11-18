# Application Form Creation

## Tổng quan

Module này cho phép người dùng tạo đơn từ (application form) thủ công cho một ngày cụ thể. Hỗ trợ 2 loại đơn chính:
- **Đơn xin nghỉ** (typeId: 1)
- **Đơn vắng mặt** (typeId: 2)

## Component Structure

### Main Component

**File**: `frontend/components/timesheet/CreateApplicationFormDialog.tsx`

Dialog component sử dụng Shadcn UI Dialog.

### Custom Hook: useCreateApplicationForm

**File**: `frontend/hooks/use-create-application-form.ts`

Hook quản lý toàn bộ logic của form creation.

## Form Fields

### Type Selection

- Dropdown chọn loại đơn (typeId)
- Mặc định: typeId = 2 (Đơn vắng mặt)
- Nếu đã có đơn vắng mặt trong tuần, mặc định: typeId = 1

**Code reference**: `frontend/hooks/use-create-application-form.ts:89, 427-428`

### Reason Selection

- Dropdown chọn lý do (reasonId)
- Chỉ hiển thị reasons phù hợp với typeId đã chọn
- Mặc định: null

**Code reference**: `frontend/hooks/use-create-application-form.ts:90, 140-180`

### Approver Selection

- Combobox chọn người duyệt cho từng order
- Số lượng approvers phụ thuộc vào `selectedType.orderMax`
- Load approvers từ API khi typeId thay đổi
- Load saved approvers từ Redux state

**Code reference**: `frontend/hooks/use-create-application-form.ts:201-258`

### Time Selection

- Input `timeStart`: Thời gian bắt đầu (format: HH:mm)
- Input `timeEnd`: Thời gian kết thúc (format: HH:mm)
- Tự động tính toán dựa trên typeId và calendarDay

**Code reference**: `frontend/hooks/use-create-application-form.ts:296-358`

## Auto Time Calculation

### Logic

**Function**: `calculateAutoTime`

**Code reference**: `frontend/hooks/use-create-application-form.ts:296-358`

#### Đơn vắng mặt (typeId: 2)

1. **Đi muộn**: `workStart` đến `min(timeIn, workStart + 60 phút)`
2. **Về sớm**: `max(timeOut, workEnd - 60 phút)` đến `workEnd`
3. **Thiếu chấm công**: Sử dụng `getMissingTimeRanges()`

#### Đơn nghỉ phép (typeId: 1)

1. **Có chấm công**: Sử dụng `getMissingTimeRanges()` (không thể làm đơn cả ngày)
2. **Không có chấm công**: `workStart` đến `workEnd` (có thể làm đơn cả ngày)

## Validation

### Validation Function

**Function**: `validate`

**Code reference**: `frontend/hooks/use-create-application-form.ts:448-540`

### Validation Rules

#### 1. Date Range Validation

- Chỉ cho phép tạo đơn trong vòng 7 ngày trở lại từ hôm nay
- Không giới hạn tương lai

```typescript
const selectedDate = dayjs(date);
const today = dayjs();
const minDate = today.subtract(7, 'day');
if (selectedDate.isBefore(minDate, 'day')) {
  return false; // Warning message đã được xử lý bởi getWarningMessage
}
```

**Code reference**: `frontend/hooks/use-create-application-form.ts:451-460`

#### 2. Approver Validation

- Tất cả người duyệt phải được chọn (theo `orderMax`)

```typescript
const approverCount = getApproverCount(selectedType);
for (let order = 0; order < approverCount; order++) {
  if (!approverIds[order]) {
    setValidationError(`Vui lòng chọn người duyệt ${order + 1}`);
    return false;
  }
}
```

**Code reference**: `frontend/hooks/use-create-application-form.ts:462-473`

#### 3. Đơn nghỉ phép (typeId: 1)

- Nếu có chấm công, không thể làm đơn cả ngày

```typescript
if (calendarDay && calendarDay.timeIn && calendarDay.timeOut) {
  const isFullDay = !timeStart || !timeEnd || (timeStart === workStart && timeEnd === workEnd);
  if (isFullDay) {
    setValidationError('Không thể tạo đơn nghỉ phép cả ngày khi đã có chấm công...');
    return false;
  }
}
```

**Code reference**: `frontend/hooks/use-create-application-form.ts:475-490`

#### 4. Đơn vắng mặt (typeId: 2)

- Phải có `timeStart` và `timeEnd`
- Không được quá 60 phút
- Một tuần chỉ có 1 đơn vắng mặt

```typescript
if (!timeStart || !timeEnd) {
  setValidationError('Vui lòng nhập thời gian bắt đầu và kết thúc');
  return false;
}

const calculatedMinutes = calculateMinutes(timeStart, timeEnd);
if (calculatedMinutes > 60) {
  setValidationError('Đơn Vắng mặt - Thay đổi thời gian làm việc không được quá 60 phút');
  return false;
}

const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays, dayDetailMap, mergedDays);
if (hasAbsenceFormInWeek) {
  setValidationError('Một tuần chỉ có thể có 1 đơn vắng mặt...');
  return false;
}
```

**Code reference**: `frontend/hooks/use-create-application-form.ts:492-537`

## Warning Messages

### getWarningMessage Function

**Function**: `getWarningMessage`

**Code reference**: `frontend/hooks/use-create-application-form.ts:376-410`

### Warning Types

#### 1. Overlap Warning (Ưu tiên cao nhất)

- Kiểm tra overlap với các đơn đã có trong ngày
- Message: "Ngày này đã có đơn trùng lặp thời gian. Vui lòng kiểm tra lại."

```typescript
if (timeStart && timeEnd) {
  const hasOverlap = checkOverlappingForms(timeStart, timeEnd, calendarDay, dayDetail);
  if (hasOverlap) {
    return 'Ngày này đã có đơn trùng lặp thời gian. Vui lòng kiểm tra lại.';
  }
}
```

#### 2. Overdue Warning

- Kiểm tra quá hạn làm đơn (7 ngày trở lại)
- Message: "Đã quá hạn làm đơn cho ngày này"

```typescript
const selectedDate = dayjs(date);
const today = dayjs();
const minDate = today.subtract(7, 'day');
if (selectedDate.isBefore(minDate, 'day')) {
  return 'Đã quá hạn làm đơn cho ngày này';
}
```

#### 3. Absence Form in Week Warning

- Chỉ hiển thị khi typeId === 2
- Message: "Đã có đơn vắng mặt (Thay đổi thời gian làm việc) trong tuần này..."

```typescript
if (typeId === 2) {
  const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays, dayDetailMap, mergedDays);
  if (hasAbsenceFormInWeek) {
    return 'Đã có đơn vắng mặt (Thay đổi thời gian làm việc) trong tuần này...';
  }
}
```

## Submit Flow

### handleSubmit Function

**Function**: `handleSubmit`

**Returns**: `Promise<boolean>` - true nếu thành công, false nếu thất bại

**Code reference**: `frontend/hooks/use-create-application-form.ts:543-611`

### Steps

1. **Validate**: Gọi `validate()`, return false nếu không hợp lệ
2. **Check Token**: Kiểm tra HRM token
3. **Create Payload**: Tạo payload với:
   - `typeId`, `startDate`, `endDate`
   - `data.trackingTimes` (khác nhau cho typeId 1 và 2)
   - `applicationApprovals` (approvers)
   - `description`
4. **API Call**: Gọi `applicationApi.createApplicationForm()`
5. **Return**: Return true nếu thành công, false nếu có lỗi

### Payload Structure

#### Đơn vắng mặt (typeId: 2)

```typescript
{
  typeId: 2,
  startDate: date,
  endDate: date,
  data: {
    reasonId: reasonId,
    trackingTimes: [{
      date,
      timeStart,
      timeEnd,
      reasonId: trackingTimeReasonId
    }]
  },
  applicationApprovals: [...],
  description: selectedType?.name || 'Đơn từ'
}
```

#### Đơn nghỉ phép (typeId: 1)

```typescript
{
  typeId: 1,
  startDate: date,
  endDate: date,
  data: {
    reasonId: reasonId,
    trackingTimes: [{
      dateStart: date,
      dateEnd: date,
      timeStart: timeStart || undefined,
      timeEnd: timeEnd || undefined,
      reasonId: trackingTimeReasonId
    }]
  },
  applicationApprovals: [...],
  description: selectedType?.name || 'Đơn từ'
}
```

**Code reference**: `frontend/hooks/use-create-application-form.ts:570-601`

## Success Handling

### Dialog Component

**File**: `frontend/components/timesheet/CreateApplicationFormDialog.tsx`

```typescript
const handleSubmit = async () => {
  const success = await handleSubmitInternal();
  if (success) {
    toast.success('Tạo đơn từ thành công');
    onSuccess();
    onOpenChange(false);
  }
};
```

**Code reference**: `frontend/components/timesheet/CreateApplicationFormDialog.tsx:87-94`

### onSuccess Callback

- Gọi `onSuccess()` từ parent component
- Parent reload calendar và tự động mở lại day detail

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:67-72`

## State Management

### Form State

- `typeId`: Loại đơn
- `reasonId`: Lý do
- `approverIds`: Mảng người duyệt (0-based index)
- `timeStart`, `timeEnd`: Thời gian

### Loading States

- `loading`: Đang submit
- `loadingTypes`: Đang load types
- `loadingApprovers`: Đang load approvers

### Error States

- `error`: Lỗi từ API
- `validationError`: Lỗi validation (blocking)
- `warningMessage`: Cảnh báo (non-blocking)

## API Integration

### GET /application/types

Load danh sách loại đơn.

**Code reference**: `frontend/hooks/use-create-application-form.ts:102-125`

### GET /application/reasons

Load danh sách lý do (có thể filter theo typeId).

**Code reference**: `frontend/hooks/use-create-application-form.ts:127-180`

### GET /application/approval-assignments

Load danh sách người duyệt cho typeId và order cụ thể.

**Code reference**: `frontend/hooks/use-create-application-form.ts:201-258`

### POST /application/forms

Tạo đơn từ.

**Code reference**: `frontend/hooks/use-create-application-form.ts:603`

## Data Flow

```
User Input → Update State → Auto Calculate Time →
Validate → Show Warnings/Errors → Submit →
API Call → Success → Toast → onSuccess →
Reload Calendar → Reopen Day Detail
```
