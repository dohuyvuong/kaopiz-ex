BACKEND_IMAGE ?= kaopiz-ex-backend:local
FRONTEND_IMAGE ?= kaopiz-ex-frontend:local
IMAGE_PLATFORM ?= linux/amd64
NEXT_PUBLIC_API_BASE_URL ?= https://vngou.space/api

.PHONY: build-backend build-frontend build up down logs

build-backend:
	docker build --platform=$(IMAGE_PLATFORM) -t $(BACKEND_IMAGE) ./backend

build-frontend:
	docker build \
		 --platform=$(IMAGE_PLATFORM) \
		--build-arg NEXT_PUBLIC_API_BASE_URL=$(NEXT_PUBLIC_API_BASE_URL) \
		-t $(FRONTEND_IMAGE) \
		./frontend

build: build-backend build-frontend

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f
