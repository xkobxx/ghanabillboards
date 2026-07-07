import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Check, List, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=2400&q=85';

const STEPS = [
  { Icon: List, title: 'List your billboard', desc: 'Upload photos, set dimensions, set your daily rate, and define availability. Takes 10 minutes.' },
  { Icon: Calendar, title: 'Get booked', desc: 'Buyers discover your inventory, review specs, and book available dates. You approve or decline.' },
  { Icon: DollarSign, title: 'Get paid', desc: 'Paystack escrow holds funds during the campaign. Payout is processed 48 hours after completion.' },
];

const REQUIREMENTS = [
  'You own or have exclusive rights to the billboard structure',
  'Clear, unobstructed visibility from the primary road or pedestrian path',
  'Valid business registration or tax ID in your country of operation',
  'High-resolution photo of the structure from multiple angles',
  'Accurate dimensions and format classification',
];

export default function PublishPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { setAuthMode } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('.vp-parallax').forEach((el) => {
        gsap.to(el, { y: '-20px', ease: 'none',
          scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title="List a Billboard — Vantage Point" description="Earn revenue from your billboard inventory. List your locations on Africa's fastest-growing OOH marketplace." />

      {/* Hero */}
      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">PUBLISHER</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 640 }}>Turn your billboards into revenue. No broker needed.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 540 }}>
            List your inventory on Africa&apos;s fastest-growing OOH marketplace. Set your rates, manage bookings, and get paid — all from one dashboard.
          </p>
          <div className="vp-pill-row gsap-fade-up">
            <button onClick={() => setAuthMode('register')} className="vp-btn primary">
              Apply to list <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Link to="/pricing" className="vp-btn">View pricing</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">How it works</p>
            <h2>Three steps to earning from your inventory.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {STEPS.map(({ Icon, title, desc }, i) => (
              <article key={title} className="gsap-fade-up card-interactive" style={{
                padding: 'clamp(20px, 2.5vw, 28px)',
                border: '1px solid var(--vp-line)',
                display: 'grid', gap: 12, alignContent: 'start',
              }}>
                <span style={{
                  width: 40, height: 40, border: '1px solid var(--vp-line)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', fontWeight: 700,
                  color: 'var(--vp-dim)', marginBottom: 4,
                }}>0{i + 1}</span>
                <Icon size={18} style={{ color: 'var(--vp-primary)' }} />
                <h3 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 700, margin: 0 }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 680 }}>
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">Requirements</p>
            <h2>What you need to get started.</h2>
          </div>
          <div className="gsap-fade-up card-interactive" style={{ display: 'grid', gap: 12, padding: 'clamp(24px, 3vw, 32px)', border: '1px solid var(--vp-line)' }}>
            {REQUIREMENTS.map((req) => (
              <div key={req} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.6 }}>
                <Check size={14} style={{ color: 'var(--vp-primary)', flexShrink: 0, marginTop: 3 }} />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">START EARNING</p>
          <h2 className="gsap-fade-up">Ready to list your billboards?</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <button onClick={() => setAuthMode('register')} className="vp-btn primary">
              Apply to list <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Link to="/pricing" className="vp-btn">View publisher plans</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
