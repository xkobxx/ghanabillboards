import { useRef, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { blogApi } from '../lib/blogApi';
import type { BlogPost } from '../types';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const rootRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogApi.get(slug)
      .then(setPost)
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.post-fade', { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [post]);

  if (loading) {
    return (
      <div className="vp-home min-h-screen bg-[var(--color-background)]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 140 }}>
        <p style={{ color: 'var(--vp-dim)', fontFamily: 'var(--font-mono)' }}>Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="vp-home min-h-screen bg-[var(--color-background)]" style={{ paddingTop: 140 }}>
        <div className="vp-wrap">
          <div className="vp-guard">
            <h4>Post not found</h4>
            <p>{error || 'The article you are looking for does not exist or has been removed.'}</p>
            <Link to="/blog" className="vp-btn primary" style={{ marginTop: 16 }}><ArrowLeft className="w-3.5 h-3.5" /> Back to blog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="vp-home min-h-screen bg-[var(--color-background)]">
      <SEOHead title={`${post.title} — Vantage Point`} description={post.excerpt} />

      <article style={{ paddingTop: 140 }}>
        <div className="vp-wrap" style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link to="/blog" className="post-fade" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
            color: 'var(--vp-dim)', textDecoration: 'none', marginBottom: 32,
            transition: 'color .3s',
          }}>
            <ArrowLeft className="w-3.5 h-3.5" /> All posts
          </Link>

          <div className="post-fade" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
              padding: '2px 8px', border: '1px solid var(--vp-line)',
              color: 'var(--vp-dim)', letterSpacing: '.04em', textTransform: 'uppercase',
            }}>{post.category}</span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--vp-dim)' }}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="post-fade" style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2,
            fontWeight: 800, letterSpacing: '-.02em', marginBottom: 20,
          }}>{post.title}</h1>

          <p className="post-fade" style={{
            fontSize: 'var(--text-body-lg)', color: 'var(--vp-muted)',
            lineHeight: 1.7, marginBottom: 32,
          }}>{post.excerpt}</p>

          {post.imageUrl && (
            <div className="post-fade" style={{ marginBottom: 40 }}>
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: '100%', borderRadius: 0, border: '1px solid var(--vp-line)' }}
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
              />
            </div>
          )}

          <div
            className="post-fade vp-prose"
            dangerouslySetInnerHTML={{ __html: post.body }}
            style={{
              fontSize: 'var(--text-body)', lineHeight: 1.8, color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </article>
    </div>
  );
}
