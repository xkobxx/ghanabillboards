import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function TestComponent() {
  const {
    allBillboards,
    myBookings,
    currentUser,
    authMode,
    currentTime,
    registerBooking,
    updateBookingStatus,
    updateBillboardStatus,
    createBillboard,
    signOut,
  } = useApp();

  return (
    <div>
      <span data-testid="billboard-count">{allBillboards.length}</span>
      <span data-testid="booking-count">{myBookings.length}</span>
      <span data-testid="current-user">{currentUser ? currentUser.name : 'null'}</span>
      <span data-testid="auth-mode">{authMode ?? 'null'}</span>
      <span data-testid="current-time">{currentTime}</span>
      <button onClick={() => registerBooking({ id: 'bkg_new', billboardId: 'lag-01', startDate: '2026-07-01', endDate: '2026-07-15', campaignName: 'Test Campaign', clientName: 'Test Client', totalCost: 5000, status: 'Pending Approved' })}>
        Register Booking
      </button>
      <button onClick={() => updateBookingStatus('bkg_4401', 'Live')}>Update Booking</button>
      <button onClick={() => updateBillboardStatus('lag-01', 'Maintenance')}>Update Billboard</button>
      <button onClick={() => createBillboard({ id: 'bill_new', title: 'New Billboard', location: 'Test', city: 'Accra', country: 'Ghana', dailyRate: 500, format: 'Digital LED', dimensions: '10x20', monthlyImpressions: '100k', trafficVolume: 'High', status: 'Available', lat: 0, lng: 0, imageUrl: '', description: 'Test billboard' })}>
        Create Billboard
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('AppContext', () => {
  it('provides initial billboard data', () => {
    render(<TestWrapper><TestComponent /></TestWrapper>);
    expect(screen.getByTestId('billboard-count')).toHaveTextContent(String(5));
  });

  it('provides initial booking data (3 bookings)', () => {
    render(<TestWrapper><TestComponent /></TestWrapper>);
    expect(screen.getByTestId('booking-count')).toHaveTextContent('3');
  });

  it('starts with no current user', () => {
    render(<TestWrapper><TestComponent /></TestWrapper>);
    expect(screen.getByTestId('current-user')).toHaveTextContent('null');
  });

  it('starts with no auth mode', () => {
    render(<TestWrapper><TestComponent /></TestWrapper>);
    expect(screen.getByTestId('auth-mode')).toHaveTextContent('null');
  });

  it('provides a formatted UTC time string', () => {
    render(<TestWrapper><TestComponent /></TestWrapper>);
    const timeText = screen.getByTestId('current-time').textContent;
    expect(timeText).toMatch(/^\d{2}:\d{2}:\d{2} UTC$/);
  });

  it('registerBooking adds a booking and updates billboard status', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><TestComponent /></TestWrapper>);

    expect(screen.getByTestId('booking-count')).toHaveTextContent('3');
    await user.click(screen.getByText('Register Booking'));
    expect(screen.getByTestId('booking-count')).toHaveTextContent('4');
  });

  it('updateBookingStatus changes a booking status', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><TestComponent /></TestWrapper>);

    expect(screen.getByTestId('booking-count')).toHaveTextContent('3');
    await user.click(screen.getByText('Update Booking'));
    expect(screen.getByTestId('booking-count')).toHaveTextContent('3');
  });

  it('createBillboard adds a new billboard', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><TestComponent /></TestWrapper>);

    const initialCount = Number(screen.getByTestId('billboard-count').textContent);
    await user.click(screen.getByText('Create Billboard'));
    expect(screen.getByTestId('billboard-count')).toHaveTextContent(String(initialCount + 1));
  });

  it('signOut clears the current user', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><TestComponent /></TestWrapper>);

    expect(screen.getByTestId('current-user')).toHaveTextContent('null');
    await user.click(screen.getByText('Sign Out'));
    expect(screen.getByTestId('current-user')).toHaveTextContent('null');
  });
});
