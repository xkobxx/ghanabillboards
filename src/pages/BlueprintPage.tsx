import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import pkg from '../../package.json';

export default function BlueprintPage() {
  return (
    <main className="min-h-screen relative z-30">
      <PageContainer className="py-16 space-y-20">
      <div className="glass-panel clip-reveal rounded-2xl p-8 border border-[var(--color-border)] grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-[var(--color-surface)] text-[var(--color-text-primary)]">
        <div className="space-y-6">
          <span className="font-mono text-caption text-[var(--color-primary)] uppercase tracking-[0.2em] block">INFRASTRUCTURE SUMMARY</span>
          <h3 className="font-light text-2xl text-[var(--color-text-primary)] uppercase tracking-tight">Behind the Platform</h3>
          <p className="font-sans text-sm text-[var(--color-text-secondary)] leading-relaxed">
            A React booking client backed by a modular API gateway. Five cities. Instant search, instant pricing, instant booking.
          </p>
          <div className="space-y-3 text-caption text-[var(--color-text-muted)] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-primary)] text-caption font-bold">✓</span>
              <span>Paystack escrow-ready. Secure payments from day one.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-primary)] text-caption font-bold">✓</span>
              <span>100% client-side sandbox. No stale connection delays.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-primary)] text-caption font-bold">✓</span>
              <span>Dev sandbox mirrors Auth, Booking & Payments modules.</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/investor"
              className="px-6 py-3 border border-[var(--color-border)] rounded-full text-caption uppercase tracking-widest text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] transition-all"
            >
              VIEW SECRETS SLIDES
            </Link>
            <Link
              to="/developer"
              className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold text-caption uppercase tracking-widest rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              MONITOR GATEWAY LOGS
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-border)] space-y-6 relative z-10 shadow-sm text-[var(--color-text-primary)]">
            <div className="font-mono text-caption text-[var(--color-text-muted)] tracking-[0.2em] uppercase">SYSTEM ARCHITECTURE MAP</div>
            <div className="relative text-caption leading-relaxed font-sans space-y-4 pl-4 border-l border-[var(--color-border-strong)]">
              <div className="space-y-1">
                <div className="text-[var(--color-primary)] font-medium">1. Client Tier (React Multi-Module Router)</div>
                <div className="text-body-xs text-[var(--color-text-secondary)] leading-relaxed">Lenis smooth scrolling, GSAP programmatic triggers and visual checklist states.</div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--color-primary)] font-medium">2. API Gateway (Rate Limiter Proxy)</div>
                <div className="text-body-xs text-[var(--color-text-secondary)] leading-relaxed">Nginx configuration forwarding coordinates, signing credentials securely.</div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--color-primary)] font-medium">3. Modular Monolith DB Hub</div>
                <div className="text-body-xs text-[var(--color-text-secondary)] leading-relaxed">Prisma database abstraction holding active campaign timetables.</div>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-full h-full border border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl -z-10 translate-x-3 -translate-y-3"></div>
        </div>
      </div>
      <div className="vp-dash-panel" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h3>Build metadata</h3>
        <div className="vp-dash-list">
          <div className="vp-dash-item"><span>Environment</span><strong>{import.meta.env.MODE}</strong></div>
          <div className="vp-dash-item"><span>Version</span><strong>v{pkg.version}</strong></div>
          <div className="vp-dash-item"><span>Stack</span><strong>React · Vite · TypeScript</strong></div>
        </div>
      </div>
      </PageContainer>
    </main>
  );
}
