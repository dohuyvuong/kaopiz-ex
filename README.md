# KaopizEX - Monorepo

Monorepo chứa backend và frontend cho hệ thống công cụ nội bộ KaopizEX của Kaopiz.

## Cấu trúc

```
ChecklistReview/
├── backend/          # NestJS Backend API
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/         # NextJS Frontend (sẽ tạo sau)
│   └── ...
└── README.md
```

## Backend

Backend service được xây dựng với NestJS, cung cấp API để tự động review checklist.

Xem chi tiết trong [backend/README.md](./backend/README.md)

## Frontend

Frontend sẽ được xây dựng với NextJS (sẽ tạo sau).

## Development

### Backend

```bash
cd backend
yarn install
yarn start:dev
```

### Frontend

```bash
cd frontend
yarn install
yarn dev
```
