import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AppNavItem } from "@/components/app-shared"

type NavGroupProps = {
  activeView: string
  items: AppNavItem[]
  onViewChange: (view: string) => void
}

export function NavGroup({
  activeView,
  items,
  onViewChange,
}: NavGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.16em]">
        Workspace
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activeView === item.id

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  aria-current={isActive ? "page" : undefined}
                  className="relative font-heading font-semibold"
                  isActive={isActive}
                  onClick={() => onViewChange(item.id)}
                  tooltip={item.label}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-1 left-0 w-0.5 bg-sidebar-primary transition-opacity",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge aria-label={`${item.label} has updates`}>
                    <span className="size-1.5 rounded-full bg-sidebar-primary" />
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
