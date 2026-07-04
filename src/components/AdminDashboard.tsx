import React, { useState } from 'react';
import { Billboard, Booking } from '../types';
import {
  Shield, Users, MapPin, Activity, CheckCircle2,
  TrendingUp, Layers, CreditCard, Bell,
  Database, Server, Lock, MonitorPlay, AlertTriangle,
  Settings, User, Wrench, Mail, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const analyticsData = [
  { day: 'Jun 1', volume: 4200 }, { day: 'Jun 5', volume: 6800 },
  { day: 'Jun 10', volume: 5900 }, { day: 'Jun 15', volume: 9100 },
  { day: 'Jun 20', volume: 11400 }, { day: 'Jun 25', volume: 10200 },
  { day: 'Jun 30', volume: 14800 },
];

interface AdminDashboardProps {
  billboards: Billboard[];
  bookings: Booking[];
  onUpdateBookingStatus?: (id: string, newStatus: 'Pending Approved' | 'Live' | 'Completed' | 'Rejected') => void;
}

type ModuleTab = 'analytics' | 'auth' | 'billboards' | 'bookings' | 'payments' | 'notifications' | 'system' | 'profile';

export default function AdminDashboard({ billboards, bookings, onUpdateBookingStatus }: AdminDashboardProps) {
  const [activeModule, setActiveModule] = useState<ModuleTab>('analytics');

  const [adminProfile, setAdminProfile] = useState({
    name: 'System Administrator',
    email: 'admin@vantagepoint.com',
    phone: '+1 (800) 000-0001',
    title: 'Platform Orchestrator & Principal Engineer',
    twoFA: true,
    emailAlerts: true,
    smsAlerts: false,
  });
  const [editingAdmin, setEditingAdmin] = useState(false);
  const [adminDraft, setAdminDraft] = useState({ ...adminProfile });

  const pendingBookings = bookings.filter(b => b.status === 'Pending Approved');
  const liveBookings = bookings.filter(b => b.status === 'Live');
  
  const totalEscrow = bookings.reduce((acc, b) => acc + b.totalCost, 0);

  const ModuleButton = ({ id, label, icon: Icon, alertCount }: { id: ModuleTab, label: string, icon: React.ElementType, alertCount?: number }) => (
    <button
      onClick={() => setActiveModule(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-mono text-caption tracking-widest transition-all ${
        activeModule === id 
          ? 'bg-red-500/10 border border-red-500/30 text-red-400 font-bold' 
          : 'bg-[var(--color-surface)]/50 border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-secondary)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {alertCount !== undefined && alertCount > 0 && (
        <span className="bg-red-500 text-[var(--color-text-primary)] px-2 py-0.5 rounded-full text-caption leading-none">{alertCount}</span>
      )}
    </button>
  );

  return (
    <div id="admin-dashboard" className="max-w-[1240px] mx-auto space-y-6">
      
      {/* Gateway Header */}
      <div className="bg-[var(--color-background)] rounded-2xl p-6 border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Server className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.3em] font-bold block">PLATFORM GATEWAY ACTUATOR</span>
          </div>
          <h3 className="font-semibold text-3xl text-[var(--color-text-primary)] tracking-tight">API Gateway & Modular Monolith</h3>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">Central routing interface for v4.0 (Launch + Scale Ready).</p>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-1">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded font-mono text-caption font-bold tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" />
            ALL SYSTEMS NOMINAL
          </span>
          <span className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest">PostgreSQL Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Module Navigation Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[var(--color-surface)]/50 rounded-2xl p-4 border border-[var(--color-border)] space-y-2">
            <div className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-[0.2em] px-2 mb-4 font-semibold">Core Modules</div>
            
            <ModuleButton id="analytics" label="ANALYTICS MOD" icon={Activity} />
            <ModuleButton id="auth" label="AUTH MOD" icon={Lock} />
            <ModuleButton id="billboards" label="BILLBOARD MOD" icon={MapPin} />
            <ModuleButton id="bookings" label="BOOKING MOD" icon={Layers} alertCount={pendingBookings.length} />
            <ModuleButton id="payments" label="PAYMENT MOD" icon={CreditCard} />
            <ModuleButton id="notifications" label="NOTIFICATION MOD" icon={Bell} />
          </div>

          <div className="bg-[var(--color-surface)]/50 rounded-2xl p-4 border border-[var(--color-border)] space-y-2">
            <div className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-[0.2em] px-2 mb-4 font-semibold">Infrastructure</div>
            <ModuleButton id="system" label="GATEWAY CONFIG" icon={Settings} />
            <ModuleButton id="profile" label="SUPERADMIN PROFILE" icon={User} />
          </div>
        </div>

        {/* Module Detail Area */}
        <div className="md:col-span-3 space-y-6">
          
          {activeModule === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Activity className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                    <span className="font-mono text-caption tracking-widest uppercase">Platform Volume</span>
                  </div>
                  <div className="font-sans text-3xl font-bold text-[var(--color-text-primary)]">${totalEscrow.toLocaleString()}</div>
                  <span className="text-caption font-mono text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.5% vs Last Month</span>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Layers className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                    <span className="font-mono text-caption tracking-widest uppercase">Live Campaigns</span>
                  </div>
                  <div className="font-sans text-3xl font-bold text-[var(--color-text-primary)]">{liveBookings.length}</div>
                  <span className="text-caption font-mono text-[var(--color-text-muted)]">Executing across network</span>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <MapPin className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                    <span className="font-mono text-caption tracking-widest uppercase">Active Nodes</span>
                  </div>
                  <div className="font-sans text-3xl font-bold text-[var(--color-text-primary)]">{billboards.length}</div>
                  <span className="text-caption font-mono text-[var(--color-text-muted)]">Leasable inventory count</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
                <div>
                  <span className="font-mono text-caption text-[var(--color-primary)] uppercase tracking-[0.2em] font-extrabold block">PLATFORM TRANSACTION VOLUME (USD)</span>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Monthly Escrow Flow — June 2026</h4>
                </div>
                <div className="h-[260px] w-full font-mono text-caption">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="#52525b" tickLine={false} axisLine={false} dy={8} />
                      <YAxis stroke="#52525b" tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} dx={-6} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-background)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'monospace', color: '#fff' }}
                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Volume']}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#ef4444" strokeWidth={2} fill="url(#adminGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'auth' && (
            <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] text-lg">Auth Module</h4>
                  <p className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1">JWT verification & role enforcement</p>
                </div>
                <div className="font-mono text-caption px-3 py-1.5 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors cursor-pointer rounded-lg text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold tracking-widest">
                  PROVISION KEY
                </div>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] font-mono text-caption text-[var(--color-text-muted)] tracking-wider">
                    <th className="pb-3 font-normal">USER ID</th>
                    <th className="pb-3 font-normal">ROLE</th>
                    <th className="pb-3 font-normal">STATUS</th>
                    <th className="pb-3 font-normal">LAST IP</th>
                    <th className="pb-3 font-normal text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-caption text-[var(--color-text-secondary)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="py-4">usr_9921</td>
                    <td className="py-4"><span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded">Advertiser</span></td>
                    <td className="py-4 text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Active</td>
                    <td className="py-4 font-mono text-[var(--color-text-muted)]">197.210.64.12</td>
                    <td className="py-4 text-right"><span className="cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">REVOKE</span></td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="py-4">pub_4402</td>
                    <td className="py-4"><span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded">Media Owner</span></td>
                    <td className="py-4 text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Active</td>
                    <td className="py-4 font-mono text-[var(--color-text-muted)]">41.139.141.5</td>
                    <td className="py-4 text-right"><span className="cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">REVOKE</span></td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="py-4 font-bold text-red-300">sys_0001</td>
                    <td className="py-4"><span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded font-bold border border-red-500/20">Administrator</span></td>
                    <td className="py-4 text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> Connected</td>
                    <td className="py-4 font-mono text-[var(--color-text-muted)]">10.0.0.1 (Internal)</td>
                    <td className="py-4 text-right opacity-50">LOCKED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeModule === 'bookings' && (
             <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-6 animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] text-lg flex items-center gap-3">
                    Booking Module
                    {pendingBookings.length > 0 && (
                      <span className="bg-[var(--color-surface)] px-2.5 py-0.5 rounded font-mono text-caption text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                        {pendingBookings.length} PENDING
                      </span>
                    )}
                  </h4>
                  <p className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Transaction lifecycle management</p>
                </div>
             </div>
             
             {pendingBookings.length === 0 ? (
               <div className="text-center py-16 text-[var(--color-text-muted)] font-mono text-xs bg-[var(--color-surface)]/20 rounded-xl border border-[var(--color-border)]">
                 <CheckCircle2 className="w-10 h-10 mx-auto mb-4 opacity-20" />
                 NO PENDING APPROVALS REQUIRED
               </div>
             ) : (
               <div className="space-y-4">
                 {pendingBookings.map((booking) => {
                   const billboard = billboards.find(b => b.id === booking.billboardId);
                   return (
                     <div key={booking.id} className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl p-5 hover:bg-[var(--color-surface-hover)] transition-colors relative overflow-hidden group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                       
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-3">
                         <div className="space-y-2 relative z-10 w-full">
                           <div className="flex items-center justify-between">
                             <div className="font-sans text-lg font-bold text-[var(--color-text-primary)]">{booking.campaignName}</div>
                             <div className="font-mono text-sm text-emerald-400 font-bold">${booking.totalCost.toLocaleString()}</div>
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
                              <div>
                                <span className="block text-caption font-mono text-[var(--color-text-muted)] tracking-widest uppercase mb-1">Target Node</span>
                                <span className="font-mono text-xs text-[var(--color-text-secondary)]">{billboard?.title || booking.billboardId}</span>
                              </div>
                              <div>
                                <span className="block text-caption font-mono text-[var(--color-text-muted)] tracking-widest uppercase mb-1">Client Entity</span>
                                <span className="font-mono text-xs text-[var(--color-text-secondary)]">{booking.clientName}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="block text-caption font-mono text-[var(--color-text-muted)] tracking-widest uppercase mb-1">Execution Window</span>
                                <span className="font-mono text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                                  {booking.startDate} <TrendingUp className="w-3 h-3 text-[var(--color-text-muted)]" /> {booking.endDate}
                                </span>
                              </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-border)] justify-end pl-3 relative z-10">
                         <button className="bg-transparent hover:bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] px-4 py-2 rounded-lg font-mono text-caption tracking-widest font-bold transition-all">
                           VIEW CONTRACT
                         </button>
                         <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-mono text-caption tracking-widest font-bold transition-all cursor-pointer"
                          onClick={() => onUpdateBookingStatus?.(booking.id, 'Rejected')}>
                           REJECT
                         </button>
                         <button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-6 py-2 rounded-lg font-mono text-caption tracking-widest font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-pointer"
                          onClick={() => onUpdateBookingStatus?.(booking.id, 'Live')}>
                           <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
          )}

          {activeModule === 'billboards' && (
            <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-6 animate-in fade-in duration-300 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] text-lg">Billboard Management</h4>
                  <p className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{billboards.length} nodes registered</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] font-mono text-caption text-[var(--color-text-muted)] tracking-wider">
                      <th className="pb-3 font-normal">NODE</th>
                      <th className="pb-3 font-normal">CITY</th>
                      <th className="pb-3 font-normal">FORMAT</th>
                      <th className="pb-3 font-normal text-right">DAILY RATE</th>
                      <th className="pb-3 font-normal text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-caption text-[var(--color-text-secondary)]">
                    {billboards.map(b => (
                      <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/30 transition-colors">
                        <td className="py-4 text-[var(--color-text-primary)] font-bold max-w-[180px] truncate">{b.title}</td>
                        <td className="py-4">{b.city}, {b.country}</td>
                        <td className="py-4 text-[var(--color-text-muted)]">{b.format}</td>
                        <td className="py-4 text-right text-emerald-400 font-bold">${b.dailyRate}/day</td>
                        <td className="py-4 text-right">
                          <span className={`px-2.5 py-1 rounded text-caption font-bold ${
                            b.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                            b.status === 'Fully Booked' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-zinc-500/10 text-zinc-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'payments' && (
            <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-6 animate-in fade-in duration-300 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] text-lg">Payment Module</h4>
                  <p className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Paystack escrow · automated invoicing</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded font-mono text-caption font-bold">GATEWAY LIVE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 rounded-xl">
                  <div className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Escrow Balance</div>
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">${totalEscrow.toLocaleString()}</div>
                </div>
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 rounded-xl">
                  <div className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Platform Commission</div>
                  <div className="text-2xl font-bold text-emerald-400">${Math.round(totalEscrow * 0.15).toLocaleString()}</div>
                  <div className="font-mono text-caption text-[var(--color-text-muted)] mt-1">15% of gross</div>
                </div>
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 rounded-xl">
                  <div className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Vendor Payouts</div>
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">${Math.round(totalEscrow * 0.85).toLocaleString()}</div>
                  <div className="font-mono text-caption text-[var(--color-text-muted)] mt-1">85% to media owners</div>
                </div>
              </div>

              <div>
                <h5 className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Transaction Ledger</h5>
                <div className="space-y-2">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                      <div>
                        <div className="text-xs font-bold text-[var(--color-text-primary)]">{b.campaignName}</div>
                        <div className="text-caption font-mono text-[var(--color-text-muted)] mt-0.5">{b.clientName} · {b.startDate}</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-bold text-emerald-400">${b.totalCost.toLocaleString()}</span>
                        <span className={`text-caption font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          b.status === 'Live' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                          b.status === 'Pending Approved' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                          'border-blue-500/30 text-blue-400 bg-blue-500/10'
                        }`}>{b.status === 'Pending Approved' ? 'Pending' : b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModule === 'notifications' && (
            <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-6 animate-in fade-in duration-300 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] text-lg">Notification & Courier Module</h4>
                  <p className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1">SendGrid (Email) · Hubtel (SMS)</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded font-mono text-caption font-bold">ALL ROUTES UP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">SendGrid Email</div>
                    <div className="text-caption font-mono text-emerald-400 mt-0.5">● Connected · 99.9% delivery</div>
                  </div>
                </div>
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">Hubtel SMS</div>
                    <div className="text-caption font-mono text-emerald-400 mt-0.5">● Connected · GH/NG/KE</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Recent Dispatch Log</h5>
                <div className="space-y-2 font-mono text-caption">
                  {[
                    { type: 'email', event: 'Booking confirmation sent', recipient: 'sora@dynamics.co', time: '2 min ago', ok: true },
                    { type: 'sms', event: 'Booking approved alert', recipient: '+233 50 123 4567', time: '5 min ago', ok: true },
                    { type: 'email', event: 'Invoice INV-4401 delivered', recipient: 'billing@globalbrands.com', time: '18 min ago', ok: true },
                    { type: 'email', event: 'New vendor registration', recipient: 'admin@vantagepoint.com', time: '1 hour ago', ok: true },
                    { type: 'sms', event: 'Campaign live alert', recipient: '+234 81 987 6543', time: '2 hours ago', ok: true },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                        {n.type === 'email'
                          ? <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          : <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        <div>
                          <div className="text-[var(--color-text-primary)]">{n.event}</div>
                          <div className="text-[var(--color-text-muted)] text-caption mt-0.5">{n.recipient}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[var(--color-text-muted)]">{n.time}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModule === 'system' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-[var(--color-black)] border border-[var(--color-border)] rounded-2xl p-6 font-mono text-xs">
                 <h4 className="font-semibold text-[var(--color-text-primary)] text-lg mb-4 flex items-center gap-2">
                   <Settings className="w-5 h-5" /> Gateway Configurations
                 </h4>
                 
                 <div className="space-y-3">
                   <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)]">Rate Limiting (windowMs)</span>
                     <span className="text-emerald-400">15 * 60 * 1000</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)]">Rate Limiting (Max Req)</span>
                     <span className="text-emerald-400">100 / window</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)]">JWT Authentication Mode</span>
                     <span className="text-[var(--color-text-primary)]">Strict/Bearer</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)]">Database Engine</span>
                     <span className="text-[var(--color-text-primary)]">PostgreSQL (Prisma)</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)]">CI/CD Pipeline Status</span>
                     <span className="text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> passing</span>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {activeModule === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="glass-panel border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Shield className="w-32 h-32 text-indigo-500" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center p-1">
                      <div className="w-full h-full bg-[var(--color-background)] rounded-xl flex items-center justify-center">
                        <User className="w-12 h-12 text-indigo-400" />
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono text-caption uppercase font-bold tracking-widest">
                      LEVEL 5 CLEARANCE
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    {editingAdmin ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Display Name</label>
                            <input type="text" value={adminDraft.name} onChange={e => setAdminDraft(d => ({ ...d, name: e.target.value }))}
                              className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-indigo-400 transition-colors font-sans" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Title / Role</label>
                            <input type="text" value={adminDraft.title} onChange={e => setAdminDraft(d => ({ ...d, title: e.target.value }))}
                              className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-indigo-400 transition-colors font-sans" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Email Address</label>
                            <input type="email" value={adminDraft.email} onChange={e => setAdminDraft(d => ({ ...d, email: e.target.value }))}
                              className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-indigo-400 transition-colors font-sans" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-widest block font-bold">Phone Number</label>
                            <input type="tel" value={adminDraft.phone} onChange={e => setAdminDraft(d => ({ ...d, phone: e.target.value }))}
                              className="w-full bg-[var(--color-surface)]/60 border border-[var(--color-border)] p-2.5 rounded-lg text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-indigo-400 transition-colors font-sans" />
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                          <h4 className="text-caption font-mono text-[#d2ff00] uppercase tracking-widest font-bold">Security & Notifications</h4>
                          {([
                            { key: 'twoFA', label: '2FA Authentication', desc: 'Require hardware key on login' },
                            { key: 'emailAlerts', label: 'Email Alerts', desc: 'System notifications via email' },
                            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
                          ] as { key: 'twoFA' | 'emailAlerts' | 'smsAlerts'; label: string; desc: string }[]).map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                              <div>
                                <div className="text-xs font-semibold text-[var(--color-text-primary)]">{label}</div>
                                <div className="text-caption font-mono text-[var(--color-text-muted)]">{desc}</div>
                              </div>
                              <button type="button" role="switch" aria-checked={adminDraft[key]}
                                onClick={() => setAdminDraft(d => ({ ...d, [key]: !d[key] }))}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${adminDraft[key] ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${adminDraft[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button type="button" onClick={() => { setAdminProfile({ ...adminDraft }); setEditingAdmin(false); }}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                            Save Changes
                          </button>
                          <button type="button" onClick={() => { setAdminDraft({ ...adminProfile }); setEditingAdmin(false); }}
                            className="flex-1 py-3 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">{adminProfile.name}</h2>
                          <p className="text-sm font-mono text-[var(--color-text-secondary)] mt-1">{adminProfile.title}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                          <div className="space-y-4">
                            <h4 className="text-xs font-mono font-bold text-[#d2ff00] uppercase tracking-widest">Security Profile</h4>
                            <div className="space-y-2 font-mono text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Access Role</span>
                                <span className="text-[var(--color-text-primary)]">SUPER_ADMIN</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Email</span>
                                <span className="text-[var(--color-text-primary)]">{adminProfile.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Phone</span>
                                <span className="text-[var(--color-text-primary)]">{adminProfile.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">2FA Status</span>
                                <span className={adminProfile.twoFA ? 'text-emerald-400' : 'text-red-400'}>
                                  {adminProfile.twoFA ? 'ENABLED (Hardware Key)' : 'DISABLED'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Last Login (IP)</span>
                                <span className="text-[var(--color-text-primary)]">192.168.1.42</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Session ID</span>
                                <span className="text-[var(--color-text-secondary)] blur-sm hover:blur-none transition-all cursor-crosshair">x8f9...2a1b</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-mono font-bold text-[#d2ff00] uppercase tracking-widest">Notifications</h4>
                            <div className="space-y-2 font-mono text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Email Alerts</span>
                                <span className={adminProfile.emailAlerts ? 'text-emerald-400' : 'text-zinc-500'}>{adminProfile.emailAlerts ? 'Enabled' : 'Disabled'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">SMS Alerts</span>
                                <span className={adminProfile.smsAlerts ? 'text-emerald-400' : 'text-zinc-500'}>{adminProfile.smsAlerts ? 'Enabled' : 'Disabled'}</span>
                              </div>
                            </div>

                            <h4 className="text-xs font-mono font-bold text-[#d2ff00] uppercase tracking-widest mt-4">Audit Trail</h4>
                            <div className="space-y-2 font-mono text-caption">
                              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2 rounded flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">Changed system.rateLimit</span>
                                <span className="text-[var(--color-text-muted)]">2 mins ago</span>
                              </div>
                              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2 rounded flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">Approved Vendor #4928</span>
                                <span className="text-[var(--color-text-muted)]">1 hour ago</span>
                              </div>
                              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2 rounded flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">System Backup Initiated</span>
                                <span className="text-[var(--color-text-muted)]">6 hours ago</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => { setAdminDraft({ ...adminProfile }); setEditingAdmin(true); }}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                            Edit Profile
                          </button>
                          <button type="button"
                            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                            Revoke All Sessions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
