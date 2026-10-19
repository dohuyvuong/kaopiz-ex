# Hướng dẫn cấu hình .env

Tạo file `.env` trong thư mục `backend` dựa trên `.env.example`:

```bash
cp .env.example .env
```

Sau đó điền các giá trị thực tế vào file `.env`.

## Các biến môi trường

### Server Configuration
- `PORT`: Port để chạy backend server (mặc định: `8000`)
- `CORS_ORIGIN`: Origin được phép gọi API từ frontend (mặc định: `http://localhost:3000`)
  - Có thể cấu hình multiple origins: `http://localhost:3000,http://localhost:3001`

### Microsoft Entra ID (Azure AD) - Cho Ksystem
Các biến này dùng để đăng nhập vào Ksystem thông qua Microsoft SSO.

Đây là app Azure của Ksystem, không phải secret: client ID và tenant ID hiện sẵn trên URL khi đăng nhập Ksystem bằng Microsoft. `.env.example` đã điền sẵn giá trị thật.

- `AZURE_CLIENT_ID`: Client ID của app Azure (không có giá trị mặc định — bắt buộc nếu dùng `microsoft-sso`)
- `AZURE_REDIRECT_URI`: Redirect URI đã đăng ký cho app đó, tức trang của Ksystem: `https://ksystem.kaopiz.com/auth/microsoft`. Không dùng domain của app này (vd: `http://localhost:3000/...`), Microsoft sẽ báo redirect URI không khớp.
- `AZURE_SCOPE`: Các quyền cần yêu cầu (mặc định: `user.read openid profile offline_access`)
- `AZURE_AUTHORITY`: `https://login.microsoftonline.com/<tenant_id>` — **không** thêm `/v2.0` hay `/oauth2/...` ở cuối, code tự nối `/oauth2/v2.0/authorize` (không có giá trị mặc định — bắt buộc nếu dùng `microsoft-sso`)

### Ksystem API
- `KSYSTEM_API_BASE_URL`: Base URL của Ksystem API (mặc định: `https://ksystem.kaopiz.com/api`)
- `KSYSTEM_SOCIAL_LOGIN_ENDPOINT`: Endpoint để exchange Microsoft SSO code thành JWT token (mặc định: `https://ksystem.kaopiz.com/api/sociallogin/microsoft`)

### Ksystem OAuth - Cho HRM
Các biến này dùng để đăng nhập vào HRM thông qua Ksystem OAuth.

- `KSYSTEM_OAUTH_BASE_URL`: Base URL của Ksystem OAuth server (mặc định: `https://ksystem.kaopiz.com`)
- `KSYSTEM_OAUTH_CLIENT_ID`: Client ID của ứng dụng trong Ksystem OAuth (mặc định: `7`)
- `KSYSTEM_OAUTH_REDIRECT_URI`: Redirect URI sau khi đăng nhập (mặc định: `https://api.hrm.kaopiz.com/api/auth/callback`)

**Lưu ý:**
- Flow này không cần `CLIENT_SECRET` vì HRM API tự xử lý callback và trả về token.
- Khi gọi `GET /auth/ksystem-oauth/authorize`, có thể truyền tham số `redirectOAuth` (ví dụ: `?redirectOAuth=http://localhost:3000/auth/callback`) để sau khi đăng nhập thành công, Ksystem sẽ redirect về URL đó với code trong query string. Điều này giúp client có thể lấy được code từ URL.

### Database
- `DATABASE_URL`: Chuỗi kết nối PostgreSQL, vd: `postgresql://user:pass@localhost:5432/kaopiz_ex` (bắt buộc, không có mặc định). Chạy bằng Docker Compose với profile `db` thì compose tự tạo từ `POSTGRES_*`.

### App JWT
- `JWT_SECRET`: Khoá ký JWT của app (bắt buộc, không có mặc định). Production dùng chuỗi ngẫu nhiên, vd: `openssl rand -hex 32`.
- `JWT_EXPIRES_IN`: Thời hạn token (mặc định: `1h`)

### App URL & Telegram
- `APP_URL`: URL public của frontend, dùng làm link trong tin nhắn Telegram (mặc định: `http://localhost:3000`). Để `localhost` thì tin nhắn không có nút Duyệt/Từ chối.
- `TELEGRAM_BOT_TOKEN`: Token bot Telegram gửi thông báo (tuỳ chọn; để trống thì không gửi)

### HRM API
- `HRM_API_BASE_URL`: Base URL của HRM API, **đã bao gồm hậu tố `/api`** (mặc định: `https://api.hrm.kaopiz.com/api`)
  - **Lưu ý**: Base URL này đã bao gồm `/api` ở cuối, vì vậy các endpoint sẽ không cần thêm `/api` nữa
  - Ví dụ: Nếu `HRM_API_BASE_URL=https://api.hrm.kaopiz.com/api`, thì endpoint `/timesheets/owner-calendar` sẽ gọi đến `https://api.hrm.kaopiz.com/api/timesheets/owner-calendar`

## Lưu ý

1. Phần lớn biến có giá trị mặc định trong code, trừ `DATABASE_URL`, `JWT_SECRET`, `AZURE_CLIENT_ID`, `AZURE_AUTHORITY` (và `TELEGRAM_BOT_TOKEN` nếu cần thông báo). Vẫn nên cấu hình rõ ràng trong `.env` để tránh lỗi.
2. File `.env` không được commit vào git (đã có trong `.gitignore`).
3. Sử dụng `.env.example` làm template và điền các giá trị thực tế vào `.env`.
