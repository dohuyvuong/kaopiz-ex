# Approver Settings

## Tổng quan

Module này cho phép người dùng cấu hình người duyệt mặc định cho từng loại đơn và order. Settings được lưu trong Redux state và persist vào localStorage.

## Component Structure

### Main Component

**File**: `frontend/components/account/ApproverSettings.tsx`

Component hiển thị danh sách types và approvers cho từng type.

### Custom Hook: useApproverSettings

**File**: `frontend/hooks/use-approver-settings.ts`

Hook quản lý logic fetch và lưu approvers.

## State Management

### Redux State

**Slice**: `frontend/lib/features/application-form/applicationFormSlice.ts`

**Structure**:

```typescript
{
  approvers: {
    [typeId]: {
      [order]: userId | null
    }
  }
}
```

**Example**: `{ 1: { 1: 123, 2: 456 }, 2: { 1: 789 } }`

**Code reference**: `frontend/lib/features/application-form/applicationFormSlice.ts:5-7`

### Actions

- `setApprover`: Lưu approver cho typeId và order cụ thể
- `setApprovers`: Lưu tất cả approvers cho một typeId
- `clearApprovers`: Xóa approvers (có thể xóa một typeId hoặc tất cả)

**Code reference**: `frontend/lib/features/application-form/applicationFormSlice.ts:17-58`

## Data Fetching

### Fetch Types

**API**: `GET /application/types`

**Code reference**: `frontend/hooks/use-approver-settings.ts:47-70`

### Fetch Approvers

**API**: `GET /application/approval-assignments?typeId=X&order=Y&userId=Z`

**Logic**: Fetch approvers cho tất cả types và orders

**Code reference**: `frontend/hooks/use-approver-settings.ts:73-111`

## UI Components

### Type List

- Hiển thị danh sách types
- Mỗi type có accordion để mở/đóng

### Approver Selection

- Combobox chọn approver cho từng order
- Hiển thị format: `${user.name} (${user.email})`
- Loading state khi đang fetch approvers

**Code reference**: `frontend/components/account/ApproverSettings.tsx` (Combobox display)

## Save Logic

### handleApproverChange

**Function**: `handleApproverChange`

Lưu approver vào Redux state khi user thay đổi.

**Code reference**: `frontend/hooks/use-approver-settings.ts:113-118`

```typescript
const handleApproverChange = useCallback(
  (typeId: number, order: number, approverId: number | null) => {
    dispatch(setApprover({ typeId, order, userId: approverId }));
  },
  [dispatch],
);
```

## Persistence

### Redux Persist

Settings được persist vào localStorage với key `applicationForm`.

**Code reference**: `frontend/lib/store.ts:23-29`

## Usage in Form Creation

### Load Saved Approvers

Khi tạo đơn, hook `useCreateApplicationForm` load saved approvers từ Redux state và tự động chọn.

**Code reference**: `frontend/hooks/use-create-application-form.ts:211-239`
