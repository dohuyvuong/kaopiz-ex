# Base deps stage: cache full dev dependencies (build + tools)
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build stage: dùng deps đã cache để build, generate Prisma client
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN yarn build

# Prod deps stage: chỉ cài production dependencies để runtime nhẹ hơn
FROM node:24-alpine AS prod-deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# Production stage: image cuối cùng
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000

# Prisma trên Alpine cần OpenSSL + libc compat ở runtime
RUN apk add --no-cache openssl libc6-compat

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma/

# Wait for Postgres then migrate and start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE ${PORT}

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
