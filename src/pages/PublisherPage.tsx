import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import {
  LayoutDashboard, PanelTop, Inbox, SlidersHorizontal, Banknote,
  Building2, Settings, Wrench, BadgeDollarSign,
  ArrowUpRight, Pencil, Trash2, X, Upload, Image,
  ShieldAlert, MailCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Billboard } from '../types';
import Toggle from '../components/Toggle';
import DashboardShell from '../components/DashboardShell';
import AvatarUpload from '../components/AvatarUpload';
import PasswordChange from '../components/PasswordChange';
import ProfileCompleteness from '../components/ProfileCompleteness';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProfile, type ProfileErrors } from '../lib/validation';

type PublisherView = 'overview' | 'inventory' | 'requests' | 'rates' | 'revenue' | 'profile' | 'settings';

export default function PublisherPage() {
  const {
    currentUser, setAuthMode, allBillboards, setAllBillboards, myBookings, setCurrentUser,
    updateBookingStatus, updateBillboardStatus, createBillboard, deleteBillboard, signOut,
    changePassword, deleteAccount,
  } = useApp();
  const [activeView, setActiveView] = useState<PublisherView>('overview');
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '', phone: '', bio: '', location: '', website: '' });
  const [vSettings, setVSettings] = useLocalStorage('vantage_publisher_settings', { payoutCurrency: 'USD', rateModel: 'Manual daily-rate approval', invoiceCycle: 'Monthly consolidated invoice', occupancyTarget: 82, bookingAlerts: true, maintenanceAlerts: true, payoutAlerts: true, broadcastSlots: true, maintenanceMode: false });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [editingBillboard, setEditingBillboard] = useState<Billboard | null>(null);
  const [editDraft, setEditDraft] = useState<Billboard | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  type InventoryFormat = Billboard['format'];
  const FORMATS: InventoryFormat[] = ['Digital LED', 'Static Mega', 'Spectacular Bridge', 'Portrait Pillar'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditDraft(d => d ? { ...d, imageUrl: reader.result as string } : d);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!currentUser) return;
    setProfileDraft({ name: currentUser.name, email: currentUser.email, company: currentUser.company || '', phone: currentUser.phone || '', bio: currentUser.bio || '', location: currentUser.location || '', website: currentUser.website || '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    document.body.style.overflow = editingBillboard ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingBillboard]);

  /* ── Guard ── */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Publisher access required</h4>
          <p>Login or create a publisher account to access the inventory listing and booking management workspace.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'publisher' && currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Publisher access required</h4>
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
  const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R' };
  const currency = (n: number) => CURRENCY_SYMBOLS[vSettings.payoutCurrency] + Number(n).toLocaleString();
  const approved = myBookings.filter(b => ['Live', 'Completed'].includes(b.status)).reduce((s, b) => s + b.totalCost, 0);
  const pendingBookings = myBookings.filter(b => b.status === 'Pending Approved');
  const avgRate = Math.round(allBillboards.reduce((s, b) => s + b.dailyRate, 0) / Math.max(1, allBillboards.length));
  const maintenanceCount = allBillboards.filter(b => b.status === 'Maintenance').length;
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PB';

  const navItems: { id: PublisherView; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'overview',   label: 'Supply Hub',  icon: <LayoutDashboard size={15} /> },
    { id: 'inventory',  label: 'Inventory',   icon: <PanelTop size={15} />, badge: vSettings.maintenanceMode },
    { id: 'requests',   label: 'Requests',    icon: <Inbox size={15} />, badge: vSettings.bookingAlerts },
    { id: 'rates',      label: 'Rates',       icon: <SlidersHorizontal size={15} />, badge: vSettings.broadcastSlots },
    { id: 'revenue',    label: 'Revenue',     icon: <Banknote size={15} />, badge: vSettings.payoutAlerts },
    { id: 'profile',    label: 'Profile',     icon: <Building2 size={15} /> },
    { id: 'settings',   label: 'Settings',    icon: <Settings size={15} /> },
  ];

  const handleAddAsset = () => {
    const newId = `new-${crypto.randomUUID().slice(0, 8)}`;
    const newBillboard: Billboard = {
      id: newId,
      title: 'New Publisher Surface',
      location: 'Unassigned corridor',
      city: 'Lagos',
      country: 'Nigeria',
      dailyRate: 350,
      format: 'Static Mega',
      dimensions: '10m × 4m',
      monthlyImpressions: '500,000',
      trafficVolume: 'High',
      status: 'Available',
      lat: 6.5,
      lng: 3.4,
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      description: 'New supply-side asset awaiting complete publisher parameters.',
    };
    createBillboard(newBillboard);
    setEditingBillboard(newBillboard);
    setEditDraft({ ...newBillboard });
    setActiveView('inventory');
  };

  return (
    <DashboardShell
      role="publisher"
      activeView={activeView}
      onViewChange={id => setActiveView(id as PublisherView)}
      navItems={navItems}
      user={currentUser}
      onSignOut={signOut}
      sidebarAction={
        <button className="vp-btn sm primary full" onClick={handleAddAsset}>
          Add Billboard <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      }
    >
        {/* ── Overview ── */}
        <section className={`vp-dashboard-view${activeView === 'overview' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Publisher Supply Hub</p>
            <h1>Supply hub</h1>
          </div>
          <div className="vp-dash-metrics">
            <div className="vp-stat-card">
              <strong>{allBillboards.length}</strong>
              <span>Total assets</span>
            </div>
            <div className="vp-stat-card">
              <strong>{allBillboards.filter(b => b.status === 'Available').length}<span className="text-body-xs" style={{ color: 'rgba(245,240,231,.4)', marginLeft: 6 }}>/ {allBillboards.length}</span></strong>
              <span>Available <span className="text-caption" style={{ color: 'rgba(245,240,231,.36)' }}>({Math.round(allBillboards.filter(b => b.status === 'Available').length / Math.max(1, allBillboards.length) * 100)}% occ — target {vSettings.occupancyTarget}%)</span></span>
            </div>
            <div className="vp-stat-card">
              <strong>{currency(approved)}</strong>
              <span>Gross billing</span>
            </div>
            <div className="vp-stat-card">
              <strong>{pendingBookings.length}</strong>
              <span>Pending requests</span>
            </div>
          </div>
          <div className="vp-panel-col-grid three">
            <div className="vp-mini-card">
              <h4><PanelTop size={17} />Inventory control</h4>
              <p>Edit board rates, formats, and operational status directly from the dashboard.</p>
            </div>
            <div className="vp-mini-card">
              <h4><Inbox size={17} />Request queue</h4>
              <p>Approve or reject advertiser bookings; approved requests move to Live status.</p>
            </div>
            <div className="vp-mini-card">
              <h4><Banknote size={17} />Gross billing</h4>
              <p>Revenue updates from approved or completed bookings.</p>
            </div>
          </div>
        </section>

        {/* ── Inventory ── */}
        <section className={`vp-dashboard-view${activeView === 'inventory' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <div className="vp-panel-title">
              <div>
                <h3>Operational inventory list</h3>
                <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '4px 0 0' }}>
                  Update daily rates, format, and operational status.
                </p>
              </div>
              <button className="vp-btn sm" onClick={handleAddAsset}>Add Billboard</button>
            </div>
            <div className="vp-inventory-table">
              <div className="row head">
                <span>Asset</span>
                <span>Rate</span>
                <span>Format</span>
                <span>Status</span>
                <span className="actions">Actions</span>
              </div>
              {allBillboards.map(b => (
                <div key={b.id} className="row">
                  <div className="cell">
                    <strong>{b.title}</strong>
                    <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.52)', margin: '2px 0 0', fontFamily: 'inherit', lineHeight: 1.25 }}>
                      {b.location}, {b.city} · {b.dimensions}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: 'var(--vp-ink)' }}>{currency(b.dailyRate)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--vp-ink)' }}>{b.format}</span>
                  </div>
                  <div>
                    <span className={`vp-status-pill ${b.status === 'Available' ? 'ok' : b.status === 'Maintenance' ? 'bad' : 'warn'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="actions">
                    <button className="vp-btn sm icon" type="button" title={b.status === 'Available' ? 'Set Maintenance' : 'Set Available'} onClick={() => updateBillboardStatus(b.id, b.status === 'Available' ? 'Maintenance' : 'Available')}><Wrench size={14} /></button>
                    <button className="vp-btn sm icon" type="button" title="Edit" onClick={() => { setEditingBillboard(b); setEditDraft({ ...b }); }}><Pencil size={14} /></button>
                    <button className="vp-btn sm icon danger" type="button" title="Delete" onClick={() => deleteBillboard(b.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Edit Asset Modal ── */}
        {editingBillboard && editDraft && (
          <div className="vp-edit-overlay" onClick={() => { setEditingBillboard(null); setEditDraft(null); }}>
            <div className="vp-edit-panel" onClick={e => e.stopPropagation()}>
              <div className="vp-edit-header">
                <div>
                  <p className="vp-eyebrow" style={{ margin: 0 }}>Edit Asset</p>
                  <h4 style={{ margin: '2px 0 0', fontSize: 'var(--text-body-lg)', color: 'var(--vp-ink)' }}>{editingBillboard.title}</h4>
                </div>
                <button className="vp-btn sm icon" type="button" aria-label="Close" onClick={() => { setEditingBillboard(null); setEditDraft(null); }}><X size={16} /></button>
              </div>

              <div className="vp-edit-form">
                {/* ── Identity ── */}
                <div className="vp-edit-section">
                  <span className="vp-edit-section-label">Identity</span>
                  <div className="vp-edit-field">
                    <label>Title</label>
                    <input type="text" value={editDraft.title} onChange={e => setEditDraft(d => d ? { ...d, title: e.target.value } : d)} className="vp-input-inline" />
                  </div>
                  <div className="vp-edit-field">
                    <label>Description</label>
                    <textarea value={editDraft.description} onChange={e => setEditDraft(d => d ? { ...d, description: e.target.value } : d)} className="vp-input-inline" rows={6} style={{ resize: 'vertical', minHeight: 120 }} />
                  </div>
                </div>

                {/* ── Location ── */}
                <div className="vp-edit-section">
                  <span className="vp-edit-section-label">Location</span>
                  <div className="vp-edit-field">
                    <label>Location</label>
                    <input type="text" value={editDraft.location} onChange={e => setEditDraft(d => d ? { ...d, location: e.target.value } : d)} className="vp-input-inline" />
                  </div>
                  <div className="vp-edit-row">
                    <div className="vp-edit-field">
                      <label>City</label>
                      <input type="text" value={editDraft.city} onChange={e => setEditDraft(d => d ? { ...d, city: e.target.value } : d)} className="vp-input-inline" />
                    </div>
                    <div className="vp-edit-field">
                      <label>Country</label>
                      <input type="text" value={editDraft.country} onChange={e => setEditDraft(d => d ? { ...d, country: e.target.value } : d)} className="vp-input-inline" />
                    </div>
                  </div>
                </div>

                {/* ── Commercials ── */}
                <div className="vp-edit-section">
                  <span className="vp-edit-section-label">Commercials</span>
                  <div className="vp-edit-row">
                    <div className="vp-edit-field">
                      <label>Daily Rate</label>
                      <input type="number" min={50} max={50000} value={editDraft.dailyRate} onChange={e => setEditDraft(d => d ? { ...d, dailyRate: Number(e.target.value) } : d)} className="vp-input-inline" style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="vp-edit-field">
                      <label>Format</label>
                      <select value={editDraft.format} onChange={e => setEditDraft(d => d ? { ...d, format: e.target.value as Billboard['format'] } : d)} className="vp-select-inline">
                        {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="vp-edit-row">
                    <div className="vp-edit-field">
                      <label>Dimensions</label>
                      <input type="text" value={editDraft.dimensions} onChange={e => setEditDraft(d => d ? { ...d, dimensions: e.target.value } : d)} className="vp-input-inline" />
                    </div>
                    <div className="vp-edit-field">
                      <label>Monthly Impressions</label>
                      <input type="text" value={editDraft.monthlyImpressions} onChange={e => setEditDraft(d => d ? { ...d, monthlyImpressions: e.target.value } : d)} className="vp-input-inline" />
                    </div>
                  </div>
                </div>

                {/* ── Geo ── */}
                <div className="vp-edit-section">
                  <span className="vp-edit-section-label">Geo</span>
                  <div className="vp-edit-row">
                    <div className="vp-edit-field">
                      <label>Latitude</label>
                      <input type="number" step="any" value={editDraft.lat} onChange={e => setEditDraft(d => d ? { ...d, lat: Number(e.target.value) } : d)} className="vp-input-inline" style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="vp-edit-field">
                      <label>Longitude</label>
                      <input type="number" step="any" value={editDraft.lng} onChange={e => setEditDraft(d => d ? { ...d, lng: Number(e.target.value) } : d)} className="vp-input-inline" style={{ fontFamily: 'monospace' }} />
                    </div>
                  </div>
                  <div className="vp-edit-field">
                    <label>Traffic Volume</label>
                    <select value={editDraft.trafficVolume} onChange={e => setEditDraft(d => d ? { ...d, trafficVolume: e.target.value as Billboard['trafficVolume'] } : d)} className="vp-select-inline">
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                      <option value="Mega">Mega</option>
                    </select>
                  </div>
                </div>

                {/* ── Media ── */}
                <div className="vp-edit-section">
                  <span className="vp-edit-section-label">Media</span>
                  <div className="vp-edit-field">
                    <label>Image URL</label>
                    <div className="vp-edit-media-group">
                      <input type="text" value={editDraft.imageUrl} onChange={e => setEditDraft(d => d ? { ...d, imageUrl: e.target.value } : d)} className="vp-input-inline" style={{ flex: 1 }} />
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      <button type="button" className="vp-btn sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} /> Upload
                      </button>
                    </div>
                  </div>
                  <div className="vp-edit-preview">
                    {editDraft.imageUrl ? (
                      <img src={editDraft.imageUrl} alt="Preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="vp-edit-preview-empty">
                        <Image size={24} />
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="vp-edit-actions">
                <button className="vp-btn sm" type="button" onClick={() => { setEditingBillboard(null); setEditDraft(null); }}>Cancel</button>
                <button className="vp-btn sm primary" type="button" onClick={() => {
                  if (editDraft) {
                    setAllBillboards(prev => prev.map(bk => bk.id === editDraft.id ? editDraft : bk));
                  }
                  setEditingBillboard(null);
                  setEditDraft(null);
                }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Requests ── */}
        <section className={`vp-dashboard-view${activeView === 'requests' ? ' active' : ''}`}>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <h3>Incoming booking requests</h3>
              <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '0 0 8px' }}>
                Approve or reject campaign requests. Approved requests increase gross billing.
              </p>
              <div className="vp-booking-queue">
                {pendingBookings.length === 0 ? (
                  <div className="vp-empty">No pending booking requests. New advertiser bookings will appear here for approval.</div>
                ) : pendingBookings.map(b => {
                  const board = allBillboards.find(bl => bl.id === b.billboardId);
                  return (
                    <div key={b.id} className="vp-queue-card">
                      <div className="vp-queue-top">
                        <div>
                          <h4>{b.campaignName}</h4>
                          <p>{b.clientName} · {board?.title || b.billboardId} · {currency(b.totalCost)}</p>
                        </div>
                        <span className="vp-status-pill warn">{b.status}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: 0 }}>
                        {b.slogan || 'No slogan supplied.'}
                      </p>
                      <div className="vp-queue-actions">
                        <button className="vp-btn sm primary" onClick={() => updateBookingStatus(b.id, 'Live')}>Approve <ArrowUpRight className="w-3.5 h-3.5" /></button>
                        <button className="vp-btn sm danger" onClick={() => updateBookingStatus(b.id, 'Rejected' as never)}>Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Queue summary</h3>
              <div className="vp-dash-metrics" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="vp-stat-card" style={{ minHeight: 'auto', padding: 16 }}>
                  <strong style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}>{pendingBookings.length}</strong>
                  <span>Pending requests</span>
                </div>
                <div className="vp-stat-card" style={{ minHeight: 'auto', padding: 16 }}>
                  <strong style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}>{currency(pendingBookings.reduce((s, b) => s + b.totalCost, 0))}</strong>
                  <span>Pipeline value</span>
                </div>
              </div>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Approving moves booking to Live status and reserves the calendar slot.</span><strong>Approve</strong></div>
                <div className="vp-dash-item"><span>Rejecting removes the request; the buyer must resubmit a new booking.</span><strong>Reject</strong></div>
                <div className="vp-dash-item"><span>Approved bookings flow into gross billing and revenue reporting.</span><strong>Revenue</strong></div>
                <div className="vp-dash-item"><span>Inventory status updates to Fully Booked when all slots are claimed.</span><strong>Occupancy</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Rates ── */}
        <section className={`vp-dashboard-view${activeView === 'rates' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Rates</p>
            <h2>Pricing and inventory parameters.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <h3>Rate guidance</h3>
              <div className="vp-compact-table">
                <div className="row head"><span>Asset</span><span>Rate</span><span>Status</span></div>
                {allBillboards.map(b => (
                  <div key={b.id} className="row">
                    <strong>{b.title}</strong>
                    <span>{currency(b.dailyRate)}/day</span>
                    <span className={`vp-status-pill ${b.status === 'Available' ? 'ok' : 'warn'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Pricing controls</h3>
              <div className="vp-role-task-list">
                <div className="vp-role-task"><BadgeDollarSign size={16} /><span>Daily-rate inputs control advertiser campaign valuation.</span><strong>Rate</strong></div>
                <div className="vp-role-task"><PanelTop size={16} /><span>Format selectors classify inventory across four board types.</span><strong>Format</strong></div>
                <div className="vp-role-task"><SlidersHorizontal size={16} /><span>Status controls broadcast availability, fully booked, or maintenance state.</span><strong>Status</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Revenue ── */}
        <section className={`vp-dashboard-view${activeView === 'revenue' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Revenue</p>
            <h2>Financial summary and occupancy signals.</h2>
          </div>
          <div className="vp-panel-grid">
            <div className="vp-dash-panel">
              <h3>Revenue summary</h3>
              <div className="vp-panel-col-grid" style={{ marginTop: 0 }}>
                <div className="vp-mini-card">
                  <h4><Banknote size={17} />Approved billing</h4>
                  <p>{currency(approved)} from Live or Completed campaign records.</p>
                  <span className="vp-tag ok">Gross</span>
                </div>
                <div className="vp-mini-card">
                  <h4><BadgeDollarSign size={17} />Average daily rate</h4>
                  <p>{currency(avgRate)} across currently listed assets.</p>
                  <span className="vp-tag">Pricing</span>
                </div>
                <div className="vp-mini-card">
                  <h4><Wrench size={17} />Maintenance load</h4>
                  <p>{maintenanceCount} asset{maintenanceCount === 1 ? '' : 's'} currently unavailable due to maintenance.</p>
                  <span className={`vp-tag ${maintenanceCount ? 'warn' : 'ok'}`}>Operations</span>
                </div>
                <div className="vp-mini-card">
                  <h4><Inbox size={17} />Pending queue</h4>
                  <p>{pendingBookings.length} booking request{pendingBookings.length === 1 ? '' : 's'} awaiting publisher action.</p>
                  <span className="vp-tag warn">Requests</span>
                </div>
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Revenue levers</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Approved / Live bookings</span><strong>Revenue source</strong></div>
                <div className="vp-dash-item"><span>Status toggles</span><strong>Inventory health</strong></div>
                <div className="vp-dash-item"><span>Availability queue</span><strong>Empty-calendar risk</strong></div>
                <div className="vp-dash-item"><span>Invoice cadence from Settings</span><strong>Billing cycle</strong></div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Profile ── */}
        <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Publisher profile</p>
            <h2>Publisher profile</h2>
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
                  <span className="vp-tag">Publisher</span>
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
                    <textarea value={profileDraft.bio} onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" rows={3} style={{ resize: 'vertical' }} placeholder="Describe your media company..." />
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
                  <span>Two-factor authentication</span>
                  <Toggle checked={currentUser.mfaEnabled ?? false} onChange={() => setCurrentUser({ ...currentUser, mfaEnabled: !(currentUser.mfaEnabled ?? false) })} />
                </div>
                <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.45)', marginTop: 4, lineHeight: 1.5 }}>
                  {currentUser.mfaEnabled ? 'Authenticator challenge active.' : 'Protect this account with an authenticator.'}
                </p>
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
                  <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.45)' }}>Permanently removes all inventory, bookings, and revenue records.</p>
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
                  <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.52)', lineHeight: 1.5 }}>All your inventory, bookings, and revenue records will be permanently removed.</p>
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
            <p className="vp-eyebrow">Publisher settings</p>
            <h2>Inventory broadcast, pricing defaults, invoice behaviour, and security.</h2>
          </div>
          <div className="vp-panel-grid equal">
            {/* Left column */}
            <div style={{ display: 'grid', gap: 12 }}>
              {/* Financial */}
              <div className="vp-dash-panel">
                <p className="vp-settings-legend">Financial</p>
                <div className="vp-dash-list">
                  <div className="vp-dash-item">
                    <span>Payout currency</span>
                    <select value={vSettings.payoutCurrency} onChange={e => setVSettings(s => ({ ...s, payoutCurrency: e.target.value }))} className="vp-select-inline">
                      {['USD','GHS','NGN','KES','ZAR'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="vp-dash-item">
                    <span>Rate model</span>
                    <select value={vSettings.rateModel} onChange={e => setVSettings(s => ({ ...s, rateModel: e.target.value }))} className="vp-select-inline">
                      <option value="Manual daily-rate approval">Manual daily-rate approval</option>
                      <option value="Algorithmic pricing">Algorithmic pricing</option>
                    </select>
                  </div>
                  <div className="vp-dash-item">
                    <span>Invoice cycle</span>
                    <select value={vSettings.invoiceCycle} onChange={e => setVSettings(s => ({ ...s, invoiceCycle: e.target.value }))} className="vp-select-inline">
                      <option value="Monthly consolidated invoice">Monthly consolidated invoice</option>
                      <option value="Weekly invoice">Weekly invoice</option>
                      <option value="Quarterly invoice">Quarterly invoice</option>
                    </select>
                  </div>
                  <div className="vp-dash-item">
                    <span>Occupancy target</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" min={0} max={100} value={vSettings.occupancyTarget} onChange={e => setVSettings(s => ({ ...s, occupancyTarget: Number(e.target.value) }))} className="text-body-sm" style={{ width: 70, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(245,240,231,.16)', padding: '4px 8px', borderRadius: 0, color: '#f5f0e7', textAlign: 'right' }} />
                      <strong>%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Broadcast & Operations */}
              <div className="vp-dash-panel">
                <p className="vp-settings-legend">Broadcast & Operations</p>
                <div className="vp-dash-list">
                  {([
                    { key: 'broadcastSlots' as const, label: 'Broadcast available slots', desc: 'Publish open inventory to the advertiser marketplace.' },
                    { key: 'maintenanceMode' as const, label: 'Global maintenance mode', desc: 'Removes all your inventory from availability.' },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="vp-dash-item" style={{ alignItems: 'flex-start' }}>
                      <span>{label}<small>{desc}</small></span>
                      <Toggle checked={vSettings[key]} onChange={() => setVSettings(s => ({ ...s, [key]: !s[key] }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'grid', gap: 12 }}>
              {/* Notifications */}
              <div className="vp-dash-panel">
                <p className="vp-settings-legend">Notifications</p>
                <div className="vp-dash-list">
                  {([
                    { key: 'bookingAlerts' as const, label: 'Booking request alerts', desc: 'New and updated booking requests.' },
                    { key: 'maintenanceAlerts' as const, label: 'Maintenance alerts', desc: 'Asset downtime and service events.' },
                    { key: 'payoutAlerts' as const, label: 'Payout alerts', desc: 'Invoice, settlement, and payment events.' },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="vp-dash-item" style={{ alignItems: 'flex-start' }}>
                      <span>{label}<small>{desc}</small></span>
                      <Toggle checked={vSettings[key]} onChange={() => setVSettings(s => ({ ...s, [key]: !s[key] }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="vp-dash-panel">
                <p className="vp-settings-legend">Security</p>
                <div className="vp-dash-item" style={{ alignItems: 'flex-start' }}>
                  <span>Two-factor authentication<small>{currentUser.mfaEnabled ? 'Authenticator challenge active at sign-in.' : 'Protect supply controls and payout contacts with MFA.'}</small></span>
                  <Toggle
                    checked={currentUser.mfaEnabled ?? false}
                    onChange={() => setCurrentUser({ ...currentUser, mfaEnabled: !(currentUser.mfaEnabled ?? false) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
    </DashboardShell>
  );
}
