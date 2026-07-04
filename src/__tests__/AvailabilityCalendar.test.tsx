import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AvailabilityCalendar', () => {
  it('loads reserved slots and emits selected dates', async () => {
    const onSelectDate = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      billboardId: 'acc-01',
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-08-01T00:00:00.000Z',
      available: false,
      reason: 'booked',
      bookedSlots: [{
        id: 'booking-1',
        startAt: '2026-07-07T09:00:00.000Z',
        endAt: '2026-07-07T11:00:00.000Z',
        status: 'Live',
      }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AvailabilityCalendar
        billboardId="acc-01"
        selectedStart="2026-07-06"
        selectedEnd="2026-07-10"
        activeBoundary="end"
        onSelectDate={onSelectDate}
      />,
    );

    expect(await screen.findByRole('gridcell', {
      name: /July 7, 2026, has reserved time/i,
    })).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    await userEvent.click(screen.getByRole('gridcell', {
      name: /July 8, 2026/i,
    }));
    expect(onSelectDate).toHaveBeenCalledWith('2026-07-08');
  });

  it('surfaces availability loading failures without disabling date selection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(
      <AvailabilityCalendar
        billboardId="acc-01"
        selectedStart="2026-07-06"
        selectedEnd="2026-07-10"
        activeBoundary="start"
        onSelectDate={() => undefined}
      />,
    );

    expect(await screen.findByText('Live schedule unavailable')).toBeInTheDocument();
    expect(screen.getByRole('gridcell', {
      name: /July 8, 2026/i,
    })).toBeEnabled();
  });
});
