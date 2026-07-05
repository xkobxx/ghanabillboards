import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Billboard, Booking } from '../types';
import { 
  Building2, Monitor, Users, CreditCard, ChevronRight, 
  MapPin, CheckCircle2, XCircle, TrendingUp, DollarSign, User,
  Wrench, Clock, ArrowUpRight, AlertTriangle, FileText, Printer
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const occupancyTrendData = [
  { month: 'Dec 2025', rate: 72 },
  { month: 'Jan 2026', rate: 78 },
  { month: 'Feb 2026', rate: 81 },
  { month: 'Mar 2026', rate: 85 },
  { month: 'Apr 2026', rate: 89 },
  { month: 'May 2026', rate: 92 },
];

const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE4MUExRCIvPjxwYXRoIGQ9Ik00MzAgMzAwSDc3MFY1MDBINDMwWiIgZmlsbD0iIzIyMjUyQSIvPjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNzE3MTdhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JTUFHRSBVTkFWQUlMQUJMRTwvdGV4dD48L3N2Zz4=';
const stableNumber = (key: string, min: number, range: number) => {
  const hash = Array.from(key).reduce((total, character) => total + character.charCodeAt(0), 0);
  return min + (hash % range);
};

interface VendorDashboardProps {
  billboards: Billboard[];
  bookings: Booking[];
  onUpdateBookingStatus?: (id: string, newStatus: 'Pending Approved' | 'Live' | 'Completed' | 'Rejected') => void;
  onUpdateBillboardStatus?: (id: string, newStatus: Billboard['status']) => void;
  onAddBillboard?: (billboard: Billboard) => void;
}

type VendorTab = 'overview' | 'inventory' | 'requests' | 'payouts' | 'profile';

export default function VendorDashboard({ 
  billboards, 
  bookings,
  onUpdateBookingStatus,
  onUpdateBillboardStatus,
  onAddBillboard
}: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<VendorTab>('overview');
  const [inventoryCityFilter, setInventoryCityFilter] = useState('All');

  const [vendorProfile, setVendorProfile] = useState({
    companyName: 'Prime Displays Ltd.',
    regNumber: 'RC-829104',
    contactName: 'David Okafor',
    email: 'operations@primedisplays.net',
    phone: '+234 80 1234 5678',
    bankAccount: 'GTBank •••• 9301',
    payoutSchedule: 'Bi-Weekly',
    emailNotifications: true,
    smsNotifications: false,
  });
  const [editingVendor, setEditingVendor] = useState(false);
  const [vendorDraft, setVendorDraft] = useState({
    companyName: 'Prime Displays Ltd.',
    regNumber: 'RC-829104',
    contactName: 'David Okafor',
    email: 'operations@primedisplays.net',
    phone: '+234 80 1234 5678',
    bankAccount: 'GTBank •••• 9301',
    payoutSchedule: 'Bi-Weekly',
    emailNotifications: true,
    smsNotifications: false,
  });

  // Form states for creating billboard
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCity, setNewCity] = useState('Lagos');
  const [newDailyRate, setNewDailyRate] = useState('320');
  const [newImpressions, setNewImpressions] = useState('2.5M');
  const [newFormat, setNewFormat] = useState<'Digital LED' | 'Static Mega' | 'Spectacular Bridge' | 'Portrait Pillar'>('Digital LED');

  // Maintenance Alert Modal State
  const [selectedMaintenanceBillboard, setSelectedMaintenanceBillboard] = useState<Billboard | null>(null);

  // In a real app, this would be filtered by vendor ID
  const myInventory = billboards; 
  const pendingRequests = bookings.filter(b => b.status === 'Pending Approved');
  
  // Calculate mock revenue
  const totalRevenue = bookings.filter(b => b.status !== 'Rejected' as any).reduce((acc, b) => acc + b.totalCost, 0);

  // Payout states and custom period calculations
  const [payoutPrintPreview, setPayoutPrintPreview] = useState(false);
  const activeBookingsPayout = bookings.filter(b => b.status !== 'Rejected' as any);
  
  const calculatedTotalEarnings = activeBookingsPayout.reduce((acc, b) => acc + b.totalCost, 0);
  const calculatedCurrentPeriod = bookings
    .filter(b => b.status === 'Live' || b.status === 'Pending Approved')
    .reduce((acc, b) => acc + b.totalCost, 0);
  const calculatedPaidToDate = bookings
    .filter(b => b.status === 'Completed')
    .reduce((acc, b) => acc + b.totalCost, 0);

  const displayTotalEarnings = calculatedTotalEarnings || 74200;
  const displayCurrentPeriod = calculatedCurrentPeriod || 14950;
  const displayPaidToDate = calculatedPaidToDate || (displayTotalEarnings - displayCurrentPeriod);

  const availableCount = myInventory.filter(b => b.status === 'Available').length;

  // Body scroll lock + Escape key for modals
  useEffect(() => {
    const isOpen = showAddModal || selectedMaintenanceBillboard !== null;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowAddModal(false);
          setSelectedMaintenanceBillboard(null);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showAddModal, selectedMaintenanceBillboard]);

  const bookedCount = myInventory.filter(b => b.status === 'Fully Booked').length;
  const maintenanceCount = myInventory.filter(b => b.status === 'Maintenance').length;

  const avgDailyRate = myInventory.length > 0 
    ? Math.round(myInventory.reduce((acc, b) => acc + b.dailyRate, 0) / myInventory.length) 
    : 0;
  
  const totalMaintenanceDowntime = maintenanceCount * 18; // Estimated hours of active downtime

  const filteredInventory = myInventory.filter(b => inventoryCityFilter === 'All' || b.city === inventoryCityFilter);

  const chartData = [
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Booked', value: bookedCount, color: '#f59e0b' },
    { name: 'Maintenance', value: maintenanceCount, color: '#3f3f46' },
  ].filter(d => d.value > 0);

  // Compare revenue performance across billboard formats over the last quarter
  const formatRevenueData = useMemo(() => {
    const formatTotals: { [key: string]: number } = {
      'Digital LED': 0,
      'Static Mega': 0,
      'Spectacular Bridge': 0,
      'Portrait Pillar': 0
    };

    bookings.forEach(b => {
      if (b.status !== 'Rejected' as any) {
        const billboard = billboards.find(bill => bill.id === b.billboardId);
        if (billboard && formatTotals[billboard.format] !== undefined) {
          formatTotals[billboard.format] += b.totalCost;
        }
      }
    });

    const keys = Object.keys(formatTotals);
    const totalSelected = keys.reduce((sum, k) => sum + formatTotals[k], 0);

    // Default neat last-quarter revenue seeding
    const defaultQuarterRevenues: { [key: string]: number } = {
      'Digital LED': 42500,
      'Static Mega': 21000,
      'Spectacular Bridge': 17500,
      'Portrait Pillar': 9800
    };

    return keys.map(key => ({
      format: key,
      revenue: totalSelected > 0 && formatTotals[key] > 0 ? formatTotals[key] : defaultQuarterRevenues[key],
      color: key === 'Digital LED' ? '#3cffd0' : key === 'Static Mega' ? '#ffffff' : key === 'Spectacular Bridge' ? '#5200ff' : '#ec4899',
    }));
  }, [bookings, billboards]);

  const TabButton = ({ id, label, icon: Icon, alertCount }: { id: VendorTab, label: string, icon: React.ElementType, alertCount?: number }) => (
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === id}
      aria-controls="vendor-workspace-panel"
      onClick={() => setActiveTab(id)}
      className={`flex min-h-11 shrink-0 items-center justify-between gap-4 rounded-xl border px-4 py-3 font-mono text-body-xs font-semibold uppercase tracking-[0.12em] transition-all md:w-full ${
        activeTab === id 
          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold' 
          : 'bg-[var(--color-surface)]/50 border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-secondary)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {alertCount !== undefined && alertCount > 0 && (
        <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-caption leading-none font-bold">{alertCount}</span>
      )}
    </button>
  );

  return (
    <div className="dashboard-shell vendor-dashboard max-w-[1240px] mx-auto space-y-5">
      
      {/* Vendor Header */}
      <section className="dashboard-panel rounded-[0px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Building2 className="w-48 h-48 text-amber-500" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.3em] font-bold block">MEDIA OWNER PORTAL</span>
          </div>
          <h1 className="font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-[-0.04em]">Publisher Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Manage inventory, approve bookings, and track payouts.</p>
        </div>

        <div className="relative z-10 flex gap-4">
          <div className="p-4 bg-[var(--color-surface)]/40 rounded-xl border border-[var(--color-border)] flex flex-col items-start gap-1 min-w-[120px]">
            <span className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Gross Revenue</span>
            <span className="text-xl font-sans font-bold text-[var(--color-text-primary)]">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="p-4 bg-[var(--color-surface)]/40 rounded-xl border border-[var(--color-border)] flex flex-col items-start gap-1 min-w-[120px]">
            <span className="text-caption uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Active Units</span>
            <span className="text-xl font-sans font-bold text-[var(--color-text-primary)]">{myInventory.length}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="dashboard-panel rounded-2xl p-2 md:p-4">
            <div className="hidden text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-[0.18em] px-2 mb-3 font-semibold md:block">Management</div>
            <div role="tablist" aria-label="Vendor workspace" className="dashboard-tabs flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
              <TabButton id="overview" label="Overview" icon={TrendingUp} />
              <TabButton id="requests" label="Booking requests" icon={Users} alertCount={pendingRequests.length} />
              <TabButton id="inventory" label="My screens" icon={Monitor} />
              <TabButton id="payouts" label="Payouts" icon={DollarSign} />
              <TabButton id="profile" label="My profile" icon={User} />
            </div>
          </div>
          
          <button 
            type="button"
            aria-label="Add billboard"
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 rounded-xl bg-transparent border border-amber-500/20 text-amber-500 font-semibold text-caption tracking-wider uppercase hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            + Add Billboard
          </button>
        </div>

        {/* Workspace Display */}
        <div id="vendor-workspace-panel" role="tabpanel" className="min-w-0 md:col-span-3 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 duration-300">
              
              {/* Needs Approval Banner */}
              {pendingRequests.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-[var(--color-warning-text)] font-semibold text-sm">Action required</h4>
                    <p className="text-sm text-[var(--color-warning-text)]">You have {pendingRequests.length} campaign {pendingRequests.length === 1 ? 'booking' : 'bookings'} pending approval.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="min-h-11 w-full px-4 py-2 bg-amber-500 text-black text-caption font-bold rounded-lg uppercase tracking-wider hover:bg-amber-400 transition-colors sm:w-auto"
                  >
                    Review
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Occupancy Status Chart */}
                <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 flex flex-col">
                  <div className="mb-4">
                    <h4 className="font-medium text-lg text-[var(--color-text-primary)]">Occupancy Status</h4>
                    <p className="text-caption text-[var(--color-text-muted)]">Live inventory allocation</p>
                  </div>
                  <div className="h-[240px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {chartData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Assets */}
                <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-lg text-[var(--color-text-primary)]">Top Performing Assets</h4>
                      <p className="text-caption text-[var(--color-text-muted)]">Highest revenue generating units</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {myInventory.slice(0, 3).map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative grow-0 shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = FALLBACK_IMG;
                                }}
                              />
                            ) : <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-caption font-mono">N/A</div>}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{item.title}</div>
                            <div className="flex items-center gap-2 text-caption text-[var(--color-text-muted)] font-mono tracking-widest mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{item.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-[var(--color-text-primary)]">${(item.dailyRate * 30).toLocaleString()} <span className="text-[var(--color-text-muted)] text-caption">/mo est.</span></div>
                          <div className="text-caption text-emerald-600 font-mono">{stableNumber(item.id, 86, 13)}% occupancy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6 duration-300">
               <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h4 className="font-medium text-lg text-[var(--color-text-primary)]">Pending Campaign Approvals</h4>
                    <p className="text-caption text-[var(--color-text-muted)]">Review brand creatives and schedule</p>
                  </div>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--color-text-secondary)] font-mono">You're all caught up.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((req, idx) => {
                      const billboard = billboards.find(b => b.id === req.billboardId);
                      return (
                        <div key={idx} className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-caption text-[var(--color-text-secondary)] font-mono tracking-widest mb-1 uppercase">Booking #{req.id}</div>
                              <div className="text-sm text-[var(--color-text-primary)] font-medium">Target: {billboard?.title || 'Standard Billboard'}</div>
                              <div className="text-caption text-[var(--color-text-muted)]">Dates: {req.startDate} to {req.endDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-400">${req.totalCost}</div>
                              <div className="text-caption text-[var(--color-text-muted)] uppercase tracking-widest">Gross Revenue</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                            <button 
                              onClick={() => onUpdateBookingStatus?.(req.id, 'Live')}
                              className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-caption font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-colors flex justify-center items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Accept
                            </button>
                            <button 
                              onClick={() => onUpdateBookingStatus?.(req.id, 'Rejected')}
                              className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-caption font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
               </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6 duration-300">
              
              {/* Top-level Performance & Health KPI Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Revenue Growth Card */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300 group">
                  <div className="space-y-1">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">REVENUE GROWTH</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans font-bold text-2xl text-[var(--color-text-primary)] tracking-tight">+24.8%</span>
                      <span className="font-mono text-caption text-emerald-400 font-bold uppercase">MoM</span>
                    </div>
                    <span className="text-caption text-[var(--color-text-muted)] block font-mono">+$4,230 vs Q1 2026</span>
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <TrendingUp className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {/* Avg. Daily Rate Card */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300 group">
                  <div className="space-y-1">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">AVG. DAILY RATE</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans font-bold text-2xl text-amber-500 tracking-tight">${avgDailyRate}</span>
                      <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase">/ Day</span>
                    </div>
                    <span className="text-caption text-[var(--color-text-muted)] block font-mono">Across {myInventory.length} listed node screens</span>
                  </div>
                  <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Maintenance Downtime Card */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300 group">
                  <div className="space-y-1">
                    <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">TOTAL DOWNTIME</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans font-bold text-2xl text-[var(--color-text-primary)] tracking-tight">{totalMaintenanceDowntime} Hrs</span>
                      <span className="font-mono text-caption text-red-400 font-bold uppercase font-extrabold">Est</span>
                    </div>
                    <span className="text-caption text-[var(--color-text-muted)] block font-mono">{maintenanceCount} screen units offline</span>
                  </div>
                  <div className="p-3.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>

              </div>
              
              {/* Occupancy Trend Visualization Box */}
              <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="font-mono text-caption text-amber-400 uppercase tracking-[0.2em] font-bold block">PERFORMANCE INSIGHTS</span>
                    <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">6-Month Inventory Occupancy Rate</h4>
                  </div>
                  <div className="flex gap-4 font-mono text-caption">
                    <div className="text-right">
                      <span className="text-[var(--color-text-muted)] block uppercase">6-MONTH AVG</span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">82.8%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--color-text-muted)] block uppercase font-bold">TREND SHIFT</span>
                      <span className="text-sm font-bold text-[var(--color-primary)]">▲ +20.0%</span>
                    </div>
                  </div>
                </div>

                <div className="h-[180px] w-full pt-4 font-mono text-caption select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={occupancyTrendData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#71717a" 
                        tickLine={false}
                        axisLine={false}
                        dy={10} 
                      />
                      <YAxis 
                        stroke="#71717a" 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                        domain={[60, 100]}
                        dx={-5}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111113', 
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          borderRadius: '12px',
                          fontFamily: 'JetBrains Mono, sans-serif'
                        }}
                        formatter={(value: any) => [`${value}%`, 'Occupancy Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#f59e0b" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorOccupancy)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-xl text-[var(--color-text-primary)]">My Screens</h3>
                    <p className="text-caption text-[var(--color-text-muted)] mt-1">Manage your active billboard inventory.</p>
                  </div>
                  
                  <div className="flex bg-[var(--color-surface)]/50 rounded-lg p-1 border border-[var(--color-border)] overflow-x-auto">
                    {['All', 'Lagos', 'Accra', 'Nairobi'].map(city => (
                      <button 
                        type="button"
                        key={city}
                        aria-pressed={inventoryCityFilter === city}
                        onClick={() => setInventoryCityFilter(city)}
                        className={`px-3 py-1.5 text-caption font-mono rounded-md hover:bg-[var(--color-surface)] transition-colors ${inventoryCityFilter === city ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-bold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   {filteredInventory.length === 0 ? (
                     <div className="py-12 text-center rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
                       <p className="text-[var(--color-text-muted)] font-mono text-sm">No inventory found for this city.</p>
                     </div>
                   ) : (
                     filteredInventory.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors gap-4 cursor-pointer">
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = FALLBACK_IMG;
                                  }}
                                />
                              ) : <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-caption font-mono">N/A</div>}
                              <div className="absolute inset-0 bg-[var(--color-surface)]/20"></div>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-[var(--color-text-primary)] line-clamp-1 max-w-[200px]">{item.title}</div>
                              <div className="text-caption text-[var(--color-text-secondary)] font-mono mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {item.city} 
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 items-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-caption text-[var(--color-text-muted)] font-mono uppercase">Views / Day</div>
                              <div className="text-caption text-[var(--color-text-primary)]">{stableNumber(item.id, 38, 18)}k+</div>
                            </div>
                            <div className="text-right">
                              <div className="text-caption text-[var(--color-text-muted)] font-mono uppercase">Daily Rate</div>
                              <div className="text-sm font-semibold text-[var(--color-text-primary)]">${item.dailyRate}</div>
                            </div>
                            <div className="w-24 text-right">
                              <button
                                type="button"
                                title="Click to cycle status"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.status === 'Fully Booked') {
                                    onUpdateBillboardStatus?.(item.id, 'Available');
                                    return;
                                  }
                                  if (item.status === 'Maintenance') {
                                    setSelectedMaintenanceBillboard(item);
                                    return;
                                  }
                                  const nextStatus = item.status === 'Available' ? 'Maintenance' : 'Available';
                                  onUpdateBillboardStatus?.(item.id, nextStatus);
                                }}
                                className={`text-caption font-mono font-extrabold uppercase py-1 px-3 rounded-full border transition-all cursor-pointer ${
                                  item.status === 'Available' 
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                    : item.status === 'Fully Booked'
                                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400'
                                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                                }`}
                              >
                                {item.status}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6 duration-300">
              <style>{`
                @media print {
                  body {
                    background: white !important;
                    color: black !important;
                  }
                  header, nav, aside, button, .no-print, #console-workbench, .glass-panel:not(.print-panel-only), .inline-flex, .md\\:col-span-1 {
                    display: none !important;
                  }
                  #print-earnings-document {
                    display: block !important;
                    background: white !important;
                    color: black !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    padding: 2.5rem !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    font-family: sans-serif !important;
                  }
                  .print\\:text-black {
                    color: black !important;
                  }
                  .print\\:border-black {
                    border-color: #000000 !important;
                  }
                  .print\\:bg-white {
                    background-color: #ffffff !important;
                  }
                }
              `}</style>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-caption text-amber-400 uppercase tracking-[0.2em] font-bold block">FINANCIAL CLEARING</span>
                  <h3 className="font-medium text-2xl text-[var(--color-text-primary)]">Earnings & Payouts</h3>
                  <p className="text-caption text-[var(--color-text-muted)] mt-1">Track settled transfers and current statement period balances.</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPayoutPrintPreview(!payoutPrintPreview)}
                    className="px-4 py-2 bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-caption font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    {payoutPrintPreview ? 'Show Dashboard View' : 'Show Print Preview'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-caption font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Report
                  </button>
                </div>
              </div>

              {!payoutPrintPreview ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] space-y-3 bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest font-bold">CURRENT PERIOD</span>
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-caption uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded">Pending Escrow</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold font-sans tracking-tight text-[var(--color-text-primary)]">${displayCurrentPeriod.toLocaleString()}</div>
                        <span className="text-caption text-[var(--color-text-muted)] block font-mono">May 1 – May 31, 2026</span>
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] space-y-3 bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest font-bold">PAID TO DATE</span>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-caption uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded">Transferred</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold font-sans tracking-tight text-[var(--color-primary)]">${displayPaidToDate.toLocaleString()}</div>
                        <span className="text-caption text-[var(--color-text-muted)] block font-mono">Cleared & settled in GTBank</span>
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border)] space-y-3 bg-[var(--color-surface)]/80 hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest font-bold">GROSS EARNINGS</span>
                        <span className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-caption uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded">Total Contract</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold font-sans tracking-tight text-[var(--color-text-primary)]">${displayTotalEarnings.toLocaleString()}</div>
                        <span className="text-caption text-[var(--color-text-muted)] block font-mono">Across all booked contracts</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm uppercase font-mono tracking-wider">GTBANK •••• 9301</h4>
                        <p className="text-[var(--color-text-muted)] text-caption font-mono mt-0.5">Bi-Weekly settlement schedule / Registered to Prime Displays Ltd.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-caption font-mono text-[var(--color-text-muted)] block uppercase tracking-wider">Next Transfer Target</span>
                      <span className="text-sm font-bold text-amber-500 font-mono">June 1, 2026</span>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                    <h4 className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-widest font-bold">Statement Transactions Ledger</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-[760px] w-full text-left border-collapse text-caption font-mono">
                        <thead>
                          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider">
                            <th className="pb-3 font-normal">Reference ID</th>
                            <th className="pb-3 font-normal">Leased Node Screen</th>
                            <th className="pb-3 font-normal">Advertiser Campaign</th>
                            <th className="pb-3 font-normal">Schedule Dates</th>
                            <th className="pb-3 text-right font-normal">Gross Cost</th>
                            <th className="pb-3 text-right font-normal">Payout Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[var(--color-text-secondary)]">
                          {bookings.length > 0 ? (
                            bookings.map((b) => {
                              const targetBillboard = billboards.find(bill => bill.id === b.billboardId);
                              return (
                                <tr key={b.id} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                                  <td className="py-3 text-[var(--color-text-muted)] uppercase">#{b.id}</td>
                                  <td className="py-3 text-[var(--color-text-primary)] font-sans font-medium">{targetBillboard?.title || 'Digital Spectacular'}</td>
                                  <td className="py-3 font-sans">{b.campaignName || 'Product Launch Campaign'}</td>
                                  <td className="py-3">{b.startDate} – {b.endDate}</td>
                                  <td className="py-3 text-right font-semibold text-[var(--color-text-primary)]">${b.totalCost.toLocaleString()}</td>
                                  <td className="py-3 text-right">
                                    <span className={`px-2 py-0.5 rounded text-caption uppercase font-bold ${
                                      b.status === 'Completed' 
                                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
                                        : b.status === 'Live'
                                        ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                                        : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                                    }`}>
                                      {b.status === 'Completed' ? 'Settled' : b.status === 'Live' ? 'Processing' : b.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            [
                              { ref: 'B-F939A1', node: 'Main Expressway Mega LED', campaign: 'Beverage Summer Launch', dates: 'May 01 – May 14', rate: 7200, status: 'Settled' },
                              { ref: 'B-C02948', node: 'Lekki Toll Gate Portrait LED', campaign: 'Telco High-Speed Launch', dates: 'May 10 – May 24', rate: 4800, status: 'Processing' },
                              { ref: 'B-Z81940', node: 'Ikeja Mall Archway Spectacular', campaign: 'Airtravel Global Promo', dates: 'May 15 – May 28', rate: 2950, status: 'Processing' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                                <td className="py-3 text-[var(--color-text-muted)]">{row.ref}</td>
                                <td className="py-3 text-[var(--color-text-primary)] font-sans font-medium">{row.node}</td>
                                <td className="py-3 font-sans">{row.campaign}</td>
                                <td className="py-3">{row.dates}, 2026</td>
                                <td className="py-3 text-right font-semibold text-[var(--color-text-primary)]">${row.rate.toLocaleString()}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-caption uppercase font-bold ${
                                    row.status === 'Settled'
                                      ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                                      : 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="print-report-area" className="bg-white text-[var(--color-text-primary)] border border-zinc-200 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl space-y-8 duration-200">
                  <div className="flex border-b border-zinc-200 pb-6 justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="text-[var(--color-text-secondary)] font-mono text-caption tracking-widest font-extrabold uppercase">VANTAGE PARTNER NETWORK</div>
                      <h4 className="font-black text-2xl tracking-tight uppercase text-[var(--color-text-primary)]">Earnings & Payout Statement</h4>
                      <p className="text-caption text-[var(--color-text-muted)]">Statement Period: May 1, 2026 – May 31, 2026</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono text-caption bg-[var(--color-surface-hover)] inline-block px-1.5 py-0.5 text-[var(--color-text-muted)] rounded border border-[var(--color-border)] font-bold uppercase">Statement #VP-2026-05</span>
                      <div className="text-caption text-[var(--color-text-muted)] font-mono uppercase mt-2">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="font-mono text-caption font-bold text-[var(--color-text-secondary)] uppercase tracking-widest border-b border-zinc-100 pb-1">MEDIA PUBLISHER ACCOUNT</h5>
                      <div className="text-caption space-y-1.5">
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Publisher:</span> <span className="font-semibold text-[var(--color-text-primary)]">Prime Displays Ltd.</span></div>
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Operational Reg:</span> <span className="font-semibold text-[var(--color-text-primary)]">RC-829104</span></div>
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Payout Target Bank:</span> <span className="font-semibold text-[var(--color-text-primary)] font-sans">GTBank •••• 9301</span></div>
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Schedule:</span> <span className="font-semibold text-[var(--color-text-primary)]">Bi-Weekly Clearing</span></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-mono text-caption font-bold text-[var(--color-text-secondary)] uppercase tracking-widest border-b border-zinc-100 pb-1">FINANCIAL BALANCES SUMMARY</h5>
                      <div className="text-caption space-y-1.5">
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Gross Lifetime Earnings:</span> <span className="font-semibold text-[var(--color-text-primary)]">${displayTotalEarnings.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Cleared & Paid to Bank:</span> <span className="font-semibold text-emerald-650">${displayPaidToDate.toLocaleString()}</span></div>
                        <div className="flex justify-between border-t border-zinc-150 pt-2 font-bold"><span className="text-[var(--color-text-primary)] font-extrabold">Current Period Escrow:</span> <span className="text-amber-600">${displayCurrentPeriod.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-mono text-caption font-bold text-[var(--color-text-secondary)] uppercase tracking-widest border-b border-zinc-100 pb-2">SCHEDULE TRANSACTION DETAIL</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-caption">
                        <thead>
                          <tr className="border-b border-zinc-300 text-[var(--color-text-muted)] uppercase tracking-widest font-mono text-caption">
                            <th className="py-2.5 font-bold">Reference ID</th>
                            <th className="py-2.5 font-bold">Node Screen Location</th>
                            <th className="py-2.5 font-bold">Campaign Lease</th>
                            <th className="py-2.5 font-bold">Duration</th>
                            <th className="py-2.5 text-right font-bold">Payout Status</th>
                            <th className="py-2.5 text-right font-bold">Gross Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-[var(--color-text-muted)]">
                          {bookings.length > 0 ? (
                            bookings.map((b) => {
                              const targetBillboard = billboards.find(bill => bill.id === b.billboardId);
                              return (
                                <tr key={b.id} className="border-b border-zinc-50 font-sans">
                                  <td className="py-2.5 font-mono text-[var(--color-text-muted)] text-caption uppercase">#{b.id}</td>
                                  <td className="py-2.5 font-medium text-[var(--color-text-primary)]">{targetBillboard?.title || 'Digital Spectacular'}</td>
                                  <td className="py-2.5">{b.campaignName || 'Product Launch Campaign'}</td>
                                  <td className="py-2.5">{b.startDate} – {b.endDate}</td>
                                  <td className="py-2.5 text-right uppercase text-caption font-mono font-bold text-[var(--color-text-muted)]">
                                    {b.status === 'Completed' ? 'Settled / Cleared' : b.status === 'Live' ? 'Processing' : b.status}
                                  </td>
                                  <td className="py-2.5 text-right font-semibold text-[var(--color-text-primary)] font-mono">${b.totalCost.toLocaleString()}</td>
                                </tr>
                              );
                            })
                          ) : (
                            [
                              { ref: 'B-F939A1', node: 'Main Expressway Mega LED', campaign: 'Beverage Summer Launch', dates: 'May 01 – May 14', rate: 7200, status: 'Settled' },
                              { ref: 'B-C02948', node: 'Lekki Toll Gate Portrait LED', campaign: 'Telco High-Speed Launch', dates: 'May 10 – May 24', rate: 4800, status: 'Processing' },
                              { ref: 'B-Z81940', node: 'Ikeja Mall Archway Spectacular', campaign: 'Airtravel Global Promo', dates: 'May 15 – May 28', rate: 2950, status: 'Processing' },
                            ].map((row, i) => (
                              <tr key={i} className="border-b border-zinc-50 font-sans">
                                <td className="py-2.5 font-mono text-[var(--color-text-secondary)] text-caption">{row.ref}</td>
                                <td className="py-2.5 font-medium text-[var(--color-text-primary)]">{row.node}</td>
                                <td className="py-2.5">{row.campaign}</td>
                                <td className="py-2.5">{row.dates}, 2026</td>
                                <td className="py-2.5 text-right font-mono uppercase text-caption font-extrabold text-[var(--color-text-muted)]">{row.status}</td>
                                <td className="py-2.5 text-right font-mono text-[var(--color-text-primary)] font-bold">${row.rate.toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-caption text-[var(--color-text-secondary)] font-mono leading-relaxed">
                    <div>
                      <p className="uppercase tracking-wider font-extrabold">AUTHENTICATION HASH CODE</p>
                      <p className="mt-0.5 text-[var(--color-text-secondary)] select-text">SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="uppercase tracking-wider font-extrabold">STATUS: CLEARANCE PASSED</p>
                      <p className="mt-0.5 text-[var(--color-text-secondary)] font-sans">Vantage Point Escrow Hub • Bi-Weekly Auto Clearing Approved</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Print-only markup */}
              <div id="print-earnings-document" className="hidden print:block bg-white text-black p-8 font-sans">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight uppercase">VANTAGE POINT PARTNER NETWORK</h2>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Earnings & Payout Statement Report</h3>
                    <p className="text-caption text-[var(--color-text-muted)] mt-1">Statement Period: May 1, 2026 – May 31, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-caption font-mono font-bold">REPORT #VP-2026-05</p>
                    <p className="text-caption text-[var(--color-text-muted)] mt-1">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 my-6">
                  <div>
                    <h4 className="border-b border-black text-caption font-bold uppercase pb-1 tracking-wider">Publisher Account Details</h4>
                    <div className="text-caption space-y-1 mt-2">
                      <div><span className="text-[var(--color-text-muted)]">Company Name:</span> <strong className="text-black font-sans">Prime Displays Ltd.</strong></div>
                      <div><span className="text-[var(--color-text-muted)]">Registration ID:</span> <strong className="text-black">RC-829104</strong></div>
                      <div><span className="text-[var(--color-text-muted)]">Clearing Method:</span> <strong className="text-black font-sans">GTBank (•••• 9301) - Bi-Weekly Schedule</strong></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="border-b border-black text-caption font-bold uppercase pb-1 tracking-wider">Period Balances Statement</h4>
                    <div className="text-caption space-y-1 mt-2">
                      <div className="flex justify-between"><span>Contract Gross Earnings:</span> <span>${displayTotalEarnings.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Cleared & Settled to Date:</span> <span>${displayPaidToDate.toLocaleString()}</span></div>
                      <div className="flex justify-between border-t border-zinc-300 pt-1 font-bold"><span>Current Period Escrow Clearing:</span> <span>${displayCurrentPeriod.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <div className="my-6">
                  <h4 className="border-b border-black text-caption font-bold uppercase pb-1.5 tracking-wider">Statement Schedule Transactions</h4>
                  <table className="w-full text-left font-sans text-caption mt-2 border-collapse">
                    <thead>
                      <tr className="border-b border-black text-[var(--color-text-muted)] font-bold">
                        <th className="py-2">Reference</th>
                        <th className="py-2">Location Node</th>
                        <th className="py-2">Campaign Lease</th>
                        <th className="py-2">Duration</th>
                        <th className="py-2 text-right">Status</th>
                        <th className="py-2 text-right">Gross Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {bookings.length > 0 ? (
                        bookings.map((b) => {
                          const targetBillboard = billboards.find(bill => bill.id === b.billboardId);
                          return (
                            <tr key={b.id} className="text-black">
                              <td className="py-2 font-mono">#{b.id}</td>
                              <td className="py-2 font-medium">{targetBillboard?.title || 'Digital Spectacular'}</td>
                              <td className="py-2">{b.campaignName || 'Product Launch Campaign'}</td>
                              <td className="py-2">{b.startDate} – {b.endDate}</td>
                              <td className="py-2 text-right font-bold">
                                {b.status === 'Completed' ? 'Cleared' : b.status === 'Live' ? 'Clearing' : b.status}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold">${b.totalCost.toLocaleString()}</td>
                            </tr>
                          );
                        })
                      ) : (
                        [
                          { ref: 'B-F939A1', node: 'Main Expressway Mega LED', campaign: 'Beverage Summer Launch', dates: 'May 01 – May 14', rate: 7200, status: 'Settled' },
                          { ref: 'B-C02948', node: 'Lekki Toll Gate Portrait LED', campaign: 'Telco High-Speed Launch', dates: 'May 10 – May 24', rate: 4800, status: 'Processing' },
                          { ref: 'B-Z81940', node: 'Ikeja Mall Archway Spectacular', campaign: 'Airtravel Global Promo', dates: 'May 15 – May 28', rate: 2950, status: 'Processing' },
                        ].map((row, i) => (
                          <tr key={i} className="text-black">
                            <td className="py-2 font-mono text-[var(--color-text-muted)]">{row.ref}</td>
                            <td className="py-2 font-medium">{row.node}</td>
                            <td className="py-2">{row.campaign}</td>
                            <td className="py-2">{row.dates}, 2026</td>
                            <td className="py-2 text-right font-mono font-bold uppercase">{row.status}</td>
                            <td className="py-2 text-right font-mono font-semibold">${row.rate.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-8 border-t border-black flex justify-between items-baseline mt-16 text-caption text-[var(--color-text-muted)] font-mono">
                  <div>
                    <h5 className="font-extrabold uppercase text-black">REGULATORY COMPLIANCE SYSTEM CLEARANCE</h5>
                    <p className="mt-0.5 font-bold">AUTOMATED SHA-256 DIGITAL CONTRACT HANDSHAKE VERIFIED</p>
                    <p className="mt-1">HASH: SHA256-VP98124018A8B880CE139AE74200EB3D27BE41E4F28551F2A</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold uppercase text-black font-sans">Cleared & Authorized Escrow</p>
                    <p className="mt-1 border-t border-zinc-500 pt-3">Authorizing Agent Sign-off</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 duration-300">
              <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{vendorProfile.companyName}</h2>
                    <p className="text-[var(--color-text-secondary)] font-mono text-sm tracking-wide mt-1">Verified Media Publisher</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-caption uppercase font-mono rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Top Rated</span>
                      <span className="text-caption text-[var(--color-text-muted)] font-mono">Listed {myInventory.length} screens</span>
                    </div>
                  </div>
                </div>

                {editingVendor ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Company Name</label>
                        <input type="text" value={vendorDraft.companyName} onChange={e => setVendorDraft(d => ({ ...d, companyName: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Registration Number</label>
                        <input type="text" value={vendorDraft.regNumber} onChange={e => setVendorDraft(d => ({ ...d, regNumber: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Operations Representative</label>
                        <input type="text" value={vendorDraft.contactName} onChange={e => setVendorDraft(d => ({ ...d, contactName: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Support Email</label>
                        <input type="email" value={vendorDraft.email} onChange={e => setVendorDraft(d => ({ ...d, email: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Phone Number</label>
                        <input type="tel" value={vendorDraft.phone} onChange={e => setVendorDraft(d => ({ ...d, phone: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Bank Account</label>
                        <input type="text" value={vendorDraft.bankAccount} onChange={e => setVendorDraft(d => ({ ...d, bankAccount: e.target.value }))}
                          className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-caption focus:outline-none focus:border-amber-400 transition-colors font-sans" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-caption font-mono text-amber-400 uppercase tracking-widest font-bold">Notification Preferences</h4>
                      {([
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Booking requests and payout alerts' },
                        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Critical alerts via SMS' },
                      ] as { key: 'emailNotifications' | 'smsNotifications'; label: string; desc: string }[]).map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                          <div>
                            <div className="text-caption font-semibold text-[var(--color-text-primary)]">{label}</div>
                            <div className="text-caption font-mono text-[var(--color-text-muted)]">{desc}</div>
                          </div>
                          <button type="button" role="switch" aria-checked={vendorDraft[key]}
                            onClick={() => setVendorDraft(d => ({ ...d, [key]: !d[key] }))}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${vendorDraft[key] ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${vendorDraft[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setVendorProfile({ ...vendorDraft }); setEditingVendor(false); }}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Save Changes
                      </button>
                      <button type="button" onClick={() => { setVendorDraft({ ...vendorProfile }); setEditingVendor(false); }}
                        className="flex-1 py-3 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">Business Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Company Reg.</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.regNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Operations Rep</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.contactName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Support Email</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Phone</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">Payout Configuration</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Bank Account</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.bankAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Payout Schedule</span>
                            <span className="text-caption text-[var(--color-text-primary)]">{vendorProfile.payoutSchedule}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">Email Notifications</span>
                            <span className={`text-caption ${vendorProfile.emailNotifications ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {vendorProfile.emailNotifications ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-caption text-[var(--color-text-muted)] font-mono">SMS Notifications</span>
                            <span className={`text-caption ${vendorProfile.smsNotifications ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {vendorProfile.smsNotifications ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)]">
                      <button type="button" onClick={() => { setVendorDraft({ ...vendorProfile }); setEditingVendor(true); }}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono text-caption font-bold uppercase tracking-widest rounded-xl transition-all">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab !== 'overview' && activeTab !== 'requests' && activeTab !== 'inventory' && activeTab !== 'payouts' && activeTab !== 'profile') && (
             <div className="py-24 text-center glass-panel rounded-2xl border border-[var(--color-border)] duration-300">
               <Monitor className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-4" />
               <p className="text-sm text-[var(--color-text-secondary)] font-mono">Module locked.</p>
               <p className="text-caption text-[var(--color-text-muted)] mt-2">Activate Publisher Pro to access {activeTab}.</p>
             </div>
          )}

        </div>
      </div>

      {/* Dynamic Create Modal for Add Billboard */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--color-surface)]/80 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{animation: "fadeIn 0.2s ease-out"}} onClick={() => setShowAddModal(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-billboard-title"
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{animation: "scaleIn 0.2s ease-out"}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
            
            <div className="space-y-1">
              <span className="font-mono text-caption text-amber-400 uppercase tracking-widest block font-bold">INVENTORY REGISTRY</span>
              <h4 id="add-billboard-title" className="font-semibold text-xl text-[var(--color-text-primary)]">List new billboard</h4>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle || !newLocation) return;
              
              const id = `node-${crypto.randomUUID().slice(0, 8)}`;
              onAddBillboard?.({
                id,
                title: newTitle,
                location: newLocation,
                city: newCity,
                country: newCity === 'Lagos' ? 'Nigeria' : newCity === 'Accra' ? 'Ghana' : newCity === 'Nairobi' ? 'Kenya' : 'South Africa',
                dailyRate: Number(newDailyRate) || 300,
                format: newFormat,
                dimensions: '20m x 8m',
                monthlyImpressions: newImpressions,
                trafficVolume: Number(newDailyRate) > 350 ? 'Mega' : 'Very High',
                status: 'Available',
                lat: 40 + Math.random() * 30, // Random placement inside active zone
                lng: 35 + Math.random() * 30,
                imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1200',
                description: `A prime leasable asset located at ${newLocation}. Delivers high impact visibility with an estimated ${newImpressions} views/month.`
              });

              // Reset & Close
              setNewTitle('');
              setNewLocation('');
              setShowAddModal(false);
            }} className="space-y-4 text-caption font-mono">
              <div className="space-y-1.5">
                <label htmlFor="billboard-title" className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">Billboard title</label>
                <input 
                  id="billboard-title"
                  type="text" 
                  required
                  placeholder="e.g. Landmark Boulevard Spectacular Mirror"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="billboard-location" className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">Exact location</label>
                <input 
                  id="billboard-location"
                  type="text" 
                  required
                  placeholder="e.g. Plot 14, Lekki Expressway (Inbound)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">City</label>
                  <select 
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Accra">Accra</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Johannesburg">Johannesburg</option>
                    <option value="Cape Town">Cape Town</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">Display Format</label>
                  <select 
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="Digital LED">Digital LED</option>
                    <option value="Static Mega">Static Mega</option>
                    <option value="Spectacular Bridge">Spectacular Bridge</option>
                    <option value="Portrait Pillar">Portrait Pillar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">Daily Leasable Rate ($)</label>
                  <input 
                    type="number" 
                    required
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(e.target.value)}
                    className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">Est. Monthly Impressions</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 2.5M"
                    value={newImpressions}
                    onChange={(e) => setNewImpressions(e.target.value)}
                    className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 font-mono">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-transparent hover:bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!newTitle || !newLocation}
                  className="px-5 py-2 bg-amber-500 text-black font-bold rounded-lg uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
                >
                  PUBLISH NODE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Alert Modal */}
      {selectedMaintenanceBillboard && (
        <div className="fixed inset-0 bg-[var(--color-surface)]/80 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{animation: "fadeIn 0.2s ease-out"}} onClick={() => setSelectedMaintenanceBillboard(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-dialog-title"
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{animation: "scaleIn 0.2s ease-out"}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMaintenanceBillboard(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-caption text-red-400 uppercase tracking-widest block font-bold">SYSTEM ALERT: MAINTENANCE NODE</span>
                <h4 id="maintenance-dialog-title" className="font-semibold text-lg text-[var(--color-text-primary)]">Maintenance status log</h4>
              </div>
            </div>

            <div className="space-y-4 text-caption font-mono">
              <div className="p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    {selectedMaintenanceBillboard.imageUrl ? (
                      <img
                        src={selectedMaintenanceBillboard.imageUrl}
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
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text-primary)] font-sans">{selectedMaintenanceBillboard.title}</div>
                    <div className="text-caption text-[var(--color-text-secondary)] mt-0.5">{selectedMaintenanceBillboard.location}, {selectedMaintenanceBillboard.city}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[var(--color-text-muted)] uppercase tracking-wider block font-bold text-caption">REPORTED ISSUE LOG</span>
                <div className="p-4 rounded-lg bg-zinc-950/50 border border-[var(--color-border)] space-y-3 text-body-xs leading-relaxed">
                  <div className="grid grid-cols-2 gap-2 text-[var(--color-text-secondary)] pb-2 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-[var(--color-text-muted)] font-extrabold uppercase text-caption block">REPORTED ON:</span>
                      <span className="text-[var(--color-text-primary)]">May 22, 2026</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] font-extrabold uppercase text-caption block">SEVERITY LEVEL:</span>
                      <span className="text-amber-500">HIGH (Level 3)</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--color-text-muted)] font-extrabold uppercase text-caption block">DIAGNOSTIC DESCRIPTION:</span>
                    <p className="text-[var(--color-text-secondary)]">
                      System anomaly detected. Automated diagnostics logged critical pixel calibration faults on LED driver board #7, accompanied by unexpected ambient temperature surge (+14°C above baseline) in the telemetry housing. Screen refresh rate temporarily downgraded to prevent panel damage.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--color-text-muted)] font-extrabold uppercase text-caption block">PROCEDURAL RECOMMENDATION:</span>
                    <p className="text-[var(--color-text-secondary)]">
                      Recommend field engineering team intervention for thermal paste re-application and controller card reboot. On-site dispatch is scheduled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    onUpdateBillboardStatus?.(selectedMaintenanceBillboard.id, 'Available');
                    setSelectedMaintenanceBillboard(null);
                  }}
                  className="w-full py-3 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/30 text-[var(--color-primary)] border border-[var(--color-primary)]/45 font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(60,255,208,0.1)]"
                >
                  <CheckCircle2 className="w-4 h-4" /> Resolve & Restore to Available
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedMaintenanceBillboard(null)}
                  className="w-full py-2.5 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  KEEP IN MAINTENANCE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
