# Build context là GỐC REPO, không phải thư mục frontend — cần vì frontend phụ
# thuộc package `shared/` (logic chấm công dùng chung với backend).

# Shared stage: build package dùng chung trước, frontend sẽ link vào
FROM node:24-alpine AS shared-build

WORKDIR /app/shared

COPY shared/package.json shared/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY shared/tsconfig.json shared/tsconfig.build.json ./
COPY shared/src ./src
RUN yarn build

# Deps stage: cache node_modules theo package.json + yarn.lock
FROM node:24-alpine AS deps

WORKDIR /app/frontend

# `link:../shared` cần thư mục shared tồn tại ngay lúc yarn install
COPY --from=shared-build /app/shared /app/shared
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

# Build stage: dùng deps đã cache để build Next.js
FROM node:24-alpine AS builder

WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY --from=shared-build /app/shared /app/shared
COPY frontend/package.json frontend/yarn.lock ./
COPY --from=deps /app/frontend/node_modules ./node_modules

COPY frontend/ ./
RUN yarn build

# Production stage: dùng output standalone của Next.js
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# `outputFileTracingRoot` trỏ về gốc repo nên standalone có thêm một cấp thư mục
# `frontend/`; server.js nằm ở đó chứ không phải ở gốc.
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE ${PORT}

CMD ["node", "frontend/server.js"]
