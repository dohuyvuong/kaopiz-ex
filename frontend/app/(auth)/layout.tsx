export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout đơn giản cho các trang authentication (login, register, etc.)
  // Không có sidebar, header, chỉ có nội dung đơn giản
  return <>{children}</>;
}
