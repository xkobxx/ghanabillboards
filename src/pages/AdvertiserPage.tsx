import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, CalendarCheck, ListChecks, CalendarRange,
  FileCheck2, UserRoundCog, Settings, Search, Calculator, X,
  ArrowUpRight, CalendarPlus, Trash2, ChevronLeft,
  ShieldAlert, MailCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Toggle from '../components/Toggle';
import DashboardShell from '../components/DashboardShell';
import AvatarUpload from '../components/AvatarUpload';
import PasswordChange from '../components/PasswordChange';
import ProfileCompleteness from '../components/ProfileCompleteness';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProfile, type ProfileErrors } from '../lib/validation';

type AdvertiserView =
  | 'overview'
  | 'marketplace'
  | 'campaigns'
  | 'shortlist'
  | 'locks'
  | 'creative'
  | 'profile'
  | 'settings';

export default function AdvertiserPage() {
  const { currentUser, setAuthMode, allBillboards, myBookings, signOut, setCurrentUser, updateBookingStatus, setMyBookings, setSelectedBillboard, changePassword, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdvertiserView>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '', phone: '', bio: '', location: '', website: '' });
  const [editingSettings, setEditingSettings] = useState(false);
  const [adSettings, setAdSettings] = useLocalStorage('vantage_advertiser_settings', { billingCurrency: 'USD', flightLength: 14, approvalWorkflow: true, bookingAlerts: true, availabilityAlerts: true, invoiceAlerts: true, twoFA: false, creativeReview: true });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [campaignDraft, setCampaignDraft] = useState({ campaignName: '', slogan: '' });
  const [showLockPicker, setShowLockPicker] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R' };

  /* ── Guard ── */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Advertiser access required</h4>
          <p>Login or create an advertiser account to access the booking and campaign workspace.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'advertiser' && currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Advertiser access required</h4>
          <p>This account is registered as a {currentUser.role}. Use the correct workspace for your role.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Switch account <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const available = allBillboards.filter(b => b.status === 'Available').length;
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const currency = (n: number) => CURRENCY_SYMBOLS[adSettings.billingCurrency] + Number(n).toLocaleString();

  const navItems: { id: AdvertiserView; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'overview',     label: 'Overview',     icon: <LayoutDashboard size={15} /> },
    { id: 'marketplace',  label: 'Marketplace',  icon: <Map size={15} />, badge: adSettings.availabilityAlerts },
    { id: 'campaigns',    label: 'Campaigns',    icon: <CalendarCheck size={15} />, badge: adSettings.bookingAlerts },
    { id: 'shortlist',    label: 'Shortlist',    icon: <ListChecks size={15} /> },
    { id: 'locks',        label: 'Locks',        icon: <CalendarRange size={15} /> },
    { id: 'creative',     label: 'Creative',     icon: <FileCheck2 size={15} />, badge: adSettings.creativeReview },
    { id: 'profile',      label: 'Profile',      icon: <UserRoundCog size={15} /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings size={15} />, badge: adSettings.twoFA },
  ];

  return (
    <DashboardShell
      role="advertiser"
      activeView={activeView}
      onViewChange={id => setActiveView(id as AdvertiserView)}
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
            <p className="vp-eyebrow">Advertiser dashboard</p>
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
                    <span className={`vp-status-pill ${b.status === 'Available' ? 'ok' : 'warn'}`}>
                      {b.status}
                    </span>
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
                            background: bg, border: `1px solid ${borderColor}`, borderRadius: 4,
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
                    Default flight length: <strong>{adSettings.flightLength} days</strong> · Currency: <strong>{adSettings.billingCurrency}</strong>
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
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(168,255,96,.25)', border: '1px solid rgba(168,255,96,.4)', display: 'inline-block' }} />
                  <span>Live — approved and running on a billboard.</span>
                  <strong style={{ color: '#a8ff60' }}>Active</strong>
                </div>
                <div className="vp-role-task">
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,193,7,.15)', border: '1px solid rgba(255,193,7,.4)', display: 'inline-block' }} />
                  <span>Pending — submitted, awaiting vendor approval.</span>
                  <strong style={{ color: '#ffc107' }}>Pending</strong>
                </div>
                <div className="vp-role-task"><CalendarCheck size={16} /><span>Releasing a lock removes the reservation and frees inventory.</span><strong style={{ color: 'rgba(245,240,231,.46)' }}>Release</strong></div>
                <div className="vp-role-task"><CalendarRange size={16} /><span>Default flight length ({adSettings.flightLength}d) pre-fills new bookings.</span><strong style={{ color: 'rgba(245,240,231,.46)' }}>Default</strong></div>
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
                    <span className={`vp-status-pill ${b.slogan ? 'ok' : 'warn'}`}>
                      {b.slogan ? 'Copy supplied' : 'Copy missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Creative requirements</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><FileCheck2 size={16} /><span>Slogan or campaign copy supplied in the booking form.</span><strong>Copy</strong></div>
                <div className="vp-role-task"><Map size={16} /><span>Static prototype tracks readiness; production supports creative asset upload.</span><strong>Asset</strong></div>
                <div className="vp-role-task"><CalendarCheck size={16} /><span>Creative review can be required from advertiser settings.</span><strong>Approval</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Profile ── */}
        <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Advertiser profile</p>
            <h2>Advertiser profile</h2>
          </div>

          {/* Email verification badge */}
          {!currentUser.emailVerified && (
            <div className="vp-dash-panel" style={{
              marginBottom: 16, background: 'rgba(255,193,7,.06)', border: '1px solid rgba(255,193,7,.2)',
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
            }}>
              <MailCheck size={16} style={{ color: '#ffc107', flexShrink: 0 }} />
              <span className="text-body-sm" style={{ color: 'rgba(245,240,231,.8)' }}>
                Email not verified — <button type="button" className="vp-btn sm" style={{ marginLeft: 4 }}
                  onClick={() => {
                    setCurrentUser({ ...currentUser, emailVerified: true });
                  }}>Verify now</button>
              </span>
            </div>
          )}

          {currentUser.emailVerified && (
            <div className="vp-dash-panel" style={{
              marginBottom: 16, background: 'rgba(168,255,96,.06)', border: '1px solid rgba(168,255,96,.2)',
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
            }}>
              <MailCheck size={16} style={{ color: '#a8ff60', flexShrink: 0 }} />
              <span className="text-body-sm" style={{ color: 'rgba(245,240,231,.8)' }}>Email verified</span>
            </div>
          )}

          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <AvatarUpload
                  currentAvatar={currentUser.avatar}
                  userName={currentUser.name}
                  onSave={dataUrl => setCurrentUser({ ...currentUser, avatar: dataUrl })}
                />
              </div>

              <div className="vp-panel-title">
                <div><h3>Account profile</h3></div>
                {!editingProfile ? (
                  <button className="vp-btn sm" type="button" onClick={() => { setProfileDraft({ name: currentUser.name, email: currentUser.email, company: currentUser.company || '', phone: currentUser.phone || '', bio: currentUser.bio || '', location: currentUser.location || '', website: currentUser.website || '' }); setEditingProfile(true); }}>Edit Profile</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="vp-btn sm primary" type="button" onClick={() => { const errs = validateProfile(profileDraft.name, profileDraft.email, profileDraft.phone, profileDraft.website); if (errs.name || errs.email || errs.phone || errs.website) { setProfileErrors(errs); return; } setCurrentUser({ ...currentUser, name: profileDraft.name, email: profileDraft.email, company: profileDraft.company || undefined, phone: profileDraft.phone || undefined, bio: profileDraft.bio || undefined, location: profileDraft.location || undefined, website: profileDraft.website || undefined }); setEditingProfile(false); setProfileSaved(true); setProfileErrors({}); setTimeout(() => setProfileSaved(false), 2000); }}>Save</button>
                    <button className="vp-btn sm" type="button" onClick={() => { setEditingProfile(false); setProfileErrors({}); }}>Cancel</button>
                    {profileSaved && <span className="text-body-xs" style={{ color: '#a8ff60', fontWeight: 700, fontFamily: 'monospace' }}>✓ Saved</span>}
                  </div>
                )}
              </div>
              <div className="vp-dash-list">
                {editingProfile ? (
                  <>
                    <div className="vp-dash-item"><span>Full name</span><input type="text" value={profileDraft.name} onChange={e => { setProfileDraft(d => ({ ...d, name: e.target.value })); if (profileErrors.name) setProfileErrors(p => ({ ...p, name: undefined })); }} className="vp-input-inline" /></div>
                    {profileErrors.name && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.name}</p>}
                    <div className="vp-dash-item"><span>Work email</span><input type="email" value={profileDraft.email} onChange={e => { setProfileDraft(d => ({ ...d, email: e.target.value })); if (profileErrors.email) setProfileErrors(p => ({ ...p, email: undefined })); }} className="vp-input-inline" /></div>
                    {profileErrors.email && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.email}</p>}
                    <div className="vp-dash-item"><span>Company</span><input type="text" value={profileDraft.company} onChange={e => setProfileDraft(d => ({ ...d, company: e.target.value }))} className="vp-input-inline" /></div>
                    <div className="vp-dash-item"><span>Phone</span><input type="tel" value={profileDraft.phone} onChange={e => setProfileDraft(d => ({ ...d, phone: e.target.value }))} className="vp-input-inline" /></div>
                    {profileErrors.phone && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.phone}</p>}
                    <div className="vp-dash-item"><span>Location</span><input type="text" value={profileDraft.location} onChange={e => setProfileDraft(d => ({ ...d, location: e.target.value }))} className="vp-input-inline" placeholder="City, Country" /></div>
                    <div className="vp-dash-item"><span>Website</span><input type="url" value={profileDraft.website} onChange={e => setProfileDraft(d => ({ ...d, website: e.target.value }))} className="vp-input-inline" placeholder="https://..." /></div>
                    {profileErrors.website && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.website}</p>}
                    <div className="vp-dash-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                      <span>Bio</span>
                      <textarea value={profileDraft.bio} onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} className="vp-input-inline" rows={3} style={{ resize: 'vertical' }} placeholder="Tell brands who you are..." />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="vp-dash-item"><span>Full name</span><strong>{currentUser.name}</strong></div>
                    <div className="vp-dash-item"><span>Work email</span><strong>{currentUser.email}</strong></div>
                    {currentUser.company && <div className="vp-dash-item"><span>Company</span><strong>{currentUser.company}</strong></div>}
                    <div className="vp-dash-item"><span>Phone</span><strong>{currentUser.phone || '—'}</strong></div>
                    <div className="vp-dash-item"><span>Location</span><strong>{currentUser.location || '—'}</strong></div>
                    <div className="vp-dash-item"><span>Website</span><strong>{currentUser.website ? <a href={currentUser.website} target="_blank" rel="noopener noreferrer" style={{ color: '#a8ff60' }}>{currentUser.website}</a> : '—'}</strong></div>
                    <div className="vp-dash-item"><span>Role</span><strong>Advertiser</strong></div>
                    <div className="vp-dash-item"><span>Account ID</span><strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{currentUser.id}</strong></div>
                  </>
                )}
              </div>

              {currentUser.bio && !editingProfile && (
                <div className="vp-setting-summary" style={{ marginTop: 16 }}>
                  <p style={{ color: 'rgba(245,240,231,.68)', lineHeight: 1.5 }}>{currentUser.bio}</p>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid rgba(245,240,231,.08)', margin: '20px 0 0' }} />

              <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 10, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>Security</h3>
                {!showPasswordChange ? (
                  <button className="vp-btn sm" type="button"
                    onClick={() => setShowPasswordChange(true)}>Change password</button>
                ) : (
                  <PasswordChange onChangePassword={changePassword} onClose={() => setShowPasswordChange(false)} />
                )}
              </div>

              <div className="vp-setting-summary" style={{ marginTop: 24 }}>
                Profile data is used across booking records, invoices, and campaign review handoffs.
                Update your details to keep approval workflows accurate.
              </div>
            </div>

            <aside className="vp-dash-panel">
              <h3>What this profile controls</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Agency / brand identity displayed on campaign records.</span><strong>Identity</strong></div>
                <div className="vp-dash-item"><span>Billing contact for invoices and financial approvals.</span><strong>Billing</strong></div>
                <div className="vp-dash-item"><span>Creative contact for slogan and artwork review.</span><strong>Creative</strong></div>
                <div className="vp-dash-item"><span>Preferred markets used to speed up future discovery.</span><strong>Markets</strong></div>
              </div>

              <ProfileCompleteness user={currentUser} />

              <hr style={{ border: 'none', borderTop: '1px solid rgba(245,240,231,.08)', margin: '20px 0 0' }} />

              <div style={{ marginTop: 16 }}>
                {!showDeleteConfirm ? (
                  <button className="vp-btn sm" type="button" style={{ width: '100%', color: 'rgba(245,240,231,.52)', borderColor: 'rgba(245,240,231,.12)' }}
                    onClick={() => setShowDeleteConfirm(true)}>
                    <ShieldAlert size={14} /> Delete my account
                  </button>
                ) : (
                  <div style={{ border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: 14, background: 'rgba(239,68,68,.04)' }}>
                    <p className="text-body-sm" style={{ color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Delete account?</p>
                    <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.52)', marginBottom: 12, lineHeight: 1.5 }}>
                      All your data including bookings, campaign history, and settings will be permanently removed.
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="vp-btn sm primary" type="button" style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: 11 }}
                        onClick={() => { deleteAccount(); window.location.href = '/'; }}>Yes, delete permanently</button>
                      <button className="vp-btn sm" type="button" style={{ fontSize: 11 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* ── Settings ── */}
        <section className={`vp-dashboard-view${activeView === 'settings' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Advertiser settings</p>
            <h2>Booking defaults, notifications, approvals, and security.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <div className="vp-panel-title">
                <div><h3>Account settings</h3></div>
                {!editingSettings ? (
                  <button className="vp-btn sm" type="button" onClick={() => setEditingSettings(true)}>Edit Settings</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="vp-btn sm primary" type="button" onClick={() => setEditingSettings(false)}>Save</button>
                    <button className="vp-btn sm" type="button" onClick={() => setEditingSettings(false)}>Cancel</button>
                  </div>
                )}
              </div>
              <div className="vp-dash-list">
                {editingSettings ? (
                  <>
                    <div className="vp-dash-item">
                      <span>Billing currency</span>
                      <select value={adSettings.billingCurrency} onChange={e => setAdSettings(s => ({ ...s, billingCurrency: e.target.value }))} className="vp-select-inline">
                        <option value="USD">USD</option>
                        <option value="GHS">GHS</option>
                        <option value="NGN">NGN</option>
                        <option value="KES">KES</option>
                        <option value="ZAR">ZAR</option>
                      </select>
                    </div>
                    <div className="vp-dash-item">
                      <span>Default flight length</span>
                      <input type="number" min={1} max={365} value={adSettings.flightLength} onChange={e => setAdSettings(s => ({ ...s, flightLength: Number(e.target.value) }))} className="text-body-sm" style={{ width: 80, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(245,240,231,.16)', padding: '4px 8px', borderRadius: 6, color: '#f5f0e7', textAlign: 'right' }} />
                      <strong style={{ marginLeft: 4 }}>days</strong>
                    </div>
                    {([
                      { key: 'approvalWorkflow' as const, label: 'Approval workflow' },
                      { key: 'bookingAlerts' as const, label: 'Booking status alerts' },
                      { key: 'availabilityAlerts' as const, label: 'Availability alerts' },
                      { key: 'invoiceAlerts' as const, label: 'Invoice alerts' },
                      { key: 'twoFA' as const, label: 'Two-factor authentication' },
                      { key: 'creativeReview' as const, label: 'Creative review required' },
                    ]).map(({ key, label }) => (
                      <div key={key} className="vp-dash-item">
                        <span>{label}</span>
                        <Toggle checked={adSettings[key]} onChange={() => setAdSettings(s => ({ ...s, [key]: !s[key] }))} />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="vp-dash-item"><span>Billing currency</span><strong>{adSettings.billingCurrency}</strong></div>
                    <div className="vp-dash-item"><span>Default flight length</span><strong>{adSettings.flightLength} days</strong></div>
                    <div className="vp-dash-item"><span>Approval workflow</span><strong>{adSettings.approvalWorkflow ? 'Manager approval before vendor submission' : 'Direct submit'}</strong></div>
                    <div className="vp-dash-item"><span>Booking status alerts</span><strong>{adSettings.bookingAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Availability alerts</span><strong>{adSettings.availabilityAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Invoice alerts</span><strong>{adSettings.invoiceAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Two-factor authentication</span><strong>{adSettings.twoFA ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Creative review required</span><strong>{adSettings.creativeReview ? 'Enabled' : 'Disabled'}</strong></div>
                  </>
                )}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Operational impact</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Default flight length and budget cap guide campaign valuation.</span><strong>Planning</strong></div>
                <div className="vp-dash-item"><span>Approval workflow determines whether requests require manager review.</span><strong>Governance</strong></div>
                <div className="vp-dash-item"><span>Alerts notify users when availability, invoices, or booking states change.</span><strong>Alerts</strong></div>
                <div className="vp-dash-item"><span>MFA and session alerts protect advertiser workspace access.</span><strong>Security</strong></div>
              </div>
            </aside>
          </div>
        </section>
    </DashboardShell>
  );
}
