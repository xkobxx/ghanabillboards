import { useRef, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, LogOut, UserRoundCog } from 'lucide-react';
import type { User } from '../types';

export interface UserDropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

interface UserDropdownProps {
  currentUser: User;
  items: UserDropdownItem[];
}

export default function UserDropdown({ currentUser, items }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="vp-user-dropdown" ref={ref}>
      <button
        type="button"
        className="vp-user-dropdown-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="vp-user-dropdown-avatar">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
          ) : (
            initials
          )}
        </span>
        <span className="vp-user-dropdown-name">{currentUser.name}</span>
        <ChevronDown className={`vp-user-dropdown-chevron${open ? ' is-open' : ''}`} size={14} />
      </button>

      {open && (
        <div className="vp-user-dropdown-menu" role="menu">
          <div className="vp-user-dropdown-header">
            <span className="vp-user-dropdown-header-name">{currentUser.name}</span>
            <span className="vp-user-dropdown-header-email">{currentUser.email}</span>
          </div>
          <div className="vp-user-dropdown-divider" />
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              className={`vp-user-dropdown-item${item.variant === 'danger' ? ' danger' : ''}`}
              onClick={() => { item.onClick(); setOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function defaultDashboardItems(
  onProfile: () => void,
  onSettings: () => void,
  signOut: () => void,
): UserDropdownItem[] {
  return [
    { label: 'Profile', icon: <UserRoundCog size={14} />, onClick: onProfile },
    { label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, onClick: onSettings },
    { label: 'Sign Out', icon: <LogOut size={14} />, onClick: signOut, variant: 'danger', divider: true },
  ];
}
