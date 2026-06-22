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

.PHONY: build-backend build-frontend build-nginx build up-db up-app up up-prod down logs

build-backend: guard-BACKEND_IMAGE guard-IMAGE_PLATFORM
	docker build --platform=$(IMAGE_PLATFORM) -t $(BACKEND_IMAGE) ./backend

build-frontend: guard-FRONTEND_IMAGE guard-IMAGE_PLATFORM guard-NEXT_PUBLIC_API_BASE_URL
	docker build \
		--platform=$(IMAGE_PLATFORM) \
		--build-arg NEXT_PUBLIC_API_BASE_URL=$(NEXT_PUBLIC_API_BASE_URL) \
		-t $(FRONTEND_IMAGE) \
		./frontend

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

down:
	docker compose --profile db --profile app --profile edge down

logs:
	docker compose --profile db --profile app --profile edge logs -f
