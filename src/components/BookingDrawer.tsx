import React, { useEffect, useState } from 'react';
import { Billboard, Booking } from '../types';
import { X, ShieldCheck, Building2, Check, CreditCard, Receipt, Clock3, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AvailabilityCalendar from './AvailabilityCalendar';
import { getBillboardAvailability } from '../lib/availabilityApi';

interface BookingDrawerProps {
  billboard: Billboard | null;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function localDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export default function BookingDrawer({ billboard, onClose, onConfirmBooking }: BookingDrawerProps) {
  const [campaignName, setCampaignName] = useState('');
  const [clientName, setClientName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(() => daysFromNow(14));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [activeBoundary, setActiveBoundary] = useState<'start' | 'end'>('start');
  const [dateError, setDateError] = useState('');
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [receiptCode, setReceiptCode] = useState('');

  useEffect(() => {
    if (!billboard) {
      setAvailabilityState('idle');
      return;
    }

    const startAt = localDateTime(startDate, startTime);
    const endAt = localDateTime(endDate, endTime);
    if (
      startDate < todayStr()
      || !Number.isFinite(startAt.getTime())
      || !Number.isFinite(endAt.getTime())
      || endAt <= startAt
    ) {
      setAvailabilityState('idle');
      return;
    }

    const controller = new AbortController();
    setAvailabilityState('checking');
    getBillboardAvailability(billboard.id, startAt, endAt, controller.signal)
      .then((result) => setAvailabilityState(result.available ? 'available' : 'unavailable'))
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        setAvailabilityState('error');
      });

    return () => controller.abort();
  }, [billboard, startDate, startTime, endDate, endTime]);

  if (!billboard) return null;

  // Calculate day difference
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalCost = calculatedDays * billboard.dailyRate;

  // Process transaction sequence
  const handleInitiatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !clientName) return;
    if (startDate < todayStr()) { setDateError('Start date cannot be in the past.'); return; }
    const startAt = localDateTime(startDate, startTime);
    const endAt = localDateTime(endDate, endTime);
    if (endAt <= startAt) { setDateError('Campaign end must be after its start.'); return; }
    if (availabilityState !== 'available') {
      setDateError(
        availabilityState === 'unavailable'
          ? 'That time is already reserved. Select another slot.'
          : 'Live availability must be confirmed before booking.',
      );
      return;
    }
    setDateError('');

    setCheckoutStep('processing');

    setTimeout(() => {
      // Create final invoice code
      const uniqueCode = `INV-${billboard.id.toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`;
      setReceiptCode(uniqueCode);
      setCheckoutStep('success');

      // Dispatch booking state back
      const confirmedBooking: Booking = {
        id: `bkg-${Date.now()}`,
        billboardId: billboard.id,
        startDate,
        endDate,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        campaignName,
        clientName,
        slogan: slogan || undefined,
        totalCost,
        status: 'Pending Approved'
      };
      
      onConfirmBooking(confirmedBooking);
    }, 2200); // Cinematic latency simulation
  };

  const handleReset = () => {
    setCampaignName('');
    setClientName('');
    setSlogan('');
    setDateError('');
    setStartDate(todayStr());
    setEndDate(daysFromNow(14));
    setStartTime('09:00');
    setEndTime('17:00');
    setActiveBoundary('start');
    setAvailabilityState('idle');
    setCheckoutStep('form');
    onClose();
  };

  const handleCalendarDate = (date: string) => {
    setDateError('');
    if (activeBoundary === 'start') {
      setStartDate(date);
      if (endDate < date) setEndDate(date);
      setActiveBoundary('end');
      return;
    }

    if (date < startDate) {
      setDateError('End date cannot be before the start date.');
      return;
    }
    setEndDate(date);
    setActiveBoundary('start');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] overflow-hidden flex justify-end">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="absolute inset-0 bg-[var(--color-surface)]/60 backdrop-blur-md"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 22, stiffness: 100 }}
          className="relative w-full max-w-2xl bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full flex flex-col justify-between overflow-hidden z-10 shadow-2xl"
        >
          {/* Header Panel */}
          <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
            <div>
              <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.3em] block">SEGMENT DISPATCH GATEWAY</span>
              <h3 className="font-semibold text-xl text-[var(--color-text-primary)] uppercase tracking-tight">Programmatic Schedule</h3>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
            
            {/* Target Billboard Overview Node */}
            <div className="bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] flex gap-4 items-center">
              <img
                src={billboard.imageUrl}
                alt={billboard.title}
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-cover border border-[var(--color-border)]"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-surface)]/50 w-max block border border-[var(--color-border)]">
                  {billboard.format}
                </span>
                <h4 className="font-semibold text-[var(--color-text-primary)] truncate text-base uppercase tracking-tight">{billboard.title}</h4>
                <p className="text-[var(--color-text-secondary)] text-xs truncate">{billboard.location}</p>
                <div className="font-mono text-caption text-[var(--color-text-muted)] flex items-center gap-3 pt-1">
                  <span>DIM: {billboard.dimensions}</span>
                  <span>RATE: ${billboard.dailyRate}/DAY</span>
                </div>
              </div>
            </div>

            {/* Step-based Content Switching */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleInitiatePayout} className="space-y-6">
                <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.2em] block">CAMPAIGN SPECIFICATIONS</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-camp-name" className="block font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-semibold">
                      CAMPAIGN NAME
                    </label>
                    <input
                      id="drawer-camp-name"
                      type="text"
                      required
                      placeholder="e.g. Summer FinTech Expo"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans"
                    />
                  </div>

                  {/* Brand / Client Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-client-name" className="block font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-semibold">
                      ORGANIZATION / BRAND
                    </label>
                    <input
                      id="drawer-client-name"
                      type="text"
                      required
                      placeholder="e.g. Paystack Corp Ghana"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Creative Slogan */}
                <div className="space-y-1.5">
                  <label htmlFor="drawer-slogan" className="block font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-semibold">
                    CAMPAIGN SLOGAN <span style={{ opacity: 0.5 }}>(optional)</span>
                  </label>
                  <input
                    id="drawer-slogan"
                    type="text"
                    placeholder="e.g. Reach the Summit of Visual Distinction"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="font-mono text-caption font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                        Campaign window
                      </span>
                      <p className="mt-1 text-body-xs text-[var(--color-text-muted)]">
                        Choose the dates, then set precise local times.
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-caption text-[var(--color-text-muted)]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setActiveBoundary('start')}
                      className={`bg-[var(--color-surface)] p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                        activeBoundary === 'start' ? 'shadow-[inset_0_-2px_0_var(--color-primary)]' : ''
                      }`}
                    >
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        Starts
                      </span>
                      <strong className="mt-1 block text-sm font-semibold text-[var(--color-text-primary)]">
                        {new Date(`${startDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBoundary('end')}
                      className={`bg-[var(--color-surface)] p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                        activeBoundary === 'end' ? 'shadow-[inset_0_-2px_0_var(--color-primary)]' : ''
                      }`}
                    >
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        Ends
                      </span>
                      <strong className="mt-1 block text-sm font-semibold text-[var(--color-text-primary)]">
                        {new Date(`${endDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </strong>
                    </button>
                  </div>

                  <AvailabilityCalendar
                    billboardId={billboard.id}
                    selectedStart={startDate}
                    selectedEnd={endDate}
                    activeBoundary={activeBoundary}
                    onSelectDate={handleCalendarDate}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="drawer-start-time" className="block font-mono text-caption font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        Start time
                      </label>
                      <input
                        id="drawer-start-time"
                        type="time"
                        required
                        value={startTime}
                        onChange={(event) => { setStartTime(event.target.value); setDateError(''); }}
                        className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 font-mono text-sm text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-primary)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="drawer-end-time" className="block font-mono text-caption font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        End time
                      </label>
                      <input
                        id="drawer-end-time"
                        type="time"
                        required
                        value={endTime}
                        onChange={(event) => { setEndTime(event.target.value); setDateError(''); }}
                        className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 font-mono text-sm text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div
                    className="flex min-h-10 items-center gap-2 border-l-2 px-3 text-body-xs"
                    style={{
                      borderColor:
                        availabilityState === 'available'
                          ? 'var(--color-success)'
                          : availabilityState === 'unavailable' || availabilityState === 'error'
                            ? 'var(--color-error)'
                            : 'var(--color-border-strong)',
                      color: 'var(--color-text-secondary)',
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    {availabilityState === 'checking' ? (
                      <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Checking live inventory…</>
                    ) : availabilityState === 'available' ? (
                      <><Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> This time slot is available.</>
                    ) : availabilityState === 'unavailable' ? (
                      <><X className="h-3.5 w-3.5 text-[var(--color-error)]" /> This time overlaps an existing reservation.</>
                    ) : availabilityState === 'error' ? (
                      <><X className="h-3.5 w-3.5 text-[var(--color-error)]" /> Live availability could not be verified.</>
                    ) : (
                      <>Set an end time after the campaign start.</>
                    )}
                  </div>
                </div>

                {dateError && (
                  <p className="text-xs font-mono" style={{ color: '#f87171' }}>{dateError}</p>
                )}

                {/* Value Sum card */}
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-[var(--color-text-secondary)] uppercase tracking-[0.1em]">Dynamic Budget Evaluation:</span>
                    <span className="font-mono text-body-xs text-[var(--color-text-secondary)]">{calculatedDays} campaigning days</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-sans text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Total Programmatic Escrow Amount:</span>
                    <span className="text-3xl font-sans font-light text-[var(--color-text-primary)] tracking-tight">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Terms notification warning */}
                <div className="p-4 bg-[var(--color-surface)]/50 border border-[var(--color-border)] text-caption text-[var(--color-text-secondary)] leading-relaxed font-sans flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
                  <p>
                    By clicking dispatch, you approve the escrow initialization. Payment is held securely under 
                    African OOH Escrow Standard rules. 100% payout occurs upon continuous hardware telemetry confirmation.
                  </p>
                </div>

                {/* Form action button container */}
                <button
                  type="submit"
                  disabled={availabilityState !== 'available'}
                  className="w-full cursor-pointer bg-[var(--color-primary)] py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {availabilityState === 'checking' ? 'VERIFYING LIVE INVENTORY' : 'AUTHORIZE ESCROW DISPATCH'}
                </button>
              </form>
            )}

            {/* Loading / Handshake Animation Step */}
            {checkoutStep === 'processing' && (
              <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-t-2 border-b-2 border-[var(--color-border)] animate-spin" />
                  <CreditCard className="w-5 h-5 text-[var(--color-text-secondary)] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <span className="font-mono text-caption text-[var(--color-text-secondary)] tracking-[0.3em] block uppercase animate-pulse">
                    Securing API Connection Sequence
                  </span>
                  <h4 className="font-light text-xl text-[var(--color-text-primary)] uppercase tracking-tight">Negotiating Escrow Parameters...</h4>
                  <ul className="text-xs text-[var(--color-text-muted)] font-mono space-y-2 max-w-sm mx-auto text-left pt-6 border-t border-[var(--color-border)] mt-4">
                    <li className="flex items-center gap-2">▪ <span className="text-[var(--color-text-secondary)]">CONNECTING TO GATEWAY [4000]</span></li>
                    <li className="flex items-center gap-2">▪ <span className="text-[var(--color-text-secondary)]">SIGNING HEADERS WEBSOCKET</span></li>
                    <li className="flex items-center gap-2">▪ <span className="text-[var(--color-text-muted)]">INJECTING INTEGRATION PAYSTACK REFERENCE</span></li>
                  </ul>
                </div>
              </div>
            )}

            {/* Success Invoice Receipt Step */}
            {checkoutStep === 'success' && (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-[var(--color-surface)]/50 border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-text-primary)] mb-2">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-2xl text-[var(--color-text-primary)] uppercase tracking-tight">Scheduled Successfully!</h4>
                  <p className="text-caption text-[var(--color-text-secondary)] font-mono uppercase tracking-[0.2em]">TRANSACTION ESCROW COMPLETED</p>
                </div>

                {/* Printable Invoice Certificate Card */}
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-6 space-y-5 font-mono text-xs relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-[0.02]">
                    <Receipt className="w-24 h-24 text-[var(--color-text-primary)]" />
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-sans font-semibold text-xs tracking-wider">
                      <Building2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      <span>OOH EXCHANGE RECEIPT</span>
                    </div>
                    <span className="text-[var(--color-text-primary)] font-mono text-body-xs font-semibold tracking-wider">{receiptCode}</span>
                  </div>

                  <div className="space-y-2.5 text-body-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">CLIENT AGENCY:</span>
                      <span className="text-[var(--color-text-secondary)]">{clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">CAMPAIGN INITIATIVE:</span>
                      <span className="text-[var(--color-text-secondary)]">"{campaignName}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">HARDWARE LOCATOR:</span>
                      <span className="text-[var(--color-text-secondary)]">{billboard.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">CITY NODE DETECTED:</span>
                      <span className="text-[var(--color-text-primary)]">{billboard.city}, {billboard.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">DURATION PERIOD:</span>
                      <span className="text-[var(--color-text-primary)] font-semibold">
                        {startDate} {startTime} to {endDate} {endTime} ({calculatedDays} Days)
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4 flex justify-between items-end font-sans">
                    <span className="text-caption text-[var(--color-text-secondary)] uppercase tracking-wider">Settled Funds Escrow Base:</span>
                    <span className="text-2xl font-light text-[var(--color-text-primary)] font-mono">${totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-4 border border-[var(--color-border-hover)] text-[var(--color-text-primary)] font-sans font-bold text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-colors cursor-pointer"
                  >
                    RETURN TO MAP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="py-4 px-6 bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-sans font-bold text-xs tracking-[0.2em] uppercase hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    PRINT
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Panel */}
          <div className="p-4 bg-[var(--color-surface)]/60 border-t border-[var(--color-border)] text-center text-caption text-[var(--color-text-muted)] font-mono uppercase tracking-[0.3em]">
            NODE IDENTITY SECURED BY JWT // {billboard.city.toUpperCase()}-[CORE]
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
