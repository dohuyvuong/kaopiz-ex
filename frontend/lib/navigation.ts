import { type LucideIcon, LayoutDashboard, CheckSquare, Play, Clock } from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface NavItemWithSubmenu {
  title: string
  icon: LucideIcon
  items: NavItem[]
}

export type NavItemType = NavItem | NavItemWithSubmenu

export const navItems: NavItemType[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Checklist Review",
    icon: CheckSquare,
    items: [
      {
        title: "Chờ tôi duyệt",
        url: "/checklist-review/pending",
        icon: Clock,
      },
      {
        title: "Tự động review",
        url: "/checklist-review/auto-review",
        icon: Play,
      },
    ],
  },
]

/**
 * Tìm menu item theo URL
 */
export function findNavItemByUrl(
  url: string,
  items: NavItemType[] = navItems
): NavItem | null {
  for (const item of items) {
    if ("url" in item && item.url === url) {
      return item
    }
    if ("items" in item) {
      const found = item.items.find((subItem) => subItem.url === url)
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * Tìm menu item cha của một URL (nếu URL là submenu item)
 */
export function findParentNavItem(
  url: string,
  items: NavItemType[] = navItems
): NavItemWithSubmenu | undefined {
  for (const item of items) {
    if ("items" in item) {
      const found = item.items.find((subItem) => subItem.url === url)
      if (found) {
        return item
      }
    }
  }
  return undefined
}

/**
 * Kiểm tra xem pathname có thuộc submenu nào không
 */
export function findSubmenuByPathname(
  pathname: string,
  items: NavItemType[] = navItems
): NavItemWithSubmenu | undefined {
  for (const item of items) {
    if ("items" in item) {
      // Kiểm tra xem pathname có match với bất kỳ submenu item nào không
      const hasMatch = item.items.some((subItem) => pathname === subItem.url)
      if (hasMatch) {
        return item
      }
    }
  }
  return undefined
}

/**
 * Tìm menu item theo pathname (có thể match prefix)
 */
export function findNavItemByPathname(
  pathname: string,
  items: NavItemType[] = navItems
): { item: NavItem; parent?: NavItemWithSubmenu } | null {
  // Tìm exact match trước
  const exactMatch = findNavItemByUrl(pathname, items)
  if (exactMatch) {
    const parent = findParentNavItem(pathname, items)
    return { item: exactMatch, parent }
  }

  // Tìm prefix match (cho các route như /checklist-review/pending/123)
  for (const item of items) {
    if ("url" in item && pathname.startsWith(item.url + "/")) {
      return { item }
    }
    if ("items" in item) {
      for (const subItem of item.items) {
        if (pathname.startsWith(subItem.url + "/") || pathname === subItem.url) {
          return { item: subItem, parent: item }
        }
      }
    }
  }

  return null
}
