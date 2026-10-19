# Load .env nếu tồn tại; biến trong .env không ghi đè biến đã set từ shell
-include .env
export

# Guard: báo lỗi nếu biến chưa được set (từ .env hoặc command)
guard-%:
	@[ -n "${$*}" ] || (echo "ERROR: $* is not set. Set it in .env or run: make $@ $*=<value>"; exit 1)

COMPOSE_DB := docker compose --profile db
COMPOSE_APP := docker compose --profile app
COMPOSE_EDGE := docker compose --profile edge
COMPOSE_STACK := docker compose --profile db --profile app
COMPOSE_PROD := docker compose --profile db --profile app --profile edge
COMPOSE_ALL := docker compose --profile db --profile app --profile edge --profile tunnel

.PHONY: build-backend build-frontend build-nginx build up-db up-app up up-prod deploy-tunnel down logs

# Context là gốc repo (dấu "."), không phải ./backend hay ./frontend: cả hai
# image đều cần thư mục shared/ — package logic chấm công dùng chung.
build-backend: guard-BACKEND_IMAGE guard-IMAGE_PLATFORM
	docker build --platform=$(IMAGE_PLATFORM) -f backend/Dockerfile -t $(BACKEND_IMAGE) .

build-frontend: guard-FRONTEND_IMAGE guard-IMAGE_PLATFORM guard-NEXT_PUBLIC_API_BASE_URL
	docker build \
		--platform=$(IMAGE_PLATFORM) \
		--build-arg NEXT_PUBLIC_API_BASE_URL=$(NEXT_PUBLIC_API_BASE_URL) \
		-f frontend/Dockerfile \
		-t $(FRONTEND_IMAGE) \
		.

build-nginx: guard-NGINX_IMAGE
	docker build --platform=$(IMAGE_PLATFORM) -t $(NGINX_IMAGE) ./nginx

build: build-backend build-frontend build-nginx

up-db:
	$(COMPOSE_DB) up -d

up-app:
	$(COMPOSE_APP) up -d

up: build
	$(COMPOSE_STACK) up -d

up-prod:
	$(COMPOSE_PROD) up -d

# Production qua Cloudflare Tunnel (không nginx) — xem deploy.sh
deploy-tunnel:
	./deploy.sh

down:
	$(COMPOSE_ALL) down

logs:
	$(COMPOSE_ALL) logs -f
