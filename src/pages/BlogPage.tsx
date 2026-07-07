import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { blogApi } from '../lib/blogApi';
import type { BlogPost } from '../types';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85';
const CTA_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85';
const PLACEHOLDER_POST_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&q=80';

const CATEGORIES = ['All', 'Industry', 'Product', 'Market data'];

export default function BlogPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeCat, setActiveCat] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.list()
      .then(setPosts)
      .catch(() => { /* ponytail: silent fail, show empty state */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || posts.length === 0) return;
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
  }, [loading, posts.length]);

  const filtered = activeCat === 'All' ? posts : posts.filter(a => a.category === activeCat);

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

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="blog-card" style={{
                  height: 280, border: '1px solid var(--vp-line)',
                  background: 'rgba(255,255,255,.03)',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)' }}>
              {posts.length === 0 ? 'No posts published yet.' : 'No posts in this category.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filtered.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`} className="blog-card card-interactive" style={{
                  position: 'relative', overflow: 'hidden',
                  padding: 'clamp(20px, 2.5vw, 28px)',
                  border: '1px solid var(--vp-line)',
                  display: 'grid', alignContent: 'start', gap: 12,
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div className="blog-card-bg-overlay" style={{ position: 'absolute', inset: 0, background: `var(--vp-bg)`, opacity: 0.92, pointerEvents: 'none', transition: 'opacity .4s var(--vp-ease)' }} />
                  <div className="blog-card-bg-image" style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${article.imageUrl || PLACEHOLDER_POST_IMG})`,
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
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)' }}>
                        {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
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
          )}
        </div>
      </section>

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
