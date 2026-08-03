# Build context là GỐC REPO, không phải thư mục backend — cần vì backend phụ
# thuộc package `shared/` (logic chấm công dùng chung với frontend).

# Shared stage: build package dùng chung trước, backend sẽ link vào
FROM node:24-alpine AS shared-build

WORKDIR /app/shared

COPY shared/package.json shared/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY shared/tsconfig.json shared/tsconfig.build.json ./
COPY shared/src ./src
RUN yarn build

# Base deps stage: cache full dev dependencies (build + tools)
FROM node:24-alpine AS deps

WORKDIR /app/backend

# `link:../shared` cần thư mục shared tồn tại ngay lúc yarn install
COPY --from=shared-build /app/shared /app/shared
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --frozen-lockfile

# Build stage: dùng deps đã cache để build, generate Prisma client
FROM node:24-alpine AS builder

WORKDIR /app/backend

COPY --from=shared-build /app/shared /app/shared
COPY backend/package.json backend/yarn.lock ./
COPY --from=deps /app/backend/node_modules ./node_modules

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/ ./
RUN yarn build

# Prod deps stage: chỉ cài production dependencies để runtime nhẹ hơn
FROM node:24-alpine AS prod-deps

WORKDIR /app/backend

COPY --from=shared-build /app/shared /app/shared
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# Production stage: image cuối cùng
FROM node:24-alpine AS runner

WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=8000

# Prisma trên Alpine cần OpenSSL + libc compat ở runtime
RUN apk add --no-cache openssl libc6-compat

# node_modules/@kaopiz/timesheet là symlink trỏ sang /app/shared — phải copy cả
# hai và giữ nguyên vị trí tương đối thì Node mới resolve được.
COPY --from=shared-build /app/shared/package.json /app/shared/package.json
COPY --from=shared-build /app/shared/dist /app/shared/dist

COPY --from=prod-deps /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma/

# Wait for Postgres then migrate and start
COPY backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE ${PORT}

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
