"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navItems, findSubmenuByPathname } from "@/lib/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Tự động detect submenu nào đang open dựa trên pathname
  const activeSubmenu = findSubmenuByPathname(pathname || "")
  const [manuallyToggledSubmenus, setManuallyToggledSubmenus] = useState<Set<string>>(
    new Set()
  )

  // Tính toán submenu nào đang open: active submenu hoặc manually toggled
  const getOpenSubmenus = (): Set<string> => {
    const open = new Set<string>()
    if (activeSubmenu) {
      open.add(activeSubmenu.title)
    }
    // Giữ lại các submenu đã được toggle manually
    manuallyToggledSubmenus.forEach((title) => {
      open.add(title)
    })
    return open
  }

  const openSubmenus = getOpenSubmenus()

  const toggleSubmenu = (title: string) => {
    setManuallyToggledSubmenus((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          // Check if item has submenu
          if ("items" in item) {
            const isOpen = openSubmenus.has(item.title)
            const isActive = item.items.some((subItem) => pathname === subItem.url)

            // Khi sidebar collapsed, dùng DropdownMenu
            if (isCollapsed) {
              return (
                <SidebarMenuItem key={item.title}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={4}
                      className="w-48"
                    >
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <Link
                              href={subItem.url}
                              className={isSubActive ? "bg-accent" : ""}
                            >
                              <subItem.icon className="mr-2 h-4 w-4" />
                              <span>{subItem.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )
            }

            // Khi sidebar expanded, dùng Collapsible
            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleSubmenu(item.title)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.url}>
                                <subItem.icon />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // Regular menu item
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
