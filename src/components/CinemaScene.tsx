import SectionEyebrow from './SectionEyebrow';

const particles = [
  { delay: '0s', dur: '8s', left: '18%', bottom: '40%', w: '2px', h: '2px', anim: 'cinemaParticle1' },
  { delay: '2s', dur: '9s', left: '72%', bottom: '35%', w: '3px', h: '3px', anim: 'cinemaParticle2' },
  { delay: '4s', dur: '7.5s', left: '55%', bottom: '48%', w: '2px', h: '2px', anim: 'cinemaParticle3' },
  { delay: '1.5s', dur: '10s', left: '28%', bottom: '55%', w: '1.5px', h: '1.5px', anim: 'cinemaParticle2' },
  { delay: '5.5s', dur: '8.5s', left: '82%', bottom: '42%', w: '2px', h: '2px', anim: 'cinemaParticle1' },
  { delay: '3s', dur: '9.5s', left: '45%', bottom: '60%', w: '1.5px', h: '1.5px', anim: 'cinemaParticle3' },
];

export default function CinemaScene() {
  return (
    <section className="cinema-section relative min-h-[150vh] pt-[120px]">
      <div className="sticky top-0 min-h-screen grid place-items-center w-full">
        <div className="cinema-image relative w-[min(92vw,1180px)] h-[64vh] rounded-[0px] overflow-hidden" style={{
          border: '1px solid var(--color-border)',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.68)), radial-gradient(circle at 60% 32%, color-mix(in srgb, var(--color-primary) 24%, transparent) 0%, transparent 22%), radial-gradient(circle at 40% 62%, rgba(246,211,107,0.14) 0%, transparent 26%), linear-gradient(135deg, #111316, #20211f 44%, #070708)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
          transformOrigin: 'center',
        }}>
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.w,
                height: p.h,
                background: 'var(--color-primary)',
                boxShadow: '0 0 8px var(--color-primary)',
                animation: `${p.anim} ${p.dur} ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
          <div className="absolute top-0 left-0 right-0 h-[140px] pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)',
          }} />
          <div className="absolute inset-0 opacity-80" style={{
            background: 'linear-gradient(90deg, transparent 0 8%, rgba(255,255,255,0.05) 8% 8.2%, transparent 8.2% 19%, rgba(255,255,255,0.04) 19% 19.2%, transparent 19.2%), radial-gradient(circle at 50% 20%, rgba(255,255,255,0.16) 0%, transparent 12%)',
          }} />
          <div className="billboard-scene absolute left-1/2 bottom-0 -translate-x-1/2 w-[min(680px,72%)] h-[72%]">
            <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[78%] h-[34%] rounded-[0px]" style={{
              border: '1px solid rgba(255,255,255,0.42)',
              background: 'linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 84%, transparent), rgba(246,211,107,0.62)), linear-gradient(90deg, rgba(255,255,255,0.25), transparent)',
              boxShadow: '0 0 80px color-mix(in srgb, var(--color-primary) 22%, transparent), 0 35px 100px rgba(0,0,0,0.6)',
            }}>
              <span className="absolute left-7 bottom-6 text-[clamp(22px,4vw,48px)] font-black tracking-[-0.08em]" style={{ color: 'rgba(5,5,6,0.78)' }}>VANTAGE POINT</span>
            </div>
            <div className="absolute left-1/2 top-[41%] -translate-x-1/2 w-[46px] h-[59%] border-b-0" style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.19), rgba(255,255,255,0.04))' }} />
          </div>
          <div className="absolute left-[clamp(22px,5vw,64px)] bottom-[clamp(24px,5vw,70px)] max-w-[530px]">
            <SectionEyebrow>Scroll expansion</SectionEyebrow>
            <h2 className="tracking-[-0.075em] leading-[0.92] font-extrabold text-[clamp(42px,6vw,92px)] mb-5">From static space to live inventory.</h2>
            <p className="text-[clamp(18px,2.1vw,25px)] leading-[1.45] tracking-[-0.025em] text-[var(--color-text-secondary)]">As users scroll, the billboard expands from a visual metaphor into a working marketplace system: available, priced, scheduled, and monitored.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
