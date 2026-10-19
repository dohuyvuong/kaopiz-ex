# Deploy one-click qua Cloudflare Tunnel

Deploy toàn bộ stack (Postgres + backend + frontend) lên một máy chủ Linux hoặc Windows bằng một lệnh, public ra Internet qua Cloudflare Tunnel.

- Không cần nginx/certbot, không mở port 80/443, không cần IP public: Cloudflare lo HTTPS, `cloudflared` chủ động nối ra Cloudflare.
- Frontend và backend không publish port ra host, chỉ nghe trong mạng nội bộ của compose. Server đang chạy service khác trên 80/443/3000/8000/8080… không bị ảnh hưởng.
- API nằm ở **subdomain riêng** (vd: `kaopiz-ex-api.example.com`). Lý do: `cloudflared` chỉ match được path chứ không cắt prefix `/api` như nginx, mà backend không có global prefix.

Các bước 1–4 chỉ làm một lần. Những lần deploy sau chỉ cần [bước 5](#5-deploy).

## 1. Chuẩn bị

| | Linux | Windows 10/11 |
|---|---|---|
| Docker | Docker Engine + plugin Compose v2 (`docker compose version` chạy được) | Docker Desktop, chế độ **Linux containers** (WSL2) |
| Git | `git` | Git for Windows (cung cấp Git Bash để chạy script) |

- Domain phải đang dùng nameserver của Cloudflare.
- Windows Server chỉ có Docker Engine (không có Docker Desktop) thì **không dùng được**: nó chỉ chạy Windows containers.
- Windows: Docker Desktop chỉ chạy khi có người đăng nhập. Muốn stack tự lên lại sau khi khởi động lại máy, bật *Settings → General → Start Docker Desktop when you sign in*.

## 2. Tạo tunnel trên Cloudflare

1. Vào [Cloudflare Zero Trust](https://one.dash.cloudflare.com) → **Networks → Tunnels → Create a tunnel** → chọn **Cloudflared** → đặt tên (vd: `kaopiz-ex`).
2. Ở bước cài connector, **copy lệnh cài** có chứa `--token eyJ...` rồi lưu tạm lại (dán nguyên lệnh vào script cũng được). **Không cần chạy lệnh đó**: container `cloudflared` trong compose sẽ làm việc này.
3. **Trỏ domain vào tunnel**: thêm 2 route ở tab **Public Hostname** của tunnel (giao diện mới gọi là *Published application routes*):

   | Hostname | Service |
   |----------|---------|
   | `kaopiz-ex.example.com` | `HTTP` → `frontend:3000` |
   | `kaopiz-ex-api.example.com` | `HTTP` → `backend:8000` |

   Đặt cả hai hostname ở **subdomain cấp 1** như trên. Chứng chỉ miễn phí của Cloudflare (Universal SSL) chỉ phủ `example.com` và `*.example.com`; hostname kiểu `api.kaopiz-ex.example.com` sẽ lỗi HTTPS nếu không mua Advanced Certificate.

   Service phải là **tên service trong compose** (`frontend`, `backend`), không phải `localhost`. Port lấy theo `FRONTEND_PORT` / `BACKEND_PORT` trong `.env`.

4. Lưu route xong, **dashboard Cloudflare tự tạo bản ghi DNS** cho từng hostname, không cần vào trang DNS. `deploy.sh` không đụng tới DNS hay route: nó chỉ dùng token để container `cloudflared` nối vào tunnel. Đổi hostname/port sau này thì sửa trên dashboard, không cần deploy lại.

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | `CNAME` | `kaopiz-ex` | `<tunnel-id>.cfargotunnel.com` | Proxied (đám mây cam) |
   | `CNAME` | `kaopiz-ex-api` | `<tunnel-id>.cfargotunnel.com` | Proxied (đám mây cam) |

   Kiểm tra ở **DNS → Records** của domain. `<tunnel-id>` là ID hiện trong danh sách Tunnels.

   - Báo *record already exists*: hostname đó đã có bản ghi khác (vd: A record trỏ về server cũ). Xoá bản ghi cũ trong **DNS → Records** rồi lưu lại route.
   - Không thấy bản ghi được tạo (vd: domain nằm ở tài khoản Cloudflare khác): tự thêm 2 bản ghi CNAME như bảng trên, **bật Proxied**. Để DNS only thì không chạy, vì `cfargotunnel.com` không có IP public.

   DNS của Cloudflare cập nhật gần như ngay; vào được hostname mà thấy lỗi 1033 nghĩa là DNS đã đúng nhưng tunnel chưa chạy — sẽ hết sau khi deploy ở bước 5.

Domain phụ (domain cũ, `www`…) trước đây được nginx redirect về domain chính. Giờ việc này làm bằng **Rules → Redirect Rules** trên Cloudflare.

## 3. Lấy code về máy chủ

```bash
git clone <repo-url> kaopiz-ex
cd kaopiz-ex
cp .env.example .env
```

Windows: clone bằng Git for Windows. Repo có `.gitattributes` để giữ file `.sh` ở dạng LF. Nếu clone trước khi có file này mà gặp lỗi `/bin/sh^M: not found` khi backend khởi động, xoá thư mục rồi clone lại.

## 4. Cấu hình `.env`

`.env.example` đã có đủ mọi biến mà backend, frontend và compose dùng. Phân loại theo việc có phải sửa hay không:

**Bắt buộc sửa**

| Biến | Giá trị |
|------|---------|
| `APP_URL` | `https://kaopiz-ex.example.com`. Dùng làm link trong tin nhắn Telegram. |
| `CORS_ORIGIN` | Giống `APP_URL`, không có `/` ở cuối. Nhiều origin thì ngăn cách bằng dấu phẩy. |
| `NEXT_PUBLIC_API_BASE_URL` | `https://kaopiz-ex-api.example.com`. Subdomain riêng, **không** phải `.../api`. Được bake vào frontend lúc build. |
| `JWT_SECRET` | Chuỗi ngẫu nhiên, vd: `openssl rand -hex 32`. Script từ chối chạy nếu còn trống hoặc là `change-me-in-production`. Đổi giá trị này thì mọi người phải đăng nhập lại. |
| `POSTGRES_PASSWORD` | Mật khẩu ngẫu nhiên. Chỉ đặt được **trước** lần chạy đầu: Postgres chỉ đọc biến này khi tạo volume, đổi sau thì backend không kết nối được DB. |
| `CLOUDFLARE_TUNNEL_TOKEN` | Để trống cũng được: script hỏi ở lần chạy đầu và tự lưu vào. |

**Theo tính năng** (để trống thì tính năng đó không chạy)

| Biến | Dùng cho |
|------|----------|
| `TELEGRAM_BOT_TOKEN` | Gửi thông báo Telegram |

**Đã có giá trị đúng, thường giữ nguyên**

| Biến | Ghi chú |
|------|---------|
| `BACKEND_IMAGE`, `FRONTEND_IMAGE` | Tên tag image script build ra. |
| `IMAGE_PLATFORM` | Mặc định `linux/amd64`. Server ARM đổi thành `linux/arm64`, không thì build qua giả lập rất chậm. |
| `BACKEND_PORT`, `FRONTEND_PORT` | Port trong mạng nội bộ compose, không đụng port của host. Đổi thì sửa luôn route trên Cloudflare. |
| `BACKEND_HOST`, `FRONTEND_HOST` | Hostname container. Nằm dưới mục *Nginx* trong `.env.example` nhưng compose vẫn dùng, đừng xoá. |
| `POSTGRES_USER`, `POSTGRES_DB` | Tên user/database. |
| `JWT_EXPIRES_IN` | Thời hạn token, mặc định `1h`. |
| `AZURE_CLIENT_ID`, `AZURE_AUTHORITY`, `AZURE_SCOPE`, `AZURE_REDIRECT_URI` | Đăng nhập Microsoft (`microsoft-sso`). Đã điền giá trị thật của app Azure bên Ksystem — không phải secret. Redirect URI trỏ về Ksystem, không phụ thuộc domain của app. |
| `KSYSTEM_*`, `HRM_API_BASE_URL` | URL và client của Ksystem/HRM. |

**Tuỳ chọn**

| Biến | Khi nào cần |
|------|-------------|
| `POSTGRES_PORT` | Server đã có service dùng port 5432. Postgres chỉ publish trên `127.0.0.1` (máy khác không truy cập được); đổi port để tránh xung đột. |
| `POSTGRES_BIND` | Cần cho máy khác kết nối thẳng vào DB thì đặt `0.0.0.0`. |
| `DATABASE_URL` | Dùng Postgres ngoài thay vì container `db`. Có biến này thì script không bật profile `db`, và `POSTGRES_*` không còn tác dụng. |

**Không dùng với tunnel** (chỉ cho profile `edge`): `NGINX_IMAGE`, `PRIMARY_DOMAIN`, `EXTRA_DOMAINS`, `CERTBOT_EMAIL`, `CERTBOT_STAGING`.

Đăng nhập Ksystem OAuth: frontend gửi `https://<domain frontend>/auth/callback` làm `redirect_oauth`. Đổi domain thì nên thử đăng nhập lại ngay sau lần deploy đầu, phòng trường hợp phía Ksystem/HRM giới hạn domain được redirect về.

## 5. Deploy

```bash
./deploy.sh              # Linux — hoặc: make deploy-tunnel
```

Windows: **double-click `deploy.cmd`**, hoặc chạy `deploy.cmd` trong cmd/PowerShell.

Script sẽ:

1. Kiểm tra Docker (Linux containers) và `.env`. Chặn lại nếu `NEXT_PUBLIC_API_BASE_URL` còn là `localhost` hoặc kiểu `/api`, hoặc `JWT_SECRET` còn trống / giá trị mẫu.
2. `git pull` code mới (bỏ qua bằng `--no-pull`).
3. Hỏi `CLOUDFLARE_TUNNEL_TOKEN` nếu chưa có và lưu vào `.env`.
4. Build image backend và frontend. URL API được bake vào frontend ở bước này.
5. Gỡ nginx/keep-alive (profile `edge`) nếu đang chạy, volume cert vẫn giữ.
6. `docker compose --profile db --profile app --profile tunnel up -d`. Backend tự chạy migration khi khởi động.
7. Chờ tối đa 30 giây đến khi tunnel báo kết nối; quá thời gian thì in log `cloudflared` và báo lỗi.

Xong thì mở `https://kaopiz-ex.example.com` và đăng nhập thử.

**Lần sau** có code mới: chạy lại đúng lệnh trên.

## Lệnh hay dùng

```bash
docker compose --profile db --profile app --profile tunnel ps     # trạng thái
docker compose --profile tunnel logs -f cloudflared              # log tunnel
docker compose --profile app logs -f backend                      # log backend
make down                                                         # dừng tất cả (giữ dữ liệu DB)
```

## Xử lý lỗi

| Hiện tượng | Nguyên nhân thường gặp |
|------------|------------------------|
| Script báo tunnel chưa kết nối, log có `Unauthorized` / `invalid token` | Token sai hoặc tunnel đã bị xoá. Xoá dòng `CLOUDFLARE_TUNNEL_TOKEN` trong `.env` rồi chạy lại để nhập token mới. |
| Trình duyệt báo **502 Bad Gateway** / Cloudflare error 1033 | Service trong Public Hostname sai (dùng `localhost` thay vì `frontend`/`backend`, sai port), hoặc container đang khởi động lại. Xem `docker compose ... ps`. |
| Trang lên nhưng gọi API lỗi **CORS** | `CORS_ORIGIN` khác URL frontend (thừa `/` cuối, sai `www`). Sửa `.env` rồi chạy lại script. |
| Frontend vẫn gọi URL API cũ | `NEXT_PUBLIC_API_BASE_URL` được bake lúc build. Sửa `.env` rồi chạy lại script để build lại. |
| `port is already allocated` khi up | Port 5432 trên host đã có service khác dùng. Đặt `POSTGRES_PORT` khác. |
| Backend restart liên tục, log `/bin/sh^M: not found` | Clone trên Windows trước khi có `.gitattributes`. Clone lại. |
| `Docker daemon chưa chạy, hoặc đang ở chế độ Windows containers` | Mở Docker Desktop; chuột phải icon → *Switch to Linux containers*. |
