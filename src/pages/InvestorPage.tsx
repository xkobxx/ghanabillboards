import { useState, useEffect } from 'react';
import { LayoutDashboard, Presentation, Route, LineChart, BadgeDollarSign, Settings, ShieldAlert, MailCheck, Monitor, Radio, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Toggle from '../components/Toggle';
import DashboardShell from '../components/DashboardShell';
import AvatarUpload from '../components/AvatarUpload';
import PasswordChange from '../components/PasswordChange';
import ProfileCompleteness from '../components/ProfileCompleteness';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProfile, type ProfileErrors } from '../lib/validation';

type InvestorView = 'overview' | 'deck' | 'roadmap' | 'model' | 'profile' | 'settings';

const NAV_ITEMS = [
  { id: 'overview' as InvestorView, label: 'Overview',   icon: <LayoutDashboard size={15} /> },
  { id: 'deck' as InvestorView,     label: 'Pitch deck', icon: <Presentation size={15} /> },
  { id: 'roadmap' as InvestorView,  label: 'Roadmap',    icon: <Route size={15} /> },
  { id: 'model' as InvestorView,    label: 'Model',      icon: <LineChart size={15} /> },
  { id: 'profile' as InvestorView,  label: 'Profile',    icon: <BadgeDollarSign size={15} /> },
  { id: 'settings' as InvestorView, label: 'Settings',   icon: <Settings size={15} /> },
];

const DECK_SLIDES = [
  { num: '01', title: 'Problem', body: 'African OOH advertising runs on email chains, static PDFs, and phone calls. Buyers can\'t discover, compare, or book inventory without manual broker involvement.' },
  { num: '02', title: 'Solution', body: 'Vantage Point is a unified terminal that gives buyers one public entry point, then routes booking, publisher, operator, and investor workflows into role-specific spaces.' },
  { num: '03', title: 'Market', body: 'Sub-Saharan Africa OOH market is estimated at $2.4B annually. Digital OOH is growing at 18% CAGR. Ghana, Nigeria, and Kenya form the initial five-node launch market.' },
  { num: '04', title: 'Business model', body: 'Marketplace commission on bookings, publisher SaaS subscription, premium analytics products, and future programmatic exchange infrastructure fee.' },
  { num: '05', title: 'Roadmap', body: 'Phase 1: Unified booking terminal. Phase 2: Live IoT telemetry integration. Phase 3: Programmatic real-time bidding exchange for digital inventory.' },
  { num: '06', title: 'Architecture', body: 'Modular monolith today, transitioning to microservices as booking volume and publisher node count crosses the 500-node threshold.' },
];

export default function InvestorPage() {
  const { currentUser, setAuthMode, signOut, setCurrentUser, changePassword, deleteAccount } = useApp();
  const [activeView, setActiveView] = useState<InvestorView>('overview');
  const [slideIndex, setSlideIndex] = useState(0);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '', phone: '', bio: '', location: '', website: '' });
  const [iSettings, setISettings] = useLocalStorage('vantage_investor_settings', { deckAccess: 'teaser', updateCadence: 'monthly', ndaRequired: true, emailAlerts: true, smsAlerts: false });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileDraft({ name: currentUser.name, email: currentUser.email, company: currentUser.company || '', phone: currentUser.phone || '', bio: currentUser.bio || '', location: currentUser.location || '', website: currentUser.website || '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const initials = currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '--';

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Investor access required</h4>
          <p>Growth thesis, deck material, and monetisation assumptions are not public-first content.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login</button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'investor' && currentUser.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Investor access required</h4>
          <p>This account does not have investor clearance. Use the correct workspace for your role.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="vp-btn" onClick={signOut}>Switch account</button>
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

  return (
    <DashboardShell
      role="investor"
      activeView={activeView}
      onViewChange={id => setActiveView(id as InvestorView)}
      navItems={NAV_ITEMS}
      user={currentUser}
      onSignOut={signOut}
    >

            {/* Overview */}
            <section className={`vp-dashboard-view${activeView === 'overview' ? ' active' : ''}`}>
              <div className="vp-dash-page-header">
                <p className="vp-eyebrow">Investor dashboard</p>
                <h1>Growth thesis</h1>
                <p className="vp-lead">Review the pitch carousel, market thesis, monetisation paths, technical roadmap, and architecture transition from modular monolith to future services.</p>
              </div>
              <div className="vp-dash-metrics">
                {[
                  { v: '$2.4B', l: 'Africa OOH market' },
                  { v: '18%', l: 'CAGR digital OOH' },
                  { v: '5', l: 'Launch market nodes' },
                  { v: 'Phase 1', l: 'Terminal milestone' },
                ].map(({ v, l }) => (
                  <div className="vp-stat-card" key={l}><strong>{v}</strong><span>{l}</span></div>
                ))}
              </div>
              <div className="vp-panel-col-grid three">
                {[
                  { title: 'Pitch deck', body: 'Six-slide investor narrative covering problem, solution, market, business model, and architecture.' },
                  { title: 'Roadmap', body: 'Tracks Phase 1 Unified Terminal, Phase 2 Live IoT Telemetry, and Phase 3 Programmatic RTB.' },
                  { title: 'Marketplace model', body: 'Separates booking commission, publisher SaaS, analytics, and future exchange infrastructure.' },
                ].map(({ title, body }) => (
                  <article className="vp-mini-card" key={title}><h4>{title}</h4><p>{body}</p></article>
                ))}
              </div>
            </section>

            {/* Pitch Deck */}
            <section className={`vp-dashboard-view${activeView === 'deck' ? ' active' : ''}`}>
              <article className="vp-dash-panel">
                <h3>Growth pitch deck</h3>
                <div className="vp-deck-card" style={{ marginTop: 24 }}>
                  <span className="vp-num">{DECK_SLIDES[slideIndex].num}</span>
                  <h3 style={{ marginBottom: 0 }}>{DECK_SLIDES[slideIndex].title}</h3>
                  <p className="text-lg" style={{ color: 'rgba(245,240,231,.68)', lineHeight: 1.55, marginTop: 16 }}>{DECK_SLIDES[slideIndex].body}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="button" className="vp-btn" onClick={() => setSlideIndex(i => Math.max(0, i - 1))}>Previous</button>
                  <button type="button" className="vp-btn primary" onClick={() => setSlideIndex(i => Math.min(DECK_SLIDES.length - 1, i + 1))}>Next slide</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {DECK_SLIDES.map((_, i) => (
                    <button key={i} type="button" onClick={() => setSlideIndex(i)}
                      style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <span style={{ width: 12, height: 12, border: '1px solid rgba(245,240,231,.32)', background: i === slideIndex ? '#a8ff60' : 'transparent', display: 'block', transition: 'background .2s' }} />
                    </button>
                  ))}
                </div>
              </article>
            </section>

            {/* Roadmap */}
            <section className={`vp-dashboard-view${activeView === 'roadmap' ? ' active' : ''}`}>
              <article className="vp-dash-panel">
                <h3>Roadmap and monetisation</h3>
                <div className="vp-panel-col-grid three" style={{ marginTop: 16 }}>
                  {[
                    { phase: 'Phase 1', label: 'Unified booking terminal', status: 'Live', icon: <Monitor size={17} /> },
                    { phase: 'Phase 2', label: 'Live IoT telemetry integration', status: 'Q4 2026', icon: <Radio size={17} /> },
                    { phase: 'Phase 3', label: 'Programmatic RTB exchange', status: '2027', icon: <TrendingUp size={17} /> },
                  ].map(({ phase, label, status, icon }) => (
                    <div key={phase} className="vp-mini-card">
                      <h4>{icon}{phase}</h4>
                      <p>{label}</p>
                      <span className={`vp-tag${status === 'Live' ? ' ok' : ''}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Model */}
            <section className={`vp-dashboard-view${activeView === 'model' ? ' active' : ''}`}>
              <article className="vp-dash-panel">
                <h3>Marketplace model</h3>
                <p className="text-lg" style={{ color: 'rgba(245,240,231,.68)', lineHeight: 1.62, marginTop: 12 }}>
                  The investor view separates public product narrative from private assumptions around commission, SaaS subscriptions, premium analytics, and eventual programmatic exchange infrastructure.
                </p>
                <div className="vp-panel-col-grid three" style={{ marginTop: 20 }}>
                  {[
                    { label: 'Marketplace commission', value: 'Booking layer', icon: <BadgeDollarSign size={17} /> },
                    { label: 'SaaS subscription', value: 'Publisher tools', icon: <LayoutDashboard size={17} /> },
                    { label: 'Premium analytics', value: 'Telemetry data products', icon: <LineChart size={17} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="vp-mini-card">
                      <h4>{icon}{label}</h4>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Profile */}
            <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
              <div className="vp-dash-page-header">
                <p className="vp-eyebrow">Investor profile</p>
                <h2>Investor profile</h2>
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
                <article className="vp-dash-panel">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <AvatarUpload
                      currentAvatar={currentUser.avatar}
                      userName={currentUser.name}
                      onSave={dataUrl => setCurrentUser({ ...currentUser, avatar: dataUrl })}
                    />
                  </div>

                  <div className="vp-panel-title">
                    <div><h3>Profile details</h3></div>
                    {profileSaved && <span className="text-body-xs" style={{ color: '#a8ff60', fontWeight: 700, fontFamily: 'monospace' }}>✓ Saved</span>}
                  </div>
                  <div className="vp-dash-list">
                    <div className="vp-dash-item"><span>Name</span><input type="text" value={profileDraft.name} onChange={e => { setProfileDraft(d => ({ ...d, name: e.target.value })); if (profileErrors.name) setProfileErrors(p => ({ ...p, name: undefined })); }} onBlur={saveProfile} className="vp-input-inline" /></div>
                    {profileErrors.name && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.name}</p>}
                    <div className="vp-dash-item"><span>Email</span><input type="email" value={profileDraft.email} onChange={e => { setProfileDraft(d => ({ ...d, email: e.target.value })); if (profileErrors.email) setProfileErrors(p => ({ ...p, email: undefined })); }} onBlur={saveProfile} className="vp-input-inline" /></div>
                    {profileErrors.email && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.email}</p>}
                    <div className="vp-dash-item"><span>Company</span><input type="text" value={profileDraft.company} onChange={e => setProfileDraft(d => ({ ...d, company: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" /></div>
                    <div className="vp-dash-item"><span>Phone</span><input type="tel" value={profileDraft.phone} onChange={e => setProfileDraft(d => ({ ...d, phone: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" /></div>
                    {profileErrors.phone && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.phone}</p>}
                    <div className="vp-dash-item"><span>Location</span><input type="text" value={profileDraft.location} onChange={e => setProfileDraft(d => ({ ...d, location: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" placeholder="City, Country" /></div>
                    <div className="vp-dash-item"><span>Website</span><input type="url" value={profileDraft.website} onChange={e => setProfileDraft(d => ({ ...d, website: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" placeholder="https://..." /></div>
                    {profileErrors.website && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.website}</p>}
                    <div className="vp-dash-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                      <span>Bio</span>
                      <textarea value={profileDraft.bio} onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} onBlur={saveProfile} className="vp-input-inline" rows={3} style={{ resize: 'vertical' }} placeholder="Tell us about your firm..." />
                    </div>
                    <div className="vp-dash-item"><span>Role</span><strong>Investor</strong></div>
                    <div className="vp-dash-item"><span>Account ID</span><strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{currentUser.id}</strong></div>
                  </div>

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
                </article>

                <aside className="vp-dash-panel">
                  <h3>Profile overview</h3>
                  <div className="vp-profile-context">
                    <div className="vp-dash-item"><span>Name and email identify you in deal rooms and investor relations.</span><strong>Identity</strong></div>
                    <div className="vp-dash-item"><span>Contact details for quarterly updates and pitch deck access.</span><strong>Contact</strong></div>
                    <div className="vp-dash-item"><span>Firm details shown on NDA acknowledgements and term sheets.</span><strong>Legal</strong></div>
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
                      <div style={{ border: '1px solid rgba(239,68,68,.3)', borderRadius: 0, padding: 14, background: 'rgba(239,68,68,.04)' }}>
                        <p className="text-body-sm" style={{ color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Delete account?</p>
                        <p className="text-body-xs" style={{ color: 'rgba(245,240,231,.52)', marginBottom: 12, lineHeight: 1.5 }}>
                          All your investor profile data and access will be permanently removed.
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

            {/* Settings */}
            <section className={`vp-dashboard-view${activeView === 'settings' ? ' active' : ''}`}>
              <div className="vp-dash-page-header">
                <p className="vp-eyebrow">Investor settings</p>
                <h2>Update cadence, deck access, confidentiality, and market-data display.</h2>
              </div>
              <div className="vp-panel-grid">
                <article className="vp-dash-panel">
                  <div className="vp-panel-title">
                    <div><h3>Confidentiality controls</h3></div>
                  </div>
                  <div className="vp-dash-list">
                    <div className="vp-dash-item">
                      <span>Deck access level</span>
                      <select value={iSettings.deckAccess} onChange={e => setISettings(s => ({ ...s, deckAccess: e.target.value }))} className="vp-select-inline">
                        <option value="teaser">Teaser only</option>
                        <option value="full">Full deck</option>
                        <option value="architecture">Architecture material</option>
                      </select>
                    </div>
                    <div className="vp-dash-item">
                      <span>Update cadence</span>
                      <select value={iSettings.updateCadence} onChange={e => setISettings(s => ({ ...s, updateCadence: e.target.value }))} className="vp-select-inline">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    {([
                      { key: 'ndaRequired' as const, label: 'NDA requirement' },
                      { key: 'emailAlerts' as const, label: 'Email alerts' },
                      { key: 'smsAlerts' as const, label: 'SMS alerts' },
                    ]).map(({ key, label }) => (
                      <div key={key} className="vp-dash-item">
                        <span>{label}</span>
                        <Toggle checked={iSettings[key]} onChange={() => setISettings(s => ({ ...s, [key]: !s[key] }))} />
                      </div>
                    ))}
                  </div>
                </article>
                <aside className="vp-dash-panel">
                  <h3>Confidentiality impact</h3>
                  <div className="vp-profile-context">
                    <div className="vp-dash-item"><span>Deck access level controls teaser, full deck, or architecture material.</span><strong>Deck</strong></div>
                    <div className="vp-dash-item"><span>Update cadence controls how often traction and roadmap notes are surfaced.</span><strong>Updates</strong></div>
                    <div className="vp-dash-item"><span>NDA requirement protects monetisation and architecture details.</span><strong>NDA</strong></div>
                  </div>
                </aside>
              </div>
            </section>
    </DashboardShell>
  );
}
