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
    const heroHeadline = screen.getByRole('heading', {
      level: 1,
      name: /Find and book billboards across Africa in under 5 minutes/i,
    });
    expect(heroHeadline).toBeInTheDocument();
  });

  it('renders eyebrow badge', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByText("Africa's out-of-home marketplace")).toBeInTheDocument();
  });

  it('renders hero description text', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    const desc = screen.getByText((content) => content.startsWith('The first unified marketplace for outdoor advertising'));
    expect(desc).toBeInTheDocument();
  });

  it('renders the marketplace section', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByRole('region', { name: 'Live billboard inventory' })).toBeInTheDocument();
  });

  it('renders the platform section with role cards', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByRole('heading', { name: 'Pick the workspace that matches your role.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book inventory/ })).toHaveAttribute('href', '/booking');
    expect(screen.getByRole('link', { name: /List locations/ })).toHaveAttribute('href', '/publisher');
  });

  it('renders the flow section', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByRole('heading', { name: 'Discover, price, schedule, operate.' })).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<TestWrapper><LandingPage /></TestWrapper>);
    expect(screen.getByRole('heading', { name: "Put Africa's streets to work." })).toBeInTheDocument();
    const bookBtn = screen.getByRole('link', { name: /Browse live inventory/ });
    expect(bookBtn).toBeInTheDocument();
    expect(bookBtn).toHaveAttribute('href', '/booking');
    expect(screen.getByRole('button', { name: 'List your locations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Already have an account/ })).toBeInTheDocument();
  });

  it('renders formerly scroll-triggered content without animation hooks', () => {
    const { container } = render(<TestWrapper><LandingPage /></TestWrapper>);
    const problemHeading = screen.getByRole('heading', {
      name: 'Stop emailing 42 people to book one billboard.',
    });

    expect(problemHeading).not.toHaveStyle({ opacity: '0' });
    expect(problemHeading).not.toHaveStyle({ transform: 'translateY(36px)' });
    expect(container.querySelectorAll('.reveal, .fade-up')).toHaveLength(0);
    expect(container.querySelectorAll('[data-count]')).toHaveLength(0);
    expect(screen.getByText('18 days')).toBeInTheDocument();
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
