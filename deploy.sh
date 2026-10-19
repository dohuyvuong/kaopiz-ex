#!/usr/bin/env bash
# Deploy one-click trên máy chủ: git pull → build image → docker compose up
# với Cloudflare Tunnel (profile tunnel), KHÔNG dùng nginx/certbot (profile edge).
#
# Routing đặt ở Cloudflare Zero Trust → Tunnels → Public Hostname:
#   <APP_URL>                  → http://frontend:<FRONTEND_PORT>
#   <NEXT_PUBLIC_API_BASE_URL> → http://backend:<BACKEND_PORT>
# API phải nằm ở subdomain riêng (vd: https://kaopiz-ex-api.example.com) vì cloudflared
# không cắt được prefix /api như nginx — backend không có global prefix.
#
# Cách dùng:
#   ./deploy.sh            # pull code mới rồi deploy
#   ./deploy.sh --no-pull  # deploy code hiện tại, bỏ qua git pull
#   deploy.cmd             # trên Windows (gọi script này qua Git Bash)
#
# Lần đầu chưa có CLOUDFLARE_TUNNEL_TOKEN, script hỏi token và lưu vào .env.

set -euo pipefail

# Git Bash trên Windows tự đổi tham số dạng /path thành C:\...; tắt đi để
# --platform=linux/amd64, URL trong --build-arg… được truyền nguyên vẹn.
export MSYS_NO_PATHCONV=1

cd "$(dirname "$0")"

PULL=true
for arg in "$@"; do
  case "$arg" in
    --no-pull) PULL=false ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "Tham số không hợp lệ: $arg" >&2; exit 1 ;;
  esac
done

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

# Lấy biến theo thứ tự ưu tiên giống docker compose: shell env > .env.
# Không `source .env` vì có giá trị chứa dấu cách không quote (AZURE_SCOPE).
env_get() {
  local key=$1 val
  if [[ -n "${!key:-}" ]]; then
    printf '%s' "${!key}"
    return
  fi
  val=$(grep -E "^${key}=" .env | tail -n1 | cut -d= -f2-) || true
  val=${val%$'\r'}
  val=${val#\"}; val=${val%\"}
  val=${val#\'}; val=${val%\'}
  printf '%s' "$val"
}

# ---------------------------------------------------------------------------
# Kiểm tra môi trường
# ---------------------------------------------------------------------------
command -v docker >/dev/null || die "Chưa cài Docker."
docker compose version >/dev/null 2>&1 || die "Cần Docker Compose v2 (lệnh 'docker compose')."
# Image dùng node:alpine/postgres:alpine nên cần Linux containers. Trên Windows
# đó là Docker Desktop (WSL2); Docker Engine thuần trên Windows Server chỉ chạy
# Windows containers.
[[ "$(docker info --format '{{.OSType}}' 2>/dev/null)" == linux ]] \
  || die "Docker daemon chưa chạy, hoặc đang ở chế độ Windows containers (cần Linux containers)."

if [[ ! -f .env ]]; then
  cp .env.example .env
  chmod 600 .env
  die "Chưa có .env — đã tạo từ .env.example. Sửa giá trị thật rồi chạy lại."
fi

# ---------------------------------------------------------------------------
# Pull code mới
# ---------------------------------------------------------------------------
if $PULL && [[ -d .git ]]; then
  log "git pull"
  git pull --ff-only
fi

# ---------------------------------------------------------------------------
# Kiểm tra cấu hình URL
# ---------------------------------------------------------------------------
BACKEND_IMAGE=$(env_get BACKEND_IMAGE)
FRONTEND_IMAGE=$(env_get FRONTEND_IMAGE)
IMAGE_PLATFORM=$(env_get IMAGE_PLATFORM)
NEXT_PUBLIC_API_BASE_URL=$(env_get NEXT_PUBLIC_API_BASE_URL)
APP_URL=$(env_get APP_URL)
DATABASE_URL=$(env_get DATABASE_URL)

for v in BACKEND_IMAGE FRONTEND_IMAGE NEXT_PUBLIC_API_BASE_URL APP_URL; do
  [[ -n "${!v}" ]] || die "$v chưa được đặt trong .env."
done

case "$NEXT_PUBLIC_API_BASE_URL" in
  *localhost*|*127.0.0.1*)
    die "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL — trình duyệt người dùng không gọi được. Đặt URL public của API, vd: https://kaopiz-ex-api.example.com" ;;
  "${APP_URL%/}"/api*)
    die "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL là kiểu /api của nginx. Với tunnel, dùng subdomain riêng cho API, vd: https://kaopiz-ex-api.example.com" ;;
esac

# Giá trị mẫu trong .env.example mà ai cũng biết → token đăng nhập giả mạo được
JWT_SECRET=$(env_get JWT_SECRET)
case "$JWT_SECRET" in
  ""|change-me-in-production)
    die "JWT_SECRET đang trống hoặc còn giá trị mẫu. Đặt chuỗi ngẫu nhiên, vd: openssl rand -hex 32" ;;
esac
if [[ -z "$DATABASE_URL" && "$(env_get POSTGRES_PASSWORD)" == kaopiz_ex_secret ]]; then
  echo "Cảnh báo: POSTGRES_PASSWORD còn giá trị mẫu (chỉ đổi được trước khi DB được tạo lần đầu)."
fi

# ---------------------------------------------------------------------------
# Token Cloudflare Tunnel
# ---------------------------------------------------------------------------
CLOUDFLARE_TUNNEL_TOKEN=$(env_get CLOUDFLARE_TUNNEL_TOKEN)
if [[ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]]; then
  [[ -t 0 ]] || die "Thiếu CLOUDFLARE_TUNNEL_TOKEN và không có terminal để nhập."
  echo "Lấy token tại: Cloudflare Zero Trust → Networks → Tunnels → (tunnel) → Install connector."
  read -rsp "Dán CLOUDFLARE_TUNNEL_TOKEN: " CLOUDFLARE_TUNNEL_TOKEN
  echo
  # Người dùng có thể dán cả lệnh `cloudflared ... --token <token>`
  CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN##* }
  [[ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]] || die "Token rỗng."

  tmp=$(mktemp)
  grep -v '^CLOUDFLARE_TUNNEL_TOKEN=' .env > "$tmp" || true
  printf 'CLOUDFLARE_TUNNEL_TOKEN=%s\n' "$CLOUDFLARE_TUNNEL_TOKEN" >> "$tmp"
  cat "$tmp" > .env
  rm -f "$tmp"
  chmod 600 .env
  echo "Đã lưu token vào .env (lần sau không cần nhập lại)."
fi
export CLOUDFLARE_TUNNEL_TOKEN

# ---------------------------------------------------------------------------
# Build image
# Context là gốc repo vì backend/frontend đều cần thư mục shared/.
# ---------------------------------------------------------------------------
PLATFORM_ARGS=()
[[ -n "$IMAGE_PLATFORM" ]] && PLATFORM_ARGS=(--platform="$IMAGE_PLATFORM")

log "Build backend: $BACKEND_IMAGE"
docker build ${PLATFORM_ARGS[@]+"${PLATFORM_ARGS[@]}"} -f backend/Dockerfile -t "$BACKEND_IMAGE" .

log "Build frontend: $FRONTEND_IMAGE (API: $NEXT_PUBLIC_API_BASE_URL)"
docker build ${PLATFORM_ARGS[@]+"${PLATFORM_ARGS[@]}"} \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  -f frontend/Dockerfile \
  -t "$FRONTEND_IMAGE" \
  .

# ---------------------------------------------------------------------------
# Khởi động stack
# ---------------------------------------------------------------------------
PROFILES=(--profile app --profile tunnel)
if [[ -z "$DATABASE_URL" ]]; then
  PROFILES=(--profile db "${PROFILES[@]}")
else
  echo "Có DATABASE_URL → dùng DB ngoài, không bật profile db."
fi

# Chuyển từ nginx sang tunnel: gỡ nginx/keep-alive nếu còn chạy (giữ volume cert)
if [[ -n "$(docker compose --profile edge ps -q nginx keep-alive 2>/dev/null)" ]]; then
  log "Gỡ nginx + keep-alive (profile edge) — tunnel thay thế"
  docker compose --profile edge rm -sf nginx keep-alive
fi

log "docker compose ${PROFILES[*]} up -d"
docker compose "${PROFILES[@]}" up -d

# ---------------------------------------------------------------------------
# Chờ tunnel kết nối
# ---------------------------------------------------------------------------
log "Chờ cloudflared kết nối Cloudflare..."
connected=false
for _ in $(seq 1 30); do
  if docker compose --profile tunnel logs cloudflared 2>&1 | grep -q 'Registered tunnel connection'; then
    connected=true
    break
  fi
  sleep 1
done

docker compose "${PROFILES[@]}" ps

if $connected; then
  log "Xong. Tunnel đã kết nối."
  echo "  Frontend: $APP_URL"
  echo "  API     : $NEXT_PUBLIC_API_BASE_URL"
else
  echo
  echo "Tunnel chưa báo kết nối sau 30s. Log gần nhất:"
  docker compose --profile tunnel logs --tail 30 cloudflared
  exit 1
fi
