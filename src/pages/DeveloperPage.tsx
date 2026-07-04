import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Settings, ArrowUpRight, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DeveloperConsole from '../components/DeveloperConsole';
import PageContainer from '../components/PageContainer';
import Toggle from '../components/Toggle';
import ThemeToggle from '../components/ThemeToggle';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProfile, type ProfileErrors } from '../lib/validation';

type DevView = 'console' | 'profile' | 'settings';

export default function DeveloperPage() {
  const { currentUser, setAuthMode, signOut, setCurrentUser } = useApp();
  const [activeView, setActiveView] = useState<DevView>('console');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', company: '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [dSettings, setDSettings] = useLocalStorage('vantage_dev_settings', { emailAlerts: true, smsAlerts: false, logRetention: 7 });

  if (!currentUser) {
    return (
      <main className="min-h-screen relative z-30" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Developer access required</h4>
          <p>Login or create a developer account to access the console, logs, and sandbox environment.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Login <ArrowUpRight className="w-3.5 h-3.5" /></button>
            <button className="vp-btn" onClick={() => setAuthMode('register')}>Sign up</button>
          </div>
        </div>
      </main>
    );
  }

  if (currentUser.role !== 'developer' && currentUser.role !== 'admin') {
    return (
      <main className="min-h-screen relative z-30" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <div className="vp-guard">
          <h4>Developer access required</h4>
          <p>This account is registered as a {currentUser.role}. Use the correct workspace for your role.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="vp-btn primary" onClick={() => setAuthMode('signin')}>Switch account <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </main>
    );
  }

  const initials = currentUser.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'DV';

  return (
    <main className="min-h-screen relative z-30" style={{ paddingTop: 84 }}>
      <div className="vp-wrap" style={{ padding: '24px 24px 60px' }}>
        <div className="vp-dashboard-shell">
          <aside className="vp-dashboard-sidebar" aria-label="Developer dashboard">
            <span className="vp-sidebar-kicker">Dev sandbox</span>
            <h2>Dev Console</h2>
            <p>Gateway simulation, schema inspection, and sandbox telemetry.</p>
            <nav className="vp-sidebar-nav">
              {([
                { id: 'console' as const, label: 'Console', Icon: () => null },
                { id: 'profile' as const, label: 'Profile', Icon: IdCard },
                { id: 'settings' as const, label: 'Settings', Icon: Settings },
              ]).map(({ id, label, Icon }) => (
                <button key={id} type="button"
                  className={`vp-sidebar-link${activeView === id ? ' active' : ''}`}
                  onClick={() => setActiveView(id)}>
                  <Icon width={15} height={15} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <button className="vp-btn sm full" type="button" onClick={signOut}>Logout</button>
          </aside>

          <div className="vp-dashboard-main">
            <div className="vp-breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={12} className="vp-breadcrumb-sep" />
              <span>Developer</span>
            </div>
            <div className="vp-dashboard-topbar">
              <div className="vp-topbar-left">
                <div className="vp-topbar-avatar">{initials}</div>
                <div className="vp-topbar-copy">
                  <strong>{currentUser.name}</strong>
                  <span>Developer · sandbox</span>
                </div>
              </div>
              <div className="vp-topbar-actions">
                <ThemeToggle />
                <button className="vp-btn sm raised" type="button" onClick={() => setActiveView('profile')}><IdCard size={16} /><span>Profile</span></button>
                <button className="vp-btn sm" type="button" onClick={signOut}>Logout</button>
              </div>
            </div>

            <section className={`vp-dashboard-view${activeView === 'console' ? ' active' : ''}`}>
              <SEOHead />
              <PageContainer className="py-16"><DeveloperConsole /></PageContainer>
            </section>

            <section className={`vp-dashboard-view${activeView === 'profile' ? ' active' : ''}`}>
              <div className="vp-dash-page-header">
                <p className="vp-eyebrow">Developer profile</p>
                <h2>Developer identity</h2>
              </div>
              <div className="vp-dash-panel">
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
                      <div className="vp-dash-item"><span>Name</span><input type="text" value={profileDraft.name} onChange={e => { setProfileDraft(d => ({ ...d, name: e.target.value })); if (profileErrors.name) setProfileErrors(p => ({ ...p, name: undefined })); }} className="vp-input-inline" /></div>
                      {profileErrors.name && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.name}</p>}
                      <div className="vp-dash-item"><span>Email</span><input type="email" value={profileDraft.email} onChange={e => { setProfileDraft(d => ({ ...d, email: e.target.value })); if (profileErrors.email) setProfileErrors(p => ({ ...p, email: undefined })); }} className="vp-input-inline" /></div>
                      {profileErrors.email && <p className="text-body-xs" style={{ color: '#ef4444', margin: '-8px 0 4px 0', fontFamily: 'monospace' }}>{profileErrors.email}</p>}
                      <div className="vp-dash-item"><span>Company</span><input type="text" value={profileDraft.company} onChange={e => setProfileDraft(d => ({ ...d, company: e.target.value }))} className="vp-input-inline" /></div>
                    </>
                  ) : (
                    <>
                      <div className="vp-dash-item"><span>Name</span><strong>{currentUser.name}</strong></div>
                      <div className="vp-dash-item"><span>Email</span><strong>{currentUser.email}</strong></div>
                      <div className="vp-dash-item"><span>Role</span><strong>Developer</strong></div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className={`vp-dashboard-view${activeView === 'settings' ? ' active' : ''}`}>
              <div className="vp-dash-page-header">
                <p className="vp-eyebrow">Developer settings</p>
                <h2>Sandbox preferences, log retention, and alerting.</h2>
              </div>
              <div className="vp-dash-panel">
                <h3>Account settings</h3>
                <div className="vp-dash-list">
                  <div className="vp-dash-item">
                    <span>Log retention (days)</span>
                    <input type="number" min={1} max={30} value={dSettings.logRetention} onChange={e => setDSettings(s => ({ ...s, logRetention: Number(e.target.value) }))} className="text-body-sm" style={{ width: 70, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(245,240,231,.16)', padding: '4px 8px', borderRadius: 6, color: '#f5f0e7', textAlign: 'right', fontFamily: 'inherit' }} />
                  </div>
                  <div className="vp-dash-item"><span>Email alerts</span><Toggle checked={dSettings.emailAlerts} onChange={() => setDSettings(s => ({ ...s, emailAlerts: !s.emailAlerts }))} /></div>
                  <div className="vp-dash-item"><span>SMS alerts</span><Toggle checked={dSettings.smsAlerts} onChange={() => setDSettings(s => ({ ...s, smsAlerts: !s.smsAlerts }))} /></div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
