import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=2400&q=85';

const IMAGES: Record<string, string> = {
  Accra: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
  Lagos: 'https://images.unsplash.com/photo-1578991624413-2f0e18d3b897?w=600&q=80',
  Nairobi: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
  Johannesburg: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=600&q=80',
  Cape_Town: 'https://images.unsplash.com/photo-1580062617399-e6970faf3ae5?w=600&q=80',
  Kumasi: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
  Abuja: 'https://images.unsplash.com/photo-1578991624413-2f0e18d3b897?w=600&q=80',
  Mombasa: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
};

const CITIES = [
  { name: 'Accra', country: 'Ghana', count: '42+', formats: ['Digital', 'Static', 'Bridge'], coord: '5.56°N · 0.20°W' },
  { name: 'Lagos', country: 'Nigeria', count: '68+', formats: ['Digital', 'Static', 'Pillar'], coord: '6.52°N · 3.37°E' },
  { name: 'Nairobi', country: 'Kenya', count: '35+', formats: ['Digital', 'Bridge', 'Static'], coord: '1.29°S · 36.82°E' },
  { name: 'Johannesburg', country: 'South Africa', count: '54+', formats: ['Digital', 'Pillar', 'Static'], coord: '26.20°S · 28.02°E' },
  { name: 'Cape Town', country: 'South Africa', count: '28+', formats: ['Static', 'Digital', 'Bridge'], coord: '33.92°S · 18.42°E' },
  { name: 'Kumasi', country: 'Ghana', count: '18+', formats: ['Static', 'Digital'], coord: '6.68°N · 1.62°W' },
  { name: 'Abuja', country: 'Nigeria', count: '22+', formats: ['Digital', 'Static'], coord: '9.08°N · 7.40°E' },
  { name: 'Mombasa', country: 'Kenya', count: '14+', formats: ['Static', 'Bridge'], coord: '4.04°S · 39.67°E' },
];

export default function LocationsPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = rootRef.current?.querySelectorAll<HTMLElement>('.location-card');
      if (cards) {
        gsap.fromTo(cards, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06,
          scrollTrigger: { trigger: cards[0], start: 'top 82%', once: true },
        });
      }
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
      <SEOHead title="Locations — Vantage Point" description="Browse billboard inventory across Accra, Lagos, Nairobi, Johannesburg, and 40+ African cities." />

      {/* Hero */}
      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">LOCATIONS</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 640 }}>Coverage across Africa&apos;s fastest-growing cities.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 540 }}>
            Each city has active, verified inventory ready to book. Digital, static, bridge, and pillar formats available.
          </p>
        </div>
      </section>

      {/* City grid */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {CITIES.map((city) => (
              <article key={city.name} className="location-card vp-city-card card-interactive" style={{
                padding: 'clamp(20px, 2.5vw, 28px)',
                border: '1px solid var(--vp-line)',
                display: 'grid', gap: 12,
              }}>
                <div className="vp-city-card-bg" style={{ backgroundImage: `url(${IMAGES[city.name.replace(' ', '_')]})` }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-h3)', margin: 0, lineHeight: 1.1 }}>{city.name}</h3>
                      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '.04em' }}>{city.country}</p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--vp-primary)',
                      fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      {city.count}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-muted)', fontFamily: 'var(--font-mono)', margin: '12px 0 0', letterSpacing: '.02em' }}>{city.coord}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                    {city.formats.map((fmt) => (
                      <span key={fmt} style={{
                        fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                        padding: '2px 8px', border: '1px solid var(--vp-line)',
                        color: 'var(--vp-dim)', textTransform: 'uppercase', letterSpacing: '.04em',
                      }}>{fmt}</span>
                    ))}
                  </div>
                  <Link to="/booking" className="vp-btn sm" style={{ justifySelf: 'start', marginTop: 16 }}>
                    Browse <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / metrics */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">By the numbers</p>
            <h2>Our footprint, in brief.</h2>
          </div>
          <div className="gsap-fade-up" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32,
          }}>
            {[
              { label: 'Cities', value: '10+' },
              { label: 'Billboards', value: '280+' },
              { label: 'Countries', value: '5' },
              { label: 'Formats', value: '4' },
            ].map((stat) => (
              <div key={stat.label} className="card-interactive vp-stat-card-mini" style={{
                padding: '28px 24px', border: '1px solid var(--vp-line)', textAlign: 'center',
              }}>
                <p style={{
                  fontSize: 'var(--text-h2)', fontWeight: 600, margin: 0, lineHeight: 1,
                  fontFamily: 'var(--font-mono)', color: 'var(--vp-primary)',
                }}>{stat.value}</p>
                <p style={{
                  fontSize: 'var(--text-caption)', margin: '8px 0 0', color: 'var(--vp-dim)',
                  fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.04em',
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">READY?</p>
          <h2 className="gsap-fade-up">Find inventory in any of our cities.</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Browse all cities <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
