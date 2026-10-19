# Chạy dự án bằng Docker Compose

## Yêu cầu

- Docker & Docker Compose
- Backend và frontend trong container build với **Node.js 24** (`node:24-alpine` trong Dockerfile).
- (Khuyến nghị) File `.env` ở thư mục gốc: copy từ `.env.example` (`cp .env.example .env`) rồi chỉnh giá trị. File `.env.example` gộp đủ biến cho db, backend và frontend khi chạy Docker.

## Profiles

Một file `docker-compose.yml`, bật service theo profile:

| Profile | Services | Khi nào dùng |
|---------|----------|--------------|
| `db` | Postgres | Dev local cần DB trong Docker; hoặc prod tự host DB |
| `app` | backend + frontend | Deploy ứng dụng (luôn đi cùng nhau) |
| `edge` | nginx + keep-alive | Prod có domain public / SSL, mở port 80/443 |
| `tunnel` | cloudflared | Prod đi qua Cloudflare Tunnel — thay cho `edge`, không mở port |

**Lưu ý:** Mọi service đều gắn profile — `docker compose up -d` không bật gì cả; phải chỉ rõ profile.

## Cấu hình DB: PostgreSQL

Dự án dùng **PostgreSQL** (đã chuyển từ SQLite).

- **Profile `db`:** Postgres 16 Alpine, publish `127.0.0.1:5432` (đổi bằng `POSTGRES_BIND` / `POSTGRES_PORT`), volume `postgres_data`.
- **Không dùng profile `db`:** set `DATABASE_URL` trong `.env` trỏ Postgres ngoài (managed DB, Postgres cài trên host, …).

Khi bật profile `db`, backend container mặc định dùng:

`postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`

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
# Chỉ Postgres (backend/frontend chạy bằng yarn trên máy)
docker compose --profile db up -d

# DB + app trong Docker (dev/staging)
docker compose --profile db --profile app up -d --build
# hoặc
make up

# Production: DB + app + nginx + keep-alive
docker compose --profile db --profile app --profile edge up -d
# hoặc
make up-prod
```

Với profile `edge`, truy cập qua domain (`PRIMARY_DOMAIN`) trên port 80/443. Postgres: `localhost:${POSTGRES_PORT:-5432}` khi bật profile `db`.

## Deploy qua Cloudflare Tunnel (one-click)

Profile `tunnel` thay cho `edge`: không nginx, không mở port 80/443, chạy bằng `./deploy.sh` (Windows: `deploy.cmd`). Hướng dẫn từng bước: [deploy-tunnel.md](./deploy-tunnel.md).

## Migrations

Backend container khi start sẽ tự chạy `prisma migrate deploy` (retry 10 lần chờ Postgres sẵn sàng). Không cần chạy migrate tay.

## Ghi chú

- **Backend**: Cần `JWT_SECRET`; các biến Azure/HRM/Telegram/OAuth đặt trong `.env` hoặc env của compose nếu dùng tính năng tương ứng.
- **Frontend**: `NEXT_PUBLIC_API_BASE_URL` được bake vào lúc build; đổi URL API thì cần build lại image (hoặc dùng giá trị lúc build qua build args).
- **DB ngoài Docker**: bỏ profile `db`, set `DATABASE_URL` trong `.env`; vẫn có thể dùng `--profile app --profile edge`.
