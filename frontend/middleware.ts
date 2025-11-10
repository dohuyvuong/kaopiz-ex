import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware này chỉ để redirect cơ bản
  // Auth check thực sự được xử lý bởi ProtectedRoute component (client-side)
  // vì token được lưu trong localStorage (chỉ có thể truy cập ở client)

  const isLoginPage = request.nextUrl.pathname === '/login';

  // Cho phép truy cập login page và các static files
  if (isLoginPage || request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Các route khác sẽ được ProtectedRoute component xử lý
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
