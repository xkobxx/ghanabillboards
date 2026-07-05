import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Bell, Mail, MessageSquare, Bell as BellIcon, X, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppNotification } from '../types';

const CHANNEL_ICON: Record<AppNotification['channel'], ReactNode> = {
  'in-app': <BellIcon size={11} />,
  'email':  <Mail size={11} />,
  'sms':    <MessageSquare size={11} />,
};

const CHANNEL_COLOR: Record<AppNotification['channel'], string> = {
  'in-app': 'text-[var(--color-primary)] bg-[var(--color-primary)]/10',
  'email':  'text-blue-400 bg-blue-400/10',
  'sms':    'text-amber-400 bg-amber-400/10',
};

export default function NotificationBell() {
  const { notifications, markAllNotificationsRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && unread > 0) markAllNotificationsRead();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Notifications"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 shadow-2xl border border-border rounded-lg overflow-hidden bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Notifications</span>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Mark all read"
                  >
                    <CheckCheck size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                    title="Clear all"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No notifications</p>
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-2.5 px-3 py-2.5 transition-colors ${n.read ? 'bg-background' : 'bg-blue-500/5'}`}
              >
                <span className={`mt-0.5 shrink-0 flex items-center justify-center rounded-full p-1 ${CHANNEL_COLOR[n.channel]}`}>
                  {CHANNEL_ICON[n.channel]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground leading-snug truncate">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 break-words">{n.body}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5 font-mono">{n.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
