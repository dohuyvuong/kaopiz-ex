"use client"

import { useRouter } from "next/navigation"
import { EllipsisVertical, LogIn, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/lib/hooks"
import { CommonUserInfo, HrmUserInfoResponse } from "@/lib/types/userInfo"
import { useIsMobile } from "@/hooks/use-mobile"

interface NavUserProps {
  onLogout?: () => void
}

// Helper function để extract CommonUserInfo từ userInfo
function extractUserInfo(
  userInfo: CommonUserInfo | HrmUserInfoResponse | undefined,
): CommonUserInfo | null {
  if (!userInfo) return null;
  // HRM wrap userInfo trong object có key "info"
  if ('info' in userInfo) {
    return userInfo.info;
  }
  // Ksystem trả về trực tiếp CommonUserInfo
  return userInfo as CommonUserInfo;
}

// Helper function để lấy user info từ tokens (ưu tiên ksystem, sau đó hrm)
function getUserInfoFromTokens(tokens: {
  ksystem?: { userInfo?: CommonUserInfo | HrmUserInfoResponse };
  hrm?: { userInfo?: CommonUserInfo | HrmUserInfoResponse };
}): CommonUserInfo | null {
  const ksystemUserInfo = extractUserInfo(tokens.ksystem?.userInfo);
  if (ksystemUserInfo) return ksystemUserInfo;

  const hrmUserInfo = extractUserInfo(tokens.hrm?.userInfo);
  if (hrmUserInfo) return hrmUserInfo;

  return null;
}

export function NavUser({ onLogout }: NavUserProps) {
  const router = useRouter()
  const { tokens } = useAppSelector((state) => state.auth)
  const userInfo = getUserInfoFromTokens(tokens)
  const isMobile = useIsMobile()

  // Kiểm tra xem có đăng nhập hay không (có ít nhất một token)
  const isLoggedIn = !!(tokens.ksystem || tokens.hrm)

  const displayName = userInfo?.name || "User"
  const displayEmail = userInfo?.email || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleAccountClick = () => {
    router.push("/account")
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo?.user_profile?.avatar || undefined} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo?.user_profile?.avatar || undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAccountClick}>
              <User />
              Tài khoản
            </DropdownMenuItem>
            {isLoggedIn ? (
              onLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} variant="destructive">
                    <LogOut />
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              )
            ) : (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLoginClick}>
                  <LogIn />
                  Đăng nhập
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
