import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'When you register for an account, we collect your name, email address, company name, and billing information. When you use the platform, we collect data about your searches, bookings, and campaign activity. This includes billboard preferences, saved searches, booking history, and communication preferences.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to operate the marketplace, process bookings, facilitate payments, and provide customer support. We also use aggregated, anonymised data to improve the platform, generate market insights, and develop new features. We do not sell your personal information to third parties.',
  },
  {
    title: 'Payment Processing',
    body: 'Payment processing on Vantage Point is handled by Paystack, a PCI-DSS compliant payment processor. Your payment details are transmitted directly to Paystack and are never stored on our servers. Paystack\'s privacy policy governs how they handle your payment data.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your account information for as long as your account is active. Booking and transaction records are retained for 7 years to comply with financial regulations in the jurisdictions where we operate. You may request deletion of your account and associated data at any time by contacting our support team.',
  },
  {
    title: 'Your Rights',
    body: 'Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also have the right to restrict or object to certain processing activities. To exercise these rights, please contact us at privacy@vantagepoint.media.',
  },
  {
    title: 'Cookies',
    body: 'We use essential cookies to operate the platform and optional analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.',
  },
  {
    title: 'Data Sharing',
    body: 'We share your data with publishers only as necessary to fulfill bookings (name, company, campaign details). We share data with Paystack for payment processing. We do not share personal data with any other third parties without your explicit consent, except where required by law.',
  },
  {
    title: 'Security',
    body: 'We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest, and regular security audits. Access to production data is restricted to authorised personnel only. We maintain SOC 2 compliance for data handling practices.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this privacy policy from time to time. Material changes will be communicated via email and through a notice on the platform. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
  {
    title: 'Contact',
    body: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@vantagepoint.media or write to: Vantage Point Media Ltd, Accra, Ghana, West Africa.',
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

export default function PrivacyPage() {
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
      <SEOHead title="Privacy Policy — Vantage Point" />

      <section className="vp-stage" style={{ paddingTop: 140 }}>
        <div className="vp-wrap" style={{ maxWidth: 720 }}>
          <p className="vp-eyebrow gsap-fade-up">PRIVACY POLICY</p>
          <h1 className="gsap-fade-up" style={{ maxWidth: 620, marginBottom: 8 }}>How we handle your data.</h1>
          <p className="gsap-fade-up" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)', margin: 0 }}>
            Last updated: June 2026
          </p>
        </div>
      </section>

      <section className="vp-stage">
        <div className="vp-wrap" style={{ maxWidth: 960 }}>
          <div className="gsap-fade-up" style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: '0 0 40px' }}>
            <p style={{ marginBottom: 16 }}>
              Vantage Point Media Ltd ("Vantage Point," "we," "us," or "our") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 40 }}>
            <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
              <p className="vp-eyebrow" style={{ marginBottom: 16 }}>CONTENTS</p>
              <nav className="vp-sidebar-nav">
                {SECTIONS.map(({ title }) => (
                  <a
                    key={slugify(title)}
                    href={`#${slugify(title)}`}
                    className="vp-sidebar-link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(slugify(title))?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </aside>

            <div style={{ borderTop: '1px solid var(--vp-line)' }}>
              {SECTIONS.map(({ title, body }, i) => (
                <div
                  key={i}
                  id={slugify(title)}
                  className="gsap-fade-up"
                  style={{ padding: '24px 0', borderBottom: '1px solid var(--vp-line)' }}
                >
                  <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{title}</h2>
                  <p style={{ color: 'var(--vp-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 1.7, margin: 0, maxWidth: 640 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
