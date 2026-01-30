'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Separator } from '@/components/ui/separator';
import { AppBreadcrumb } from './Breadcrumb';

// Dynamic import để tránh hydration mismatch
const SidebarProvider = dynamic(
  () => import('@/components/ui/sidebar').then((mod) => mod.SidebarProvider),
  { ssr: false }
);

const SidebarInset = dynamic(
  () => import('@/components/ui/sidebar').then((mod) => mod.SidebarInset),
  { ssr: false }
);

const SidebarTrigger = dynamic(
  () => import('@/components/ui/sidebar').then((mod) => mod.SidebarTrigger),
  { ssr: false }
);

const AppSidebar = dynamic(
  () => import('@/components/app-sidebar').then((mod) => ({ default: mod.AppSidebar })),
  { ssr: false }
);

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isSidebarOpen = useSidebarStore((state) => state.isOpen);
  const appRefreshToken = useAuthStore((state) => state.appRefreshToken);

  const handleLogout = async () => {
    if (appRefreshToken) {
      try {
        await authApi.logout(appRefreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    useAuthStore.getState().clearAuth();
    router.push('/login');
  };

  const handleSidebarOpenChange = (open: boolean) => {
    useSidebarStore.getState().setOpen(open);
  };

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={handleSidebarOpenChange}>
      <AppSidebar onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <AppBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 pb-4">
              <div className='px-4'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
