# GitHub Actions — CI/CD

Workflow: [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml).

Job **Lint** dùng **Node.js 24** (khớp `backend/.nvmrc`, `frontend/.nvmrc` và image Docker `node:24-alpine`).

## Hành vi

| Sự kiện | Công việc |
|---------|-----------|
| PR hoặc push vào **`master`** | Lint: ESLint backend + frontend (không `--fix`) |
| **Push** vào **`master`** (sau khi lint pass) | Build 3 image Docker → đóng gói `docker save` → SCP lên VPS → `docker load` → `docker compose -f docker-compose.db.yml -f docker-compose.yml up -d` |

Không push image lên registry công khai; image được chuyển trực tiếp tới server.

## GitHub — Secrets

| Secret | Mô tả |
|--------|--------|
| `SSH_PRIVATE_KEY` | Private key SSH (đủ khối PEM), có quyền `docker`/`docker compose` trên VPS |
| `SSH_KNOWN_HOSTS` | *(Khuyến nghị)* Nội dung từ `ssh-keyscan -H <host>`; để trống thì CI sẽ `ssh-keyscan` khi chạy |

## GitHub — Repository variables

| Variable | Mô tả |
|----------|--------|
| `DEPLOY_HOST` | Hostname hoặc IP VPS |
| `DEPLOY_USER` | User SSH |
| `DEPLOY_PATH` | Đường dẫn tuyệt đối trên VPS tới thư mục có `docker-compose.yml`, `docker-compose.db.yml` và `.env` |
| `BACKEND_IMAGE` | **Trùng** `BACKEND_IMAGE` trong `.env` trên VPS |
| `FRONTEND_IMAGE` | **Trùng** `FRONTEND_IMAGE` trên VPS |
| `NGINX_IMAGE` | **Trùng** `NGINX_IMAGE` trên VPS |
| `NEXT_PUBLIC_API_BASE_URL` | URL API mà trình duyệt gọi (bake vào Next lúc build) |
| `IMAGE_PLATFORM` | *(Tuỳ chọn)* Mặc định `linux/amd64` |

## VPS

- Đã có `.env` runtime (DB, JWT, OAuth, tên image, …) như môi trường production.
- User deploy có thể chạy `docker compose` trong `DEPLOY_PATH`.
- Hai file compose dùng đúng lệnh:  
  `docker compose -f docker-compose.db.yml -f docker-compose.yml up -d`.

## Lint khi commit (Husky)

Sau khi **clone repo**, cần chạy `yarn install` trong **`backend/`** hoặc **`frontend/`** ít nhất **một lần**: script `prepare` (`cd .. && husky`) tạo thư mục **`.husky/_`** và ghi vào Git config **`core.hooksPath=.husky/_`**. Nếu bước này không chạy (hoặc ghi `.git/config` thất bại), Git **sẽ không gọi** Husky — commit vẫn thành công nhưng **không lint**.

Kiểm tra nhanh:

```bash
git config core.hooksPath
# Kỳ vọng: .husky/_
```

Nên cài dependency ở **cả hai** package (backend + frontend). Mỗi **commit**, hook **pre-commit** chạy **`yarn lint:fix`** đầy đủ ở **backend** rồi **frontend**, và so **`git status --porcelain` (backend, frontend)** trước/sau; nếu có thay đổi do `--fix`, hook **chặn commit** cho tới khi **`git add`** lại. Cursor / GUI Git thường có **PATH tối thiểu** — hook có **nạp nvm** (`$HOME/.nvm/nvm.sh`) và thêm **Homebrew** (`/opt/homebrew/bin`, `/usr/local/bin`). Nếu vẫn báo không thấy `node` / `yarn`, hãy thử commit trong **Terminal** nơi `nvm` / `fnm` đã kích hoạt, hoặc cài Node qua Homebrew.

- CI vẫn dùng **`yarn lint`** (không `--fix`), xem workflow.
- Commit có `--no-verify` thì bỏ qua mọi hook.

## Lưu ý

- Đổi `NEXT_PUBLIC_*` cần **build lại** image frontend (workflow đã truyền qua build-arg).
- Tag image trên CI **phải khớp** biến image trong `.env` server để `docker compose` nhận đúng image vừa `docker load`.
