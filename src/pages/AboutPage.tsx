import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1590155641561-aaee38643c1e?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1722568357957-1c4b6a7b89a6?auto=format&fit=crop&w=2400&q=85';

const REACH_CITIES = ['Accra', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town', 'Kumasi', 'Abuja', 'Mombasa', 'Dakar', 'Abidjan'];

const TEAM = [
  { name: 'David Mensah', role: 'Founder & CEO', bio: 'Former media strategist. Building Africa\'s first unified OOH marketplace.', gradient: 'linear-gradient(135deg, #0D9488, #042f2e)', initials: 'DM' },
  { name: 'Ama Osei', role: 'Head of Operations', bio: 'Supply chain and logistics across 47 African markets.', gradient: 'linear-gradient(135deg, #5200FF, #1a0033)', initials: 'AO' },
  { name: 'Kofi Anane', role: 'CTO', bio: 'Platform architecture, API gateway, and marketplace infrastructure.', gradient: 'linear-gradient(135deg, #EC4899, #4a002d)', initials: 'KA' },
  { name: 'Zara Kone', role: 'Head of Partnerships', bio: 'Onboarding publishers and negotiating exclusive inventory deals.', gradient: 'linear-gradient(135deg, #F59E0B, #4a2e00)', initials: 'ZK' },
];

const MILESTONES = [
  { year: '2024', event: 'Concept validation with 12 publishers across Ghana and Nigeria' },
  { year: '2025 Q1', event: 'Platform launch — Accra and Lagos go live with 42+ publisher integrations' },
  { year: '2025 Q3', event: 'Nairobi and Johannesburg added. Paystack escrow integration shipped.' },
  { year: '2026 Q1', event: '10-city expansion. API gateway opens for programmatic bookings.' },
  { year: '2026 Q3', event: 'Phase 2: Full-scale programmatic exchange across Sub-Saharan Africa' },
];

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('.vp-parallax').forEach((el) => {
        gsap.to(el, {
          y: () => el.closest('.vp-hero-section') ? '-20px' : '30px',
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title="About — Vantage Point" description="Africa's first unified marketplace for outdoor advertising. Mission, team, and milestones." />

      {/* Hero */}
      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">ABOUT</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 680 }}>Digitising outdoor advertising for a continent on the move.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 580 }}>
            Vantage Point is building the operating system for Africa&apos;s $1.2B out-of-home advertising market.
            One search, one price, one booking — across 47 cities.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="gsap-fade-up card-interactive" style={{
            padding: 'clamp(32px, 4vw, 48px)', border: '1px solid var(--vp-line)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40,
          }}>
            <div>
              <p className="vp-eyebrow" style={{ marginBottom: 12 }}>Mission</p>
              <h2 style={{ fontSize: 'var(--text-h3)', margin: 0 }}>Bringing outdoor advertising into the digital age.</h2>
            </div>
            <div style={{ display: 'grid', gap: 20 }}>
              <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: 0 }}>
                The problem is analogue: 45,000+ billboards across Sub-Saharan Africa, each priced, booked, and verified
                through phone calls and PDF rate cards. It takes 18 days on average to book one billboard.
              </p>
              <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: 0 }}>
                We replace this with a programmatic marketplace. Search by city, format, traffic tier, and budget.
                See transparent pricing. Book in under 5 minutes. Track campaign delivery in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Geographic presence */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">Coverage</p>
            <h2>Active in 10+ cities, expanding monthly.</h2>
          </div>
          <div className="gsap-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 16 }}>
            {REACH_CITIES.map((city) => (
              <span key={city} className="vp-city-chip">
                <MapPin size={12} />{city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">Team</p>
            <h2>The people building the platform.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {TEAM.map((member) => (
              <article key={member.name} className="gsap-fade-up card-interactive vp-team-card" style={{ padding: '24px', border: '1px solid var(--vp-line)', display: 'grid', alignContent: 'start', gap: 14 }}>
                <div
                  className="vp-team-avatar"
                  style={{ background: member.gradient }}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-body-sm)', marginBottom: 2 }}>{member.name}</h3>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '.04em', marginBottom: 8, textTransform: 'uppercase' }}>{member.role}</p>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.6, margin: 0 }}>{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 640 }}>
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">Milestones</p>
            <h2>Our journey so far.</h2>
          </div>
          <div style={{ borderLeft: '1px solid var(--vp-line)', paddingLeft: 24, display: 'grid', gap: 28 }}>
            {MILESTONES.map((m, i) => (
              <div key={i} className="gsap-fade-up card-interactive vp-timeline-item" style={{ position: 'relative' }}>
                <span className="vp-timeline-dot" />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--vp-primary)', marginBottom: 4 }}>{m.year}</p>
                <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.6, margin: 0 }}>{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">JOIN US</p>
          <h2 className="gsap-fade-up">Be part of Africa&apos;s OOH revolution.</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Start booking <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            <Link to="/publish" className="vp-btn">List your billboard</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
