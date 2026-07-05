import type { ReactNode } from "react"

import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  type AppNavItem,
  type DashboardRole,
} from "@/components/app-shared"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { User } from "@/src/types"

export type AppShellProps = {
  role: DashboardRole
  activeView: string
  onViewChange: (view: string) => void
  navItems: AppNavItem[]
  user: User
  onSignOut: () => void
  sidebarAction?: ReactNode
  pageLabel?: string
  children: ReactNode
}

export function AppShell({
  role,
  activeView,
  onViewChange,
  navItems,
  user,
  onSignOut,
  sidebarAction,
  pageLabel,
  children,
}: AppShellProps) {
  const activeItem = navItems.find((item) => item.id === activeView)
  const currentLabel =
    pageLabel ??
    activeItem?.label ??
    `${role.charAt(0).toUpperCase()}${role.slice(1)}`

  return (
    <SidebarProvider
      className="[--app-wrapper-max-width:80rem] [--sidebar-width:17rem]"
    >
      <AppSidebar
        role={role}
        activeView={activeView}
        navItems={navItems}
        onViewChange={onViewChange}
        onSignOut={onSignOut}
        sidebarAction={sidebarAction}
        user={user}
      />
      <SidebarInset>
        <AppHeader
          page={{ title: currentLabel, icon: activeItem?.icon }}
          user={user}
          onProfile={() => onViewChange("profile")}
          onSettings={() => onViewChange("settings")}
          onSignOut={onSignOut}
        />
        <main
          className="mx-auto flex w-full max-w-(--app-wrapper-max-width) flex-1 flex-col p-4 md:p-6"
          id="dashboard-content"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
