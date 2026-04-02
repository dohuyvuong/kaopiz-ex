#!/usr/bin/env sh
set -e

# ---------------------------------------------------------------------------
# Biến môi trường
#   PRIMARY_DOMAIN    : domain chính, frontend/backend được proxy tại đây
#   EXTRA_DOMAINS     : domain phụ (cách nhau bởi dấu phẩy), sẽ redirect về PRIMARY_DOMAIN
#   CERTBOT_EMAIL     : email đăng ký Let's Encrypt
#   CERTBOT_STAGING   : "true" để dùng staging (test, tránh rate-limit)
#   FRONTEND_HOST     : hostname của frontend service, vd: frontend
#   FRONTEND_PORT     : port của frontend service,    vd: 3000
#   BACKEND_HOST      : hostname của backend service,  vd: backend
#   BACKEND_PORT      : port của backend service,     vd: 8000
# ---------------------------------------------------------------------------
PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-}"
EXTRA_DOMAINS="${EXTRA_DOMAINS:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
CERTBOT_STAGING="${CERTBOT_STAGING:-false}"
FRONTEND_HOST="${FRONTEND_HOST:-frontend}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_HOST="${BACKEND_HOST:-backend}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

CONF_FILE="/etc/nginx/conf.d/kaopiz-ex.conf"
WEBROOT="/var/www/certbot"

if [ -z "$PRIMARY_DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "[nginx] ERROR: PRIMARY_DOMAIN và CERTBOT_EMAIL phải được đặt."
  exit 1
fi

# Build danh sách đầy đủ: PRIMARY + EXTRA (cách nhau bởi dấu phẩy)
if [ -n "$EXTRA_DOMAINS" ]; then
  ALL_DOMAINS="${PRIMARY_DOMAIN},${EXTRA_DOMAINS}"
else
  ALL_DOMAINS="${PRIMARY_DOMAIN}"
fi

CERT_PATH="/etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem"

STAGING_FLAG=""
[ "$CERTBOT_STAGING" = "true" ] && STAGING_FLAG="--staging"

mkdir -p "$WEBROOT"

# ---------------------------------------------------------------------------
# Helper: viết từng server block
# ---------------------------------------------------------------------------

write_http_block() {
  d="$1"
  echo "server {"
  echo "  listen 80;"
  echo "  server_name $d;"
  echo ""
  echo "  location /.well-known/acme-challenge/ {"
  echo "    root /var/www/certbot;"
  echo "  }"
  echo ""
  echo "  location / {"
  echo "    return 301 https://${PRIMARY_DOMAIN}\$request_uri;"
  echo "  }"
  echo "}"
  echo ""
}

write_https_redirect_block() {
  d="$1"
  echo "server {"
  echo "  listen 443 ssl;"
  echo "  server_name $d;"
  echo ""
  echo "  ssl_certificate /etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem;"
  echo "  ssl_certificate_key /etc/letsencrypt/live/${PRIMARY_DOMAIN}/privkey.pem;"
  echo "  ssl_protocols TLSv1.2 TLSv1.3;"
  echo "  ssl_ciphers HIGH:!aNULL:!MD5;"
  echo ""
  echo "  return 301 https://${PRIMARY_DOMAIN}\$request_uri;"
  echo "}"
  echo ""
}

write_https_primary_block() {
  echo "server {"
  echo "  listen 443 ssl;"
  echo "  server_name ${PRIMARY_DOMAIN};"
  echo ""
  echo "  ssl_certificate /etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem;"
  echo "  ssl_certificate_key /etc/letsencrypt/live/${PRIMARY_DOMAIN}/privkey.pem;"
  echo "  ssl_protocols TLSv1.2 TLSv1.3;"
  echo "  ssl_ciphers HIGH:!aNULL:!MD5;"
  echo ""
  echo "  # Frontend (Next.js)"
  echo "  location / {"
  echo "    proxy_pass http://${FRONTEND_HOST}:${FRONTEND_PORT};"
  echo "    proxy_set_header Host \$host;"
  echo "    proxy_set_header X-Real-IP \$remote_addr;"
  echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
  echo "    proxy_set_header X-Forwarded-Proto \$scheme;"
  echo "  }"
  echo ""
  echo "  # Backend API (strip prefix /api)"
  echo "  location /api/ {"
  echo "    proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT}/;"
  echo "    proxy_set_header Host \$host;"
  echo "    proxy_set_header X-Real-IP \$remote_addr;"
  echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
  echo "    proxy_set_header X-Forwarded-Proto \$scheme;"
  echo "  }"
  echo "}"
}

# ---------------------------------------------------------------------------
# Config HTTP-only (dùng trong bước xin cert lần đầu)
# ---------------------------------------------------------------------------
write_http_config() {
  echo "[nginx] Generating HTTP-only config..."
  > "$CONF_FILE"
  for d in $(echo "$ALL_DOMAINS" | tr ',' ' '); do
    write_http_block "$d" >> "$CONF_FILE"
  done
}

# ---------------------------------------------------------------------------
# Config đầy đủ HTTP + HTTPS
# ---------------------------------------------------------------------------
write_https_config() {
  echo "[nginx] Generating HTTPS config..."
  > "$CONF_FILE"
  for d in $(echo "$ALL_DOMAINS" | tr ',' ' '); do
    write_http_block "$d" >> "$CONF_FILE"
  done
  for d in $(echo "$ALL_DOMAINS" | tr ',' ' '); do
    if [ "$d" != "$PRIMARY_DOMAIN" ]; then
      write_https_redirect_block "$d" >> "$CONF_FILE"
    fi
  done
  write_https_primary_block >> "$CONF_FILE"
}

# ---------------------------------------------------------------------------
# Step 1: Sinh config HTTP để nginx có thể start và phục vụ ACME challenge
# ---------------------------------------------------------------------------
write_http_config

# ---------------------------------------------------------------------------
# Step 2: Khởi động nginx ở nền (HTTP only)
# ---------------------------------------------------------------------------
echo "[nginx] Starting nginx (HTTP only for ACME challenge)..."
nginx -g "daemon off;" &
NGINX_PID=$!
sleep 1

# ---------------------------------------------------------------------------
# Step 3: Xin cert nếu chưa có
# ---------------------------------------------------------------------------
if [ ! -f "$CERT_PATH" ]; then
  echo "[nginx] Obtaining certificate for: $ALL_DOMAINS"

  CERTBOT_D_ARGS=""
  for d in $(echo "$ALL_DOMAINS" | tr ',' ' '); do
    CERTBOT_D_ARGS="$CERTBOT_D_ARGS -d $d"
  done

  # shellcheck disable=SC2086
  certbot certonly \
    --webroot -w "$WEBROOT" \
    $CERTBOT_D_ARGS \
    --email "$CERTBOT_EMAIL" \
    --agree-tos --no-eff-email \
    $STAGING_FLAG
else
  echo "[nginx] Certificate already exists, skipping certonly."
fi

# ---------------------------------------------------------------------------
# Step 4: Sinh config HTTPS và reload nginx
# ---------------------------------------------------------------------------
write_https_config
echo "[nginx] Reloading nginx with HTTPS config..."
nginx -s reload

echo "[nginx] Ready. Serving HTTP→HTTPS redirect and HTTPS proxy."
echo "[nginx] PRIMARY_DOMAIN : $PRIMARY_DOMAIN"
echo "[nginx] ALL_DOMAINS    : $ALL_DOMAINS"

# ---------------------------------------------------------------------------
# Step 5: Renew cert định kỳ mỗi 12h + reload nginx
# ---------------------------------------------------------------------------
(
  while true; do
    sleep 12h & wait $!
    echo "[nginx] Running certbot renew..."
    certbot renew --webroot -w "$WEBROOT" || true
    nginx -s reload
  done
) &

# Giữ nginx ở foreground
wait $NGINX_PID
