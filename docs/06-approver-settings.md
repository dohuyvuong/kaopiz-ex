# Approver Settings

## Tổng quan

Module này cho phép người dùng cấu hình người duyệt mặc định cho từng loại đơn và order. Settings được lưu trên **server** (bảng `ApproverPreference`).

## Component Structure

### Main Component

**File**: `frontend/components/account/ApproverSettings.tsx`

Component hiển thị danh sách types và approvers cho từng type.

### Custom Hook: useApproverSettings

**File**: `frontend/hooks/use-approver-settings.ts`

Hook quản lý logic fetch và lưu approvers qua API.

## State Management (Server)

### API Endpoints

- `GET /application/approver-preferences` - Lấy cấu hình người duyệt
- `PUT /application/approver-preferences` - Lưu cấu hình (body: `{ preferences: { [typeId]: { [order]: approverUserId } } }`)

### Structure (OOP - array of entities)

```typescript
interface ApproverPreference {
  typeId: number;
  order: number;
  approverUserId: number;
}

type ApproverPreferences = ApproverPreference[];
```

**Example**: `[{ typeId: 1, order: 1, approverUserId: 123 }, { typeId: 1, order: 2, approverUserId: 456 }]`

Helper: `ApproverPreferencesHelper` (get, set, getByTypeId, fromLegacyMap, toLegacyMap)

## Data Fetching

### Fetch Types

**API**: `GET /application/types`

### Fetch Approvers (danh sách có thể chọn)

**API**: `GET /application/approval-assignments?typeId=X&order=Y&userId=Z`

### Fetch Approver Preferences (đã lưu)

**API**: `GET /application/approver-preferences`

## Migration từ localStorage

Khi user mở Approver Settings lần đầu sau khi migrate, nếu API trả về rỗng và có data cũ trong localStorage (`application-form-storage`), hook sẽ tự động gửi data lên server để migrate và xóa localStorage.

## Save Logic

### handleApproverChange

Khi user thay đổi approver, hook gọi `applicationApi.saveApproverPreferences()` để lưu lên server.

## Usage in Form Creation

### Load Saved Approvers

Khi tạo đơn, hook `useCreateApplicationForm` fetch approver preferences từ API và tự động chọn.
