import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import {
  getBillboardAvailability,
  type AvailabilitySlot,
} from '../lib/availabilityApi';

interface AvailabilityCalendarProps {
  billboardId: string;
  selectedStart: string;
  selectedEnd: string;
  activeBoundary: 'start' | 'end';
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - leading);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function slotTouchesDate(slot: AvailabilitySlot, date: Date) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return new Date(slot.startAt) < dayEnd && new Date(slot.endAt) > dayStart;
}

export default function AvailabilityCalendar({
  billboardId,
  selectedStart,
  selectedEnd,
  activeBoundary,
  onSelectDate,
}: AvailabilityCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedStart ? new Date(`${selectedStart}T12:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    setState('loading');

    getBillboardAvailability(billboardId, monthStart, monthEnd, controller.signal)
      .then((result) => {
        setSlots(result.bookedSlots);
        setState('ready');
      })
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        setSlots([]);
        setState('error');
      });

    return () => controller.abort();
  }, [billboardId, visibleMonth]);

  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const today = dateKey(new Date());
  const label = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      aria-label="Billboard availability calendar"
      className="border-y border-[var(--color-border)] py-5"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-caption uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Live inventory window
          </p>
          <h5 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
            {label}
          </h5>
        </div>
        <div className="flex border border-[var(--color-border)]">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="border-l border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7" role="grid" aria-label={label}>
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            role="columnheader"
            className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
          >
            {weekday}
          </div>
        ))}
        {days.map((date) => {
          const key = dateKey(date);
          const inMonth = date.getMonth() === visibleMonth.getMonth();
          const isPast = key < today;
          const isStart = key === selectedStart;
          const isEnd = key === selectedEnd;
          const inRange = Boolean(selectedStart && selectedEnd && key > selectedStart && key < selectedEnd);
          const hasBooking = slots.some((slot) => slotTouchesDate(slot, date));

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              disabled={isPast || !inMonth}
              aria-label={`${date.toLocaleDateString(undefined, { dateStyle: 'long' })}${hasBooking ? ', has reserved time' : ''}`}
              aria-selected={isStart || isEnd}
              onClick={() => onSelectDate(key)}
              className={[
                'relative min-h-10 border-t border-[var(--color-border)] text-sm transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]',
                !inMonth || isPast
                  ? 'cursor-not-allowed text-[var(--color-disabled-text)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
                inRange ? 'bg-[var(--color-primary-focus)]' : '',
                isStart || isEnd
                  ? 'bg-[var(--color-primary)] font-semibold text-[var(--color-text-inverse)]'
                  : '',
              ].join(' ')}
            >
              <span>{date.getDate()}</span>
              {hasBooking && inMonth ? (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    isStart || isEnd ? 'bg-[var(--color-text-inverse)]' : 'bg-[var(--color-warning)]'
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex min-h-5 items-center justify-between gap-3 text-caption text-[var(--color-text-muted)]">
        <span>
          Selecting campaign {activeBoundary === 'start' ? 'start' : 'end'} date
        </span>
        {state === 'loading' ? (
          <span className="flex items-center gap-1.5" role="status">
            <LoaderCircle className="h-3 w-3 animate-spin" /> Loading schedule
          </span>
        ) : state === 'error' ? (
          <span role="status" className="text-[var(--color-error-text)]">
            Live schedule unavailable
          </span>
        ) : (
          <span><i className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]" />Reserved time</span>
        )}
      </div>
    </section>
  );
}
