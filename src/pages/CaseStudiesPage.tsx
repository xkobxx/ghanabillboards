import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=2400&q=85';

const INDUSTRIES = ['All', 'FMCG', 'Telecoms', 'Finance', 'Retail'];

const STUDIES = [
  {
    brand: 'Zamzam Beverages', city: 'Accra', duration: '8 weeks', industry: 'FMCG',
    metric: '43%', metricLabel: 'brand recall lift',
    desc: 'A regional beverage brand used Vantage Point to place digital billboards across 12 high-traffic intersections in Accra. Real-time audience data showed peak engagement during evening commute hours.',
    tags: ['Digital', 'Multi-location', 'Brand recall'],
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80',
  },
  {
    brand: 'Swift Networks', city: 'Lagos', duration: '12 weeks', industry: 'Telecoms',
    metric: '2.8M', metricLabel: 'weekly impressions',
    desc: 'Swift Networks launched their fibre-to-home product across Lagos with a mix of digital and static billboards along key commuter corridors. Programmatic booking reduced their planning time from 3 weeks to 2 days.',
    tags: ['Programmatic', 'Mixed format', 'Product launch'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    brand: 'Prestige Banc', city: 'Nairobi', duration: '6 weeks', industry: 'Finance',
    metric: '38%', metricLabel: 'increase in branch inquiries',
    desc: 'Prestige Banc targeted Nairobi\'s financial district with premium digital placements. The campaign drove measurable foot traffic to their new SME banking centre.',
    tags: ['Digital', 'Premium placement', 'Foot traffic'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
];

export default function CaseStudiesPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndustry, setActiveIndustry] = useState('All');

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

  const filtered = activeIndustry === 'All' ? STUDIES : STUDIES.filter(s => s.industry === activeIndustry);

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title="Case Studies — Vantage Point" description="See how brands win with programmatic outdoor advertising across Africa." />

      {/* Hero */}
      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">CASE STUDIES</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 600 }}>How brands win with Vantage Point.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 520 }}>
            Real campaigns, real results. From FMCG to fintech, see how media buyers use programmatic OOH to outperform traditional outdoor advertising.
          </p>
        </div>
      </section>

      {/* Industry filter */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="gsap-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {INDUSTRIES.map((ind) => (
              <button key={ind} type="button" onClick={() => setActiveIndustry(ind)}
                className={`filter-chip ${activeIndustry === ind ? 'active' : ''}`}
              >
                {ind}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {filtered.map((study) => (
              <article key={study.brand} className="gsap-fade-up vp-study-card card-interactive" style={{
                border: '1px solid var(--vp-line)',
                display: 'grid', alignContent: 'start',
              }}>
                <img
                  className="vp-study-card-bg"
                  src={study.image}
                  alt=""
                  aria-hidden="true"
                />
                {/* Metric hero */}
                <div style={{
                  position: 'relative',
                  padding: 'clamp(24px, 3vw, 32px)', borderBottom: '1px solid var(--vp-line)',
                }}>
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <TrendingUp size={14} style={{ color: 'var(--vp-primary)' }} />
                    <span style={{ fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', color: 'var(--vp-primary)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Result</span>
                  </div>
                  <span className="vp-study-metric" style={{ position: 'relative', zIndex: 1, fontSize: 'var(--text-display)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1, color: 'var(--vp-ink)' }}>{study.metric}</span>
                  <p style={{ position: 'relative', zIndex: 1, fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', margin: '4px 0 0' }}>{study.metricLabel}</p>
                </div>
                {/* Content */}
                <div style={{ padding: 'clamp(20px, 2.5vw, 28px)', display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                      padding: '2px 8px', border: '1px solid var(--vp-line)',
                      color: 'var(--vp-dim)', letterSpacing: '.04em', textTransform: 'uppercase',
                    }}>{study.industry}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 700, margin: 0 }}>{study.brand}</h3>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)', margin: 0 }}>
                    {study.city} · {study.duration}
                  </p>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.7, margin: 0 }}>{study.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {study.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                        padding: '2px 8px', background: 'var(--vp-panel)', border: '1px solid var(--vp-line)',
                        color: 'var(--vp-dim)',
                      }}>{tag}</span>
                    ))}
                  </div>
                  <Link to="/case-studies" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: 'var(--vp-primary)', textTransform: 'uppercase', letterSpacing: '.06em',
                    textDecoration: 'none', marginTop: 4,
                  }}>Read full case study <ArrowUpRight className="w-3 h-3" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">YOUR CAMPAIGN</p>
          <h2 className="gsap-fade-up">Ready to run your own success story?</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Start a campaign <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
