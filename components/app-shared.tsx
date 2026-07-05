import type { ReactNode } from "react"

export type DashboardRole = "admin" | "publisher" | "buyer" | "investor"

export type AppNavItem = {
  id: string
  label: string
  icon: ReactNode
  badge?: boolean
}

export const ROLE_META: Record<
  DashboardRole,
  { label: string; shortLabel: string }
> = {
  admin: { label: "Gateway operator", shortLabel: "Operator" },
  publisher: { label: "Supply side", shortLabel: "Supply" },
  buyer: { label: "Demand side", shortLabel: "Demand" },
  investor: { label: "Growth access", shortLabel: "Growth" },
}

export function getInitials(name: string, fallback = "VP") {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return initials || fallback
}
