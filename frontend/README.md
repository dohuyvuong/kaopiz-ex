# Frontend - KaopizEX

Frontend application được xây dựng với Next.js, shadcn/ui, Tailwind CSS và Redux cho hệ thống công cụ nội bộ KaopizEX.

## Setup

1. Cài đặt dependencies:
```bash
yarn install
```

2. Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. Chạy development server:
```bash
yarn dev
```

## Cấu trúc

- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities, Redux store, API clients
- `lib/features/` - Redux slices
- `lib/api/` - API service functions

## Auth Flow

1. User truy cập trang bất kỳ → Kiểm tra token trong localStorage
2. Nếu chưa có token → Redirect đến `/login`
3. Ở trang login:
   - Click "Lấy URL đăng nhập" → Gọi API `/auth/authorize`
   - Tự động mở URL SSO trong tab mới
   - User đăng nhập và copy callback URL
   - Paste URL vào textbox và click "Xác nhận và lấy token"
   - Gọi API `/auth/token` để exchange token
   - Lưu token vào Redux và localStorage
   - Redirect về trang chủ

## Protected Routes

Sử dụng `ProtectedRoute` component để bảo vệ các route cần authentication:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content */}
    </ProtectedRoute>
  );
}
```
