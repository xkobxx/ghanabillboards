import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import UserDropdown, { defaultDashboardItems } from './UserDropdown';
import NotificationBell from './NotificationBell';
import type { User } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: boolean;
}

interface DashboardShellProps {
  role: 'admin' | 'vendor' | 'advertiser' | 'investor';
  activeView: string;
  onViewChange: (view: string) => void;
  navItems: NavItem[];
  user: User;
  onSignOut: () => void;
  sidebarAction?: React.ReactNode;
  pageLabel?: string;
  children: React.ReactNode;
}

const ROLE_META = {
  admin:      { label: 'Gateway operator',  badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  vendor:     { label: 'Supply side',        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  advertiser: { label: 'Demand side',        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  investor:   { label: 'Growth access',      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

function SidebarBrand({ role }: { role: keyof typeof ROLE_META }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const meta = ROLE_META[role];

  return (
    <div className="flex flex-col gap-3 px-3 py-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* VP monogram */}
        <div
          className="shrink-0 flex items-center justify-center rounded-lg text-white font-bold text-sm select-none"
          style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--vp-primary), var(--vp-primary-hover))', letterSpacing: '-0.03em' }}
        >
          VP
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold tracking-tight leading-none text-sidebar-foreground" style={{ fontFamily: 'Urbanist Variable, Urbanist, sans-serif' }}>
              Vantage Point
            </span>
            <span className={`mt-1 inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserFooter({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-3">
        <div
          className="flex items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
          style={{ width: 28, height: 28, backgroundColor: 'var(--vp-primary)' }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : initials}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden"
        style={{ width: 30, height: 30, backgroundColor: 'var(--vp-primary)' }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : initials}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-sidebar-foreground truncate leading-none">{user.name}</span>
        <span className="text-[11px] text-muted-foreground truncate mt-0.5 leading-none">{user.email}</span>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

export default function DashboardShell({
  role, activeView, onViewChange, navItems, user, onSignOut, sidebarAction, pageLabel, children,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const currentLabel = pageLabel ?? navItems.find(n => n.id === activeView)?.label ?? '';
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
        {/* Header: logo + role */}
        <SidebarHeader className="pb-0">
          <SidebarBrand role={role} />
          <SidebarSeparator />
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(item => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeView === item.id}
                      onClick={() => onViewChange(item.id)}
                      tooltip={item.label}
                      className="relative group"
                    >
                      {/* Active indicator */}
                      {activeView === item.id && (
                        <span
                          className="absolute left-0 inset-y-1 w-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--vp-primary)' }}
                          aria-hidden
                        />
                      )}
                      <span className={`transition-colors ${activeView === item.id ? 'text-[var(--vp-primary)]' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium" style={{ fontFamily: 'Urbanist Variable, Urbanist, sans-serif' }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--vp-primary)' }} aria-label="Alert" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Optional action (e.g. "Generate traffic", "Add Billboard") */}
          {sidebarAction && (
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent className="px-2">
                {sidebarAction}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Footer: user + sign out */}
        <SidebarFooter className="pt-0">
          <SidebarSeparator />
          <UserFooter user={user} onSignOut={onSignOut} />
        </SidebarFooter>

        {/* Rail for icon-only collapse via hover */}
        <SidebarRail />
      </Sidebar>

      {/* Main inset */}
      <SidebarInset>
        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Link to="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
            <ChevronRight size={10} className="shrink-0" />
            <span className="text-foreground font-medium truncate">{currentLabel || roleTitle}</span>
          </nav>
          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <UserDropdown
              currentUser={user}
              items={defaultDashboardItems(
                () => onViewChange('profile'),
                () => onViewChange('settings'),
                onSignOut,
              )}
            />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
