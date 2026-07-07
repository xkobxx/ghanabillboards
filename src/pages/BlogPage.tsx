import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85';

const CATEGORIES = ['All', 'Industry', 'Product', 'Market data'];

const ARTICLES = [
  {
    title: "The State of OOH Advertising in Africa 2026",
    date: 'Jun 24, 2026', category: 'Industry',
    excerpt: 'Out-of-home advertising across Sub-Saharan Africa is projected to reach $1.6B by 2028, driven by urbanisation, digital screen adoption, and programmatic buying.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&q=80',
  },
  {
    title: 'How Programmatic Booking Is Changing Outdoor Media',
    date: 'May 12, 2026', category: 'Product',
    excerpt: 'The shift from phone calls and PDF rate cards to real-time programmatic marketplace is reducing booking times from 18 days to under 5 minutes.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    title: 'Digital vs Static: Which Billboard Format Wins?',
    date: 'Apr 3, 2026', category: 'Market data',
    excerpt: 'Digital billboards command 4x higher rates than static but offer dynamic creative switching. We break down the ROI case for each format.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
  },
  {
    title: "Why Accra Is Becoming West Africa's Ad Hub",
    date: 'Mar 18, 2026', category: 'Industry',
    excerpt: 'With a 7% GDP growth rate and a booming creative sector, Accra is attracting major advertising spend from multinational brands targeting West Africa.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
  },
  {
    title: 'Introducing Real-Time Traffic Verification',
    date: 'Feb 10, 2026', category: 'Product',
    excerpt: 'Our new telemetry integration gives buyers verified traffic counts, dwell time data, and proof-of-play for every campaign running on the platform.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    title: "Nairobi OOH Market: 2026 Buyer's Guide",
    date: 'Jan 22, 2026', category: 'Market data',
    excerpt: 'Nairobi\'s billboard inventory grew 34% year-over-year. We map the key corridors, price ranges, and audience demographics for media buyers.',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
  },
];

export default function BlogPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = rootRef.current?.querySelectorAll<HTMLElement>('.blog-card');
      if (cards) {
        gsap.fromTo(cards, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: cards[0], start: 'top 82%', once: true },
        });
      }
      gsap.utils.toArray<HTMLElement>('.vp-parallax').forEach((el) => {
        gsap.to(el, { y: '-20px', ease: 'none',
          scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const filtered = activeCat === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeCat);

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title="Blog — Vantage Point" description="Insights, analysis, and product updates from Africa's out-of-home advertising marketplace." />

      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">BLOG</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 600 }}>Insights from Africa&apos;s OOH market.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 520 }}>
            Industry analysis, product updates, and market data for media buyers and advertising professionals.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="gsap-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCat(cat)}
                className={`filter-chip${activeCat === cat ? ' active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map((article) => (
              <Link key={article.title} to="/blog" className="blog-card card-interactive" style={{
                position: 'relative', overflow: 'hidden',
                padding: 'clamp(20px, 2.5vw, 28px)',
                border: '1px solid var(--vp-line)',
                display: 'grid', alignContent: 'start', gap: 12,
                textDecoration: 'none', color: 'inherit',
              }}>
                <div className="blog-card-bg-overlay" style={{ position: 'absolute', inset: 0, background: `var(--vp-bg)`, opacity: 0.92, pointerEvents: 'none', transition: 'opacity .4s var(--vp-ease)' }} />
                <div className="blog-card-bg-image" style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${article.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: 'transform .6s cubic-bezier(.16,1,.3,1)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                      padding: '2px 8px', border: '1px solid var(--vp-line)',
                      color: 'var(--vp-dim)', letterSpacing: '.04em', textTransform: 'uppercase',
                    }}>{article.category}</span>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)' }}>{article.date}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-body)', lineHeight: 1.4, margin: 0, fontWeight: 700, marginTop: 12 }}>{article.title}</h3>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.7, margin: 0, marginTop: 12 }}>{article.excerpt}</p>
                  <span className="blog-card-read-more" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: 'var(--vp-primary)', textTransform: 'uppercase', letterSpacing: '.06em',
                    marginTop: 4, transition: 'transform .3s var(--vp-ease)',
                  }}>
                    Read more <ArrowUpRight className="w-3 h-3" style={{ transition: 'transform .3s var(--vp-ease)' }} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">STAY UPDATED</p>
          <h2 className="gsap-fade-up">Get market insights delivered to your inbox.</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Browse inventory <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
