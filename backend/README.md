# KaopizEX - Tự động hóa flow trên Kaopiz

KaopizEX để gọi APIs của Kaopiz với JWT Token từ Microsoft SSO.

**Built with NestJS and TypeScript**

## Kiến trúc

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  KaopizEX   │ ──────> │   Kaopiz    │ <────── │  Microsoft  │
│             │  API    │             │  SSO    │     SSO     │
│  (NestJS)   │ (JWT)   │  (APIs)     │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Cài đặt

```bash
npm install
```

## Cấu hình

1. Tạo file `.env` từ template `.env.example`:
```bash
cp .env.example .env
```

2. Điền thông tin vào `.env` (xem chi tiết trong `ENV_SETUP.md`)

## Lấy JWT Token

### Qua API Endpoints

**Quy trình:**
1. Khởi động server: `npm run start:dev`
2. Gọi `GET http://localhost:3000/auth/authorize` - Tự động mở browser để đăng nhập
3. Sau khi đăng nhập, copy toàn bộ URL từ thanh địa chỉ
4. Gọi `POST http://localhost:3000/auth/token` với body `{ "url": "..." }`
5. Token được lưu vào cache tự động

**Ví dụ:**
```bash
# Bước 1: Lấy authorization URL (tự động mở browser)
curl http://localhost:3000/auth/authorize

# Bước 2: Đổi code thành token
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ksystem.kaopiz.com/auth/microsoft#code=...&session_state=..."}'

# Bước 3: Kiểm tra trạng thái token
curl http://localhost:3000/auth/status
```

**Lưu ý:**
- Token được cache và tự động refresh khi hết hạn

## Sử dụng

### Basic Usage

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KaopizService } from './api/kaopiz.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const kaopizService = app.get(KaopizService);

  // Gọi API GET
  const data = await kaopizService.get('/checklist');

  // Gọi API POST
  const result = await kaopizService.post('/checklist/review', {
    checklistId: '123',
    action: 'review'
  });

  await app.close();
}

bootstrap();
```

### Auto Flow

```typescript
const flowResult = await kaopizService.executeAutoFlow({
  checklistId: '123',
  action: 'review',
  data: {
    status: 'approved',
    notes: 'Auto approved by KaopizEX'
  }
});
```

## Chạy

```bash
# Build project
npm run build

# Chạy ứng dụng (production)
npm run start:prod

# Development mode (auto-reload)
npm run start:dev

# Lint code
npm run lint

# Format code
npm run format
```

## Cấu trúc Project

```
src/
├── main.ts                 # Entry point
├── app.module.ts          # Root module
├── config/                # Configuration
│   ├── config.module.ts
│   └── config.service.ts
├── auth/                  # Authentication
│   ├── auth.module.ts
│   └── token.service.ts
├── api/                   # API services
│   ├── api.module.ts
│   └── kaopiz.service.ts
├── interfaces/            # TypeScript interfaces
│   ├── config.interface.ts
│   └── token.interface.ts
└── utils/                 # Utilities
    └── extract-auth-params.util.ts
```

## Token Management

- Token được lưu tự động vào `.token-cache.json`
- Tự động refresh khi hết hạn (nếu có refresh_token)
- Token cache được sử dụng cho các lần gọi API tiếp theo

## Lưu ý

1. **Bảo mật**: Không commit file `.env` và `.token-cache.json` vào git
2. **Token Management**: Token được cache tự động, refresh khi cần
3. **Error Handling**: Xử lý lỗi authentication và API errors

## Troubleshooting

### Lỗi: "Không có token"

**Giải pháp:**
1. Gọi `GET /auth/authorize` để lấy token từ SSO
2. Kiểm tra file `.token-cache.json` có tồn tại và hợp lệ không

### Lỗi: "API Error: 401"

**Giải pháp:**
- Token đã hết hạn, gọi lại `GET /auth/authorize` để lấy token mới
- Kiểm tra token có đúng format không

### Lỗi: "Không tìm thấy authorization code trong URL"

**Giải pháp:**
- Đảm bảo copy toàn bộ URL từ browser (bao gồm cả `#code=...`)
- URL phải có format: `https://ksystem.kaopiz.com/auth/microsoft#code=...&session_state=...`
