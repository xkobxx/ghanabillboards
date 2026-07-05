import type React from "react"

import { AppShell } from "@/components/app-shell"
import type { AppNavItem, DashboardRole } from "@/components/app-shared"
import type { User } from "../types"

export type NavItem = AppNavItem

interface DashboardShellProps {
  role: DashboardRole
  activeView: string
  onViewChange: (view: string) => void
  navItems: NavItem[]
  user: User
  onSignOut: () => void
  sidebarAction?: React.ReactNode
  pageLabel?: string
  children: React.ReactNode
}

export default function DashboardShell(props: DashboardShellProps) {
  return <AppShell {...props} />
}
