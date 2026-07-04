import { describe, expect, it } from 'vitest';
import {
  intervalsOverlap,
  isValidInterval,
  toBookingInterval,
} from '../../server/lib/bookingSchedule';

describe('booking schedule intervals', () => {
  it('normalizes legacy date-only bookings to UTC boundaries', () => {
    const interval = toBookingInterval({
      startDate: '2026-07-04',
      endDate: '2026-07-06',
    });

    expect(interval.startAt.toISOString()).toBe('2026-07-04T00:00:00.000Z');
    expect(interval.endAt.toISOString()).toBe('2026-07-06T00:00:00.000Z');
  });

  it('normalizes offset time slots to UTC', () => {
    const interval = toBookingInterval({
      startDate: '2026-07-04',
      endDate: '2026-07-04',
      startAt: '2026-07-04T09:00:00+01:00',
      endAt: '2026-07-04T12:30:00+01:00',
    });

    expect(interval.startAt.toISOString()).toBe('2026-07-04T08:00:00.000Z');
    expect(interval.endAt.toISOString()).toBe('2026-07-04T11:30:00.000Z');
    expect(isValidInterval(interval)).toBe(true);
  });

  it('treats adjacent half-open slots as available', () => {
    const first = {
      startAt: new Date('2026-07-04T09:00:00Z'),
      endAt: new Date('2026-07-04T10:00:00Z'),
    };
    const adjacent = {
      startAt: new Date('2026-07-04T10:00:00Z'),
      endAt: new Date('2026-07-04T11:00:00Z'),
    };

    expect(intervalsOverlap(first, adjacent)).toBe(false);
  });

  it('detects partial and contained overlaps', () => {
    const existing = {
      startAt: new Date('2026-07-04T09:00:00Z'),
      endAt: new Date('2026-07-04T12:00:00Z'),
    };

    expect(intervalsOverlap(existing, {
      startAt: new Date('2026-07-04T11:00:00Z'),
      endAt: new Date('2026-07-04T13:00:00Z'),
    })).toBe(true);
    expect(intervalsOverlap(existing, {
      startAt: new Date('2026-07-04T10:00:00Z'),
      endAt: new Date('2026-07-04T11:00:00Z'),
    })).toBe(true);
  });
});
