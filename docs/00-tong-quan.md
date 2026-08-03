# Tổng quan hệ thống KaopizEX

## Giới thiệu

KaopizEX là hệ thống công cụ nội bộ của Kaopiz, được xây dựng để tích hợp và quản lý các hệ thống nội bộ như Ksystem và HRM. Hệ thống cung cấp các tính năng chính:

- **Authentication & Authorization**: Multi-provider authentication với Microsoft SSO và Ksystem OAuth
- **Timesheet Management**: Quản lý chấm công, xem lịch làm việc, tạo đơn từ
- **Application Form Management**: Tạo và quản lý đơn từ (nghỉ phép, vắng mặt)
- **Auto-create Applications**: Tự động tính toán và tạo đơn từ để giảm phạt đi muộn/về sớm
- **Approver Settings**: Cấu hình người duyệt mặc định cho từng loại đơn
- **Background Automation**: Kiểm tra tự động định kỳ (checklist chờ duyệt, đơn cần tạo), thông báo Telegram, xác nhận hoặc tự duyệt sau timeout

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                      KaopizEX System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │ ◄─────► │   Backend    │                  │
│  │  (Next.js)   │  HTTP   │  (NestJS)    │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                           │
│         │                         │                           │
│         ▼                         ▼                           │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Zustand   │         │   Ksystem    │                  │
│  │   Stores    │         │     API      │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                           │
│         │                         ▼                           │
│         │                  ┌──────────────┐                  │
│         │                  │     HRM      │                  │
│         │                  │     API     │                  │
│         │                  └──────────────┘                  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │ localStorage │                                          │
│  │ (Zustand    │                                          │
│  │  persist)   │                                          │
│  └──────────────┘                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Frontend (Next.js)

- **Framework**: Next.js 16.0.1 với App Router
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **State Management**: Zustand với persist middleware
- **Date/Time**: dayjs với plugins (utc, timezone)
- **Notifications**: Sonner (toast notifications)

### Backend (NestJS)

- **Framework**: NestJS với TypeScript
- **Architecture**: Modular architecture với controllers, services, providers
- **Authentication**: Multi-provider authentication system
- **API Integration**: HTTP clients cho Ksystem và HRM APIs

## Tech Stack

### Frontend Dependencies

```json
{
  "next": "16.0.1",
  "react": "19.2.0",
  "zustand": "^5.0.10",
  "dayjs": "^1.11.19",
  "sonner": "^2.0.7"
}
```

### Backend Dependencies

- NestJS core modules
- HTTP client cho Ksystem và HRM APIs
- JWT token management

## Cấu trúc thư mục

### Shared (`@kaopiz/timesheet`)

Logic nghiệp vụ chấm công, thuần TypeScript — không React, không NestJS, không gọi
API. Frontend và backend cùng link vào (`link:../shared`) nên màn calendar và cron
tự động tạo đơn không thể ra hai kết quả khác nhau.

```
shared/
├── src/
│   ├── types.ts          # CalendarDay, DayForm, TimesheetRules
│   ├── normalize.ts      # response HRM → model (hấp thụ 3 shape trackingTimes)
│   ├── estimate.ts       # ước tính muộn/sớm sau khi duyệt đơn chờ
│   ├── rules.ts          # cảnh báo khi tạo đơn (tuần bắt đầu thứ Hai)
│   ├── suggest.ts        # đề xuất đơn cần tạo
│   ├── *.test.ts         # 52 test trên response thật của HRM
│   └── __fixtures__/     # fixture rút từ fixtures/
└── package.json
```

Chi tiết: [02-timesheet-calendar.md](./02-timesheet-calendar.md)

### Frontend

```
frontend/
├── app/                          # Next.js App Router
│   ├── (hrm)/                    # Routes yêu cầu HRM token
│   │   └── timesheet/            # Timesheet page
│   ├── (ksystem)/                # Routes yêu cầu Ksystem token
│   │   └── checklist-review/     # Checklist review pages
│   ├── (public)/                 # Public routes
│   │   └── login/                # Login page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── account/                  # Account settings components
│   ├── auth/                     # Authentication components
│   ├── checklist/                # Checklist review components
│   ├── timesheet/                # Timesheet components
│   └── ui/                       # Shadcn UI components
├── hooks/                        # Custom React hooks
│   ├── use-create-application-form.ts
│   ├── use-auto-create-applications.ts
│   ├── use-approver-settings.ts
│   └── use-timesheet-calendar.ts
├── lib/                          # Utilities và configurations
│   ├── api/                      # API client + service functions
│   │   ├── client.ts             # Axios client (auto token, refresh)
│   │   ├── application.ts
│   │   ├── timesheet.ts
│   │   └── checklist.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── (approver preferences lưu trên server)
│   │   └── sidebar-store.ts
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
└── package.json
```

### Backend

```
backend/
├── src/
│   ├── api/                      # API integration services
│   │   ├── services/
│   │   │   ├── hrm/              # HRM API services
│   │   │   └── ksystem/          # Ksystem API services
│   │   └── api.module.ts
│   ├── application/              # Application form module
│   │   ├── application.controller.ts
│   │   ├── application.service.ts
│   │   └── dto/
│   ├── auth/                     # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── providers/            # Auth providers
│   │   │   ├── microsoft-sso.provider.ts
│   │   │   └── ksystem-oauth.provider.ts
│   │   └── guards/               # Auth guards
│   ├── timesheet/                # Timesheet module
│   │   ├── timesheet.controller.ts
│   │   ├── timesheet.service.ts
│   │   ├── timesheet-snapshot.service.ts  # dựng dữ liệu cho @kaopiz/timesheet
│   │   └── dto/
│   ├── checklist/               # Checklist review module
│   ├── common/                   # Common utilities
│   ├── config/                   # Configuration
│   └── main.ts                   # Application entry point
└── package.json
```

## Luồng dữ liệu chính

### 1. Authentication Flow

```
User → Login Page → Select Provider → Get Auth URL →
Open URL → Login → Copy Callback URL → Exchange Token →
Save to Zustand + localStorage → Redirect to Home
```

Chi tiết: [01-authentication.md](./01-authentication.md)

### 2. Timesheet Flow

```
User → Timesheet Page → Load Calendar → Select Day →
Load Day Detail → Merge Data (Approved + Pending) →
Display → Create Form (Optional) → Reload Calendar
```

Chi tiết:
- [02-timesheet-calendar.md](./02-timesheet-calendar.md)
- [03-timesheet-day-detail.md](./03-timesheet-day-detail.md)

### 3. Application Form Creation Flow

```
User → Open Create Form Dialog → Select Type →
Select Reason → Select Approvers → Enter Time →
Validate → Submit → API Call → Success → Reload Calendar
```

Chi tiết: [04-application-form-creation.md](./04-application-form-creation.md)

### 4. Auto-create Applications Flow

```
User → Open Auto-create Dialog → Calculate Applications →
Preview → Check Missing Approvers → Edit (Optional) →
Submit → Create All → Progress Tracking → Reload Calendar
```

Chi tiết: [05-auto-create-applications.md](./05-auto-create-applications.md)

### 5. Background Automation Flow

```
User → Account → Tab "Tự động hóa" → Bật job + cấu hình (kênh, thời gian tự duyệt) →
Cron kiểm tra (9h/10h) → Tạo PendingAction → Gửi notification (Telegram) →
User xác nhận (approve/reject) hoặc sau N phút tự duyệt → Thực hiện (submit review / tạo đơn)
```

Chi tiết: [11-background-automation.md](./11-background-automation.md)

## State Management

### Zustand Stores

- **auth-store**: appToken, appRefreshToken, user, systems, isLoading
- **Approver preferences**: Lưu trên server (API /application/approver-preferences)
- **sidebar-store**: isOpen

Chi tiết: [08-state-management.md](./08-state-management.md)

## API Endpoints

### Authentication

- `GET /auth/providers` - Lấy danh sách providers
- `GET /auth/:provider/authorize` - Lấy authorization URL
- `POST /auth/:provider/token` - Exchange token

### Timesheet

- `GET /timesheet/calendar?monthYear=MM-YYYY` - Lấy calendar data
- `GET /timesheet/day-detail?date=YYYY-MM-DD` - Lấy day detail

### Application

- `GET /application/types` - Lấy danh sách loại đơn
- `GET /application/reasons?typeId=1` - Lấy danh sách lý do
- `GET /application/approval-assignments?typeId=1&order=1&userId=861` - Lấy người duyệt
- `POST /application/forms` - Tạo đơn từ

### Automation (Background Jobs)

- `GET /automation/settings` - Lấy tất cả automation settings
- `GET /automation/settings/:jobType` - Lấy setting theo jobType
- `PUT /automation/settings/:jobType` - Cập nhật setting
- `GET /automation/pending-actions` - Lấy danh sách pending actions
- `POST /automation/approve` - Xác nhận và thực hiện pending action
- `POST /automation/reject` - Từ chối pending action

Chi tiết: [10-api-integration.md](./10-api-integration.md), [11-background-automation.md](./11-background-automation.md)

## Mục lục tài liệu

1. [00-tong-quan.md](./00-tong-quan.md) - Tổng quan hệ thống (file này)
2. [01-authentication.md](./01-authentication.md) - Authentication & Authorization
3. [02-timesheet-calendar.md](./02-timesheet-calendar.md) - Timesheet Calendar
4. [03-timesheet-day-detail.md](./03-timesheet-day-detail.md) - Timesheet Day Detail
5. [04-application-form-creation.md](./04-application-form-creation.md) - Application Form Creation
6. [05-auto-create-applications.md](./05-auto-create-applications.md) - Auto-create Applications
7. [06-approver-settings.md](./06-approver-settings.md) - Approver Settings
8. [07-validation-utilities.md](./07-validation-utilities.md) - Validation Utilities
9. [08-state-management.md](./08-state-management.md) - State Management
10. [09-ui-components.md](./09-ui-components.md) - UI Components
11. [10-api-integration.md](./10-api-integration.md) - API Integration
12. [11-background-automation.md](./11-background-automation.md) - Background Automation (kiểm tra tự động, notification, approve/reject)

## Development Setup

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

### Backend

```bash
cd backend
yarn install
yarn start:dev
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (.env)

Xem chi tiết trong `backend/.env.example`
