import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Billboard, Booking } from '../types';
import { 
  Activity, MapPin, Layers, CreditCard, PlayCircle, BarChart3, 
  Target, Zap, ShieldCheck, User, Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdvertiserDashboardProps {
  billboards: Billboard[];
  bookings: Booking[];
}

type AdvertiserTab = 'overview' | 'campaigns' | 'billing' | 'analytics' | 'profile';

const generateGrowthData = () => {
  const data = [];
  const startImpressions = 450000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const step = (29 - i) * 11800;
    const noise = Math.sin((29 - i) * 0.6) * 13000;
    const value = Math.round(startImpressions + step + noise);
    data.push({
      date: dateStr,
      impressions: value,
    });
  }
  return data;
};

const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFjMWMxYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNzE3MTdhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tk8gSU1BR0U8L3RleHQ+PC9zdmc+';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`));
const getStatusLabel = (status: string) => status === 'Pending Approved' ? 'Pending approval' : status;

export default function AdvertiserDashboard({ billboards, bookings }: AdvertiserDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdvertiserTab>('overview');
  const [campaignCityFilter, setCampaignCityFilter] = useState('All');

  const [advertiserProfile, setAdvertiserProfile] = useState({
    companyName: 'Global Brands Inc.',
    contactName: 'Sarah Jenkins',
    email: 's.jenkins@globalbrands.com',
    phone: '+1 (555) 019-2834',
    taxId: 'GB-83920111',
    billingCycle: 'Monthly (Net 30)',
    emailNotifications: true,
    smsAlerts: false,
  });
  const [editingAdvertiser, setEditingAdvertiser] = useState(false);
  const [advertiserDraft, setAdvertiserDraft] = useState({
    companyName: 'Global Brands Inc.',
    contactName: 'Sarah Jenkins',
    email: 's.jenkins@globalbrands.com',
    phone: '+1 (555) 019-2834',
    taxId: 'GB-83920111',
    billingCycle: 'Monthly (Net 30)',
    emailNotifications: true,
    smsAlerts: false,
  });

  const myBookings = bookings;
  const liveCampaigns = myBookings.filter(b => b.status === 'Live' || b.status === 'Pending Approved');
  const totalSpent = myBookings.reduce((acc, b) => acc + b.totalCost, 0);

  const filteredBookings = myBookings.filter(booking => {
    if (campaignCityFilter === 'All') return true;
    const billboard = billboards.find(b => b.id === booking.billboardId);
    return billboard?.city === campaignCityFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30';
      case 'Pending Approved': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-[var(--color-text-secondary)] bg-zinc-800/40 border-[var(--color-border)]';
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: AdvertiserTab, label: string, icon: React.ElementType }) => (
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === id}
      aria-controls="advertiser-workspace-panel"
      onClick={() => setActiveTab(id)}
      className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-4 py-3 font-mono text-body-xs font-semibold uppercase tracking-[0.12em] transition-all cursor-pointer select-none md:w-full ${
        activeTab === id 
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text-inverse)] font-black' 
          : 'bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--dashboard-surface-muted)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );

  return (
    <div className="dashboard-shell advertiser-dashboard max-w-[1240px] mx-auto space-y-5 text-[var(--color-text-primary)] bg-transparent">
      
      {/* Brand Header */}
      <section className="dashboard-hero rounded-[0px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <Target className="w-48 h-48 text-[var(--color-text-primary)]" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption text-[var(--color-primary)] uppercase tracking-[0.3em] font-extrabold block">BRAND & AGENCY PORTAL</span>
          </div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[var(--dashboard-hero-text)] tracking-[-0.04em]">Advertiser Command Center</h1>
          <p className="max-w-2xl text-sm text-[var(--dashboard-hero-muted)]">Manage regional campaigns, analyze reach, and optimize metropolitan billboard delivery.</p>
        </div>

        <div className="relative z-10 p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] flex flex-col items-end gap-1">
          <span className="text-caption uppercase font-mono tracking-widest text-[var(--color-primary)] font-bold">Total Campaign Spend</span>
          <span className="text-2xl font-sans font-black text-[var(--color-text-primary)]">{currencyFormatter.format(totalSpent)}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="dashboard-panel rounded-2xl p-2 md:p-4">
            <div className="hidden text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-[0.18em] px-2 mb-3 font-bold md:block">Workspace</div>
            <div role="tablist" aria-label="Advertiser workspace" className="dashboard-tabs flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
              <TabButton id="overview" label="Overview" icon={Activity} />
              <TabButton id="campaigns" label="Campaigns" icon={Layers} />
              <TabButton id="analytics" label="Performance" icon={BarChart3} />
              <TabButton id="billing" label="Billing & invoices" icon={CreditCard} />
              <TabButton id="profile" label="My profile" icon={User} />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full min-h-12 rounded-xl bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-extrabold text-caption tracking-wider uppercase hover:bg-[var(--color-primary-hover)] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
          >
            <Zap className="w-4 h-4 text-[var(--color-text-inverse)]" />
            Browse inventory
          </button>
        </div>

        {/* Workspace Display */}
        <div id="advertiser-workspace-panel" role="tabpanel" className="min-w-0 md:col-span-3 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="dashboard-panel p-6 rounded-2xl">
                  <PlayCircle className="w-6 h-6 text-[var(--color-primary)] mb-4" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Active Campaigns</div>
                  <div className="text-3xl font-sans font-black mt-1 text-[var(--color-text-primary)]">{liveCampaigns.length}</div>
                </div>
                <div className="dashboard-panel p-6 rounded-2xl">
                  <MapPin className="w-6 h-6 text-[var(--color-primary)] mb-4" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Total Placements</div>
                  <div className="text-3xl font-sans font-black mt-1 text-[var(--color-text-primary)] flex items-baseline gap-2">
                    {liveCampaigns.reduce((acc, c) => acc + 1, 0)}
                    <span className="text-caption font-mono text-[var(--color-text-secondary)] font-normal">screens</span>
                  </div>
                </div>
                <div className="dashboard-panel p-6 rounded-2xl">
                  <Target className="w-6 h-6 text-[var(--color-primary)] mb-4" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Est. Impressions</div>
                  <div className="text-3xl font-sans font-black mt-1 text-[var(--color-text-primary)]">{(liveCampaigns.length * 125000).toLocaleString()}+</div>
                </div>
              </div>

              <div className="dashboard-panel rounded-2xl p-5 sm:p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <div>
                    <h4 className="font-extrabold text-xl text-[var(--color-text-primary)] uppercase tracking-tight">Recent Deployments</h4>
                    <p className="text-caption text-[var(--color-text-secondary)]">Your latest billboard activations</p>
                  </div>
                </div>

                {myBookings.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/35">
                    <p className="text-sm text-[var(--color-text-muted)] font-mono">No campaigns scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBookings.slice(0, 4).map((booking, idx) => {
                      const billboard = billboards.find(b => b.id === booking.billboardId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/40 border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shrink-0">
                              {billboard?.imageUrl ? (
                                <img
                                  src={billboard.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = FALLBACK_IMG;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-caption font-mono">N/A</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-caption sm:text-body-sm font-bold text-[var(--color-text-primary)] uppercase truncate max-w-[150px] sm:max-w-xs">{billboard?.title || 'Standard Display'}</div>
                              <div className="text-caption text-[var(--color-text-secondary)] font-mono tracking-widest">{billboard?.location}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-caption font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                            <span className="text-caption text-[var(--color-primary)] font-bold">{currencyFormatter.format(booking.totalCost)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="dashboard-panel rounded-2xl p-5 sm:p-8 space-y-8">
                <div className="flex items-center gap-6 pb-6 border-b border-[var(--color-border)]">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] uppercase tracking-tight">{advertiserProfile.companyName}</h2>
                    <p className="text-[var(--color-text-secondary)] font-mono text-caption tracking-wide">Enterprise Advertiser Account</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-caption uppercase font-mono rounded font-bold">Verified Partner</span>
                      <span className="text-caption text-[var(--color-text-muted)] font-mono">Member since 2023</span>
                    </div>
                  </div>
                </div>

                {editingAdvertiser ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Company Name</label>
                        <input type="text" value={advertiserDraft.companyName} onChange={e => setAdvertiserDraft(d => ({ ...d, companyName: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Primary Contact</label>
                        <input type="text" value={advertiserDraft.contactName} onChange={e => setAdvertiserDraft(d => ({ ...d, contactName: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Email Address</label>
                        <input type="email" value={advertiserDraft.email} onChange={e => setAdvertiserDraft(d => ({ ...d, email: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Phone Number</label>
                        <input type="tel" value={advertiserDraft.phone} onChange={e => setAdvertiserDraft(d => ({ ...d, phone: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Tax ID / VAT</label>
                        <input type="text" value={advertiserDraft.taxId} onChange={e => setAdvertiserDraft(d => ({ ...d, taxId: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Billing Cycle</label>
                        <input type="text" value={advertiserDraft.billingCycle} onChange={e => setAdvertiserDraft(d => ({ ...d, billingCycle: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-caption font-mono text-[var(--color-primary)] uppercase tracking-widest font-bold">Notification Preferences</h4>
                      {([
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Campaign updates and invoice alerts' },
                        { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Campaign status changes via SMS' },
                      ] as { key: 'emailNotifications' | 'smsAlerts'; label: string; desc: string }[]).map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                          <div>
                            <div className="text-caption font-semibold text-[var(--color-text-primary)]">{label}</div>
                            <div className="text-caption font-mono text-[var(--color-text-muted)]">{desc}</div>
                          </div>
                          <button type="button" role="switch" aria-checked={advertiserDraft[key]}
                            onClick={() => setAdvertiserDraft(d => ({ ...d, [key]: !d[key] }))}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${advertiserDraft[key] ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${advertiserDraft[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setAdvertiserProfile({ ...advertiserDraft }); setEditingAdvertiser(false); }}
                        className="flex-1 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-inverse)] font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Save Changes
                      </button>
                      <button type="button" onClick={() => { setAdvertiserDraft({ ...advertiserProfile }); setEditingAdvertiser(false); }}
                        className="flex-1 py-3 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-caption font-bold text-[var(--color-primary)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2 font-mono">Account Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Primary Contact</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold">{advertiserProfile.contactName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Email Address</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold">{advertiserProfile.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Phone Number</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold">{advertiserProfile.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-caption font-bold text-[var(--color-primary)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2 font-mono">Billing Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Payment Method</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-[var(--color-primary)]"/> •••• 4242</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Billing Cycle</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold">{advertiserProfile.billingCycle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Tax ID / VAT</span>
                            <span className="text-caption text-[var(--color-text-primary)] font-bold">{advertiserProfile.taxId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">Email Notifications</span>
                            <span className={`text-caption font-bold ${advertiserProfile.emailNotifications ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {advertiserProfile.emailNotifications ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-secondary)] font-mono">SMS Alerts</span>
                            <span className={`text-caption font-bold ${advertiserProfile.smsAlerts ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {advertiserProfile.smsAlerts ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)]">
                      <button type="button" onClick={() => { setAdvertiserDraft({ ...advertiserProfile }); setEditingAdvertiser(true); }}
                        className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-inverse)] font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="dashboard-panel p-5 sm:p-6 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-[var(--color-text-primary)] uppercase tracking-tight">My Campaigns</h3>
                    <p className="text-caption text-[var(--color-text-secondary)] mt-1">Manage all your active and past deployments.</p>
                  </div>
                  
                  <div className="flex bg-[var(--color-surface)] rounded-full p-1 border border-[var(--color-border)] overflow-x-auto">
                    {['All', 'Lagos', 'Accra', 'Nairobi', 'Johannesburg', 'Cape Town'].map(city => (
                      <button 
                        type="button"
                        key={city}
                        aria-pressed={campaignCityFilter === city}
                        onClick={() => setCampaignCityFilter(city)}
                        className={`px-3.5 py-1.5 text-caption font-mono rounded-full cursor-pointer transition-all whitespace-nowrap ${campaignCityFilter === city ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-extrabold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   {filteredBookings.length === 0 ? (
                      <div className="py-12 text-center rounded-xl bg-[var(--color-surface)]/35 border border-dashed border-[var(--color-border)]">
                        <p className="text-[var(--color-text-muted)] font-mono text-caption">// NO CAMPAIGNS SCHEDULED FOR METROPOLITAN CLASSIFICATION</p>
                      </div>
                   ) : (
                     filteredBookings.map((booking, idx) => {
                        const billboard = billboards.find(b => b.id === booking.billboardId);
                        return (
                        <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/40 border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all gap-4">
                          <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0 border border-[var(--color-border)] bg-[var(--color-surface)]">
                              {billboard?.imageUrl ? (
                                <img
                                  src={billboard.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = FALLBACK_IMG;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-caption font-mono">N/A</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-base font-extrabold text-[var(--color-text-primary)] uppercase truncate max-w-[200px] sm:max-w-xs">{billboard?.title || 'Standard Display'}</div>
                              <div className="text-caption text-[var(--color-text-secondary)] font-mono mt-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" /> {billboard?.city} • {billboard?.format}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex lg:flex-row flex-col items-end lg:items-center gap-6 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-caption text-[var(--color-text-muted)] font-mono uppercase">Dates</div>
                              <div className="text-caption text-[var(--color-text-secondary)]">{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-caption text-[var(--color-text-muted)] font-mono uppercase">Cost</div>
                              <div className="text-sm font-bold text-[var(--color-primary)]">{currencyFormatter.format(booking.totalCost)}</div>
                            </div>
                            <div>
                              <span className={`text-caption inline-flex whitespace-nowrap font-mono font-bold uppercase py-1 px-3 rounded-full border ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="dashboard-panel p-5 sm:p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-[var(--color-text-primary)] uppercase tracking-tight">Impressions & Reach Report</h3>
                  <p className="text-caption text-[var(--color-text-secondary)] mt-1">Real-time out-of-home performance tracking over the last 30 days.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider block">CURRENT RUN RATE</span>
                    <span className="text-xl font-black text-[var(--color-text-primary)] font-sans">812.4K</span>
                    <span className="text-caption text-[var(--color-primary)] font-mono block mt-1">▲ 12.4% vs last cycle</span>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider block">CPM EFFICIENCY</span>
                    <span className="text-xl font-black text-[var(--color-text-primary)] font-sans">$2.15</span>
                    <span className="text-caption text-[var(--color-text-secondary)] font-mono block mt-1">Optimized rate tier</span>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider block">PEAK HOURLY REACH</span>
                    <span className="text-xl font-black text-[var(--color-text-primary)] font-sans">42.8K</span>
                    <span className="text-caption text-[var(--color-text-secondary)] font-mono block mt-1">Rush hours (17h-19h)</span>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider block">DELIVERY AGREEMENT</span>
                    <span className="text-xl font-black text-[var(--color-primary)] font-sans">99.98%</span>
                    <span className="text-caption text-[var(--color-primary)] font-mono block mt-1">Guaranteed SLA standard</span>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-caption text-[var(--color-primary)] uppercase tracking-[0.2em] font-extrabold block">AUDIENCE SCALE (LAST 30 DAYS)</span>
                      <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Aggregate Daily Billboard Impressions Growth</h4>
                    </div>
                  </div>

                  <div className="h-[300px] min-w-0 w-full pt-4 font-mono text-caption select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={generateGrowthData()}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3cffd0" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#3cffd0" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a" 
                          tickLine={false}
                          axisLine={false}
                          dy={10} 
                        />
                        <YAxis 
                          stroke="#71717a" 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--color-background)', 
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            borderRadius: '12px',
                            fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
                          }}
                          formatter={(value: any) => [Number(value).toLocaleString(), 'Impressions']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="impressions" 
                          stroke="#3cffd0" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorImpressions)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="dashboard-panel p-6 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-[var(--color-primary)] mb-3" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Total Invoiced</div>
                  <div className="text-2xl font-black mt-1 text-[var(--color-text-primary)]">{currencyFormatter.format(totalSpent)}</div>
                </div>
                <div className="dashboard-panel p-6 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Paid to Date</div>
                  <div className="text-2xl font-black mt-1 text-emerald-400">{currencyFormatter.format(myBookings.filter(b => b.status === 'Completed').reduce((a, b) => a + b.totalCost, 0))}</div>
                </div>
                <div className="dashboard-panel p-6 rounded-2xl">
                  <Activity className="w-5 h-5 text-amber-400 mb-3" />
                  <div className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)] font-bold">Outstanding</div>
                  <div className="text-2xl font-black mt-1 text-amber-400">{currencyFormatter.format(myBookings.filter(b => b.status !== 'Completed').reduce((a, b) => a + b.totalCost, 0))}</div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="dashboard-panel p-5 sm:p-6 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] uppercase tracking-tight">Payment Method</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--color-text-primary)]">Visa ending •••• 4242</div>
                      <div className="text-caption font-mono text-[var(--color-text-muted)]">Expires 09/2027 · Billing cycle: Net 30</div>
                    </div>
                  </div>
                  <span className="text-caption font-mono font-bold uppercase px-2 py-1 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Default</span>
                </div>
              </div>

              {/* Invoice History */}
              <div className="dashboard-panel p-5 sm:p-6 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] uppercase tracking-tight">Invoice History</h3>
                {myBookings.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-[var(--color-border)] rounded-xl">
                    <p className="text-caption font-mono text-[var(--color-text-muted)]">No invoices yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 pb-2 border-b border-[var(--color-border)]">
                      <span className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Campaign</span>
                      <span className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Period</span>
                      <span className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest text-right">Amount</span>
                      <span className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest text-right">Status</span>
                    </div>
                    {myBookings.map((booking, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-xl hover:bg-[var(--color-surface)]/40 transition-colors">
                        <div>
                          <div className="text-caption font-bold text-[var(--color-text-primary)] uppercase truncate max-w-[180px]">{booking.campaignName}</div>
                          <div className="text-caption font-mono text-[var(--color-text-muted)] mt-0.5">INV-{booking.id.replace('bkg_', '')}</div>
                        </div>
                        <div className="text-caption font-mono text-[var(--color-text-secondary)] whitespace-nowrap">
                          {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                        </div>
                        <div className="text-sm font-bold text-[var(--color-primary)] text-right">{currencyFormatter.format(booking.totalCost)}</div>
                        <div className="text-right">
                          <span className={`text-caption font-mono font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                            {booking.status === 'Completed' ? 'Paid' : booking.status === 'Live' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
