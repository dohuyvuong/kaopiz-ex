# Auto-create Applications

## Tổng quan

Module này tự động tính toán và tạo các đơn từ để giảm tổng đi muộn/về sớm xuống ≤ 90 phút. Logic ưu tiên:
1. Tận dụng đơn vắng mặt (1 tuần 1 lần, tối đa 60 phút) - không tốn phép năm
2. Tạo đơn nghỉ phép cho phần còn lại (nếu tổng > 90 phút)

## Component Structure

### Main Component

**File**: `frontend/components/timesheet/AutoCreateApplicationsDialog.tsx`

Dialog component với preview và progress tracking.

### Custom Hook: useAutoCreateApplications

**File**: `frontend/hooks/use-auto-create-applications.ts`

Hook quản lý logic tính toán và tạo đơn.

## Calculation Logic

### calculateApplicationsToCreate Function

**File**: `frontend/lib/utils/auto-create-applications.ts`

**Function**: `calculateApplicationsToCreate`

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:161-429`

### Steps

#### 1. Tính tổng minutesLate + minutesEarly

- Lặp qua `calendarDays` và tính tổng vi phạm
- Trừ đi số phút đã được giảm từ các đơn pending (từ `mergedDays`)

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:172-222`

#### 2. Lọc violations trong vòng 1 tuần

- Chỉ lấy các ngày trong vòng 7 ngày từ hôm nay

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:224-228`

#### 3. Sắp xếp violations

- Ưu tiên ngày có vi phạm lớn nhất
- Sau đó ưu tiên ngày gần nhất

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:230-244`

#### 4. Tận dụng đơn vắng mặt

- Tạo đơn vắng mặt cho ngày có vi phạm lớn nhất (nếu chưa có trong tuần)
- Tối đa 60 phút
- Ưu tiên đi muộn trước, sau đó về sớm

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:246-324`

#### 5. Tạo đơn nghỉ phép cho phần còn lại

- Chỉ tạo nếu tổng > 90 phút sau khi đã trừ đơn vắng mặt
- Tạo cho phần vượt quá 90 phút

**Code reference**: `frontend/lib/utils/auto-create-applications.ts:326-426`

## Preview After Approve

### Calculation

**Function**: `previewAfterApprove` (useMemo)

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:82-155`

### Logic

1. Lấy summary hiện tại
2. Trừ đi số phút từ các đơn pending (từ `mergedDays`)
3. Trừ đi số phút từ các đơn sẽ tạo (từ `applications`)
4. Phân bổ theo tỷ lệ late/early

**Result**: `{ minutesLate, minutesEarly, total }`

## Missing Approvers Detection

### Logic

**Function**: `missingApprovers` (useMemo)

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:173-209`

### Steps

1. Fetch types từ API
2. Lấy unique typeIds từ applications
3. Kiểm tra saved approvers trong Redux state
4. Tìm các order thiếu cho mỗi typeId

**Result**: Array of `{ typeId, typeName, missingOrders }`

## Submit Flow

### createApplications Function

**Function**: `createApplications`

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:248-418`

### Steps

1. **Validate**: Kiểm tra token, userId, applications
2. **Fetch Types**: Lấy danh sách types
3. **Fetch Approvers**: Lấy approvers cho từng typeId và order
4. **Create Applications**: Tạo từng đơn một với progress tracking
5. **Update Progress**: Cập nhật progress sau mỗi đơn

### Progress Tracking

```typescript
progress: {
  current: number,
  total: number,
  currentApp: ApplicationToCreate | null
}
```

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:67-75, 266-270, 300-310`

## Application Management

### Update Application

**Function**: `updateApplication`

Cho phép chỉnh sửa đơn trước khi submit.

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:233-242`

### Remove Application

**Function**: `removeApplication`

Cho phép xóa đơn khỏi danh sách.

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:244-246`

## UI Features

### Preview Section

- Hiển thị preview sau khi approve
- Hiển thị missing approvers warning
- Hiển thị danh sách applications với edit/remove buttons

### Progress Section

- Progress bar khi đang tạo đơn
- Hiển thị đơn hiện tại đang được tạo

### Success Handling

- Toast notification khi thành công
- Reload calendar sau khi tạo xong

## API Integration

### POST /application/forms

Tạo từng đơn một với progress tracking.

**Code reference**: `frontend/hooks/use-auto-create-applications.ts:300-310`
