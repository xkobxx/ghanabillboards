import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1722568357957-1c4b6a7b89a6?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=2400&q=85';

const BUYER_INFO = {
  title: 'Book on commission. No retainer, no monthly fee.',
  subtitle: 'Pay only for campaigns you actually book. 15% platform commission, transparently added to the publisher\'s daily rate at checkout.',
  items: ['15% commission, included in the total shown at checkout', 'No monthly subscription', 'No minimum commitment — book as little or as much as you want'],
};

const TIERS = [
  {
    name: 'Free', price: '0', desc: 'Start listing with no upfront cost.',
    items: ['List 1 billboard', 'Standard support', 'Basic analytics', '7-day payout cycle'],
    popular: false,
  },
  {
    name: 'Growth', price: '49', desc: 'For growing portfolios.',
    items: ['Up to 20 billboards', 'Priority support', 'Advanced analytics', '3-day payout cycle', 'API access'],
    popular: true,
  },
  {
    name: 'Enterprise', price: '—', desc: 'For operators with 50+ billboards.',
    items: ['Unlimited billboards', 'Dedicated account manager', 'Custom analytics dashboard', 'Next-day payout', 'Full API', 'White-label option'],
    popular: false,
  },
];

const FAQ_ITEMS = [
  { q: 'How does buyer pricing work?', a: 'Buyers pay a 15% commission on the publisher\'s daily rate. For example, if a billboard is listed at $100/day, the buyer sees $115/day. The $15 covers our platform, escrow, and verification services.' },
  { q: 'Can I change my publisher plan?', a: 'Yes, upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle. Pro-rated refunds are issued for downgrades.' },
  { q: 'Are there transaction fees?', a: 'No additional transaction fees. Payment processing is handled by Paystack, and their standard processing fees are included in the commission.' },
  { q: 'How long is the contract?', a: 'Buyers pay per campaign — no contract. Publishers on paid plans are on a monthly contract, cancel anytime. Enterprise plans are annual with a 30-day opt-out.' },
  { q: 'What currencies do you support?', a: 'USD, GHS, NGN, KES, and ZAR. Payouts are made in the publisher\'s preferred currency via Paystack.' },
];

export default function PricingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <SEOHead title="Pricing — Vantage Point" description="Transparent pricing for Africa's billboard marketplace. Commission-based for buyers, tiered SaaS for publishers." />

      <section className="vp-stage vp-hero-section" style={{ paddingTop: 140 }}>
        <img className="vp-hero-bg vp-parallax" src={HERO_IMG} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">PRICING</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 640 }}>Transparent pricing. No hidden fees. No email chains.</h1>
          <p className="vp-lead gsap-fade-up" style={{ maxWidth: 540 }}>
            Buyers pay only when campaigns run. Publishers choose the tier that fits their portfolio.
          </p>
        </div>
      </section>

      {/* Buyer */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="gsap-fade-up card-interactive" style={{
            padding: 'clamp(32px, 4vw, 48px)', border: '1px solid var(--vp-primary-line)', maxWidth: 720,
            background: 'var(--vp-primary-dim)',
          }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--vp-primary)', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>For Buyers</p>
            <h2 style={{ marginBottom: 8, fontSize: 'var(--text-h2)' }}>{BUYER_INFO.title}</h2>
            <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', marginBottom: 24, lineHeight: 1.6 }}>{BUYER_INFO.subtitle}</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 32 }}>
              {BUYER_INFO.items.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-body-sm)', lineHeight: 1.5, color: 'var(--vp-muted)' }}>
                  <Check size={14} style={{ color: 'var(--vp-primary)', flexShrink: 0 }} />{item}
                </div>
              ))}
            </div>
            <Link to="/booking" className="vp-btn primary">Start booking <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>

      {/* Publisher tiers */}
      <section className="vp-stage">
        <div className="vp-wrap">
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">For Publishers</p>
            <h2>Choose the tier that fits your portfolio.</h2>
          </div>
          <div className="gsap-fade-up" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16,
          }}>
            {TIERS.map((tier) => (
              <article key={tier.name} className="card-interactive"
                style={{
                  padding: 'clamp(24px, 3vw, 32px)', border: '1px solid var(--vp-line)',
                  display: 'grid', gap: 16, position: 'relative',
                  ...(tier.popular ? { borderColor: 'var(--vp-primary-line)', background: 'var(--vp-primary-bg)' } : {}),
                }}
              >
                {tier.popular && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    padding: '4px 10px', fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                    background: 'var(--vp-primary)', color: 'var(--vp-primary-ink)', textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>Popular</span>
                )}
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--vp-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{tier.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-h2)', fontWeight: 700 }}>${tier.price}</span>
                    {tier.price !== '—' && <span style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)' }}>/mo</span>}
                  </div>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', lineHeight: 1.5, marginTop: 4 }}>{tier.desc}</p>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {tier.items.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)' }}>
                      <Check size={12} style={{ color: 'var(--vp-primary)', flexShrink: 0 }} />{item}
                    </div>
                  ))}
                </div>
                <Link to="/publish" className="vp-btn" style={{ width: '100%' }}>
                  {tier.popular ? 'Get started' : (tier.name === 'Free' ? 'Start free' : 'Contact us')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 680 }}>
          <div className="vp-section-head gsap-fade-up">
            <p className="vp-eyebrow">FAQ</p>
            <h2>Common billing questions.</h2>
          </div>
          <div className="gsap-fade-up" style={{ borderTop: '1px solid var(--vp-line)' }}>
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--vp-line)' }}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      padding: '16px 0', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                      color: 'var(--vp-ink)', fontFamily: 'var(--font-sans)', fontWeight: 600,
                      fontSize: 'var(--text-body-sm)', transition: 'color .22s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--vp-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--vp-ink)'}
                  >
                    {item.q}
                    <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--vp-dim)', transition: 'transform .3s var(--vp-ease)', transform: isOpen ? 'rotate(-180deg)' : 'rotate(0)' }} />
                  </button>
                  <div style={{
                    display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows .4s cubic-bezier(.16,1,.3,1)',
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ margin: 0, padding: '0 0 16px', color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7 }}>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vp-stage vp-center vp-cta">
        <img className="vp-cta-image" src={CTA_IMG} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" aria-hidden="true" />
        <div className="vp-wrap">
          <p className="vp-eyebrow gsap-fade-up">READY?</p>
          <h2 className="gsap-fade-up">Join Africa&apos;s growing OOH marketplace.</h2>
          <div className="vp-pill-row gsap-fade-up" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="vp-btn primary">Browse inventory <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            <Link to="/publish" className="vp-btn">List a billboard</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
