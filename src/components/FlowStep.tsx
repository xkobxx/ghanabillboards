interface FlowStepProps {
  step: string;
  graphicType: 'map-lines' | 'card-lines' | 'date-lines' | 'lock-lines';
  title: string;
  desc: string;
}

const icons = {
  'map-lines': (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M16 17v6l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  ),
  'card-lines': (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="6" y="5" width="20" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <rect x="11" y="15" width="4" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.3" />
      <rect x="11" y="19" width="10" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.2" />
      <path d="M13 10l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'date-lines': (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="6" y="7" width="20" height="19" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M6 13h20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M13 4v4m6-4v4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <rect x="11" y="16" width="4" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.3" />
      <rect x="11" y="20" width="10" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  'lock-lines': (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="9" y="15" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M12 15v-4a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <path d="M16 23.5v2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  ),
};

export default function FlowStep({ step, title, desc, graphicType }: FlowStepProps) {
  return (
    <div
      className="flow-step relative p-6 rounded-2xl overflow-hidden border"
      data-step={step}
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="absolute right-4 top-3 text-display font-bold tracking-[-0.08em] text-[var(--color-text-primary)]/[0.04] font-mono leading-none">
        {step}
      </div>

      <div className="relative z-10 mb-4 w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--color-border)] text-[var(--color-primary)] opacity-70">
        {icons[graphicType]}
      </div>

      <h3 className="relative z-10 mt-2 mb-2 text-[clamp(24px,2.5vw,32px)] font-bold tracking-[-0.03em] leading-[1.12] text-[var(--color-text-primary)]">
        {title}
      </h3>

      <p className="relative z-10 text-sm leading-[1.6] text-[var(--color-text-secondary)]">
        {desc}
      </p>
    </div>
  );
}
