# Background Automation (Kiểm tra tự động)

## Giới thiệu

Tính năng **Background Automation** cho phép hệ thống chạy kiểm tra định kỳ trong nền, thông báo cho người dùng qua Telegram (hoặc kênh khác), và thực hiện hành động sau khi người dùng xác nhận hoặc sau thời gian tự duyệt (timeout).

Hai loại job đã triển khai:

1. **Auto-review Checklist** (Ksystem): Kiểm tra checklist chờ duyệt → Thông báo → User xác nhận (hoặc tự duyệt sau N phút) → Submit review
2. **Auto-create Application Forms** (HRM): Kiểm tra timesheet thiếu công → Thông báo → User xác nhận (hoặc tự duyệt) → Tạo đơn

## Trạng thái triển khai

| Phase | Nội dung | Trạng thái |
|-------|----------|------------|
| 3.1 | Infrastructure & Data (ScheduleModule, Prisma, SchedulerModule, getUsersWithAutomationEnabled) | ✅ |
| 3.2 | User đăng kí & cấu hình (API settings, UI tab Tự động hóa) | ✅ |
| 3.3 | Notification (NotificationService, TelegramNotificationService) | ✅ |
| 3.4 | Approval & Auto-approve (POST approve/reject, AutoApproveSchedulerService) | ✅ |
| 3.5 | Cron Kiểm tra (ChecklistSchedulerService, TimesheetSchedulerService) | ✅ |
| 3.6 | Monitoring & Management (trigger thủ công, job logs API) | ⏳ Optional (chưa triển khai) |

**Note**: Phase 3.1-3.5 đã hoàn thành đầy đủ chức năng chính. Phase 3.6 là tính năng optional để quản lý và monitoring chi tiết.

## Luồng hoạt động

### 1. Đăng kí và cấu hình

- User vào **Account** → tab **Tự động hóa**
- Bật từng loại job: **Auto-review checklist** hoặc **Auto-create forms**
- Khi bật, **bắt buộc** nhập:
  - **Kênh thông báo**: Telegram hoặc Email
  - **ID/địa chỉ**: Telegram Chat ID hoặc địa chỉ email
  - **Tự động duyệt sau (phút)**: Sau N phút không phản hồi thì hệ thống tự thực hiện
- Tham số tùy chọn:
  - Checklist: số review tối đa mỗi lần, tên dự án (lọc)
  - Forms: số ngày quét lại (lookbackDays)

Dữ liệu lưu trong bảng **UserAutomationSetting** (theo userId, jobType).

### 2. Cron kiểm tra (Check only)

- **ChecklistSchedulerService**: Cron 9:00 AM mỗi ngày
  - Lấy users có `UserAutomationSetting(jobType='auto-review-checklist', enabled=true)` và token Ksystem hợp lệ
  - Gọi API lấy danh sách checklist chờ duyệt (theo params: maxReviews, projectName)
  - Tạo bản ghi **PendingAction** (payload = danh sách checklist, expiresAt = now + autoApproveAfterMinutes)
  - Gửi notification (Telegram) với nội dung và link xác nhận

- **TimesheetSchedulerService**: Cron 10:00 AM mỗi ngày
  - Lấy users có `UserAutomationSetting(jobType='auto-create-forms', enabled=true)` và token HRM hợp lệ
  - Lấy calendar, tính các ngày thiếu công trong lookbackDays
  - Tạo **PendingAction** (payload = danh sách form cần tạo)
  - Gửi notification tương tự

- **Token không hợp lệ**: User có enabled nhưng token Ksystem/HRM hết hạn hoặc invalid → **không** chạy job nhưng **vẫn gửi notification** thông báo "Token không còn hợp lệ, vui lòng đăng nhập lại".

### 3. Xác nhận hoặc tự duyệt

- **User xác nhận**: Gọi **POST /automation/approve** với `pendingActionId` → hệ thống thực hiện ngay (submit review / tạo đơn theo payload) → cập nhật executedAt.
- **User từ chối**: Gọi **POST /automation/reject** → đánh dấu status = rejected, không gọi API bên ngoài.
- **Không phản hồi**: Cron **AutoApproveSchedulerService** (mỗi 5 phút) tìm PendingAction có status = pending và expiresAt < now → đánh dấu auto_approved → thực hiện giống khi user bấm Duyệt.

## API Endpoints

Tất cả endpoint automation yêu cầu **App JWT** (Authorization: Bearer &lt;appToken&gt;). Không yêu cầu system (Ksystem/HRM) trong decorator.

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/automation/settings` | Lấy tất cả automation settings của user hiện tại |
| GET | `/automation/settings/:jobType` | Lấy setting theo jobType (auto-review-checklist \| auto-create-forms) |
| PUT | `/automation/settings/:jobType` | Cập nhật setting (enabled, params, notificationChannel, notificationTarget, autoApproveAfterMinutes) |
| GET | `/automation/pending-actions` | Lấy danh sách pending actions của user |
| POST | `/automation/approve` | Body: `{ pendingActionId }` — xác nhận và thực hiện ngay |
| POST | `/automation/reject` | Body: `{ pendingActionId }` — từ chối |

## Cấu trúc Backend

### Modules

- **AutomationModule**: Controller + AutomationService, bảo vệ bởi AppJwtGuard
- **SchedulerModule**: ChecklistSchedulerService, TimesheetSchedulerService, AutoApproveSchedulerService
- **NotificationModule**: NotificationService, TelegramNotificationService

### Database (Prisma)

- **UserAutomationSetting**: userId, jobType, enabled, params (JSON), notificationChannel, notificationTarget, autoApproveAfterMinutes
- **PendingAction**: userId, jobType, payload (JSON), status, notifiedAt, expiresAt, approvedAt, executedAt, error
- **JobLog**: jobName, userId, status, details, error, startedAt, completedAt, duration

### Config (AppConfigService)

- JWT: `jwtSecret`, `jwtExpiresIn`
- Notification: `telegramBotToken`, `appUrl`

Biến môi trường đọc qua `configService.getConfig()`, không dùng trực tiếp `process.env` trong logic nghiệp vụ.

## Frontend

- **Tab Tự động hóa**: `frontend/components/account/AutomationSettings.tsx`
- **Hooks**: `use-automation-settings.ts`, `use-pending-actions.ts`
- **API client**: `frontend/lib/api/automation.ts`

Validation khi bật automation: kênh thông báo, notification target và thời gian tự duyệt là bắt buộc (cả frontend và backend DTO với `ValidateIf(o => o.enabled === true)`).

## Biến môi trường (Backend)

- `JWT_SECRET`, `JWT_EXPIRES_IN`: App JWT
- `TELEGRAM_BOT_TOKEN`: Telegram Bot (nếu không cấu hình thì notification Telegram không gửi được)
- `APP_URL`: Base URL dùng cho link trong notification (vd: http://localhost:3000)

Xem đầy đủ trong `backend/.env.example`.

## Tài liệu liên quan

- **00-tong-quan.md**: Tổng quan hệ thống và mục lục docs
- **01-authentication.md**: App JWT, system tokens
