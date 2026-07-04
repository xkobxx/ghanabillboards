interface RoleCardProps {
  kicker: string;
  title: string;
  desc: string;
  label: string;
  href: string;
  illustration: 'advertiser' | 'vendor' | 'admin';
}

const illustrations = {
  advertiser: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="6" y="12" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="12" y="18" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
      <rect x="16" y="22" width="16" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
    </svg>
  ),
  vendor: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="12" y="14" width="12" height="10" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="28" y="14" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
      <rect x="12" y="28" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
      <rect x="28" y="28" width="10" height="6" rx="2" fill="currentColor" fillOpacity="0.12" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path d="M24 8l12 8v14a12 12 0 01-24 0V16l12-8z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M24 32v4m-3-4l3 4 3-4" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="3" fill="currentColor" fillOpacity="0.15" />
    </svg>
  ),
};

export default function RoleCard({ kicker, title, desc, label, href, illustration }: RoleCardProps) {
  return (
    <a
      href={href}
      className="group relative flex flex-col min-h-[420px] p-8 rounded-2xl overflow-hidden no-underline transition-all duration-300 border"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div className="relative z-10 mb-5 w-12 h-12 text-[var(--color-primary)] opacity-60">
        {illustrations[illustration]}
      </div>

      <div className="relative z-10 font-mono text-body-xs tracking-[0.1em] uppercase mb-4 text-[var(--color-text-muted)]">
        {kicker}
      </div>

      <h3 className="relative z-10 max-w-[280px] mb-4 text-[clamp(26px,3vw,44px)] font-bold tracking-[-0.04em] leading-[1.1] text-[var(--color-text-primary)]">
        {title}
      </h3>

      <p className="relative z-10 max-w-[310px] text-[14.5px] leading-[1.65] text-[var(--color-text-secondary)] flex-1">
        {desc}
      </p>

      <div className="relative z-10 flex items-center justify-between pt-5 border-t border-[var(--color-border)] mt-6">
        <span className="text-[var(--color-text-primary)] font-semibold text-sm">
          {label}
        </span>
        <span className="w-9 h-9 grid place-items-center rounded-full border border-[var(--color-border)] transition-colors duration-200 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-text-inverse)] group-hover:border-[var(--color-primary)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  );
}
