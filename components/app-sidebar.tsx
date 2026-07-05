import { LogOutIcon } from "lucide-react"
import { Link } from "react-router-dom"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { LogoIcon } from "@/components/logo"
import { NavGroup } from "@/components/nav-group"
import { PortalMeta } from "@/components/latest-change"
import {
  ROLE_META,
  getInitials,
  type AppNavItem,
  type DashboardRole,
} from "@/components/app-shared"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import type { User } from "@/src/types"

type AppSidebarProps = {
  role: DashboardRole
  activeView: string
  navItems: AppNavItem[]
  onViewChange: (view: string) => void
  onSignOut: () => void
  sidebarAction?: ReactNode
  user: User
}

function SidebarIdentity({
  role,
  user,
  onSignOut,
}: Pick<AppSidebarProps, "role" | "user" | "onSignOut">) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <Avatar size="sm">
        {user.avatar && <AvatarImage alt={user.name} src={user.avatar} />}
        <AvatarFallback className="bg-primary font-heading font-bold text-primary-foreground">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <span className="block truncate font-heading text-xs font-semibold text-sidebar-foreground">
          {user.name}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
          {ROLE_META[role].shortLabel} · {user.email}
        </span>
      </div>
      <button
        aria-label="Sign out"
        className="rounded-none p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:hidden"
        onClick={onSignOut}
        title="Sign out"
        type="button"
      >
        <LogOutIcon className="size-3.5" />
      </button>
    </div>
  )
}

export function AppSidebar({
  role,
  activeView,
  navItems,
  onViewChange,
  onSignOut,
  sidebarAction,
  user,
}: AppSidebarProps) {
  return (
    <Sidebar
      className={cn(
        "*:data-[slot=sidebar-inner]:bg-sidebar",
        "**:data-[slot=sidebar-menu-button]:[&>span]:text-sidebar-foreground/75"
      )}
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="h-14 justify-center border-b px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 font-heading"
              render={<Link aria-label="Vantage Point home" to="/" />}
              size="lg"
              tooltip="Vantage Point"
            >
              <LogoIcon className="size-8 shrink-0 text-sidebar-primary" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-extrabold tracking-[-0.02em] text-sidebar-foreground">
                  Vantage Point
                </span>
                <span
                  className="vp-shell-role-badge"
                  data-role={role}
                >
                  {ROLE_META[role].label}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup
          activeView={activeView}
          items={navItems}
          onViewChange={onViewChange}
        />
        {sidebarAction && (
          <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <SidebarGroupContent className="px-1">
              {sidebarAction}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-0 p-0">
        <PortalMeta />
        <SidebarSeparator />
        <SidebarIdentity role={role} user={user} onSignOut={onSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
