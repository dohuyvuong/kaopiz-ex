# API Integration

## Tổng quan

Hệ thống tích hợp với 2 API systems:
- **Ksystem API**: Cho checklist review
- **HRM API**: Cho timesheet và application forms

## Frontend API Client (Axios)

**File**: `frontend/lib/api/client.ts`

Tất cả API (checklist, application, timesheet) gọi qua một axios instance:

- **Request interceptor**: Tự động gắn `Authorization: Bearer <appToken>` (lấy từ Zustand auth store). Bỏ qua với các endpoint `/auth/`.
- **Response interceptor**: Gặp 401 → gọi `authApi.refreshToken()` với `appRefreshToken` → cập nhật `appToken` trong store → retry request. Nếu refresh thất bại → clear auth và redirect `/login`. Có queue để tránh nhiều lần refresh đồng thời.

**Auth API** (`frontend/lib/api/auth.ts`) dùng **fetch** thay vì axios để tránh loop (không cần gắn token cho login/refresh).

Hooks và components **không truyền token** thủ công; client tự lấy từ store và xử lý refresh.

## API Base URL

**Environment Variable**: `NEXT_PUBLIC_API_BASE_URL`

**Default**: `http://localhost:8000`

**Code reference**: `frontend/lib/api/timesheet.ts:4`

## Authentication

### Headers

Tất cả API calls (qua axios client) tự động có Authorization header do request interceptor gắn:

```typescript
Authorization: `Bearer ${appToken}`
```

Token lấy từ Zustand auth store; không cần truyền tham số token trong từng lần gọi.

## Timesheet API

### GET /timesheet/calendar

**Purpose**: Lấy dữ liệu timesheet calendar cho một tháng

**Query Parameters**:
- `monthYear`: Format "MM-YYYY" (ví dụ: "10-2025")

**Response**:

```typescript
interface TimesheetCalendarResponse {
  timelines: TimesheetDay[];
  workingTime: {
    workStart: string;
    workEnd: string;
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

### GET /timesheet/day-detail

**Purpose**: Lấy chi tiết timesheet cho một ngày cụ thể

**Query Parameters**:
- `date`: Format "YYYY-MM-DD" (ví dụ: "2025-10-16")

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

## Application API

### GET /application/types

**Purpose**: Lấy danh sách loại đơn

**Response**:

```typescript
interface ApplicationFormTypesResponse {
  items: ApplicationFormType[];
}
```

**Code reference**: `frontend/lib/api/application.ts:15-37`

### GET /application/reasons

**Purpose**: Lấy danh sách lý do

**Query Parameters** (optional):
- `typeId`: Filter theo typeId

**Response**:

```typescript
interface ApplicationFormReasonsResponse {
  items: ApplicationFormReason[];
}
```

**Code reference**: `frontend/lib/api/application.ts:42-71`

### GET /application/approval-assignments

**Purpose**: Lấy danh sách người duyệt

**Query Parameters**:
- `typeId`: Loại đơn
- `order`: Order của người duyệt (1-based)
- `userId` (optional): User ID

**Response**:

```typescript
interface ApprovalAssignmentsResponse {
  items: ApprovalAssignment[];
}
```

**Code reference**: `frontend/lib/api/application.ts:76-111`

### POST /application/forms

**Purpose**: Tạo đơn từ

**Body**:

```typescript
interface CreateApplicationFormPayload {
  typeId: number;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
  data: {
    reasonId?: number;
    trackingTimes?: Array<{
      date?: string;
      dateStart?: string;
      dateEnd?: string;
      timeStart?: string;
      timeEnd?: string;
      reasonId?: number;
    }>;
  };
  applicationApprovals?: Array<{
    userId: number;
    order: number;
  }>;
  description?: string;
}
```

**Response**:

```typescript
interface ApplicationForm {
  id: number;
  // ... other fields
}
```

**Code reference**: `frontend/lib/api/application.ts:116-146`

## Error Handling

- **401**: Axios client tự xử lý refresh token và retry; nếu refresh fail thì clear auth và redirect login.
- **Các lỗi khác**: API modules throw error; component/hook bắt và hiển thị (toast, message).

## Backend API Endpoints

### Authentication

- `GET /auth/providers`
- `GET /auth/:provider/authorize`
- `POST /auth/:provider/token`

**Code reference**: `backend/src/auth/auth.controller.ts`

### Timesheet

- `GET /timesheet/calendar`
- `GET /timesheet/day-detail`

**Code reference**: `backend/src/timesheet/timesheet.controller.ts`

### Application

- `GET /application/types`
- `GET /application/reasons`
- `GET /application/approval-assignments`
- `POST /application/forms`

**Code reference**: `backend/src/application/application.controller.ts`

## Backend Services

### HRM API Service

**File**: `backend/src/api/services/hrm/timesheet-api.service.ts`

Service gọi HRM API để lấy timesheet data.

### Application API Service

**File**: `backend/src/api/services/hrm/application-api.service.ts`

Service gọi HRM API để quản lý application forms.
