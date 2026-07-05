import { LogOutIcon, SettingsIcon, UserRoundCogIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/components/app-shared"
import type { User } from "@/src/types"

type NavUserProps = {
  user: User
  onProfile: () => void
  onSettings: () => void
  onSignOut: () => void
}

export function NavUser({
  user,
  onProfile,
  onSettings,
  onSignOut,
}: NavUserProps) {
  const initials = getInitials(user.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={`Open account menu for ${user.name}`}
            className="rounded-none outline-none ring-ring transition-shadow focus-visible:ring-2"
            type="button"
          />
        }
      >
        <Avatar>
          {user.avatar && <AvatarImage alt={user.name} src={user.avatar} />}
          <AvatarFallback className="bg-primary font-heading font-bold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
            <Avatar size="lg">
              {user.avatar && <AvatarImage alt={user.name} src={user.avatar} />}
              <AvatarFallback className="bg-primary font-heading font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate font-heading text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onProfile}>
            <UserRoundCogIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSettings}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onSignOut} variant="destructive">
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
