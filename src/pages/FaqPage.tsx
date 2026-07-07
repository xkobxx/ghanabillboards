import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=2400&q=85';

const SECTIONS = [
  {
    id: 'booking', label: 'Booking',
    items: [
      { q: 'How do I book a billboard?', a: 'Search by city, format, and price range on the booking page. Select your desired dates and submit a booking request. The publisher confirms availability within 24 hours.' },
      { q: 'Can I cancel a booking?', a: 'Yes. Bookings can be cancelled up to 14 days before the start date at no charge. Late cancellations may incur a fee based on the publisher\'s cancellation policy.' },
      { q: 'How long does a booking take?', a: 'Most bookings are confirmed within a few hours. The average time from search to confirmed booking is under 5 minutes.' },
      { q: 'Can I book multiple billboards at once?', a: 'Yes. You can add multiple billboards to your cart and submit them as a single campaign. Each billboard is booked individually with its publisher.' },
      { q: 'What happens if a billboard is unavailable?', a: 'The system shows real-time availability. If a date you selected becomes unavailable during the booking process, you\'ll be notified before payment is processed.' },
    ],
  },
  {
    id: 'payments', label: 'Payments',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept cards, bank transfers, and mobile money via Paystack. Supported currencies include USD, GHS, NGN, KES, and ZAR.' },
      { q: 'How does escrow work?', a: 'Funds are held by Paystack escrow when you book. They are released to the publisher only after the campaign runs successfully. This protects both buyers and publishers.' },
      { q: 'Is there a minimum spend?', a: 'No minimum spend. You can book a single billboard for as little as one week.' },
      { q: 'Are there any hidden fees?', a: 'The 15% commission is included in the total shown during checkout. No booking fees, no processing fees, no surprises.' },
      { q: 'How do publishers get paid?', a: 'Payouts are processed 48 hours after campaign completion. Funds are sent to the publisher\'s linked bank account or mobile money wallet via Paystack.' },
    ],
  },
  {
    id: 'publishers', label: 'Publishers',
    items: [
      { q: 'Who can list a billboard?', a: 'Any billboard owner or operator with verified rights to the structure. You\'ll need a valid business registration or tax ID in your country of operation.' },
      { q: 'How much does it cost to list?', a: 'Listing is free on the basic tier. You can start with one billboard at no cost. Growth and Enterprise plans offer additional features for a monthly fee.' },
      { q: 'How are publishers vetted?', a: 'Every publisher undergoes a verification process including business registration validation, physical site inspection, and ownership documentation.' },
      { q: 'Can I set my own rates?', a: 'Yes. You set the daily rate for each of your billboards. The platform displays your rates transparently to all buyers.' },
      { q: 'What happens if a buyer damages my billboard?', a: 'Our terms of service require buyers to use approved installation methods. Any damage is covered by the buyer\'s campaign deposit, which is held in escrow.' },
    ],
  },
  {
    id: 'platform', label: 'Platform',
    items: [
      { q: 'What countries are supported?', a: 'We currently operate in Ghana, Nigeria, Kenya, South Africa, and Côte d\'Ivoire, with coverage across 47 cities. We\'re expanding to new markets monthly.' },
      { q: 'Can I access the platform on mobile?', a: 'Yes. The platform is fully responsive and works on all devices. Dashboard views are optimised for both desktop and mobile use.' },
      { q: 'Is there an API for programmatic booking?', a: 'Yes. Our API gateway supports programmatic booking, inventory search, and campaign reporting. Developer documentation is available in the Developer Console.' },
      { q: 'How is traffic data verified?', a: 'We use mobility telemetry and traffic data from multiple sources to provide verified impression estimates. Proof-of-play logs are available for every campaign.' },
      { q: 'What support options are available?', a: 'All users get email support. Growth and Enterprise publishers get priority support. Enterprise publishers also receive a dedicated account manager.' },
    ],
  },
];

function AccordionSection({ section }: { section: typeof SECTIONS[number] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--vp-line)' }}>
      {section.items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} style={{ borderBottom: '1px solid var(--vp-line)' }}>
            <button type="button" onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '16px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                color: 'var(--vp-ink)', fontFamily: 'var(--font-sans)', fontWeight: 600,
                fontSize: 'var(--text-body-sm)', lineHeight: 1.4,
                transition: 'background .22s var(--vp-ease)', borderRadius: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--vp-panel)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {item.q}
              <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--vp-dim)', transition: 'transform .3s var(--vp-ease)', transform: isOpen ? 'rotate(-180deg)' : 'rotate(0)' }} />
            </button>
            <div style={{
              display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows .4s cubic-bezier(.16,1,.3,1)',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, padding: '0 0 16px', color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, maxWidth: 640 }}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FaqPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('booking');

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
      <SEOHead title="FAQ — Vantage Point" description="Frequently asked questions about booking, payments, publishers, and the Vantage Point platform." />

      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">FAQ</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 600 }}>Questions? We&apos;ve got answers.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 520 }}>
            Everything you need to know about booking, payments, publishing, and using the platform.
          </p>
        </div>
      </section>

      {/* Section tabs */}
      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 760 }}>
          <div className="gsap-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {SECTIONS.map((sec) => (
              <button key={sec.id} type="button" onClick={() => setActiveSection(sec.id)}
                className={`filter-chip ${activeSection === sec.id ? 'active' : ''}`}>
                {sec.label}
              </button>
            ))}
          </div>
          <div className="gsap-fade-up">
            {SECTIONS.filter(s => s.id === activeSection).map((sec) => (
              <div key={sec.id}>
                <AccordionSection section={sec} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">STILL HAVE QUESTIONS?</p>
          <h2 className="gsap-fade-up">We&apos;re here to help.</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <a href="mailto:hello@vantagepoint.media" className="vp-btn primary">Email us <ArrowUpRight className="w-3.5 h-3.5" /></a>
            <Link to="/booking" className="vp-btn">Start booking</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
