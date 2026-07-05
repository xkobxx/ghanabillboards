import React from 'react';
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import App from '../App';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('App Routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders landing page on / route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Regional Discovery Grid')).toBeInTheDocument();
    expect(screen.getByText('Traditional OOH is broken')).toBeInTheDocument();
  });

  it('renders Blueprint page on /blueprint route', () => {
    render(
      <MemoryRouter initialEntries={['/blueprint']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('INFRASTRUCTURE SUMMARY')).toBeInTheDocument();
    expect(screen.getByText('Behind the Platform')).toBeInTheDocument();
  });

  it('renders Investor page on /investor route', () => {
    render(
      <MemoryRouter initialEntries={['/investor']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/SERIES A STRATEGY DECK/)).toBeInTheDocument();
  });

  it('renders Developer page on /developer route', () => {
    render(
      <MemoryRouter initialEntries={['/developer']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/GATEWAY STREAM/)).toBeInTheDocument();
  });

  it('renders auth gate on /buyer route when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/buyer']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('SECURITY CLEARANCE BLOCKED')).toBeInTheDocument();
    expect(screen.getByText('Buyer Hub Locked')).toBeInTheDocument();
  });

  it('renders auth gate on /publisher route when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/publisher']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('PUBLISHER RESTRICTION')).toBeInTheDocument();
    expect(screen.getByText('Publisher Dashboard Locked')).toBeInTheDocument();
  });

  it('renders auth gate on /admin route when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('SECURE DISPATCH CENTER')).toBeInTheDocument();
    expect(screen.getByText('Administrator Console Locked')).toBeInTheDocument();
  });

  it('blocks a buyer account from publisher and admin workspaces', () => {
    localStorage.setItem('vantage_current_user', JSON.stringify({
      id: 'usr_buy',
      email: 'buyer@example.com',
      name: 'Example Buyer',
      role: 'buyer',
      company: 'Example Brands',
    }));

    render(
      <MemoryRouter initialEntries={['/publisher']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Publisher access required')).toBeInTheDocument();
    expect(screen.queryByText('Publisher Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('provides an accessible compact navigation menu', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Navigation menu' })).toBeInTheDocument();
  });

  it('exposes buyer workspace navigation as accessible tabs', () => {
    localStorage.setItem('vantage_current_user', JSON.stringify({
      id: 'usr_buy',
      email: 'buyer@example.com',
      name: 'Example Buyer',
      role: 'buyer',
      company: 'Example Brands',
    }));

    render(
      <MemoryRouter initialEntries={['/buyer']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('tablist', { name: 'Buyer workspace' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens billboard creation as a labelled dialog', async () => {
    const user = userEvent.setup();
    localStorage.setItem('vantage_current_user', JSON.stringify({
      id: 'usr_pub',
      email: 'publisher@example.com',
      name: 'Example Publisher',
      role: 'publisher',
      company: 'Example Media',
    }));

    render(
      <MemoryRouter initialEntries={['/publisher']}>
        <ThemeProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Add billboard' }));

    expect(screen.getByRole('dialog', { name: 'List new billboard' })).toBeInTheDocument();
  });
});
