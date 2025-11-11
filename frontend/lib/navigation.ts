import { type LucideIcon, LayoutDashboard, CheckSquare, Play, Clock } from "lucide-react"
import { type System, SYSTEMS } from "./types/system"

export type SystemRequirement = System

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  system?: SystemRequirement // System requirement cho route này
}

export interface NavItemWithSubmenu {
  title: string
  icon: LucideIcon
  system?: SystemRequirement // System requirement cho submenu này
  items: NavItem[]
}

export type NavItemType = NavItem | NavItemWithSubmenu

export const navItems: NavItemType[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    // Không có system requirement - public route
  },
  {
    title: "Checklist Review",
    icon: CheckSquare,
    system: SYSTEMS.KSYSTEM, // Cần ksystem token
    items: [
      {
        title: "Chờ tôi duyệt",
        url: "/checklist-review/pending",
        icon: Clock,
        system: SYSTEMS.KSYSTEM,
      },
      {
        title: "Tự động review",
        url: "/checklist-review/auto-review",
        icon: Play,
        system: SYSTEMS.KSYSTEM,
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

/**
 * Lấy system requirement cho một pathname
 * Trả về undefined nếu route không yêu cầu system cụ thể (public route)
 */
export function getSystemRequirementForPathname(
  pathname: string,
  items: NavItemType[] = navItems
): System | undefined {
  const result = findNavItemByPathname(pathname, items)
  if (result) {
    if (result.item.system) {
      return result.item.system
    }
    if (result.parent && result.parent.system) {
      return result.parent.system
    }
  }

  // Không có system requirement - public route
  return undefined
}
