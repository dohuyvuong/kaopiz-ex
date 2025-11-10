# Hướng dẫn cấu hình .env

Tạo file `.env` trong thư mục gốc với nội dung sau:

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:3000

# Microsoft Entra ID (Azure AD) Configuration
# Từ link SSO: https://login.microsoftonline.com/848fba98-f4e3-4c6c-9bfd-d1372c73e936/oauth2/v2.0/authorize
AZURE_TENANT_ID=848fba98-f4e3-4c6c-9bfd-d1372c73e936
AZURE_CLIENT_ID=e756092c-7a97-4fa1-9cc3-cd418b1d7d63
AZURE_CLIENT_SECRET=
AZURE_REDIRECT_URI=https://ksystem.kaopiz.com/auth/microsoft
AZURE_SCOPE=user.read openid profile offline_access
AZURE_AUTHORITY=https://login.microsoftonline.com/848fba98-f4e3-4c6c-9bfd-d1372c73e936
AZURE_TOKEN_ENDPOINT=https://login.microsoftonline.com/848fba98-f4e3-4c6c-9bfd-d1372c73e936/oauth2/v2.0/token

# Kaopiz Configuration
KAOPIZ_API_BASE_URL=https://ksystem.kaopiz.com/api
KAOPIZ_SOCIAL_LOGIN_ENDPOINT=https://ksystem.kaopiz.com/api/sociallogin/microsoft
```

## Giải thích các biến

### Server Configuration
- `PORT`: Port để chạy backend server (mặc định: `8000`)
- `CORS_ORIGIN`: Origin được phép gọi API từ frontend (mặc định: `http://localhost:3000`)
  - Có thể cấu hình multiple origins: `http://localhost:3000,http://localhost:3001`

### Microsoft Entra ID (Azure AD)
- `AZURE_TENANT_ID`: Tenant ID của Azure AD
- `AZURE_CLIENT_ID`: Client ID của ứng dụng Azure AD
- `AZURE_CLIENT_SECRET`: Client Secret (có thể để trống, không bắt buộc)
- `AZURE_REDIRECT_URI`: Redirect URI đã được cấu hình trong Azure AD
- `AZURE_SCOPE`: Các scope cần thiết cho OAuth
- `AZURE_AUTHORITY`: Authority URL của Azure AD
- `AZURE_TOKEN_ENDPOINT`: Token endpoint của Azure AD (dùng cho refresh token)

### Kaopiz
- `KAOPIZ_API_BASE_URL`: Base URL của APIs Kaopiz (mặc định: https://ksystem.kaopiz.com/api)
- `KAOPIZ_SOCIAL_LOGIN_ENDPOINT`: Endpoint để đổi authorization code thành JWT token (tùy chọn, mặc định sẽ dùng `${KAOPIZ_API_BASE_URL}/sociallogin/microsoft`)

## Lấy Token

### Qua API Endpoints

**Quy trình:**
1. Khởi động server: `yarn start:dev` (chạy trên port 8000 mặc định)
2. Gọi `GET http://localhost:8000/auth/authorize` - Trả về authorization URL
3. Client tự mở URL trong browser để đăng nhập
4. Sau khi đăng nhập, copy toàn bộ URL từ thanh địa chỉ
5. Gọi `POST http://localhost:8000/auth/token` với body `{ "url": "..." }`
6. Token được trả về cho client, client tự lưu (không lưu ở server)

**Ví dụ:**
```bash
# Bước 1: Lấy authorization URL
curl http://localhost:8000/auth/authorize

# Response:
# {
#   "success": true,
#   "authUrl": "https://login.microsoftonline.com/...",
#   ...
# }

# Bước 2: Đổi code thành token
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ksystem.kaopiz.com/auth/microsoft#code=0.ABC123...&session_state=xyz..."}'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   ...
# }
```

**Ví dụ URL callback:**
```
https://ksystem.kaopiz.com/auth/microsoft#code=0.ABC123...&session_state=xyz...
```

## Lưu ý

1. **PORT**: Backend mặc định chạy trên port `8000` (tránh conflict với NextJS port `3000`)
2. **CORS_ORIGIN**: Cấu hình origin của frontend để cho phép gọi API
3. **AZURE_CLIENT_SECRET**: Không bắt buộc cho SSO flow
4. **KAOPIZ_SOCIAL_LOGIN_ENDPOINT**: Endpoint này sẽ nhận `code` và `session_state` để trả về JWT token
5. **Token**: Token không được lưu ở server, client phải gửi kèm trong header `Authorization: Bearer <token>` cho mỗi request
