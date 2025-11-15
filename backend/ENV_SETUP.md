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

- `AZURE_TENANT_ID`: Tenant ID của Microsoft Entra ID
- `AZURE_CLIENT_ID`: Client ID của ứng dụng trong Azure AD
- `AZURE_CLIENT_SECRET`: Client Secret (optional, không cần cho public client)
- `AZURE_REDIRECT_URI`: Redirect URI sau khi đăng nhập (phải khớp với cấu hình trong Azure AD)
- `AZURE_SCOPE`: Các quyền cần yêu cầu (mặc định: `user.read openid profile offline_access`)
- `AZURE_AUTHORITY`: Authority URL của Microsoft Entra ID
- `AZURE_TOKEN_ENDPOINT`: Token endpoint URL

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

### HRM API
- `HRM_API_BASE_URL`: Base URL của HRM API, **đã bao gồm hậu tố `/api`** (mặc định: `https://api.hrm.kaopiz.com/api`)
  - **Lưu ý**: Base URL này đã bao gồm `/api` ở cuối, vì vậy các endpoint sẽ không cần thêm `/api` nữa
  - Ví dụ: Nếu `HRM_API_BASE_URL=https://api.hrm.kaopiz.com/api`, thì endpoint `/timesheets/owner-calendar` sẽ gọi đến `https://api.hrm.kaopiz.com/api/timesheets/owner-calendar`

## Lưu ý

1. Tất cả các biến môi trường đều có giá trị mặc định trong code, nhưng nên cấu hình rõ ràng trong `.env` để tránh lỗi.
2. File `.env` không được commit vào git (đã có trong `.gitignore`).
3. Sử dụng `.env.example` làm template và điền các giá trị thực tế vào `.env`.
