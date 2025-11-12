'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, LayoutDashboard } from 'lucide-react';
import { findNavItemByPathname } from '@/lib/navigation';

export function AppBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from menu data
  const getBreadcrumbItems = (): Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }> => {
    const items: Array<{
      label: string;
      href?: string;
      icon?: React.ReactNode;
    }> = [];

    // Luôn thêm Home -> Dashboard
    items.push({
      label: 'Home',
      href: '/dashboard',
      icon: <Home className="h-4 w-4" />,
    });

    // Tìm menu item từ pathname (bao gồm cả items có showInSidebar: false)
    const navResult = findNavItemByPathname(pathname);

    if (navResult) {
      const { item, parent } = navResult;

      // Nếu có parent (submenu), thêm parent vào breadcrumb (không có href vì parent không có URL)
      if (parent) {
        const ParentIcon = parent.icon;
        items.push({
          label: parent.title,
          href: undefined, // Parent menu không có URL
          icon: <ParentIcon className="h-4 w-4" />,
        });
      }

      // Thêm menu item hiện tại
      const ItemIcon = item.icon;
      items.push({
        label: item.title,
        href: undefined, // Last item is current page
        icon: <ItemIcon className="h-4 w-4" />,
      });
    } else {
      // Nếu không tìm thấy menu item, vẫn hiển thị Dashboard
      items.push({
        label: 'Dashboard',
        href: undefined,
        icon: <LayoutDashboard className="h-4 w-4" />,
      });
    }

    return items;
  };

  const items = getBreadcrumbItems();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-1">
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {item.icon}
                  <span>{item.label}</span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href || '#'} className="flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
