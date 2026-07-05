# BlueprintPage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the thin existing BlueprintPage with a 6-section scrollytelling credibility page and add a "Platform" nav link.

**Architecture:** Two-file change only. `BlueprintPage.tsx` is a full rewrite using the same GSAP + vp-* CSS patterns as `LandingPage.tsx`. `Navbar.tsx` gets one new `<Link>`. No new CSS, no new dependencies.

**Tech Stack:** React 18, TypeScript, GSAP + ScrollTrigger (already installed), react-router-dom, lucide-react

## Global Constraints

- Use `--vp-*` CSS variables only (e.g. `--vp-primary`, `--vp-muted`, `--vp-line`, `--vp-panel`, `--vp-primary-bg`)
- Reuse existing CSS classes: `vp-stage`, `vp-wrap`, `vp-eyebrow`, `vp-lead`, `vp-btn`, `vp-metrics`, `vp-metric`, `glass-panel`, `vp-dash-panel`, `vp-dash-list`, `vp-dash-item`, `vp-pill-row`, `vp-section-head`, `vp-num`, `vp-cta`, `vp-center`, `vp-noise`, `vp-grid-bg`
- No new CSS classes, no new dependencies
- GSAP pattern: `gsap.context()` + `ScrollTrigger` + `reveal` / `fade-up` classes, identical to `LandingPage.tsx`
- Count-up pattern: `data-count`, `data-suffix` attributes + `IntersectionObserver`, identical to `LandingPage.tsx`

---

### Task 1: Add "Platform" nav link

**Files:**
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- Produces: `/blueprint` link between `Billboards` and the auth actions, visible on desktop and mobile

- [ ] **Step 1: Add Platform link to desktop nav**

Open `src/components/Navbar.tsx`. In the desktop nav links `<div className="vp-nav-links">`, add the Platform link after Billboards:

```tsx
{/* Desktop nav links */}
<div className="vp-nav-links">
  <Link to="/booking" className={isActive('/booking') ? 'active' : ''}>
    Billboards
  </Link>
  <Link to="/blueprint" className={isActive('/blueprint') ? 'active' : ''}>
    Platform
  </Link>
</div>
```

- [ ] **Step 2: Add Platform link to mobile dropdown**

In the mobile dropdown `<div className="vp-mobile-links">`, add Platform after Billboards:

```tsx
{/* Mobile dropdown */}
<div className="vp-mobile-links" role="dialog" aria-label="Navigation menu">
  <Link to="/booking" onClick={() => setMenuOpen(false)}
    className={isActive('/booking') ? 'active' : ''}>
    Billboards
  </Link>
  <Link to="/blueprint" onClick={() => setMenuOpen(false)}
    className={isActive('/blueprint') ? 'active' : ''}>
    Platform
  </Link>
```

- [ ] **Step 3: Verify in browser**

Start the dev server (`npm run dev`) and open `http://localhost:5173`. Confirm "Platform" appears in the navbar next to "Billboards" and clicking it navigates to `/blueprint`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add Platform nav link to /blueprint"
```

---

### Task 2: Rewrite BlueprintPage with 6-section scrollytelling layout

**Files:**
- Modify: `src/pages/BlueprintPage.tsx` (full rewrite)

**Interfaces:**
- Consumes: `SEOHead` from `../components/SEOHead`, `pkg` from `../../package.json`, GSAP from `gsap`, `ScrollTrigger` from `gsap/ScrollTrigger`, `Link` from `react-router-dom`, icons from `lucide-react`
- Produces: A public page at `/blueprint` with sections: Hero, Coverage, Flow, Trust, Architecture, CTA

- [ ] **Step 1: Replace BlueprintPage.tsx with the full rewrite**

Replace the entire contents of `src/pages/BlueprintPage.tsx` with:

```tsx
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
  { num: '05', Icon: Activity,          title: 'Approve',  desc: 'Vendor confirms availability and accepts the booking.',                          role: 'Vendor' },
  { num: '06', Icon: BarChart2,         title: 'Report',   desc: 'Campaign goes live. Telemetry tracks delivery status.',                         role: 'Both'   },
];

const TRUST_CARDS = [
  { Icon: Tag,          title: 'Transparent pricing',    desc: 'Daily rate × flight duration = total. Nothing buried in email attachments.' },
  { Icon: Shield,       title: 'Vendor verification',   desc: 'Every operator is vetted before their inventory goes live on the platform.' },
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
  'Paystack escrow — funds held until vendor confirmation',
  'Client-side sandbox mirrors Auth, Booking & Payments modules',
];

export default function BlueprintPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set('.vp-blueprint .reveal, .vp-blueprint .fade-up', { opacity: 0, y: 36 });
      containerRef.current?.querySelectorAll('.vp-stage').forEach((section) => {
        const items = section.querySelectorAll('.reveal, .fade-up');
        if (!items.length) return;
        gsap.fromTo(
          items,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 1.05, ease: 'power4.out', stagger: 0.08,
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
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
            <h2 className="reveal" id="coverage-title">Five cities. 42+ vendors. One search.</h2>
          </div>
          <div className="vp-metrics reveal" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', maxWidth: 800 }}>
            <div className="vp-metric">
              <strong data-count="5">5</strong>
              <span>Cities live today</span>
            </div>
            <div className="vp-metric">
              <strong data-count="42" data-suffix="+">42+</strong>
              <span>Vendors consolidated</span>
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
          <div style={{ borderLeft: '1px solid var(--vp-line)', marginLeft: 20 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: same 3 pre-existing errors in `AuthModals.test.tsx` and `NotificationBell.tsx` — no new errors from BlueprintPage.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/blueprint`. Check:
- Navbar shows "Platform" link, active state highlights on `/blueprint`
- Hero eyebrow, H1, lead, and three anchor links render
- Scrolling to §2: four count-up metrics animate (5, 42+, 4.5 min, 100%), city chips row appears
- Scrolling to §3: six-step timeline with icon circles, role badges (Buyer/Vendor/Both)
- Scrolling to §4: four glass-panel trust cards with icons
- Scrolling to §5: architecture map left, stack pills + security checklist + build metadata right
- Scrolling to §6: CTA with two buttons, "Start booking" goes to `/booking`, "View investor deck" goes to `/investor`
- Anchor links in hero ("Coverage ↓", "How it works ↓", "Architecture ↓") scroll to correct sections
- Dark mode: toggle theme and confirm all sections render correctly with dark CSS vars

- [ ] **Step 4: Check mobile layout**

Resize browser to 375px width. Verify:
- §5 two-column grid stacks vertically (CSS `auto-fit` handles this on the trust grid; §5 will need the `grid-template-columns` to collapse — see note below)

> **Mobile note for §5:** The `1fr 1fr` grid on the architecture section will not auto-collapse. If mobile layout is broken, add a `@media` override or change the inline style to `gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'`. This is an acceptable follow-up — verify and fix if needed during this step.

- [ ] **Step 5: Commit**

```bash
git add src/pages/BlueprintPage.tsx
git commit -m "feat: rewrite BlueprintPage with 6-section credibility layout"
```
