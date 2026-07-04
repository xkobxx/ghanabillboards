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

type VendorView = 'overview' | 'inventory' | 'requests' | 'rates' | 'revenue' | 'profile' | 'settings';

export default function VendorPage() {
  const {
    currentUser, setAuthMode, allBillboards, setAllBillboards, myBookings, setCurrentUser,
    updateBookingStatus, updateBillboardStatus, createBillboard, deleteBillboard, signOut,
    changePassword, deleteAccount,
  } = useApp();
  const [activeView, setActiveView] = useState<VendorView>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '', phone: '', bio: '', location: '', website: '' });
  const [editingSettings, setEditingSettings] = useState(false);
  const [vSettings, setVSettings] = useLocalStorage('vantage_vendor_settings', { payoutCurrency: 'USD', rateModel: 'Manual daily-rate approval', invoiceCycle: 'Monthly consolidated invoice', occupancyTarget: 82, bookingAlerts: true, maintenanceAlerts: true, payoutAlerts: true, broadcastSlots: true, maintenanceMode: false });
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
    document.body.style.overflow = editingBillboard ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingBillboard]);

  /* ── Guard ── */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Vendor access required</h4>
          <p>Login or create a vendor account to access the inventory listing and booking management workspace.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Vendor access required</h4>
          <p>This account is registered as a {currentUser.role}. Use the correct workspace for your role.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Switch account <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R' };
  const currency = (n: number) => CURRENCY_SYMBOLS[vSettings.payoutCurrency] + Number(n).toLocaleString();
  const approved = myBookings.filter(b => ['Live', 'Completed'].includes(b.status)).reduce((s, b) => s + b.totalCost, 0);
  const pendingBookings = myBookings.filter(b => b.status === 'Pending Approved');
  const avgRate = Math.round(allBillboards.reduce((s, b) => s + b.dailyRate, 0) / Math.max(1, allBillboards.length));
  const maintenanceCount = allBillboards.filter(b => b.status === 'Maintenance').length;
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'VN';

  const navItems: { id: VendorView; label: string; icon: React.ReactNode; badge?: boolean }[] = [
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
      title: 'New Vendor Surface',
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
      description: 'New supply-side asset awaiting complete vendor parameters.',
    };
    createBillboard(newBillboard);
    setEditingBillboard(newBillboard);
    setEditDraft({ ...newBillboard });
    setActiveView('inventory');
  };

  return (
    <DashboardShell
      role="vendor"
      activeView={activeView}
      onViewChange={id => setActiveView(id as VendorView)}
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
            <p className="vp-eyebrow">Vendor Supply Hub</p>
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
                  <p>{pendingBookings.length} booking request{pendingBookings.length === 1 ? '' : 's'} awaiting vendor action.</p>
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
            <p className="vp-eyebrow">Vendor profile</p>
            <h2>Vendor profile</h2>
          </div>

          {!currentUser.emailVerified ? (
            <div className="vp-dash-panel" style={{ marginBottom: 16, background: 'rgba(255,193,7,.06)', border: '1px solid rgba(255,193,7,.2)', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px' }}>
              <MailCheck size={16} style={{ color: '#ffc107', flexShrink: 0 }} />
              <span className="text-body-sm" style={{ color: 'rgba(245,240,231,.8)' }}>
                Email not verified — <button type="button" className="vp-btn sm" style={{ marginLeft: 4 }} onClick={() => { setCurrentUser({ ...currentUser, emailVerified: true }); }}>Verify now</button>
              </span>
            </div>
          ) : (
            <div className="vp-dash-panel" style={{ marginBottom: 16, background: 'rgba(168,255,96,.06)', border: '1px solid rgba(168,255,96,.2)', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px' }}>
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
                      <textarea value={profileDraft.bio} onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} className="vp-input-inline" rows={3} style={{ resize: 'vertical' }} placeholder="Describe your media company..." />
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
                    <div className="vp-dash-item"><span>Role</span><strong>Vendor</strong></div>
                    <div className="vp-dash-item"><span>Vendor ID</span><strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{currentUser.id}</strong></div>
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
            </div>
            <aside className="vp-dash-panel">
              <h3>What this profile controls</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Media owner displayed against listed inventory.</span><strong>Ownership</strong></div>
                <div className="vp-dash-item"><span>Payout contact used for invoices and settlements.</span><strong>Payout</strong></div>
                <div className="vp-dash-item"><span>Operations contact used for maintenance and live campaign readiness.</span><strong>Ops</strong></div>
                <div className="vp-dash-item"><span>Coverage markets used to segment supply availability.</span><strong>Markets</strong></div>
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
                      All your inventory, bookings, and revenue records will be permanently removed.
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
            <p className="vp-eyebrow">Vendor settings</p>
            <h2>Inventory broadcast, pricing defaults, invoice behaviour, and security.</h2>
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
                      <span>Payout currency</span>
                      <select value={vSettings.payoutCurrency} onChange={e => setVSettings(s => ({ ...s, payoutCurrency: e.target.value }))} className="vp-select-inline">
                        <option value="USD">USD</option>
                        <option value="GHS">GHS</option>
                        <option value="NGN">NGN</option>
                        <option value="KES">KES</option>
                        <option value="ZAR">ZAR</option>
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
                      <input type="number" min={0} max={100} value={vSettings.occupancyTarget} onChange={e => setVSettings(s => ({ ...s, occupancyTarget: Number(e.target.value) }))} className="text-body-sm" style={{ width: 70, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(245,240,231,.16)', padding: '4px 8px', borderRadius: 6, color: '#f5f0e7', textAlign: 'right' }} />
                      <strong style={{ marginLeft: 4 }}>%</strong>
                    </div>
                    {([
                      { key: 'bookingAlerts' as const, label: 'Booking request alerts' },
                      { key: 'maintenanceAlerts' as const, label: 'Maintenance alerts' },
                      { key: 'payoutAlerts' as const, label: 'Payout alerts' },
                      { key: 'broadcastSlots' as const, label: 'Broadcast available slots' },
                      { key: 'maintenanceMode' as const, label: 'Global maintenance mode' },
                    ]).map(({ key, label }) => (
                      <div key={key} className="vp-dash-item">
                        <span>{label}</span>
                        <Toggle checked={vSettings[key]} onChange={() => setVSettings(s => ({ ...s, [key]: !s[key] }))} />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="vp-dash-item"><span>Payout currency</span><strong>{vSettings.payoutCurrency}</strong></div>
                    <div className="vp-dash-item"><span>Rate model</span><strong>{vSettings.rateModel}</strong></div>
                    <div className="vp-dash-item"><span>Invoice cycle</span><strong>{vSettings.invoiceCycle}</strong></div>
                    <div className="vp-dash-item"><span>Occupancy target</span><strong>{vSettings.occupancyTarget}%</strong></div>
                    <div className="vp-dash-item"><span>Booking request alerts</span><strong>{vSettings.bookingAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Maintenance alerts</span><strong>{vSettings.maintenanceAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Payout alerts</span><strong>{vSettings.payoutAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Broadcast available slots</span><strong>{vSettings.broadcastSlots ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Global maintenance mode</span><strong>{vSettings.maintenanceMode ? 'Enabled' : 'Disabled'}</strong></div>
                  </>
                )}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Operational impact</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Broadcast available slots automatically to advertiser marketplace.</span><strong>Supply</strong></div>
                <div className="vp-dash-item"><span>Rate model and invoice cycle control commercial workflows.</span><strong>Revenue</strong></div>
                <div className="vp-dash-item"><span>Maintenance mode can remove the whole vendor account from availability.</span><strong>Safety</strong></div>
                <div className="vp-dash-item"><span>MFA protects supply controls and payout contacts.</span><strong>Security</strong></div>
              </div>
            </aside>
          </div>
        </section>
    </DashboardShell>
  );
}
