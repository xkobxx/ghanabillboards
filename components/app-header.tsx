import { cn } from "@/lib/utils"
import { AppBreadcrumbs, type AppBreadcrumbPage } from "@/components/app-breadcrumbs"
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger"
import { DecorIcon } from "@/components/decor-icon"
import { NavUser } from "@/components/nav-user"
import { Separator } from "@/components/ui/separator"
import NotificationBell from "@/src/components/NotificationBell"
import ThemeToggle from "@/src/components/ThemeToggle"
import type { User } from "@/src/types"

type AppHeaderProps = {
  page: AppBreadcrumbPage
  user: User
  onProfile: () => void
  onSettings: () => void
  onSignOut: () => void
}

export function AppHeader({
  page,
  user,
  onProfile,
  onSettings,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "relative sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6",
        "bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80"
      )}
    >
      <DecorIcon className="hidden md:block" position="bottom-left" />
      <div className="flex min-w-0 items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs page={page} />
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <NotificationBell />
        <ThemeToggle />
        <Separator
          className="mx-0.5 hidden h-4 data-[orientation=vertical]:self-center sm:block"
          orientation="vertical"
        />
        <NavUser
          user={user}
          onProfile={onProfile}
          onSettings={onSettings}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  )
}
