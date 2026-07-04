import { useTheme } from '../context/ThemeContext';

export default function HeroTerminal() {
  const { theme } = useTheme();
  const isCinematic = theme === 'cinematic';

  return (
    <div className="hero-stage relative min-h-[580px] lg:min-h-[680px] grid place-items-center" style={{ perspective: '1200px' }}>
      <div className="orbital-bg absolute w-[780px] h-[780px] rounded-full opacity-75" style={{
        background: isCinematic
          ? 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-primary) 13%, transparent) 0%, transparent 28%), repeating-radial-gradient(circle, rgba(255,255,255,0.12) 0 1px, transparent 1px 78px)'
          : 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 40%)',
        filter: 'blur(0.2px)',
        transform: 'rotateX(64deg) rotateZ(-20deg)',
      }} />

      <div
        className="map-terminal relative w-[min(540px,100%)] aspect-[1/1.14] rounded-[0px] overflow-hidden"
        style={{
          border: '1px solid var(--color-border)',
          background: isCinematic
            ? 'linear-gradient(140deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)), radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--color-primary) 13%, transparent) 0%, transparent 38%), rgba(8,8,10,0.72)'
            : 'linear-gradient(140deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)), radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 38%), var(--color-surface)',
          boxShadow: isCinematic ? '0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)' : '0 30px 90px rgba(0,0,0,0.08)',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(circle at 50% 40%, #000 28%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, #000 28%, transparent 78%)',
        }} />

        <div className="absolute top-[18px] left-[18px] right-[18px] z-[2] flex items-center justify-between px-[14px] py-[12px] rounded-full backdrop-blur-[14px] font-mono text-body-xs text-[var(--color-text-muted)]" style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.24)' }}>
          <span>OOH-GATEWAY / LIVE MAP</span>
          <span className="w-[8px] h-[8px] rounded-full bg-[var(--color-primary)]" style={{ boxShadow: '0 0 20px var(--color-primary)' }} />
        </div>

        {[
          { cls: 'left-[19%] top-[31%]', city: 'Lagos', delay: '0.1s' },
          { cls: 'left-[43%] top-[42%]', city: 'Accra', delay: '0.7s' },
          { cls: 'left-[66%] top-[34%]', city: 'Nairobi', delay: '1.4s' },
          { cls: 'left-[71%] top-[66%]', city: 'Johannesburg', delay: '1.8s' },
          { cls: 'left-[47%] top-[69%]', city: 'Cape Town', delay: '2.2s' },
        ].map((n, i) => (
          <div key={i} className={`node absolute z-[3] w-[14px] h-[14px] rounded-full bg-[var(--color-primary)] ${n.cls}`} style={{
            border: '3px solid rgba(7,7,9,0.78)',
            boxShadow: '0 0 0 9px color-mix(in srgb, var(--color-primary) 11%, transparent), 0 0 32px color-mix(in srgb, var(--color-primary) 60%, transparent)',
            animation: `nodePulse 3.5s ease-in-out infinite ${n.delay}`,
          }}>
            <span className="absolute left-[16px] top-[-11px] px-[9px] py-[7px] rounded-full whitespace-nowrap font-mono text-caption text-[var(--color-text-secondary)] backdrop-blur-[10px]" style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.33)' }}>
              {n.city}
            </span>
          </div>
        ))}
      </div>

      <div className="asset-float absolute z-[5] left-[-32px] top-[116px] w-[250px] p-[13px] rounded-[0px] backdrop-blur-[18px]" style={{ border: '1px solid var(--color-border)', background: isCinematic ? 'rgba(12,12,14,0.72)' : 'var(--color-surface)', boxShadow: '0 24px 70px rgba(0,0,0,0.38)' }}>
        <small className="block text-caption font-mono uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-[10px]">Selected asset</small>
        <div className="h-[118px] rounded-[0px] mb-[12px] overflow-hidden relative" style={{
          background: isCinematic
            ? 'linear-gradient(130deg, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 32%), linear-gradient(0deg, rgba(0,0,0,0.42) 0%, transparent 70%), radial-gradient(circle at 68% 24%, rgba(246,211,107,0.34) 0%, transparent 20%), linear-gradient(135deg, #15191a, #343431 45%, #101011)'
            : 'linear-gradient(130deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 32%), linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 70%), linear-gradient(135deg, #e8ecf0, #d4d8dc 45%, #f0f4f8)',
        }}>
          <div className="absolute left-[44%] bottom-0 w-[36px] h-[72px]" style={{ border: '1px solid rgba(255,255,255,0.26)', borderBottom: 0, background: 'rgba(255,255,255,0.10)', boxShadow: isCinematic ? '0 -18px 34px color-mix(in srgb, var(--color-primary) 20%, transparent)' : 'none' }} />
          <div className="absolute left-[34%] bottom-[70px] w-[110px] h-[40px] rounded-[0px]" style={{ border: '1px solid rgba(255,255,255,0.35)', background: `linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 55%, transparent), rgba(246,211,107,0.4))`, boxShadow: isCinematic ? '0 0 32px color-mix(in srgb, var(--color-primary) 22%, transparent)' : 'none' }} />
        </div>
        <h4 className="text-lg tracking-[-0.03em] mb-[6px] text-[var(--color-text-primary)]">Lekki Toll Gate LED</h4>
        <div className="flex items-center justify-between font-mono text-body-xs text-[var(--color-text-muted)]">
          <span>$420/day</span>
          <span className="inline-flex items-center gap-[7px] w-max px-[9px] py-[7px] rounded-full font-mono text-caption font-semibold text-[var(--color-primary)]" style={{ border: '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <span className="w-[5px] h-[5px] rounded-full bg-current" />
            Available
          </span>
        </div>
      </div>

      <div className="absolute z-[5] right-[-28px] bottom-[58px] w-[270px] p-[18px] rounded-[0px] backdrop-blur-[18px]" style={{ border: '1px solid var(--color-border)', background: isCinematic ? 'rgba(12,12,14,0.72)' : 'var(--color-surface)', boxShadow: '0 24px 70px rgba(0,0,0,0.38)' }}>
        <small className="block text-caption font-mono uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-[10px]">Instant valuation</small>
        <strong className="block text-xl tracking-[-0.04em] leading-[1.2] text-[var(--color-text-primary)]">Neo-Banking Launch Q3</strong>
        <div className="flex items-center justify-between mt-[18px] pt-[14px] font-mono text-body-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
          <span>14 days</span>
          <b className="text-[var(--color-primary)]">$5,880</b>
        </div>
      </div>
    </div>
  );
}
