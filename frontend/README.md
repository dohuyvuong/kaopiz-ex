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

Hệ thống hỗ trợ multi-provider authentication:

1. **Ksystem (Microsoft SSO)**: Đăng nhập vào Ksystem thông qua Microsoft SSO
2. **HRM (Ksystem OAuth)**: Đăng nhập vào HRM thông qua Ksystem OAuth

### Flow đăng nhập:

1. User truy cập trang bất kỳ → `SystemProtectedRoute` kiểm tra token theo system requirement
2. Nếu chưa có token cho system cần thiết → Redirect đến `/login` với error message
3. Ở trang login:
   - Chọn provider từ dropdown (Microsoft SSO hoặc Ksystem OAuth)
   - Click "Lấy URL đăng nhập" → Gọi API `/auth/:provider/authorize`
   - Mở URL trong tab mới (hoặc copy URL nếu là Ksystem OAuth)
   - User đăng nhập và copy callback URL
   - Paste URL vào textbox và click "Xác nhận và lấy token"
   - Gọi API `/auth/:provider/token` để exchange token
   - Lưu token vào Redux và localStorage theo system
   - Redirect về trang chủ

## Route Groups & Protected Routes

Hệ thống sử dụng route groups để phân chia routes:

- `(public)` - Routes công khai, không cần token, không cần SystemProtectedRoute
- `(ksystem)` - Routes yêu cầu Ksystem token, được bảo vệ bởi SystemProtectedRoute
- `(hrm)` - Routes yêu cầu HRM token, được bảo vệ bởi SystemProtectedRoute

### Sử dụng SystemProtectedRoute:

Routes được bảo vệ tự động thông qua layout của từng route group:

```tsx
// app/(ksystem)/layout.tsx
import { SystemProtectedRoute } from '@/components/auth/SystemProtectedRoute';

export default function KsystemGroupLayout({ children }) {
  return (
    <SystemProtectedRoute system="ksystem">
      <DashboardLayout>{children}</DashboardLayout>
    </SystemProtectedRoute>
  );
}

// app/(public)/layout.tsx - Không cần SystemProtectedRoute
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PublicGroupLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

`SystemProtectedRoute` tự động detect system requirement từ pathname nếu không chỉ định `system` prop. Nếu route không có system requirement (public route), component sẽ cho phép truy cập ngay.
