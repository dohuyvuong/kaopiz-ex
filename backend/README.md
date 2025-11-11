# KaopizEX - Backend

Hệ thống tích hợp để sử dụng (gọi API) của các hệ thống Kaopiz như Ksystem, HRM, và các hệ thống khác trong tương lai.

**Built with NestJS and TypeScript**

## Kiến trúc

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  KaopizEX   │ ──────> │   Ksystem   │ <────── │  Microsoft  │
│             │  API    │             │  SSO    │     SSO     │
│  (NestJS)   │ (JWT)   │  (APIs)     │         │             │
└─────────────┘         └─────────────┘         └─────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  KaopizEX   │ ──────> │     HRM     │ <────── │   Ksystem   │
│             │  API    │             │  OAuth  │   OAuth      │
│  (NestJS)   │ (JWT)   │  (APIs)     │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Cài đặt

```bash
yarn install
```

## Cấu hình

1. Tạo file `.env` từ template `.env.example`:
```bash
cp .env.example .env
```

2. Điền thông tin vào `.env` (xem chi tiết trong `ENV_SETUP.md`)

## Authentication Providers

Hệ thống hỗ trợ nhiều authentication providers:

### 1. Microsoft SSO (cho Ksystem)
- Provider name: `microsoft-sso`
- System: `ksystem`
- Flow: Microsoft SSO → Ksystem JWT Token

### 2. Ksystem OAuth (cho HRM)
- Provider name: `ksystem-oauth`
- System: `hrm`
- Flow: Ksystem OAuth → HRM JWT Token

## API Endpoints

### Authentication

#### Lấy danh sách providers
```bash
GET /auth/providers
```

#### Lấy authorization URL cho provider
```bash
GET /auth/:provider/authorize
# Ví dụ: GET /auth/microsoft-sso/authorize
# Ví dụ: GET /auth/ksystem-oauth/authorize?redirectOAuth=optional_url
```

#### Exchange code thành token
```bash
POST /auth/:provider/token
# Body: { "url": "..." } hoặc { "code": "...", "state": "..." }
# Ví dụ: POST /auth/microsoft-sso/token
# Ví dụ: POST /auth/ksystem-oauth/token
```

### Checklist (Ksystem APIs)

Tất cả endpoints yêu cầu `Authorization: Bearer <token>` header với token từ Microsoft SSO.

#### Lấy danh sách code reviews đang chờ review
```bash
GET /checklist/pending-reviews?projectName=...&page=1&perPage=20
```

#### Tự động review
```bash
POST /checklist/auto-review?maxReviews=10&projectName=...
```

## Lấy JWT Token

### Quy trình cho Microsoft SSO (Ksystem)

1. Khởi động server: `yarn start:dev`
2. Gọi `GET http://localhost:8000/auth/microsoft-sso/authorize` - Lấy authorization URL
3. Client tự mở URL trong browser để đăng nhập
4. Sau khi đăng nhập, copy toàn bộ URL từ thanh địa chỉ
5. Gọi `POST http://localhost:8000/auth/microsoft-sso/token` với body `{ "url": "..." }`
6. Token được trả về cho client, client tự lưu (không lưu ở server)

**Ví dụ:**
```bash
# Bước 1: Lấy authorization URL
curl http://localhost:8000/auth/microsoft-sso/authorize

# Response:
# {
#   "success": true,
#   "data": {
#     "authUrl": "https://login.microsoftonline.com/...",
#     "provider": "microsoft-sso",
#     "system": "ksystem"
#   }
# }

# Bước 2: Đổi code thành token
curl -X POST http://localhost:8000/auth/microsoft-sso/token \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ksystem.kaopiz.com/auth/microsoft#code=0.ABC123...&session_state=xyz..."}'

# Response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "system": "ksystem",
#     "provider": "microsoft-sso"
#   }
# }
```

### Quy trình cho Ksystem OAuth (HRM)

1. Gọi `GET http://localhost:8000/auth/ksystem-oauth/authorize` - Lấy authorization URL
2. Client tự mở URL trong browser để đăng nhập
3. Sau khi đăng nhập, copy toàn bộ URL từ thanh địa chỉ
4. Gọi `POST http://localhost:8000/auth/ksystem-oauth/token` với body `{ "url": "..." }`
5. Token được trả về cho client

## Chạy

```bash
# Development mode (auto-reload)
yarn start:dev

# Build project
yarn build

# Chạy ứng dụng (production)
yarn start:prod

# Lint code
yarn lint

# Format code
yarn format
```

## Cấu trúc Project

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── config/                 # Configuration
│   ├── config.module.ts
│   └── config.service.ts
├── auth/                   # Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── providers/          # Authentication providers
│   │   ├── microsoft-sso.provider.ts
│   │   └── ksystem-oauth.provider.ts
│   ├── services/           # Auth services
│   │   ├── auth.service.ts
│   │   └── token-store.service.ts
│   ├── guards/             # Auth guards
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt-auth-system.guard.ts
│   └── decorators/         # Custom decorators
│       ├── auth.decorator.ts
│       └── system.decorator.ts
├── api/                    # API services
│   ├── api.module.ts
│   └── services/
│       ├── ksystem.service.ts
│       ├── hrm.service.ts
│       └── checklist.service.ts
├── checklist/              # Checklist module
│   ├── checklist.controller.ts
│   └── checklist-auto-review.service.ts
├── interfaces/             # TypeScript interfaces
│   ├── config.interface.ts
│   └── token.interface.ts
└── utils/                  # Utilities
    └── extract-auth-params.util.ts
```

## Token Management

- Token không được lưu ở server
- Client phải gửi kèm token trong header `Authorization: Bearer <token>` cho mỗi request
- Token được validate bằng cách gọi API của hệ thống tương ứng

## Lưu ý

1. **Bảo mật**: Không commit file `.env` vào git
2. **Token Management**: Token được quản lý bởi client, không lưu ở server
3. **Multi-Provider**: Hệ thống hỗ trợ nhiều providers, mỗi provider cho một hệ thống khác nhau
4. **Error Handling**: Xử lý lỗi authentication và API errors

## Troubleshooting

### Lỗi: "Provider 'xxx' không tồn tại"

**Giải pháp:**
- Kiểm tra provider name có đúng không (ví dụ: `microsoft-sso`, `ksystem-oauth`)
- Xem danh sách providers: `GET /auth/providers`

### Lỗi: "Token không hợp lệ hoặc đã hết hạn"

**Giải pháp:**
- Token đã hết hạn, cần lấy token mới
- Đảm bảo đang dùng đúng token cho đúng hệ thống (ksystem token cho Ksystem APIs, hrm token cho HRM APIs)

### Lỗi: "Không tìm thấy authorization code trong URL"

**Giải pháp:**
- Đảm bảo copy toàn bộ URL từ browser (bao gồm cả `#code=...` hoặc `?code=...`)
- URL phải có format đúng với provider tương ứng
