import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, CalendarCheck, ListChecks, CalendarRange,
  FileCheck2, UserRoundCog, Settings, Search, Calculator, X,
  ArrowUpRight, CalendarPlus, Trash2, ChevronLeft,
  ShieldAlert, MailCheck,
  Receipt,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';
import AvatarUpload from '../components/AvatarUpload';
import PasswordChange from '../components/PasswordChange';
import ProfileCompleteness from '../components/ProfileCompleteness';
import BuyerSettingsForm from '../components/buyer-settings/BuyerSettingsForm';
import AvailabilityWatchButton from '../components/buyer/AvailabilityWatchButton';
import InvoiceList from '../components/buyer/InvoiceList';
import { useBuyerSettings } from '../hooks/useBuyerSettings';
import { formatUsdInCurrency } from '../lib/money';
import { approvalsApi } from '../lib/approvalsApi';
import { sessionStore } from '../lib/apiClient';
import { validateProfile, type ProfileErrors } from '../lib/validation';

type BuyerView =
  | 'overview'
  | 'marketplace'
  | 'campaigns'
  | 'invoices'
  | 'shortlist'
  | 'locks'
  | 'creative'
  | 'profile'
  | 'settings';

export default function BuyerPage() {
  const { currentUser, setAuthMode, allBillboards, myBookings, signOut, setCurrentUser, updateBookingStatus, setMyBookings, setSelectedBillboard, changePassword, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<BuyerView>('overview');
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '', phone: '', bio: '', location: '', website: '' });
  const {
    settings: adSettings,
    status: settingsStatus,
    error: settingsError,
    save: saveSettings,
    setMfaEnabled,
  } = useBuyerSettings(currentUser?.id || 'anonymous');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [campaignDraft, setCampaignDraft] = useState({ campaignName: '', slogan: '' });
  const [showLockPicker, setShowLockPicker] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileDraft({ name: currentUser.name, email: currentUser.email, company: currentUser.company || '', phone: currentUser.phone || '', bio: currentUser.bio || '', location: currentUser.location || '', website: currentUser.website || '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /* ── Guard ── */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Buyer access required</h4>
          <p>Login or create an buyer account to access the booking and campaign workspace.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Buyer access required</h4>
          <p>This account is registered as a {currentUser.role}. Use the correct workspace for your role.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Switch account <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    );
  }

  const saveProfile = () => {
    const errs = validateProfile(profileDraft.name, profileDraft.email, profileDraft.phone, profileDraft.website);
    setProfileErrors(errs);
    if (errs.name || errs.email || errs.phone || errs.website) return;
    setCurrentUser({ ...currentUser, name: profileDraft.name, email: profileDraft.email, company: profileDraft.company || undefined, phone: profileDraft.phone || undefined, bio: profileDraft.bio || undefined, location: profileDraft.location || undefined, website: profileDraft.website || undefined });
    setProfileSaved(true);
    setProfileErrors({});
    setTimeout(() => setProfileSaved(false), 2000);
  };

  /* ── Derived data ── */
  const available = allBillboards.filter(b => b.status === 'Available').length;
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BY';

  const currency = (n: number) => formatUsdInCurrency(n, adSettings.billingCurrency);

  const navItems: { id: BuyerView; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'overview',     label: 'Overview',     icon: <LayoutDashboard size={15} /> },
    { id: 'marketplace',  label: 'Marketplace',  icon: <Map size={15} />, badge: adSettings.availabilityAlerts },
    { id: 'campaigns',    label: 'Campaigns',    icon: <CalendarCheck size={15} />, badge: adSettings.bookingStatusAlerts },
    { id: 'invoices',     label: 'Invoices',     icon: <Receipt size={15} />, badge: adSettings.invoiceAlerts },
    { id: 'shortlist',    label: 'Shortlist',    icon: <ListChecks size={15} /> },
    { id: 'locks',        label: 'Locks',        icon: <CalendarRange size={15} /> },
    { id: 'creative',     label: 'Creative',     icon: <FileCheck2 size={15} />, badge: adSettings.creativeReviewRequired },
    { id: 'profile',      label: 'Profile',      icon: <UserRoundCog size={15} /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings size={15} />, badge: adSettings.mfaEnabled },
  ];

  return (
    <DashboardShell
      role="buyer"
      activeView={activeView}
      onViewChange={id => setActiveView(id as BuyerView)}
      navItems={navItems}
      user={currentUser}
      onSignOut={signOut}
      sidebarAction={
        <button className="vp-btn sm primary full" onClick={() => navigate('/booking')}>
          New booking <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      }
    >
        {/* ── Overview ── */}
        <section className={`vp-dashboard-view${activeView === 'overview' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Buyer dashboard</p>
            <h1>Campaign workspace</h1>
          </div>
          <div className="vp-dash-metrics">
            <div className="vp-stat-card">
              <strong>{available}</strong>
              <span>Available locations</span>
            </div>
            <div className="vp-stat-card">
              <strong>{allBillboards.length}</strong>
              <span>Total inventory</span>
            </div>
            <div className="vp-stat-card">
              <strong>{myBookings.length}</strong>
              <span>Campaign records</span>
            </div>
            <div className="vp-stat-card">
              <strong>4.5m</strong>
              <span>Booking target</span>
            </div>
          </div>
          <div className="vp-panel-col-grid three">
            <div className="vp-mini-card">
              <h4><Search size={17} />Discover inventory</h4>
              <p>Filter OOH locations by city, board format, traffic volume, price range, and availability.</p>
              <button className="vp-btn sm primary" onClick={() => navigate('/booking')}>Open booking page <ArrowUpRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="vp-mini-card">
              <h4><Calculator size={17} />Calculate spend</h4>
              <p>Preview campaign investment instantly using daily rate multiplied by flight duration.</p>
              <span className="vp-tag ok">Live valuation</span>
            </div>
            <div className="vp-mini-card">
              <h4><CalendarCheck size={17} />Reserve slots</h4>
              <p>Submitted campaigns are created as Pending Approved records and appear in vendor request queues.</p>
              <span className="vp-tag warn">Calendar lock</span>
            </div>
          </div>

          <div className="vp-panel-grid" style={{ marginTop: 8 }}>
            <div className="vp-dash-panel">
              <h3>Recent campaigns</h3>
              {myBookings.length === 0 ? (
                <div className="vp-empty">No campaign records yet. Create a booking to get started.</div>
              ) : (
                <div className="vp-dash-list">
                  {myBookings.slice(0, 5).map(b => {
                    const board = allBillboards.find(bl => bl.id === b.billboardId);
                    return (
                      <div key={b.id} className="vp-dash-item">
                        <span>
                          {b.campaignName}
                          <small>{board?.title || b.billboardId} · {currency(b.totalCost)} · {b.startDate} → {b.endDate}</small>
                        </span>
                        <span className={`vp-status-pill ${b.status === 'Live' || b.status === 'Completed' ? 'ok' : 'warn'}`}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <aside className="vp-dash-panel">
              <h3>Quick actions</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task">
                  <Map size={16} />
                  <span>Browse available inventory across all active markets.</span>
                  <strong>{available} open</strong>
                </div>
                <div className="vp-role-task">
                  <CalendarRange size={16} />
                  <span>Check locked flight windows in the calendar.</span>
                  <strong>{myBookings.filter(b => b.status !== 'Completed').length} active</strong>
                </div>
                <div className="vp-role-task">
                  <Calculator size={16} />
                  <span>Total pending campaign investment value.</span>
                  <strong>{currency(myBookings.filter(b => b.status === 'Pending Approved').reduce((s, b) => s + b.totalCost, 0))}</strong>
                </div>
                <div className="vp-role-task">
                  <Receipt size={16} />
                  <span>Invoices issued against completed campaigns.</span>
                  <strong>{myBookings.filter(b => b.status === 'Completed').length} invoices</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Marketplace ── */}
        <section className={`vp-dashboard-view${activeView === 'marketplace' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Marketplace discovery</p>
            <h2>Browse real inventory before building a booking.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div className="vp-panel-title">
                <div>
                  <h3>Recommended inventory</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '6px 0 0' }}>
                    A shortlist of available and high-traffic assets.
                  </p>
                </div>
                <button className="vp-btn sm primary" onClick={() => navigate('/booking')}>Book selected board <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="vp-dash-list">
                {allBillboards.filter(b => b.status !== 'Maintenance').slice(0, 5).map(b => (
                  <div key={b.id} className="vp-dash-item">
                    <span>
                      {b.title}
                      <small>{b.location}, {b.city} · {b.format} · {currency(b.dailyRate)}/day</small>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`vp-status-pill ${b.status === 'Available' ? 'ok' : 'warn'}`}>
                        {b.status}
                      </span>
                      <AvailabilityWatchButton
                        billboardId={b.id}
                        userId={currentUser.id}
                        enabled={adSettings.availabilityAlerts}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Discovery controls</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task">
                  <Map size={16} />
                  <span>Target cities: Lagos, Accra, Nairobi, Johannesburg, Cape Town</span>
                  <strong>5 markets</strong>
                </div>
                <div className="vp-role-task">
                  <LayoutDashboard size={16} />
                  <span>Formats: Digital LED, Static Mega, Spectacular Bridge, Portrait Pillar</span>
                  <strong>4 formats</strong>
                </div>
                <div className="vp-role-task">
                  <ListChecks size={16} />
                  <span>Traffic filters separate Mega, Very High, and High-volume corridors.</span>
                  <strong>Mobility</strong>
                </div>
                <div className="vp-role-task">
                  <CalendarCheck size={16} />
                  <span>Status badges prevent bookings against fully booked or maintenance inventory.</span>
                  <strong>Availability</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Campaigns ── */}
        <section className={`vp-dashboard-view${activeView === 'campaigns' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Campaigns</p>
            <h2>Campaign command centre.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div className="vp-panel-title">
                <div>
                  <h3>Campaign records</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '6px 0 0' }}>
                    Submitted bookings from the booking page appear here.
                  </p>
                </div>
                <button className="vp-btn sm primary" onClick={() => navigate('/booking')}>New booking <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="vp-dash-list">
                {myBookings.length === 0 ? (
                  <div className="vp-empty">No campaign records yet. Create a booking to generate a pending approval record.</div>
                ) : myBookings.map(b => {
                  const board = allBillboards.find(bl => bl.id === b.billboardId);
                  const isEditing = editingCampaign === b.id;
                  return (
                    <div key={b.id} className="vp-dash-item">
                      <span>
                        {isEditing ? (
                          <>
                            <input type="text" value={campaignDraft.campaignName} onChange={e => setCampaignDraft(d => ({ ...d, campaignName: e.target.value }))} className="vp-input-inline" style={{ marginBottom: 6 }} />
                            <input type="text" value={campaignDraft.slogan} onChange={e => setCampaignDraft(d => ({ ...d, slogan: e.target.value }))} className="vp-input-inline" />
                          </>
                        ) : (
                          <>
                            {b.campaignName}
                            <small>{board?.title || b.billboardId} · {b.clientName} · {currency(b.totalCost)} · {b.startDate} → {b.endDate}</small>
                          </>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`vp-status-pill ${b.status === 'Live' ? 'ok' : b.status === 'Completed' ? 'ok' : 'warn'}`}>{b.status}</span>
                        {b.status === 'Pending Approved' && !isEditing && (
                          <>
                            <button className="vp-btn sm" type="button" onClick={() => { setEditingCampaign(b.id); setCampaignDraft({ campaignName: b.campaignName, slogan: b.slogan || '' }); }}>Edit</button>
                            <button className="vp-btn sm" type="button" onClick={() => { updateBookingStatus(b.id, 'Rejected' as never); setMyBookings(prev => prev.filter(bk => bk.id !== b.id)); }} title="Cancel booking"><X size={14} /></button>
                          </>
                        )}
                        {b.status === 'Awaiting Manager Approval' && (
                          <>
                            <button
                              className="vp-btn sm primary"
                              type="button"
                              onClick={async () => {
                                if (sessionStore.getToken()) await approvalsApi.decide(b.id, 'APPROVE');
                                updateBookingStatus(b.id, 'Pending Approved');
                              }}
                            >
                              Approve request
                            </button>
                            <button
                              className="vp-btn sm danger"
                              type="button"
                              onClick={async () => {
                                if (sessionStore.getToken()) await approvalsApi.decide(b.id, 'REJECT');
                                updateBookingStatus(b.id, 'Rejected');
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {isEditing && (
                          <>
                            <button className="vp-btn sm primary" type="button" onClick={() => { setMyBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, campaignName: campaignDraft.campaignName, slogan: campaignDraft.slogan } : bk)); setEditingCampaign(null); }}>Save</button>
                            <button className="vp-btn sm" type="button" onClick={() => setEditingCampaign(null)}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Campaign workflow</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><FileCheck2 size={16} /><span>Define campaign name, client, and creative slogan.</span><strong>Scope</strong></div>
                <div className="vp-role-task"><CalendarRange size={16} /><span>Select flight start and end dates to create a calendar lock.</span><strong>Schedule</strong></div>
                <div className="vp-role-task"><Calculator size={16} /><span>Confirm total cost based on board rate and duration.</span><strong>Valuation</strong></div>
                <div className="vp-role-task"><CalendarCheck size={16} /><span>Submit request to vendor queue with Pending Approved status.</span><strong>Request</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Invoices ── */}
        <section className={`vp-dashboard-view${activeView === 'invoices' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Billing records</p>
            <h2>Invoices tied to campaign commitments.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div className="vp-panel-title">
                <div>
                  <h3>Account invoices</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '6px 0 0' }}>
                    Amounts use your saved billing currency and retain their issue value.
                  </p>
                </div>
              </div>
              <InvoiceList bookings={myBookings} currency={adSettings.billingCurrency} />
            </div>
            <aside className="vp-dash-panel">
              <h3>Invoice alerting</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><Receipt size={16} /><span>Issued invoices appear here as soon as a booking is accepted.</span><strong>Issued</strong></div>
                <div className="vp-role-task"><MailCheck size={16} /><span>Payment and overdue events follow your invoice alert preference.</span><strong>{adSettings.invoiceAlerts ? 'On' : 'Off'}</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Shortlist ── */}
        <section className={`vp-dashboard-view${activeView === 'shortlist' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Shortlist</p>
            <h2>Compare candidate boards before committing.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <h3>Inventory shortlist</h3>
              <div className="vp-dash-table">
                <div className="row head">
                  <span>Board</span><span>City</span><span>Rate</span><span>Status</span>
                </div>
                {allBillboards.filter(b => b.status !== 'Maintenance').map(b => (
                  <div key={b.id} className="row">
                    <strong>{b.title}</strong>
                    <span>{b.city}</span>
                    <span>{currency(b.dailyRate)}/day</span>
                    <span className={`vp-status-pill ${b.status === 'Available' ? 'ok' : 'warn'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Decision checklist</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><Map size={16} /><span>Confirm commuter route fits the campaign objective.</span><strong>Location</strong></div>
                <div className="vp-role-task"><Search size={16} /><span>Compare monthly impressions and traffic tier before booking.</span><strong>Reach</strong></div>
                <div className="vp-role-task"><Calculator size={16} /><span>Check daily rate against the campaign budget cap.</span><strong>Budget</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Calendar Locks ── */}
        <section className={`vp-dashboard-view${activeView === 'locks' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Calendar locks</p>
            <h2>Reserve and manage flight windows.</h2>
          </div>

          {/* Billboard picker — opens BookingDrawer */}
          {showLockPicker && (
            <div className="vp-dash-panel" style={{ marginBottom: 16 }}>
              <div className="vp-panel-title">
                <div>
                  <h3>Select a billboard to book</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '6px 0 0' }}>
                    Choose an available board to schedule a flight window.
                  </p>
                </div>
                <button className="vp-btn sm" type="button" onClick={() => setShowLockPicker(false)}><X size={14} /></button>
              </div>
              {allBillboards.filter(b => b.status === 'Available').length === 0 ? (
                <div className="vp-empty">No available boards. All inventory is either booked or in maintenance.</div>
              ) : (
                <div className="vp-dash-list">
                  {allBillboards.filter(b => b.status === 'Available').map(b => (
                    <div key={b.id} className="vp-dash-item" style={{ cursor: 'pointer' }} onClick={() => { setSelectedBillboard(b); setShowLockPicker(false); }}>
                      <span>
                        {b.title}
                        <small>{b.location}, {b.city} · {b.format} · {currency(b.dailyRate)}/day</small>
                      </span>
                      <button className="vp-btn sm primary" type="button">Book <ArrowUpRight className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar Month Grid — 3 months */}
          <div className="vp-panel-col-grid three" style={{ marginBottom: 16 }}>
            {[0, 1, 2].map(offset => {
              const now = new Date();
              const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
              const year = targetMonth.getFullYear();
              const month = targetMonth.getMonth();
              const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDay = new Date(year, month, 1).getDay();

              const getBookingsForDay = (day: number) => {
                const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return myBookings.filter(bk => {
                  if (bk.status === 'Completed') return false;
                  return ds >= bk.startDate && ds <= bk.endDate;
                });
              };

              const activeCount = Array.from({ length: daysInMonth }, (_, i) => getBookingsForDay(i + 1).length).filter(c => c > 0).length;

              return (
                <div key={offset} className="vp-dash-panel">
                  <h4 className="text-sm" style={{ marginBottom: 10, textTransform: 'none', letterSpacing: 0, fontFamily: 'inherit', color: '#f5f0e7' }}>
                    {MONTH_NAMES[month]} {year}
                    {activeCount > 0 && <span className="text-body-xs" style={{ color: 'rgba(245,240,231,.46)', marginLeft: 8 }}>({activeCount} booked days)</span>}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
                    {DAY_HEADERS.map(d => (
                      <div key={d} className="text-caption" style={{ textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(245,240,231,.36)', paddingBottom: 6, fontFamily: 'monospace' }}>{d}</div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`pad-${i}`} style={{ aspectRatio: '1', minHeight: 32 }} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayBookings = getBookingsForDay(day);
                      const today = new Date();
                      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                      const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      let bg = isPast ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)';
                      let borderColor = 'transparent';
                      if (dayBookings.length > 0) {
                        const hasLive = dayBookings.some(bk => bk.status === 'Live');
                        const hasPending = dayBookings.some(bk => bk.status === 'Pending Approved');
                        if (hasLive) { bg = 'rgba(168,255,96,.15)'; borderColor = 'rgba(168,255,96,.4)'; }
                        else if (hasPending) { bg = 'rgba(255,193,7,.15)'; borderColor = 'rgba(255,193,7,.4)'; }
                      }
                      return (
                        <div key={day} className="text-body-xs"
                          title={dayBookings.length > 0 ? dayBookings.map(bk => `${bk.campaignName} (${bk.status})`).join(', ') : ds}
                          style={{
                            aspectRatio: '1', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: bg, border: `1px solid ${borderColor}`, borderRadius: 0,
                            fontFamily: 'monospace', color: dayBookings.length > 0 ? '#f5f0e7' : isPast ? 'rgba(245,240,231,.2)' : 'rgba(245,240,231,.6)',
                            fontWeight: isToday ? 700 : dayBookings.length > 0 ? 600 : 400,
                            cursor: dayBookings.length > 0 ? 'pointer' : 'default',
                            outline: isToday ? '1px solid rgba(245,240,231,.3)' : undefined,
                            outlineOffset: -2,
                          }}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div className="vp-panel-title">
                <div>
                  <h3>Active flight locks</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '6px 0 0' }}>
                    Default flight length: <strong>{adSettings.defaultFlightDays} days</strong> · Currency: <strong>{adSettings.billingCurrency}</strong>
                  </p>
                </div>
                <button className="vp-btn sm primary" type="button" onClick={() => setShowLockPicker(!showLockPicker)}>
                  <CalendarPlus size={14} /> Schedule lock
                </button>
              </div>
              {myBookings.filter(b => b.status !== 'Completed').length === 0 ? (
                <div className="vp-empty">No active flight locks. Schedule one above or book from the marketplace.</div>
              ) : (
                <div className="vp-dash-list">
                  {myBookings.filter(b => b.status !== 'Completed').map(b => {
                    const board = allBillboards.find(bl => bl.id === b.billboardId);
                    const days = Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <div key={b.id} className="vp-dash-item">
                        <span>
                          {board?.title || b.billboardId}
                          <small>{b.campaignName} · {b.clientName} · {currency(b.totalCost)} · {days} days</small>
                        </span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong className="text-body-xs" style={{ fontFamily: 'monospace', color: 'rgba(245,240,231,.68)' }}>{b.startDate} → {b.endDate}</strong>
                          <span className={`vp-status-pill ${b.status === 'Live' ? 'ok' : 'warn'}`}>{b.status}</span>
                          {b.status === 'Pending Approved' && (
                            <button className="vp-btn sm" type="button" title="Release lock"
                              onClick={() => { updateBookingStatus(b.id, 'Rejected' as never); setMyBookings(prev => prev.filter(bk => bk.id !== b.id)); }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <aside className="vp-dash-panel">
              <h3>Legend & schedule rules</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task">
                  <span style={{ width: 12, height: 12, borderRadius: 0, background: 'rgba(168,255,96,.25)', border: '1px solid rgba(168,255,96,.4)', display: 'inline-block' }} />
                  <span>Live — approved and running on a billboard.</span>
                  <strong style={{ color: '#a8ff60' }}>Active</strong>
                </div>
                <div className="vp-role-task">
                  <span style={{ width: 12, height: 12, borderRadius: 0, background: 'rgba(255,193,7,.15)', border: '1px solid rgba(255,193,7,.4)', display: 'inline-block' }} />
                  <span>Pending — submitted, awaiting vendor approval.</span>
                  <strong style={{ color: '#ffc107' }}>Pending</strong>
                </div>
                <div className="vp-role-task"><CalendarCheck size={16} /><span>Releasing a lock removes the reservation and frees inventory.</span><strong style={{ color: 'rgba(245,240,231,.46)' }}>Release</strong></div>
                <div className="vp-role-task"><CalendarRange size={16} /><span>Default flight length ({adSettings.defaultFlightDays}d) pre-fills new bookings.</span><strong style={{ color: 'rgba(245,240,231,.46)' }}>Default</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Creative ── */}
        <section className={`vp-dashboard-view${activeView === 'creative' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Creative validation</p>
            <h2>Prepare copy before vendor approval.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <h3>Creative readiness</h3>
              <div className="vp-dash-list">
                {myBookings.length === 0 ? (
                  <div className="vp-empty">No creative tasks yet. Add a campaign slogan on the booking page to create validation work.</div>
                ) : myBookings.map(b => (
                  <div key={b.id} className="vp-dash-item">
                    <span>
                      {b.campaignName}
                      <small>{b.slogan || 'No campaign copy supplied.'}</small>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`vp-status-pill ${b.creativeApproved ? 'ok' : 'warn'}`}>
                        {b.creativeApproved ? 'Creative approved' : b.creativeAssetName ? 'Ready for review' : 'Asset required'}
                      </span>
                      {b.creativeAssetDataUrl && (
                        <a className="vp-btn sm" href={b.creativeAssetDataUrl} download={b.creativeAssetName}>View asset</a>
                      )}
                      {b.status === 'Awaiting Creative Review' && !b.creativeAssetName && (
                        <label className="vp-btn sm">
                          Upload asset
                          <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file || file.size > 5 * 1024 * 1024) return;
                              const reader = new FileReader();
                              reader.onload = () => setMyBookings((current) => current.map((booking) => booking.id === b.id
                                ? { ...booking, creativeAssetName: file.name, creativeAssetDataUrl: String(reader.result) }
                                : booking));
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}
                      {b.status === 'Awaiting Creative Review' && b.creativeAssetName && (
                        <button
                          className="vp-btn sm primary"
                          type="button"
                          onClick={() => {
                            setMyBookings((current) => current.map((booking) => booking.id === b.id
                              ? {
                                  ...booking,
                                  creativeApproved: true,
                                  status: adSettings.approvalWorkflow === 'MANAGER'
                                    ? 'Awaiting Manager Approval'
                                    : 'Pending Approved',
                                }
                              : booking));
                          }}
                        >
                          Approve creative
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Creative requirements</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><FileCheck2 size={16} /><span>Slogan or campaign copy supplied in the booking form.</span><strong>Copy</strong></div>
                <div className="vp-role-task"><Map size={16} /><span>Static prototype tracks readiness; production supports creative asset upload.</span><strong>Asset</strong></div>
                <div className="vp-role-task"><CalendarCheck size={16} /><span>Creative review can be required from buyer settings.</span><strong>Approval</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Profile ── */}
        <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Buyer profile</p>
            <h2>Buyer profile</h2>
          </div>

          <div className="vp-panel-grid">
            <div style={{ display: 'grid', gap: 12 }}>
              {/* Identity card */}
              <div className="vp-dash-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <AvatarUpload
                  currentAvatar={currentUser.avatar}
                  userName={currentUser.name}
                  onSave={dataUrl => setCurrentUser({ ...currentUser, avatar: dataUrl })}
                />
                <div style={{ width: '100%' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{currentUser.name}</div>
                  <span className="vp-tag">Buyer</span>
                  <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: '0.68rem', color: 'rgba(245,240,231,.4)', wordBreak: 'break-all', lineHeight: 1.6 }}>{currentUser.id}</div>
                </div>
                <div style={{ width: '100%', borderTop: '1px solid rgba(245,240,231,.08)', paddingTop: 12 }}>
                  {!currentUser.emailVerified ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MailCheck size={13} style={{ color: '#ffc107' }} />
                        <span className="text-body-xs" style={{ color: '#ffc107' }}>Email unverified</span>
                      </div>
                      <button type="button" className="vp-btn sm" style={{ width: '100%' }} onClick={() => setCurrentUser({ ...currentUser, emailVerified: true })}>Verify email</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <MailCheck size={13} style={{ color: '#a8ff60' }} />
                      <span className="text-body-xs" style={{ color: '#a8ff60' }}>Email verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile form */}
              <div className="vp-dash-panel">
                <div className="vp-panel-title">
                  <div><h3>Account profile</h3></div>
                  {profileSaved && <span className="text-body-xs" style={{ color: '#a8ff60', fontWeight: 700, fontFamily: 'monospace' }}>✓ Saved</span>}
                </div>
                <div className="vp-dash-list">
                  <div className="vp-dash-item"><span>Full name</span><input type="text" value={profileDraft.name} onChange={e => { setProfileDraft(d => ({ ...d, name: e.target.value })); if (profileErrors.name) setProfileErrors(p => ({ ...p, name: undefined })); }} onBlur={saveProfile} className="vp-input-inline" /></div>
                  {profileErrors.name && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.name}</p>}
                  <div className="vp-dash-item"><span>Work email</span><input type="email" value={profileDraft.email} onChange={e => { setProfileDraft(d => ({ ...d, email: e.target.value })); if (profileErrors.email) setProfileErrors(p => ({ ...p, email: undefined })); }} onBlur={saveProfile} className="vp-input-inline" /></div>
                  {profileErrors.email && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.email}</p>}
                  <div className="vp-dash-item"><span>Company</span><input type="text" value={profileDraft.company} onChange={e => setProfileDraft(d => ({ ...d, company: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" /></div>
                  <div className="vp-dash-item"><span>Phone</span><input type="tel" value={profileDraft.phone} onChange={e => setProfileDraft(d => ({ ...d, phone: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" /></div>
                  {profileErrors.phone && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.phone}</p>}
                  <div className="vp-dash-item"><span>Location</span><input type="text" value={profileDraft.location} onChange={e => setProfileDraft(d => ({ ...d, location: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" placeholder="City, Country" /></div>
                  <div className="vp-dash-item"><span>Website</span><input type="url" value={profileDraft.website} onChange={e => setProfileDraft(d => ({ ...d, website: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" placeholder="https://..." /></div>
                  {profileErrors.website && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.website}</p>}
                  <div className="vp-dash-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                    <span>Bio</span>
                    <textarea value={profileDraft.bio} onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" rows={3} style={{ resize: 'vertical' }} placeholder="Tell brands who you are..." />
                  </div>
                </div>
              </div>
            </div>

            <aside style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              {/* Security card */}
              <div className="vp-dash-panel">
                <h3 style={{ marginBottom: 14, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>Security</h3>
                {!showPasswordChange ? (
                  <button className="vp-btn sm" type="button" onClick={() => setShowPasswordChange(true)}>Change password</button>
                ) : (
                  <PasswordChange onChangePassword={changePassword} onClose={() => setShowPasswordChange(false)} />
                )}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(245,240,231,.08)', margin: '16px 0' }} />
                <div className="vp-dash-item">
                  <span>Two-factor auth<small>Manage full MFA setup in Settings.</small></span>
                  <span className={`vp-tag${adSettings.mfaEnabled ? ' ok' : ''}`}>{adSettings.mfaEnabled ? 'Active' : 'Off'}</span>
                </div>
              </div>

              {/* Completeness card */}
              <div className="vp-dash-panel">
                <ProfileCompleteness user={currentUser} />
              </div>
            </aside>
          </div>

          {/* Danger zone */}
          <div className="vp-dash-panel" style={{ marginTop: 12, background: 'rgba(239,68,68,.02)', borderColor: 'rgba(239,68,68,.14)' }}>
            {!showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p className="text-body-sm" style={{ fontWeight: 600, marginBottom: 2 }}>Delete account</p>
                  <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.45)' }}>Permanently removes all bookings, campaign history, and settings.</p>
                </div>
                <button className="vp-btn sm" type="button" style={{ flexShrink: 0, color: 'rgba(245,240,231,.52)', borderColor: 'rgba(245,240,231,.12)' }}
                  onClick={() => setShowDeleteConfirm(true)}>
                  <ShieldAlert size={14} /> Delete my account
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p className="text-body-sm" style={{ color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Delete account?</p>
                  <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.52)', lineHeight: 1.5 }}>All your data including bookings, campaign history, and settings will be permanently removed.</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="vp-btn sm primary" type="button" style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: 11 }}
                    onClick={() => { deleteAccount(); window.location.href = '/'; }}>Yes, delete permanently</button>
                  <button className="vp-btn sm" type="button" style={{ fontSize: 11 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Settings ── */}
        <section className={`vp-dashboard-view${activeView === 'settings' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Buyer settings</p>
            <h2>Booking defaults, notifications, approvals, and security.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <BuyerSettingsForm
                settings={adSettings}
                status={settingsStatus}
                error={settingsError}
                onSave={saveSettings}
                onMfaStatusChange={setMfaEnabled}
              />
            </div>
            <aside className="vp-dash-panel">
              <h3>Current defaults</h3>
              <div className="vp-dash-list">
                <div className="vp-dash-item"><span>Billing currency</span><strong>{adSettings.billingCurrency}</strong></div>
                <div className="vp-dash-item"><span>Flight length</span><strong>{adSettings.defaultFlightDays} days</strong></div>
                <div className="vp-dash-item"><span>Budget cap</span><strong>{adSettings.budgetCapMinor ? currency(adSettings.budgetCapMinor / 100) : 'None'}</strong></div>
                <div className="vp-dash-item"><span>Approval workflow</span><strong>{adSettings.approvalWorkflow === 'DIRECT' ? 'Direct' : 'Manager'}</strong></div>
                <div className="vp-dash-item"><span>Creative review</span><strong>{adSettings.creativeReviewRequired ? 'Required' : 'Optional'}</strong></div>
                <div className="vp-dash-item"><span>Availability alerts</span><strong>{adSettings.availabilityAlerts ? 'On' : 'Off'}</strong></div>
                <div className="vp-dash-item"><span>Invoice alerts</span><strong>{adSettings.invoiceAlerts ? 'On' : 'Off'}</strong></div>
              </div>
            </aside>
          </div>
        </section>
    </DashboardShell>
  );
}
