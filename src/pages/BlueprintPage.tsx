import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight, Search, SlidersHorizontal, Tag,
  CalendarCheck, Activity, BarChart2, Shield, Lock, MapPin,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import pkg from '../../package.json';

gsap.registerPlugin(ScrollTrigger);

const CITIES = ['Accra', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town'];

const FLOW_STEPS = [
  { num: '01', Icon: Search,            title: 'Search',   desc: 'Filter by city, format, traffic volume, and price range.',                       role: 'Buyer'  },
  { num: '02', Icon: SlidersHorizontal, title: 'Compare',  desc: 'View specs, daily rates, traffic data, and photos side by side.',                role: 'Buyer'  },
  { num: '03', Icon: Tag,               title: 'Price',    desc: 'Daily rate × flight duration = total. No fees added at checkout.',               role: 'Buyer'  },
  { num: '04', Icon: CalendarCheck,     title: 'Schedule', desc: 'Lock calendar dates. A pending booking record is created instantly.',            role: 'Buyer'  },
  { num: '05', Icon: Activity,          title: 'Approve',  desc: 'Publisher confirms availability and accepts the booking.',                          role: 'Publisher' },
  { num: '06', Icon: BarChart2,         title: 'Report',   desc: 'Campaign goes live. Telemetry tracks delivery status.',                         role: 'Both'   },
];

const TRUST_CARDS = [
  { Icon: Tag,          title: 'Transparent pricing',    desc: 'Daily rate × flight duration = total. Nothing buried in email attachments.' },
  { Icon: Shield,       title: 'Publisher verification',   desc: 'Every operator is vetted before their inventory goes live on the platform.' },
  { Icon: CalendarCheck, title: 'Real-time availability', desc: 'Calendar locks on your dates the moment you schedule. No double-booking.' },
  { Icon: Lock,         title: 'Escrow-ready payments',  desc: 'Paystack integration holds funds until campaign confirmation. No pay-and-pray.' },
];

const ARCH_TIERS = [
  { num: '1', title: 'Client Tier',  sub: 'React Multi-Module Router', desc: 'Lenis smooth scrolling, GSAP programmatic triggers and visual checklist states.' },
  { num: '2', title: 'API Gateway', sub: 'Rate Limiter Proxy',         desc: 'Nginx configuration forwarding coordinates, signing credentials securely.' },
  { num: '3', title: 'DB Hub',      sub: 'Modular Monolith',           desc: 'Prisma database abstraction holding active campaign timetables.' },
];

const STACK = ['React', 'Vite', 'TypeScript', 'Paystack', 'Prisma', 'Nginx'];

const SECURITY = [
  'Rate-limited API gateway — no credential exposure to client',
  'Paystack escrow — funds held until publisher confirmation',
  'Client-side sandbox mirrors Auth, Booking & Payments modules',
];

export default function BlueprintPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set('.vp-blueprint .reveal, .vp-blueprint .fade-up', { opacity: 0, y: 36 });

      // Page load entrance — blueprint hero section
      const firstStage = containerRef.current?.querySelector('.vp-stage');
      if (firstStage) {
        gsap.set(firstStage.querySelectorAll('.reveal'), { opacity: 0, y: 40 });
        if (!reduce) {
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(firstStage.querySelector('.vp-eyebrow'), { opacity: 1, y: 0, duration: 0.7 }, 0.35)
            .to(firstStage.querySelector('h1'), { opacity: 1, y: 0, duration: 0.9 }, 0.55)
            .to(firstStage.querySelector('.vp-lead'), { opacity: 1, y: 0, duration: 0.7 }, 1.15)
            .to(firstStage.querySelector('.vp-pill-row'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 }, 1.45);
        } else {
          gsap.set(firstStage.querySelectorAll('.reveal'), { opacity: 1, y: 0 });
        }
      }

      containerRef.current?.querySelectorAll('.vp-stage').forEach((section) => {
        if (section === firstStage) return; // entrance timeline handles hero
        const items = section.querySelectorAll('.reveal, .fade-up');
        if (!items.length) return;
        gsap.fromTo(
          items,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          }
        );
      });
    }, containerRef);

    // Count-up metrics
    const root = containerRef.current;
    if (!root) return () => ctx.revert();

    const nums = root.querySelectorAll<HTMLElement>('[data-count]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const to = parseFloat(el.dataset.count || '0');
        const dec = (el.dataset.count || '').includes('.') ? 1 : 0;
        const suf = el.dataset.suffix || '';
        if (reduce) { el.textContent = `${to.toFixed(dec)}${suf}`; return; }
        const start = performance.now();
        const dur = 1300;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = `${(to * eased).toFixed(dec)}${suf}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
    cleanups.push(() => io.disconnect());

    return () => { ctx.revert(); cleanups.forEach((c) => c()); };
  }, []);

  return (
    <div className="vp-blueprint vp-home" ref={containerRef}>
      <SEOHead />
      <div className="vp-noise" aria-hidden="true" />
      <div className="vp-grid-bg" aria-hidden="true" />

      {/* §1 — HERO */}
      <section className="vp-stage" style={{ paddingTop: 140 }} aria-labelledby="blueprint-title">
        <div className="vp-wrap">
          <p className="vp-eyebrow reveal">PLATFORM OVERVIEW</p>
          <h1 className="reveal" id="blueprint-title">Built for serious buyers.</h1>
          <p className="vp-lead reveal" style={{ maxWidth: 620 }}>
            Vantage Point is Africa's first unified outdoor advertising marketplace.
            This page is for media buyers, agencies, and technical teams who need
            more than a homepage before they commit.
          </p>
          <div className="vp-pill-row reveal">
            <a href="#coverage"      className="vp-btn">Coverage ↓</a>
            <a href="#how-it-works"  className="vp-btn">How it works ↓</a>
            <a href="#architecture"  className="vp-btn">Architecture ↓</a>
          </div>
        </div>
      </section>

      {/* §2 — COVERAGE & SCALE */}
      <section className="vp-stage" id="coverage" aria-labelledby="coverage-title">
        <div className="vp-wrap">
          <div className="vp-section-head">
            <p className="vp-eyebrow reveal">COVERAGE</p>
            <h2 className="reveal" id="coverage-title">Five cities. 42+ publishers. One search.</h2>
          </div>
          <div className="vp-metrics reveal" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', maxWidth: 800 }}>
            <div className="vp-metric">
              <strong data-count="5">5</strong>
              <span>Cities live today</span>
            </div>
            <div className="vp-metric">
              <strong data-count="42" data-suffix="+">42+</strong>
              <span>Publishers consolidated</span>
            </div>
            <div className="vp-metric">
              <strong data-count="4.5" data-suffix=" min">4.5 min</strong>
              <span>Avg. time to book</span>
            </div>
            <div className="vp-metric">
              <strong data-count="100" data-suffix="%">100%</strong>
              <span>Transparent pricing</span>
            </div>
          </div>
          <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32 }}>
            {CITIES.map((city) => (
              <span key={city} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                border: '1px solid var(--vp-line)',
                fontSize: 'var(--text-caption)', color: 'var(--vp-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                <MapPin size={12} />{city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* §3 — BOOKING FLOW */}
      <section className="vp-stage" id="how-it-works" aria-labelledby="flow-title">
        <div className="vp-wrap">
          <div className="vp-section-head">
            <p className="vp-eyebrow reveal">HOW IT WORKS</p>
            <h2 className="reveal" id="flow-title">From search to live campaign in six steps.</h2>
            <p className="vp-lead reveal">Deep workflows sit behind each role. Here's the full sequence.</p>
          </div>
          <div style={{ marginLeft: 20 }}>
            {FLOW_STEPS.map(({ num, Icon, title, desc, role }) => (
              <article key={num} className="reveal" style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto',
                gap: 20,
                padding: '24px 0 24px 32px',
                borderBottom: '1px solid var(--vp-line)',
                alignItems: 'start',
              }}>
                <span style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--vp-panel)',
                  border: '1px solid var(--vp-line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: -52, flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: 'var(--vp-primary)' }} />
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="vp-num">{num}</span>
                    <strong style={{ fontSize: 'var(--text-body-sm)' }}>{title}</strong>
                  </div>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-muted)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
                </div>
                <span style={{
                  fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                  padding: '2px 10px', borderRadius: 4,
                  background: 'var(--vp-panel)', border: '1px solid var(--vp-line)',
                  color: 'var(--vp-muted)', whiteSpace: 'nowrap', marginTop: 4,
                }}>{role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* §4 — TRUST SIGNALS */}
      <section className="vp-stage" id="trust" aria-labelledby="trust-title">
        <div className="vp-wrap">
          <div className="vp-section-head">
            <p className="vp-eyebrow reveal">WHY BUYERS TRUST US</p>
            <h2 className="reveal" id="trust-title">No surprises. No gatekeepers. No guessing.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {TRUST_CARDS.map(({ Icon, title, desc }) => (
              <article key={title} className="glass-panel reveal" style={{ padding: 28, borderRadius: 16 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 8, marginBottom: 16,
                  background: 'var(--vp-primary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: 'var(--vp-primary)' }} />
                </span>
                <h3 style={{ fontSize: 'var(--text-body-sm)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-muted)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* §5 — TECHNICAL ARCHITECTURE */}
      <section className="vp-stage" id="architecture" aria-labelledby="arch-title">
        <div className="vp-wrap">
          <div className="vp-section-head">
            <p className="vp-eyebrow reveal">TECHNICAL OVERVIEW</p>
            <h2 className="reveal" id="arch-title">Three tiers. One coherent system.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'start' }}>
            {/* Architecture map */}
            <div className="glass-panel reveal" style={{ padding: 32, borderRadius: 16 }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)',
                color: 'var(--vp-muted)', marginBottom: 24,
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>SYSTEM ARCHITECTURE MAP</p>
              <div style={{ borderLeft: '1px solid var(--vp-line)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {ARCH_TIERS.map(({ num, title, sub, desc }) => (
                  <div key={num}>
                    <p style={{ fontSize: 'var(--text-body-xs)', color: 'var(--vp-primary)', fontWeight: 500, marginBottom: 4 }}>
                      {num}. {title}{' '}
                      <span style={{ fontWeight: 400, color: 'var(--vp-muted)' }}>({sub})</span>
                    </p>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-muted)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stack + security + build */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-panel reveal" style={{ padding: 28, borderRadius: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)',
                  color: 'var(--vp-muted)', marginBottom: 16,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>STACK</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STACK.map((s) => (
                    <span key={s} style={{
                      padding: '4px 12px', borderRadius: 999,
                      border: '1px solid var(--vp-line)',
                      fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="glass-panel reveal" style={{ padding: 28, borderRadius: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)',
                  color: 'var(--vp-muted)', marginBottom: 16,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>SECURITY</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {SECURITY.map((item) => (
                    <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--vp-primary)', fontSize: 'var(--text-caption)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-muted)', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vp-dash-panel reveal" style={{ margin: 0 }}>
                <h3>Build metadata</h3>
                <div className="vp-dash-list">
                  <div className="vp-dash-item"><span>Environment</span><strong>{import.meta.env.MODE}</strong></div>
                  <div className="vp-dash-item"><span>Version</span><strong>v{pkg.version}</strong></div>
                  <div className="vp-dash-item"><span>Stack</span><strong>React · Vite · TypeScript</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §6 — CTA */}
      <section className="vp-stage vp-center vp-cta" id="cta">
        <div className="vp-wrap">
          <p className="vp-eyebrow reveal">GET STARTED</p>
          <h2 className="reveal">Ready to evaluate the platform?</h2>
          <p className="vp-lead reveal">
            Dashboards and deep workflows sit behind each role. Pick where you want to go.
          </p>
          <div className="vp-pill-row reveal" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">
              Start booking <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/investor" className="vp-btn">View investor deck</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
