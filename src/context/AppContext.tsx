import React from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Billboard, Booking, User, AppNotification } from '../types';
import { BILLBOARDS_DATA } from '../data';
import { readCachedBuyerSettings } from '../hooks/useBuyerSettings';
import { notificationsApi } from '../lib/notificationsApi';
import { sessionStore } from '../lib/apiClient';

interface AppContextValue {
  allBillboards: Billboard[];
  setAllBillboards: React.Dispatch<React.SetStateAction<Billboard[]>>;
  selectedBillboard: Billboard | null;
  setSelectedBillboard: (b: Billboard | null) => void;
  myBookings: Booking[];
  setMyBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  authMode: 'signin' | 'register' | null;
  setAuthMode: (m: 'signin' | 'register' | null) => void;
  currentTime: string;
  showScrollTop: boolean;
  setShowScrollTop: (v: boolean) => void;
  registerBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, newStatus: Booking['status']) => void;
  updateBillboardStatus: (id: string, newStatus: Billboard['status']) => void;
  createBillboard: (billboard: Billboard) => void;
  deleteBillboard: (id: string) => void;
  signOut: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  deleteAccount: () => void;
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg_4401',
    billboardId: 'lag-01',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    campaignName: 'Summer Launch Gala',
    clientName: 'Global Brands Inc.',
    totalCost: 7200,
    status: 'Pending Approved',
    slogan: 'Reach the Summit of Visual Distinction',
  },
  {
    id: 'bkg_4402',
    billboardId: 'nbo-01',
    startDate: '2026-05-10',
    endDate: '2026-06-10',
    campaignName: 'Neo-Tokyo Cyberpunk Showcase',
    clientName: 'Sora Dynamics',
    totalCost: 8700,
    status: 'Live',
    slogan: 'Precision-Engineered Future Tech',
  },
  {
    id: 'bkg_4403',
    billboardId: 'cpt-01',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    campaignName: 'Autumn Couture Launch',
    clientName: 'Vanguard Atelier',
    totalCost: 10500,
    status: 'Completed',
    slogan: 'Timeless Elegance, Modern Scale',
  },
];

function loadBillboards(): Billboard[] {
  try {
    const saved = localStorage.getItem('vantage_billboard_statuses');
    if (!saved) return BILLBOARDS_DATA;
    const statuses: Record<string, Billboard['status']> = JSON.parse(saved);
    return BILLBOARDS_DATA.map(b => statuses[b.id] ? { ...b, status: statuses[b.id] } : b);
  } catch { return BILLBOARDS_DATA; }
}

function loadBookings(): Booking[] {
  try {
    const saved = localStorage.getItem('vantage_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  } catch { return INITIAL_BOOKINGS; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [allBillboards, setAllBillboards] = useState<Billboard[]>(loadBillboards);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>(loadBookings);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('vantage_current_user');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });
  const [authMode, setAuthMode] = useState<'signin' | 'register' | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const hrs = String(date.getUTCHours()).padStart(2, '0');
      const mins = String(date.getUTCMinutes()).padStart(2, '0');
      const secs = String(date.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}:${secs} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (!currentUser || !sessionStore.getToken()) return;
    notificationsApi.list().then((items) => {
      setNotifications(items.map((item) => ({
        id: item.id,
        channel: 'in-app',
        title: item.title,
        body: item.body,
        timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: Boolean(item.readAt),
      })));
    }).catch(() => undefined);
  }, [currentUser]);

  // Keep a ref so event callbacks can read current bookings without stale closure
  const myBookingsRef = useRef(myBookings);
  useEffect(() => { myBookingsRef.current = myBookings; }, [myBookings]);

  useEffect(() => {
    localStorage.setItem('vantage_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNotifications(prev => [{ id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`, timestamp, read: false, ...n }, ...prev].slice(0, 50));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (sessionStore.getToken()) notificationsApi.markAllRead().catch(() => undefined);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('vantage_notifications');
    if (sessionStore.getToken()) notificationsApi.clear().catch(() => undefined);
  }, []);

  // Persist bookings
  useEffect(() => {
    localStorage.setItem('vantage_bookings', JSON.stringify(myBookings));
  }, [myBookings]);

  // Persist billboard status overrides
  useEffect(() => {
    const statuses: Record<string, Billboard['status']> = {};
    allBillboards.forEach(b => { statuses[b.id] = b.status; });
    localStorage.setItem('vantage_billboard_statuses', JSON.stringify(statuses));
  }, [allBillboards]);

  // Auto-complete expired Live campaigns on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotifs: AppNotification[] = [];
    setMyBookings(prev => prev.map(b => {
      if (b.status === 'Live' && b.endDate < today) {
        setAllBillboards(boards => boards.map(bl => bl.id === b.billboardId ? { ...bl, status: 'Available' as const } : bl));
        newNotifs.push({ id: `notif-ac-${b.id}`, channel: 'in-app', title: 'Campaign auto-completed', body: b.campaignName, timestamp, read: false });
        return { ...b, status: 'Completed' as Booking['status'] };
      }
      return b;
    }));
    if (newNotifs.length > 0) setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
  // ponytail: run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerBooking = useCallback((booking: Booking) => {
    const settings = currentUser ? readCachedBuyerSettings(currentUser.id) : null;
    const status: Booking['status'] = settings?.creativeReviewRequired
      ? 'Awaiting Creative Review'
      : settings?.approvalWorkflow === 'MANAGER'
        ? 'Awaiting Manager Approval'
        : 'Pending Approved';
    const acceptedBooking: Booking = {
      ...booking,
      status,
      invoiceCode: `INV-${booking.id.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(-10)}`,
    };
    setMyBookings((prev) => [acceptedBooking, ...prev]);
    setAllBillboards((prev) => prev.map((b) => b.id === booking.billboardId ? { ...b, status: 'Fully Booked' as const } : b));
    if (settings?.bookingStatusAlerts !== false) {
      addNotification({ channel: 'in-app', title: 'Booking submitted', body: `${booking.campaignName} — ${status.toLowerCase()}` });
    }
    if (settings?.invoiceAlerts !== false) {
      addNotification({ channel: 'email', title: 'Pro-forma invoice issued', body: `${acceptedBooking.invoiceCode} · ${booking.campaignName}` });
    }
  }, [addNotification, currentUser]);

  const updateBookingStatus = useCallback((id: string, newStatus: Booking['status']) => {
    const booking = myBookingsRef.current.find(b => b.id === id);
    const settings = currentUser ? readCachedBuyerSettings(currentUser.id) : null;
    setMyBookings((prev) => {
      if (newStatus === 'Rejected') {
        const targetBkg = prev.find(b => b.id === id);
        if (targetBkg) {
          setAllBillboards((billboards) => billboards.map((b) => b.id === targetBkg.billboardId ? { ...b, status: 'Available' as const } : b));
        }
        return prev.filter(b => b.id !== id);
      }
      return prev.map((b) => {
        if (b.id === id) {
          setAllBillboards((billboards) => billboards.map((bl) => bl.id === b.billboardId ? { ...bl, status: newStatus === 'Live' ? 'Fully Booked' as const : 'Available' as const } : bl));
          return { ...b, status: newStatus as Booking['status'] };
        }
        return b;
      });
    });
    if (booking && settings?.bookingStatusAlerts !== false) {
      if (newStatus === 'Live') {
        addNotification({ channel: 'in-app', title: 'Booking approved', body: `${booking.campaignName} is now live` });
        addNotification({ channel: 'email', title: 'Approval email queued', body: `Buyer notified — ${booking.campaignName}` });
      } else if (newStatus === 'Completed') {
        addNotification({ channel: 'in-app', title: 'Campaign completed', body: booking.campaignName });
      } else if (newStatus === 'Rejected') {
        addNotification({ channel: 'in-app', title: 'Booking rejected', body: `${booking.campaignName} was rejected` });
        addNotification({ channel: 'email', title: 'Rejection email queued', body: `Buyer notified — ${booking.campaignName}` });
        addNotification({ channel: 'sms', title: 'SMS rejection queued', body: 'Rejection SMS queued for delivery' });
      } else if (newStatus === 'Pending Approved') {
        addNotification({ channel: 'in-app', title: 'Internal approval complete', body: `${booking.campaignName} was sent to the publisher` });
      }
    }
    if (booking && newStatus === 'Rejected' && settings?.availabilityAlerts !== false) {
      addNotification({ channel: 'in-app', title: 'Inventory available again', body: `${booking.campaignName} released its reserved billboard` });
    }
  }, [addNotification, currentUser]);

  const updateBillboardStatus = useCallback((id: string, newStatus: Billboard['status']) => {
    setAllBillboards((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
  }, []);

  const createBillboard = useCallback((billboard: Billboard) => {
    setAllBillboards((prev) => [billboard, ...prev]);
    addNotification({ channel: 'in-app', title: 'Billboard published', body: `${billboard.title} is now live in inventory` });
  }, [addNotification]);

  const deleteBillboard = useCallback((id: string) => {
    setAllBillboards((prev) => prev.filter((b) => b.id !== id));
    addNotification({ channel: 'in-app', title: 'Billboard removed', body: `Asset delisted from inventory` });
  }, [addNotification]);

  const signOut = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('vantage_current_user');
    sessionStore.clear();
  }, []);

  // ponytail: global lock for all password ops, per-account locks if throughput matters
  const changePassword = useCallback((currentPassword: string, newPassword: string): boolean => {
    const users: { email: string; password: string }[] = JSON.parse(localStorage.getItem('vantage_users') || '[]');
    const user = users.find(u => u.email === currentUser?.email);
    if (!user || user.password !== currentPassword) return false;
    user.password = newPassword;
    localStorage.setItem('vantage_users', JSON.stringify(users));
    return true;
  }, [currentUser]);

  const deleteAccount = useCallback(() => {
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem('vantage_users') || '[]');
    const filtered = users.filter((u: { email: string }) => u.email !== currentUser.email);
    localStorage.setItem('vantage_users', JSON.stringify(filtered));
    localStorage.removeItem('vantage_current_user');
    setCurrentUser(null);
  }, [currentUser]);

  // Sync extended user fields to localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vantage_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <AppContext.Provider value={{
      allBillboards,
      setAllBillboards,
      selectedBillboard,
      setSelectedBillboard,
      myBookings,
      setMyBookings,
      currentUser,
      setCurrentUser,
      authMode,
      setAuthMode,
      currentTime,
      showScrollTop,
      setShowScrollTop,
      registerBooking,
      updateBookingStatus,
      updateBillboardStatus,
      createBillboard,
      deleteBillboard,
      signOut,
      changePassword,
      deleteAccount,
      notifications,
      addNotification,
      markAllNotificationsRead,
      clearNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
