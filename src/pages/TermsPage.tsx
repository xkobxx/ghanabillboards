import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using the Vantage Point platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform. We may update these terms at any time; continued use after changes constitutes acceptance.',
  },
  {
    title: 'Marketplace Rules',
    body: 'Vantage Point operates as a marketplace connecting billboard buyers with publishers. We facilitate discovery, booking, and payment processing but are not a party to the advertising contract between buyer and publisher. All bookings are subject to publisher confirmation and availability.',
  },
  {
    title: 'User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate, current information during registration. Accounts found to be using fraudulent information may be suspended or terminated.',
  },
  {
    title: 'Payments and Fees',
    body: 'A 15% commission is applied to all bookings processed through the platform. This fee is included in the total price displayed during checkout. Publishers receive payment minus platform fees as per their subscription plan. All payments are processed through Paystack.',
  },
  {
    title: 'Prohibited Use',
    body: 'You may not use the platform for any unlawful purpose, to transmit harmful code, to interfere with platform operations, or to impersonate any person or entity. Advertisers may not place ads that violate local laws or regulations in the markets where the billboard is located.',
  },
  {
    title: 'Intellectual Property',
    body: 'The Vantage Point platform, including its design, code, trademarks, and proprietary algorithms, is owned by Vantage Point Media Ltd. You may not copy, modify, distribute, or create derivative works without our express written permission.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Vantage Point is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the fees you paid in the 12 months preceding the claim. This does not apply in jurisdictions where such limitations are prohibited.',
  },
  {
    title: 'Termination',
    body: 'We may suspend or terminate your account for violation of these terms, fraudulent activity, or conduct that harms the platform or its users. You may terminate your account at any time through your dashboard or by contacting support.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by the laws of the Republic of Ghana. Any disputes arising from these terms shall be resolved through arbitration in Accra, Ghana, in accordance with the rules of the Ghana Arbitration Centre.',
  },
  {
    title: 'Contact',
    body: 'For questions about these terms, contact legal@vantagepoint.media or write to: Vantage Point Media Ltd, Accra, Ghana, West Africa.',
  },
];

export default function TermsPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title="Terms of Service — Vantage Point" />

      <section className="vp-stage" style={{ paddingTop: 140 }}>
        <div className="vp-wrap" style={{ maxWidth: 720 }}>
          <p className="vp-eyebrow gsap-fade-up">TERMS OF SERVICE</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 620, marginBottom: 8 }}>The terms that govern platform use.</h1>
          <p className="gsap-fade-up" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)', margin: 0 }}>
            Last updated: June 2026
          </p>
        </div>
      </section>

      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 960, display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 40 }}>
          <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)', marginBottom: 16, letterSpacing: '0.05em' }}>CONTENTS</p>
            <nav style={{ display: 'grid', gap: 8 }}>
              {SECTIONS.map((section, i) => (
                <a key={i} href={`#${slug(section.title)}`} onClick={(e) => { e.preventDefault(); document.getElementById(slug(section.title))?.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-muted)', textDecoration: 'none', lineHeight: 1.4, cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--vp-text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--vp-muted)')}>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>
          <div>
            <div className="gsap-fade-up" style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: '0 0 40px' }}>
              <p style={{ marginBottom: 16 }}>
                These Terms of Service ("Terms") govern your access to and use of the Vantage Point platform and services.
                By using the platform, you agree to these Terms.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--vp-line)' }}>
              {SECTIONS.map((section, i) => (
                <div key={i} id={slug(section.title)} className="gsap-fade-up" style={{ padding: '24px 0', borderBottom: '1px solid var(--vp-line)' }}>
                  <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{section.title}</h2>
                  <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: 0, maxWidth: 640 }}>{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
