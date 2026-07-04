import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import BookingPage from '../pages/BookingPage';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/booking']}>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('BookingPage', () => {
  it('renders hero heading', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Find and book billboards across Africa/i
    );
  });

  it('renders live inventory eyebrow', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    expect(screen.getByText('Live billboard inventory')).toBeInTheDocument();
  });

  it('renders available inventory section', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    expect(screen.getByText(/billboards ready to book/i)).toBeInTheDocument();
  });

  it('renders at least one billboard card', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    // billboard cards have "Book now" or "View details" CTA
    const ctaButtons = screen.getAllByText(/Book now|View details/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  it('shows login prompt when unauthenticated', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    const loginPrompts = screen.getAllByText('Login to book');
    expect(loginPrompts.length).toBeGreaterThan(0);
  });

  it('shows inventory metrics', () => {
    render(<Wrapper><BookingPage /></Wrapper>);
    expect(screen.getByText('Available boards')).toBeInTheDocument();
    expect(screen.getByText('Cities serving')).toBeInTheDocument();
    expect(screen.getByText('Total inventory')).toBeInTheDocument();
  });
});
