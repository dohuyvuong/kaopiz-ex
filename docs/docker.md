# Chạy dự án bằng Docker Compose

## Yêu cầu

- Docker & Docker Compose
- Backend và frontend trong container build với **Node.js 24** (`node:24-alpine` trong Dockerfile).
- (Khuyến nghị) File `.env` ở thư mục gốc: copy từ `.env.example` (`cp .env.example .env`) rồi chỉnh giá trị. File `.env.example` gộp đủ biến cho db, backend và frontend khi chạy Docker.

## Cấu hình DB: PostgreSQL

Dự án dùng **PostgreSQL** (đã chuyển từ SQLite). Trong Docker Compose:

- Service **db**: Postgres 16 Alpine, port 5432
- Backend kết nối qua `DATABASE_URL` (tự build từ `POSTGRES_*`)

Biến môi trường mặc định (có thể ghi đè bằng file `.env` ở thư mục gốc):

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| POSTGRES_USER | kaopiz_ex | User Postgres |
| POSTGRES_PASSWORD | kaopiz_ex_secret | Mật khẩu Postgres |
| POSTGRES_DB | kaopiz_ex | Tên database |
| JWT_SECRET | change-me-in-production | **Bắt buộc đổi** khi deploy thật |
| APP_URL | http://localhost:3000 | URL frontend (cho link Telegram, OAuth callback) |
| NEXT_PUBLIC_API_BASE_URL | http://localhost:8000 | URL API (trình duyệt gọi) |

## Chạy

```bash
# Ở thư mục gốc dự án
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Postgres: localhost:5432 (user/pass/db theo biến trên)

## Chỉ chạy DB + Backend

```bash
docker compose up -d db backend
```

## Migrations

Backend container khi start sẽ tự chạy `prisma migrate deploy` (retry 10 lần chờ Postgres sẵn sàng). Không cần chạy migrate tay.

## Ghi chú

- **Backend**: Cần `JWT_SECRET`; các biến Azure/HRM/Telegram/OAuth đặt trong `.env` hoặc env của compose nếu dùng tính năng tương ứng.
- **Frontend**: `NEXT_PUBLIC_API_BASE_URL` được bake vào lúc build; đổi URL API thì cần build lại image (hoặc dùng giá trị lúc build qua build args).
