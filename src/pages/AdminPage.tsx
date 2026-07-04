import { useState } from 'react';
import type React from 'react';
import {
  Activity, Server, FileJson, SlidersHorizontal, ShieldCheck,
  BadgeAlert, IdCard, Settings, CheckCircle,
  XCircle, ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Toggle from '../components/Toggle';
import DashboardShell from '../components/DashboardShell';
import AvatarUpload from '../components/AvatarUpload';
import PasswordChange from '../components/PasswordChange';
import ProfileCompleteness from '../components/ProfileCompleteness';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProfile, type ProfileErrors } from '../lib/validation';
import type { GatewayLog } from '../types';

type AdminView = 'overview' | 'logs' | 'payload' | 'rules' | 'privileges' | 'disputes' | 'profile' | 'settings';

const INITIAL_LOGS: GatewayLog[] = [
  { id: 'lg-1', timestamp: '21:15:02', method: 'POST', endpoint: '/api/bookings', module: 'Bookings', status: 201, latencyMs: 88 },
  { id: 'lg-2', timestamp: '21:15:04', method: 'GET',  endpoint: '/api/billboards?city=Lagos', module: 'Billboards', status: 200, latencyMs: 42 },
  { id: 'lg-3', timestamp: '21:15:09', method: 'POST', endpoint: '/api/auth/login', module: 'Auth', status: 200, latencyMs: 64 },
  { id: 'lg-4', timestamp: '21:15:18', method: 'GET',  endpoint: '/api/payments/escrow', module: 'Payments', status: 429, latencyMs: 112 },
  { id: 'lg-5', timestamp: '21:15:25', method: 'PUT',  endpoint: '/api/gateway/rules', module: 'Analytics', status: 204, latencyMs: 51 },
];

export default function AdminPage() {
  const { currentUser, setAuthMode, allBillboards, myBookings, updateBookingStatus, signOut, setCurrentUser, changePassword } = useApp();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [logs, setLogs] = useState<GatewayLog[]>(INITIAL_LOGS);
  const [selectedLog, setSelectedLog] = useState<GatewayLog | null>(INITIAL_LOGS[0]);
  const [gateway, setGateway] = useState({ rateLimit: 240, dbPool: 24, redisTTL: 180 });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '' });
  const [editingSettings, setEditingSettings] = useState(false);
  const [adminSettings, setAdminSettings] = useLocalStorage('vantage_admin_settings', { latencyAlerts: true, disputeAlerts: true, twoFA: true, auditRetention: 30, payloadVisibility: 'masked' as 'masked' | 'full' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [disputes, setDisputes] = useState([
    { id: 'd1', title: 'Creative mismatch evidence upload', status: 'open' as const },
    { id: 'd2', title: 'Calendar lock conflict', status: 'review' as const },
  ]);
  const [privileges, setPrivileges] = useLocalStorage('vantage_admin_privileges', { advertiserBook: true, vendorApprove: true, adminInspect: true, investorView: true });

  /* ── Guard ── */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Admin access required</h4>
          <p>Login with an administrator account to access the control telemetry and permissions workspace.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Admin access required</h4>
          <p>Administrative controls are only available to accounts with the administrator role.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Switch account <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';
  const medianLatency = Math.round(logs.reduce((s, l) => s + l.latencyMs, 0) / Math.max(1, logs.length));
  const rateLimitEvents = logs.filter(l => l.status === 429).length;
  const healthyRequests = logs.filter(l => l.status < 400).length;

  const generateTraffic = () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
    const modules = ['Auth', 'Billboards', 'Bookings', 'Payments', 'Analytics'] as const;
    const statuses = [200, 200, 201, 204, 400, 403, 429];
    const module = modules[Math.floor(Math.random() * modules.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const newLog: GatewayLog = {
      id: 'lg-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-GB'),
      method: methods[Math.floor(Math.random() * methods.length)],
      endpoint: '/api/' + module.toLowerCase() + '/' + Math.floor(Math.random() * 99),
      module,
      status,
      latencyMs: Math.floor(Math.random() * 160 + 28),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 12));
    setSelectedLog(newLog);
  };

  const navItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',   label: 'Overview',    icon: <Activity size={15} /> },
    { id: 'logs',       label: 'API logs',    icon: <Server size={15} /> },
    { id: 'payload',    label: 'Payloads',    icon: <FileJson size={15} /> },
    { id: 'rules',      label: 'Rules',       icon: <SlidersHorizontal size={15} /> },
    { id: 'privileges', label: 'Privileges',  icon: <ShieldCheck size={15} /> },
    { id: 'disputes',   label: 'Disputes',    icon: <BadgeAlert size={15} /> },
    { id: 'profile',    label: 'Profile',     icon: <IdCard size={15} /> },
    { id: 'settings',   label: 'Settings',    icon: <Settings size={15} /> },
  ];

  return (
    <DashboardShell
      role="admin"
      activeView={activeView}
      onViewChange={id => setActiveView(id as AdminView)}
      navItems={navItems}
      user={currentUser}
      onSignOut={signOut}
      sidebarAction={
        <button className="vp-btn sm primary full" onClick={generateTraffic}>
          Generate traffic <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      }
    >

        {/* ── Overview ── */}
        <section className={`vp-dashboard-view${activeView === 'overview' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Admin Gateway Control</p>
            <h1>Gateway control centre</h1>
          </div>
          <div className="vp-dash-metrics">
            <div className="vp-stat-card">
              <strong>{medianLatency}ms</strong>
              <span>Average latency</span>
            </div>
            <div className="vp-stat-card">
              <strong>{rateLimitEvents}</strong>
              <span>Rate-limit events</span>
            </div>
            <div className="vp-stat-card">
              <strong>{healthyRequests}</strong>
              <span>Healthy requests</span>
            </div>
            <div className="vp-stat-card">
              <strong>{gateway.rateLimit}</strong>
              <span>Requests / minute</span>
            </div>
          </div>
          <div className="vp-panel-col-grid three">
            <div className="vp-mini-card">
              <h4><Activity size={17} />Telemetry</h4>
              <p>Review methods, endpoints, status codes, modules, and latency trends.</p>
            </div>
            <div className="vp-mini-card">
              <h4><FileJson size={17} />Payload safety</h4>
              <p>Click logs to inspect structured JSON payloads and debug filters or rate-limit events.</p>
            </div>
            <div className="vp-mini-card">
              <h4><SlidersHorizontal size={17} />Gateway rules</h4>
              <p>Adjust rate limits, DB pool size, and Redis TTL in the control prototype.</p>
            </div>
          </div>
          {/* Quick booking status table */}
          <div className="vp-dash-panel">
            <h3>Booking status overview</h3>
            <div className="vp-dash-list">
              {myBookings.slice(0, 5).map(b => {
                const board = allBillboards.find(bl => bl.id === b.billboardId);
                return (
                  <div key={b.id} className="vp-dash-item">
                    <span>
                      {b.campaignName}
                      <small>{board?.title || b.billboardId} · {b.clientName}</small>
                    </span>
                    <span className={`vp-status-pill ${b.status === 'Live' || b.status === 'Completed' ? 'ok' : 'warn'}`}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Logs ── */}
        <section className={`vp-dashboard-view${activeView === 'logs' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <div className="vp-panel-title">
              <div>
                <h3>API log stream</h3>
                <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '4px 0 0' }}>Click any request to inspect the raw payload.</p>
              </div>
              <button className="vp-btn sm" onClick={generateTraffic}>Generate traffic</button>
            </div>
            <div className="vp-terminal">
              {logs.map(l => (
                <div
                  key={l.id}
                  className={`vp-log-row${selectedLog?.id === l.id ? ' active' : ''}`}
                  onClick={() => setSelectedLog(l)}
                >
                  <span>{l.method}</span>
                  <span>{l.endpoint}</span>
                  <span>{l.module}</span>
                  <span className={l.status < 300 ? 'vp-status-ok' : l.status === 429 ? 'vp-status-warn' : 'vp-status-bad'}>
                    {l.status}
                  </span>
                  <span>{l.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Payload ── */}
        <section className={`vp-dashboard-view${activeView === 'payload' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <h3>Payload inspector</h3>
            <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '0 0 8px' }}>
              Select a log entry in the API logs view to inspect the payload here.
            </p>
            <pre className="vp-payload-box">
              {selectedLog
                ? JSON.stringify({
                    id: selectedLog.id,
                    timestamp: selectedLog.timestamp,
                    method: selectedLog.method,
                    endpoint: selectedLog.endpoint,
                    module: selectedLog.module,
                    status: selectedLog.status,
                    latencyMs: selectedLog.latencyMs,
                    payload: selectedLog.payload || { synthetic: true, module: selectedLog.module, status: selectedLog.status },
                  }, null, 2)
                : 'Select a log entry to inspect payload.'}
            </pre>
          </div>
        </section>

        {/* ── Rules ── */}
        <section className={`vp-dashboard-view${activeView === 'rules' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <h3>Gateway rule injector</h3>
            <div>
              {([
                ['rateLimit', 'Max API rate limit', 'rpm', 60, 600] as const,
                ['dbPool', 'DB connection pool', 'conn', 4, 60] as const,
                ['redisTTL', 'Redis cache TTL', 'sec', 30, 600] as const,
              ] as Array<[keyof typeof gateway, string, string, number, number]>).map(([key, label, unit, min, max]) => (
                <div key={String(key)} className="vp-control-row">
                  <div>
                    <label
                      htmlFor={`gw-${String(key)}`}
                      className="text-caption"
                      style={{ display: 'block', fontFamily: 'monospace', letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(245,240,231,.46)', marginBottom: 8 }}
                    >
                      {label}
                    </label>
                    <input
                      id={`gw-${String(key)}`}
                      type="range"
                      min={min}
                      max={max}
                      value={gateway[key]}
                      style={{ width: '100%', accentColor: '#a8ff60' }}
                      onChange={e => setGateway(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    />
                  </div>
                  <output className="text-body-sm" style={{ fontFamily: 'monospace', color: '#a8ff60', textAlign: 'right' }}>
                    {gateway[key]} {unit}
                  </output>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privileges ── */}
        <section className={`vp-dashboard-view${activeView === 'privileges' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <h3>Role privileges</h3>
            <p className="text-sm" style={{ color: 'rgba(245,240,231,.68)', margin: '0 0 16px' }}>Toggle role capabilities. Changes persist across sessions.</p>
            <div className="vp-privilege-grid">
              {([
                { key: 'advertiserBook' as const, role: 'Advertiser', label: 'Advertiser can book campaigns' },
                { key: 'vendorApprove' as const, role: 'Vendor', label: 'Vendor can approve bookings' },
                { key: 'adminInspect' as const, role: 'Admin', label: 'Admin can inspect payloads' },
                { key: 'investorView' as const, role: 'Investor', label: 'Investor can view deck' },
              ]).map(({ key, role, label }) => (
                <div key={key} className="vp-priv-card">
                  <h4>{role}</h4>
                  <label>
                    {label}
                    <input type="checkbox" checked={privileges[key]} onChange={() => setPrivileges(p => ({ ...p, [key]: !p[key] }))} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Disputes ── */}
        <section className={`vp-dashboard-view${activeView === 'disputes' ? ' active' : ''}`}>
          <div className="vp-dash-panel">
            <h3>Dispute and review queue</h3>
            <div className="vp-dash-list">
              {disputes.map(d => (
                <div key={d.id} className="vp-dash-item">
                  <span>{d.title}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`vp-status-pill ${d.status === 'resolved' ? 'ok' : d.status === 'dismissed' ? '' : 'warn'}`}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                    {d.status !== 'resolved' && d.status !== 'dismissed' && (
                      <>
                        <button className="vp-btn sm" type="button" onClick={() => { setActiveView('logs'); }} title="Investigate in logs">Investigate</button>
                        <button className="vp-btn sm primary" type="button" onClick={() => setDisputes(prev => prev.map(dd => dd.id === d.id ? { ...dd, status: 'resolved' } : dd))}><CheckCircle size={14} /></button>
                        <button className="vp-btn sm" type="button" onClick={() => setDisputes(prev => prev.map(dd => dd.id === d.id ? { ...dd, status: 'dismissed' } : dd))}><XCircle size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Profile ── */}
        <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Admin profile</p>
            <h2>Operator identity, escalation ownership, clearance, and control-room contacts.</h2>
          </div>
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
                  <button className="vp-btn sm" type="button" onClick={() => { setProfileDraft({ name: currentUser.name, email: currentUser.email, company: currentUser.company || '' }); setEditingProfile(true); }}>Edit Profile</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="vp-btn sm primary" type="button" onClick={() => { const errs = validateProfile(profileDraft.name, profileDraft.email); if (errs.name || errs.email) { setProfileErrors(errs); return; } setCurrentUser({ ...currentUser, name: profileDraft.name, email: profileDraft.email, company: profileDraft.company || undefined }); setEditingProfile(false); setProfileSaved(true); setProfileErrors({}); setTimeout(() => setProfileSaved(false), 2000); }}>Save</button>
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
                    <div className="vp-dash-item"><span>Operator email</span><input type="email" value={profileDraft.email} onChange={e => { setProfileDraft(d => ({ ...d, email: e.target.value })); if (profileErrors.email) setProfileErrors(p => ({ ...p, email: undefined })); }} className="vp-input-inline" /></div>
                    {profileErrors.email && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.email}</p>}
                    <div className="vp-dash-item"><span>Organisation</span><input type="text" value={profileDraft.company} onChange={e => setProfileDraft(d => ({ ...d, company: e.target.value }))} className="vp-input-inline" /></div>
                  </>
                ) : (
                  <>
                    <div className="vp-dash-item"><span>Full name</span><strong>{currentUser.name}</strong></div>
                    <div className="vp-dash-item"><span>Operator email</span><strong>{currentUser.email}</strong></div>
                    {currentUser.company && <div className="vp-dash-item"><span>Organisation</span><strong>{currentUser.company}</strong></div>}
                  </>
                )}
                <div className="vp-dash-item"><span>Role</span><strong>Gateway Administrator</strong></div>
                <div className="vp-dash-item"><span>Operator ID</span><strong>{currentUser.id}</strong></div>
                <div className="vp-dash-item"><span>Security clearance</span><strong>Level 3 Gateway Operator</strong></div>
              </div>

              <div style={{ marginTop: 16 }}>
                {showPasswordChange ? (
                  <PasswordChange onChangePassword={changePassword} onClose={() => setShowPasswordChange(false)} />
                ) : (
                  <button className="vp-btn sm" type="button" onClick={() => setShowPasswordChange(true)}>Change Password</button>
                )}
              </div>
            </div>
            <aside className="vp-dash-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <ProfileCompleteness user={currentUser} />
              <div>
                <h3 style={{ marginBottom: 12 }}>Control-plane responsibility</h3>
                <div className="vp-profile-context">
                  <div className="vp-dash-item"><span>Operator ID is used to attribute gateway rule changes.</span><strong>Audit</strong></div>
                  <div className="vp-dash-item"><span>Escalation contact receives dispute and incident routing.</span><strong>Escalation</strong></div>
                  <div className="vp-dash-item"><span>Security clearance defines payload inspection confidence level.</span><strong>Clearance</strong></div>
                  <div className="vp-dash-item"><span>Timezone supports operational handover and logs.</span><strong>Ops</strong></div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Settings ── */}
        <section className={`vp-dashboard-view${activeView === 'settings' ? ' active' : ''}`}>
          <div className="vp-dash-page-header">
            <p className="vp-eyebrow">Admin settings</p>
            <h2>Audit, telemetry, payload visibility, alerts, and control-plane security.</h2>
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
                <div className="vp-dash-item"><span>Gateway environment</span><strong>Sandbox traffic layer</strong></div>
                {editingSettings ? (
                  <div className="vp-dash-item">
                    <span>Audit retention (days)</span>
                    <input type="number" min={7} max={90} value={adminSettings.auditRetention} onChange={e => setAdminSettings(s => ({ ...s, auditRetention: Number(e.target.value) }))} className="text-body-sm" style={{ width: 70, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(245,240,231,.16)', padding: '4px 8px', borderRadius: 6, color: '#f5f0e7', textAlign: 'right', fontFamily: 'inherit' }} />
                  </div>
                ) : (
                  <div className="vp-dash-item"><span>Audit retention</span><strong>{adminSettings.auditRetention} days</strong></div>
                )}
                {editingSettings ? (
                  <div className="vp-dash-item">
                    <span>Payload visibility</span>
                    <select value={adminSettings.payloadVisibility} onChange={e => setAdminSettings(s => ({ ...s, payloadVisibility: e.target.value as 'masked' | 'full' }))} className="vp-select-inline">
                      <option value="masked">Masked payloads</option>
                      <option value="full">Full payloads</option>
                    </select>
                  </div>
                ) : (
                  <div className="vp-dash-item"><span>Payload visibility</span><strong>{adminSettings.payloadVisibility === 'masked' ? 'Masked payloads by default' : 'Full payload visibility'}</strong></div>
                )}
                <div className="vp-dash-item"><span>Rate-limit alert threshold</span><strong>{gateway.rateLimit} rpm</strong></div>
                {editingSettings ? (
                  <>
                    <div className="vp-dash-item"><span>Latency alerts</span><Toggle checked={adminSettings.latencyAlerts} onChange={() => setAdminSettings(s => ({ ...s, latencyAlerts: !s.latencyAlerts }))} /></div>
                    <div className="vp-dash-item"><span>Dispute alerts</span><Toggle checked={adminSettings.disputeAlerts} onChange={() => setAdminSettings(s => ({ ...s, disputeAlerts: !s.disputeAlerts }))} /></div>
                    <div className="vp-dash-item"><span>Two-factor authentication</span><Toggle checked={adminSettings.twoFA} onChange={() => setAdminSettings(s => ({ ...s, twoFA: !s.twoFA }))} /></div>
                  </>
                ) : (
                  <>
                    <div className="vp-dash-item"><span>Latency alerts</span><strong>{adminSettings.latencyAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Dispute alerts</span><strong>{adminSettings.disputeAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    <div className="vp-dash-item"><span>Two-factor authentication</span><strong>{adminSettings.twoFA ? 'Enabled (required)' : 'Disabled'}</strong></div>
                  </>
                )}
              </div>
            </div>
            <aside className="vp-dash-panel">
              <h3>Operational impact</h3>
              <div className="vp-profile-context">
                <div className="vp-dash-item"><span>Audit retention defines how long operational events remain inspectable.</span><strong>Audit</strong></div>
                <div className="vp-dash-item"><span>Payload visibility balances debugging power with privacy and safety.</span><strong>Payloads</strong></div>
                <div className="vp-dash-item"><span>Rate-limit thresholds trigger gateway abuse warnings.</span><strong>Limits</strong></div>
                <div className="vp-dash-item"><span>Admin MFA is mandatory in production for privileged controls.</span><strong>Security</strong></div>
              </div>
            </aside>
          </div>
        </section>
    </DashboardShell>
  );
}
