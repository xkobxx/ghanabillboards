import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight, MailWarning, FileQuestion, Radar,
  Search, Tag, CalendarCheck, Activity, MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const CITIES = ['Accra', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town', 'Kumasi', 'Abuja', 'Mombasa'];

const ROLE_CARDS = [
  {
    title: 'Book inventory',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80',
    desc: 'Search billboards by city, format, and traffic. Compare rates. Book in under 5 minutes.',
    cta: 'Start booking',
    href: '/booking',
    alt: 'Billboard at an urban intersection at dusk',
    tag: 'Buyer',
  },
  {
    title: 'List locations',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80',
    desc: 'Manage your billboard inventory, set rates, approve bookings, and track revenue.',
    cta: 'Open publisher view',
    href: '/publisher',
    alt: 'Large format billboards along a city road',
    tag: 'Publisher',
  },
  {
    title: 'Operate the gateway',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    desc: 'Monitor bookings, inspect payloads, manage gateway rules, and resolve disputes.',
    cta: 'Open admin view',
    href: '/admin',
    alt: 'Network operations and infrastructure',
    tag: 'Admin',
  },
  {
    title: 'Review the thesis',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    desc: 'See the market thesis, revenue model, and regional expansion roadmap.',
    cta: 'Open investor view',
    href: '/investor',
    alt: 'Growth analytics and market charts',
    tag: 'Investor',
  },
];

const OPERATING_STEPS = [
  { num: '01', Icon: Search, title: 'Discover', desc: 'Search by city, format, traffic volume, price, and availability.' },
  { num: '02', Icon: Tag, title: 'Price', desc: 'See daily rate times your flight dates. No hidden fees.' },
  { num: '03', Icon: CalendarCheck, title: 'Schedule', desc: 'Lock calendar dates. Submitting creates a pending approval record.' },
  { num: '04', Icon: Activity, title: 'Operate', desc: 'Publishers approve, campaigns go live, and telemetry tracks delivery.' },
];

const PAIN_CARDS = [
  { Icon: MailWarning, title: 'Email chase', desc: 'You email 42+ operators to find one available billboard.' },
  { Icon: FileQuestion, title: 'Static PDFs', desc: 'Pricing arrives as PDF attachments. Not a searchable surface.' },
  { Icon: Radar, title: 'No proof', desc: 'You pay without knowing traffic quality or campaign delivery status.' },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setAuthMode, allBillboards } = useApp();

  // ── Carousel ──────────────────────────────────────────────────────────────
  const slides = useMemo(() => {
    const avail = allBillboards.filter(b => b.status === 'Available');
    return (avail.length > 0 ? avail : allBillboards).slice(0, 8);
  }, [allBillboards]);

  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const fadingRef = useRef(false);

  const go = useCallback((dir: 1 | -1) => {
    if (fadingRef.current || slides.length <= 1) return;
    fadingRef.current = true;
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + dir + slides.length) % slides.length);
      setFading(false);
      fadingRef.current = false;
    }, 280);
  }, [slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const board = slides[idx] ?? null;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set('.vp-home .reveal, .vp-home .fade-up', { opacity: 0, y: 36 });

      const heroSection = containerRef.current?.querySelector('.vp-hero');
      containerRef.current?.querySelectorAll('.vp-stage').forEach((section) => {
        if (section === heroSection) return; // entrance timeline handles hero
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

      // ── Page load cinematic entrance ──
      gsap.set('.vp-hero .vp-eyebrow', { opacity: 0, y: 40 });
      gsap.set('.vp-hero h1', { opacity: 0, y: 48 });
      gsap.set('.vp-hero .vp-lead', { opacity: 0, y: 24 });
      gsap.set('.vp-hero .vp-pill-row', { opacity: 0, y: 20 });
      gsap.set('.vp-hero .vp-hero-metrics', { opacity: 0, y: 24 });
      gsap.set('.vp-hero .vp-hero-visual', { opacity: 0, scale: 1.05 });
      gsap.set('.vp-hero .vp-marquee', { opacity: 0, y: 0 });

      if (!reduce) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('.vp-hero .vp-eyebrow', { opacity: 1, y: 0, duration: 0.7 }, 0.35)
          .to('.vp-hero h1', { opacity: 1, y: 0, duration: 0.9 }, 0.55)
          .to('.vp-hero .vp-lead', { opacity: 1, y: 0, duration: 0.7 }, 1.15)
          .to('.vp-hero .vp-pill-row', { opacity: 1, y: 0, duration: 0.6 }, 1.45)
          .to('.vp-hero .vp-hero-metrics', { opacity: 1, y: 0, duration: 0.65 }, 1.7)
          .to('.vp-hero .vp-hero-visual', { opacity: 1, scale: 1, duration: 1.1 }, 2.0)
          .to('.vp-hero .vp-marquee', { opacity: 1, duration: 0.5 }, 2.3);
      } else {
        gsap.set('.vp-hero .vp-eyebrow, .vp-hero h1, .vp-hero .vp-lead, .vp-hero .vp-pill-row, .vp-hero .vp-hero-metrics, .vp-hero .vp-hero-visual, .vp-hero .vp-marquee', { opacity: 1, y: 0, scale: 1 });
      }

      // ── Stack transitions ── scrub previous card up as next covers it
      if (!reduce) {
        const stackCards = gsap.utils.toArray('.vp-stack');

        stackCards.forEach((card, i) => {
          if (i === stackCards.length - 1) return;
          const cardEl = card as HTMLElement;

          gsap.to(cardEl, {
            y: () => -cardEl.offsetHeight,
            ease: 'none',
            scrollTrigger: {
              trigger: stackCards[i + 1] as Element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });

          gsap.to(cardEl, {
            opacity: 0.3,
            ease: 'none',
            scrollTrigger: {
              trigger: stackCards[i + 1] as Element,
              start: 'top bottom',
              end: 'top 30%',
              scrub: 1,
            },
          });
        });
      }
    }, containerRef);

    const root = containerRef.current;
    if (!root) return () => ctx.revert();

    // Count-up metrics ---------------------------------------------------
    const nums = root.querySelectorAll<HTMLElement>('[data-count]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const to = parseFloat(el.dataset.count || '0');
        const dec = (el.dataset.count || '').includes('.') ? 1 : 0;
        const pre = el.dataset.prefix || '';
        const suf = el.dataset.suffix || '';
        if (reduce) { el.textContent = `${pre}${to.toFixed(dec)}${suf}`; return; }
        const start = performance.now();
        const dur = 1300;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = `${pre}${(to * eased).toFixed(dec)}${suf}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
    cleanups.push(() => io.disconnect());

    if (!reduce) {
      // Magnetic primary buttons ----------------------------------------
      root.querySelectorAll<HTMLElement>('.vp-btn.primary').forEach((btn) => {
        const move = (ev: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const x = (ev.clientX - r.left - r.width / 2) * 0.25;
          const y = (ev.clientY - r.top - r.height / 2) * 0.35;
          btn.style.transform = `translate(${x}px, ${y}px)`;
        };
        const reset = () => { btn.style.transform = ''; };
        btn.addEventListener('mousemove', move);
        btn.addEventListener('mouseleave', reset);
        cleanups.push(() => { btn.removeEventListener('mousemove', move); btn.removeEventListener('mouseleave', reset); });
      });

      // Cursor spotlight on image-led surfaces ---------------------------
      root.querySelectorAll<HTMLElement>('.vp-role-card, .vp-hero-dossier').forEach((card) => {
        const move = (ev: MouseEvent) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width) * 100}%`);
          card.style.setProperty('--my', `${((ev.clientY - r.top) / r.height) * 100}%`);
        };
        card.addEventListener('mousemove', move);
        cleanups.push(() => card.removeEventListener('mousemove', move));
      });

      // Subtle hero parallax — dossier shifts on scroll
      const dossier = root.querySelector<HTMLElement>('.vp-hero-dossier');
      const heroStage = root.querySelector<HTMLElement>('.vp-hero');
      if (dossier && heroStage) {
        const onParallax = () => {
          const rect = heroStage.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const pct = -rect.top / (rect.height + window.innerHeight);
          const offset = 24 * Math.max(-0.5, Math.min(0.5, pct));
          dossier.style.transform = `translateZ(0) translateY(${offset}px)`;
        };
        window.addEventListener('scroll', onParallax, { passive: true });
        cleanups.push(() => window.removeEventListener('scroll', onParallax));
      }
    }

    return () => { ctx.revert(); cleanups.forEach((c) => c()); };
  }, []);

  return (
    <div className="vp-home" ref={containerRef}>
      <SEOHead
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Vantage Point',
          url: 'https://vantagepoint.africa',
          description:
            'The first unified marketplace for outdoor advertising in Sub-Saharan Africa. Find and book billboards across Lagos, Accra, Nairobi, Johannesburg, and Cape Town in minutes.',
          address: { '@type': 'PostalAddress', addressCountry: 'GH' },
          areaServed: [
            { '@type': 'Country', name: 'Ghana' },
            { '@type': 'Country', name: 'Nigeria' },
            { '@type': 'Country', name: 'Kenya' },
            { '@type': 'Country', name: 'South Africa' },
          ],
        }}
      />
      <div className="vp-noise" aria-hidden="true" />
      <div className="vp-grid-bg" aria-hidden="true" />

      {/* ─── HERO ─── */}
      <section className="vp-stage vp-hero" aria-labelledby="hero-title" id="home">
        <div className="vp-wrap vp-hero-split">
          <div className="vp-hero-copy">
            <p className="vp-eyebrow reveal">Africa's out-of-home marketplace</p>
            <h1 className="reveal" id="hero-title">
              Find and book billboards across Africa in under&nbsp;5&nbsp;minutes.
            </h1>
            <p className="vp-lead reveal">
              The first unified marketplace for outdoor advertising in Sub-Saharan Africa.
              One search, one price, one booking.
            </p>
            <div className="vp-pill-row reveal">
              <Link to="/booking" className="vp-btn primary">Start booking <ArrowUpRight className="w-3.5 h-3.5" /></Link>
              <button onClick={() => setAuthMode('register')} className="vp-btn">Create account</button>
            </div>
            <div className="vp-metrics vp-hero-metrics reveal" aria-label="Platform metrics">
              <Link to="/booking" className="vp-metric vp-metric-accent"><strong data-count="4.5" data-suffix="min">4.5min</strong><span>Avg. time to book</span></Link>
              <div className="vp-metric"><strong data-count="5">5</strong><span>Cities live today</span></div>
              <div className="vp-metric"><strong data-count="42" data-suffix="+">42+</strong><span>Publishers consolidated</span></div>
            </div>
          </div>

          {/* Product proof: carousel of live available inventory */}
          <div className="vp-hero-visual reveal">
            {board && (
              <article
                className={`vp-hero-dossier${fading ? ' vp-fading' : ''}`}
                aria-label={`Billboard ${idx + 1} of ${slides.length}: ${board.title}`}
              >
                <img
                  src={board.imageUrl}
                  alt={`${board.city} — ${board.title}`}
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <span className="vp-live-dot"><i />Available now</span>
                <div className="vp-hero-inv">
                  <div className="vp-inv-top">
                    <span className="vp-inv-loc"><MapPin className="w-3.5 h-3.5" /> {board.location} · {board.city}</span>
                    <span className="vp-inv-avail">Available</span>
                  </div>
                  <div className="vp-inv-meta">
                    <div><b>{board.format.split(' ')[0]}</b><small>{board.dimensions}</small></div>
                    <div><b>{board.monthlyImpressions}</b><small>monthly reach</small></div>
                    <div><b>${board.dailyRate}</b><small>per day</small></div>
                  </div>
                  <div className="vp-inv-foot">
                    <nav className="vp-carousel-nav" aria-label="Browse available billboards">
                      <button
                        className="vp-carousel-nav__btn"
                        onClick={() => go(-1)}
                        aria-label="Previous billboard"
                        disabled={slides.length <= 1}
                      >‹</button>
                      <span className="vp-carousel-nav__count" aria-live="polite">
                        {String(idx + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(slides.length).padStart(2, '0')}
                      </span>
                      <button
                        className="vp-carousel-nav__btn"
                        onClick={() => go(1)}
                        aria-label="Next billboard"
                        disabled={slides.length <= 1}
                      >›</button>
                    </nav>
                    <Link to="/booking" className="vp-btn sm primary">Book this board <ArrowUpRight className="w-3 h-3" /></Link>
                  </div>
                </div>
                <span className="vp-hero-dossier-index" aria-hidden="true">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </article>
            )}
          </div>
        </div>

        {/* City marquee — social proof + motion */}
        <div className="vp-marquee reveal" aria-label="Cities served">
          <div className="vp-marquee-track">
            {[...CITIES, ...CITIES].map((c, i) => (
              <span key={i} className="vp-marquee-item"><MapPin className="w-3 h-3" />{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STACKING SECTIONS ─── */}
      <div className="vp-stack-container">

      {/* ─── PROBLEM ─── */}
      <section className="vp-stage vp-problem vp-stack" style={{'--stack-index': 1} as React.CSSProperties} aria-labelledby="problem-title">
        <div className="vp-wrap vp-problem-layout">
          <div className="vp-problem-copy">
            <p className="vp-eyebrow reveal">The problem</p>
            <h2 className="reveal" id="problem-title">
              Stop emailing <span>42 people</span> to book one billboard.
            </h2>
            <p className="vp-lead reveal">
              The old workflow scatters discovery, pricing, proof, and booking across separate operators.
              It takes 18 days on average.
            </p>
            <div className="vp-metrics vp-problem-metrics reveal" aria-label="Problem metrics">
              <div className="vp-metric vp-problem-metric"><strong data-count="18" data-suffix=" days">18 days</strong><span>Average booking cycle</span></div>
              <div className="vp-metric vp-problem-metric"><strong data-count="42" data-suffix="%">42%</strong><span>Inventory sits empty</span></div>
              <div className="vp-metric vp-problem-metric"><strong data-count="6" data-suffix="+">6+</strong><span>Manual approval stages</span></div>
            </div>
          </div>
          <div className="vp-problem-pains reveal">
            {PAIN_CARDS.map(({ Icon, title, desc }, index) => (
              <article className="vp-problem-pain" key={title}>
                <span className="vp-problem-icon" aria-hidden="true"><Icon /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span className="vp-problem-index" aria-hidden="true">0{index + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section className="vp-stage vp-stack" id="roles" style={{'--stack-index': 2} as React.CSSProperties}>
        <div className="vp-wrap">
          <div className="vp-section-head vp-center">
            <p className="vp-eyebrow reveal">One platform. Four workspaces.</p>
            <h2 className="reveal">Pick the workspace that matches your role.</h2>
            <p className="vp-lead reveal" style={{ margin: '0 auto' }}>
              Buyers book. Publishers list. Admins operate. Investors review.
            </p>
          </div>
          <div className="vp-role-floor reveal">
            {ROLE_CARDS.map(({ title, image, desc, cta, href, alt, tag }) => (
              <Link
                to={href}
                className="vp-role-card"
                key={title}
                style={{ '--image': `url('${image}')` } as React.CSSProperties}
                aria-label={`${title} — ${alt}`}
              >
                <span className="vp-role-corner vp-role-corner-tl" />
                <span className="vp-role-corner vp-role-corner-tr" />
                <span className="vp-role-corner vp-role-corner-bl" />
                <span className="vp-role-corner vp-role-corner-br" />
                <span className="vp-role-tag">{tag}</span>
                <div className="vp-role-body">
                  <h3>{title}</h3>
                  <div className="vp-role-reveal">
                    <p>{desc}</p>
                    <span className="vp-btn sm primary">{cta} <ArrowUpRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OPERATING MODEL ─── */}
      <section className="vp-stage vp-stack" id="gateway" style={{'--stack-index': 3} as React.CSSProperties}>
        <div className="vp-wrap">
          <div className="vp-section-head">
            <p className="vp-eyebrow reveal">How it works</p>
            <h2 className="reveal">Discover, price, schedule, operate.</h2>
            <p className="vp-lead reveal">
              Four steps from search to live campaign. Deep workflows sit behind the right user role.
            </p>
          </div>
          <div className="vp-operating-grid reveal">
            {OPERATING_STEPS.map(({ num, Icon, title, desc }) => (
              <article className="vp-system-module" key={num}>
                <div className="vp-step-head">
                  <span className="vp-step-icon"><Icon className="w-5 h-5" /></span>
                  <span className="vp-num">{num}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

        <div className="vp-stack-shadow" aria-hidden="true" />
      </div>

      {/* ─── CTA ─── */}
      <section className="vp-stage vp-center vp-cta" id="booking">
        <div className="vp-wrap">
          <p className="vp-eyebrow reveal">Get started</p>
          <h2 className="reveal">Ready to book? Pick your workspace.</h2>
          <p className="vp-lead reveal">
            The homepage is intentionally light. Dashboards and infrastructure live behind their respective roles.
          </p>
          <div className="vp-pill-row reveal" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Open booking page <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            <button onClick={() => setAuthMode('register')} className="vp-btn">Sign up</button>
            <button onClick={() => setAuthMode('signin')} className="vp-btn raised">Login</button>
          </div>
        </div>
      </section>
    </div>
  );
}
