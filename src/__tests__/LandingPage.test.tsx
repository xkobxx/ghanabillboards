import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import LandingPage from '../pages/LandingPage';

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  it('renders hero section with headline', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    const heroHeadline = screen.getByRole('heading', { level: 1, name: /Book billboard/ });
    expect(heroHeadline).toBeInTheDocument();
  });

  it('renders eyebrow badge', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    const badges = screen.getAllByText('Unified OOH Advertising Terminal');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders hero description text', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    const desc = screen.getByText((content) => content.startsWith('A map-first marketplace for discovering'));
    expect(desc).toBeInTheDocument();
  });

  it('renders the marketplace section', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByText('Regional Discovery Grid')).toBeInTheDocument();
  });

  it('renders the platform section with role cards', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByText('What is Vantage Point')).toBeInTheDocument();
    expect(screen.getByText(/For advertisers, vendors, and operators/)).toBeInTheDocument();
  });

  it('renders the flow section', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByText('Advertiser flow')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    const bookBtn = screen.getByText('Start Booking Campaign');
    expect(bookBtn).toBeInTheDocument();
    expect(bookBtn.closest('a')).toHaveAttribute('href', '#booking');
  });

  it('does not render dashboard components', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.queryByText('SECURITY CLEARANCE BLOCKED')).not.toBeInTheDocument();
    expect(screen.queryByText('PUBLISHER RESTRICTION')).not.toBeInTheDocument();
    expect(screen.queryByText('SECURE DISPATCH CENTER')).not.toBeInTheDocument();
    expect(screen.queryByText('INFRASTRUCTURE SUMMARY')).not.toBeInTheDocument();
    expect(screen.queryByText('INVESTOR DECK')).not.toBeInTheDocument();
    expect(screen.queryByText('API GATEWAY MONITOR')).not.toBeInTheDocument();
  });
});
