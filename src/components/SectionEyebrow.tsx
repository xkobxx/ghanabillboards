import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function SectionEyebrow({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isCinematic = theme === 'cinematic';
  return (
    <div
      className={`inline-flex items-center gap-[10px] w-max mb-[22px] text-body-xs font-semibold tracking-[0.11em] uppercase px-3 py-[9px] rounded-full font-mono ${
        isCinematic ? 'text-white/72' : 'text-[var(--color-text-muted)]'
      }`}
      style={{
        border: `1px solid ${isCinematic ? 'rgba(255,255,255,0.07)' : 'var(--color-border)'}`,
        background: isCinematic ? 'rgba(255,255,255,0.045)' : 'var(--color-surface)',
        backdropFilter: isCinematic ? 'blur(14px)' : 'none',
      }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full bg-[var(--color-primary)] shrink-0"
        style={{ boxShadow: isCinematic ? '0 0 18px color-mix(in srgb, var(--color-primary) 65%, transparent)' : 'none' }}
      />
      {children}
    </div>
  );
}
