#!/usr/bin/env bash
set -euo pipefail

# Simple helper script to:
# 1. Generate nginx config for a given domain
# 2. Start nginx (HTTP only) to serve ACME challenge
# 3. Run certbot (webroot) to obtain certificate
# 4. Update nginx config to enable HTTPS and reload nginx
#
# Usage:
#   ./scripts/setup-certbot.sh <domain> <email> [--staging]
#
# Example:
#   ./scripts/setup-certbot.sh kaopiz-ex.example.com admin@example.com
#
# Yêu cầu:
# - Đã có docker & docker compose
# - Đã build image backend/frontend và có service nginx, certbot trong docker-compose.yml

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f \"$ROOT_DIR/docker-compose.yml\""

DOMAIN="${1:-}"
EMAIL="${2:-}"
STAGING_FLAG="${3:-}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Usage: $0 <domain> <email> [--staging]"
  exit 1
fi

if [[ "$STAGING_FLAG" == "--staging" ]]; then
  CERTBOT_STAGING="--staging"
else
  CERTBOT_STAGING=""
fi

NGINX_CONF_DIR="$ROOT_DIR/nginx/conf.d"
NGINX_CONF_FILE="$NGINX_CONF_DIR/kaopiz-ex.conf"
CERTBOT_WEBROOT_DIR="$ROOT_DIR/nginx/certbot"

mkdir -p "$NGINX_CONF_DIR" "$CERTBOT_WEBROOT_DIR"

echo ">> Step 1: Tạo nginx config (HTTP only) cho domain $DOMAIN"
cat > "$NGINX_CONF_FILE" <<EOF
server {
  listen 80;
  server_name $DOMAIN;

  # Endpoint cho Let's Encrypt HTTP-01 challenge
  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  # Proxy trực tiếp vào frontend/backend khi chưa có HTTPS
  location / {
    proxy_pass http://frontend:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

echo ">> Step 2: Khởi động nginx (HTTP) để phục vụ ACME challenge"
eval "$COMPOSE up -d nginx"

echo ">> Step 3: Gọi certbot để xin chứng chỉ cho $DOMAIN"
# Lưu ý: service certbot trong docker-compose có entrypoint riêng để renew định kỳ.
# Ở đây ta override entrypoint về 'certbot' để chạy một lần 'certonly' rồi thoát.
eval "$COMPOSE run --rm \
  --entrypoint certbot \
  certbot certonly \
  --webroot -w /var/www/certbot \
  -d \"$DOMAIN\" \
  --email \"$EMAIL\" \
  --agree-tos --no-eff-email \
  $CERTBOT_STAGING"

echo ">> Step 4: Cập nhật nginx config để bật HTTPS cho $DOMAIN"
cat > "$NGINX_CONF_FILE" <<EOF
server {
  listen 80;
  server_name $DOMAIN;

  # Endpoint cho Let's Encrypt HTTP-01 challenge
  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  # Redirect toàn bộ HTTP sang HTTPS
  location / {
    return 301 https://\$host\$request_uri;
  }
}

server {
  listen 443 ssl;
  server_name $DOMAIN;

  ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_ciphers         HIGH:!aNULL:!MD5;

  # Proxy frontend (Next.js)
  location / {
    proxy_pass http://frontend:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  # Proxy backend API
  location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

echo ">> Step 5: Reload nginx với cấu hình HTTPS mới"
eval "$COMPOSE up -d nginx"
eval "$COMPOSE exec nginx nginx -s reload || true"

echo "Hoàn tất. HTTPS cho domain $DOMAIN đã được cấu hình (giả sử DNS đã trỏ về server này)."

