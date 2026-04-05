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

### Git hooks (lint trước khi commit)

Husky cần **`core.hooksPath`** trỏ tới **`.husky/_`**. Thư mục đó được tạo khi bạn chạy **`yarn install`** trong `backend/` hoặc `frontend/` (script `prepare` gọi Husky **từ thư mục gốc repo**).

Mỗi commit, **pre-commit** chạy **`yarn lint:fix`** lần lượt ở **backend** và **frontend**, rồi so **`git status --porcelain`** chỉ hai thư mục đó **trước và sau**. Nếu khác nhau (do `--fix` đổi file), hook **dừng** — bạn xem diff, **`git add`**, commit lại. Nếu commit trong **GUI** mà hook báo thiếu `node`/`yarn`, thường do PATH không có nvm — hook đã cố nạp `~/.nvm/nvm.sh` và PATH Homebrew; nếu vẫn lỗi, commit bằng terminal sau `nvm use` hoặc cài Node qua Homebrew.

```bash
git config core.hooksPath
# Nếu không in ra .husky/_ → chạy lại: cd backend && yarn install (và cài cả frontend nếu cần)
```

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
