# KaopizEX - Monorepo

Monorepo chứa backend và frontend cho hệ thống công cụ nội bộ KaopizEX của Kaopiz.

## Cấu trúc

```
kaopiz-ex/
├── backend/          # NestJS Backend API
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/         # Next.js Frontend
│   └── ...
└── README.md
```

## Backend

Backend service được xây dựng với NestJS, cung cấp API cho các tính năng: Checklist Review, Timesheet, tự động hóa, v.v.

Xem chi tiết trong [backend/README.md](./backend/README.md)

## Frontend

Frontend được xây dựng với Next.js. Xem [frontend/README.md](./frontend/README.md).

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
