import { useEffect, useRef, type ReactNode } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from './context/ThemeContext';
import { useApp } from './context/AppContext';

import SEOHead from './components/SEOHead';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import BlueprintPage from './pages/BlueprintPage';
import InvestorPage from './pages/InvestorPage';
import DeveloperPage from './pages/DeveloperPage';
import AdvertiserPage from './pages/AdvertiserPage';
import VendorPage from './pages/VendorPage';
import AdminPage from './pages/AdminPage';
import BookingPage from './pages/BookingPage';
import BookingDrawer from './components/BookingDrawer';
import SignIn from './components/SignIn';
import Register from './components/Register';

import { ChevronUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children, role }: { children: ReactNode; role?: string }) {
  const { currentUser, setAuthMode } = useApp();
  if (!currentUser) {
    setAuthMode('signin');
    return null;
  }
  if (role && currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { theme } = useTheme();
  const isCinematic = theme === 'cinematic';
  const location = useLocation();
  const navigate = useNavigate();
  const isPortalRoute = ['/advertiser', '/vendor', '/admin', '/investor'].includes(location.pathname);
  const isLanding = location.pathname === '/';

  const {
    currentUser,
    setCurrentUser,
    authMode,
    setAuthMode,
    selectedBillboard,
    setSelectedBillboard,
    showScrollTop,
    signOut,
    registerBooking,
  } = useApp();

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => { lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (!isCinematic) return;

    const dot = cursorDotRef.current;
    const outline = cursorOutlineRef.current;
    if (!dot || !outline) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(outline, { x: e.clientX, y: e.clientY, duration: 0.8, ease: 'power3.out' });
    };

    const INTERACT_SEL = 'button, a, input, select, .cursor-pointer, .vp-btn.magnetic';

    const handleHoverStart = (e: Event) => {
      if (!(e.target instanceof Element) || !e.target.closest(INTERACT_SEL)) return;
      gsap.to(outline, { width: 72, height: 72, borderColor: 'rgba(91,192,160,0.8)', background: 'rgba(91,192,160,0.06)', duration: 0.3 });
      gsap.to(dot, { opacity: 0.5, duration: 0.3 });
    };

    const handleHoverEnd = (e: Event) => {
      if (!(e.target instanceof Element) || !e.target.closest(INTERACT_SEL)) return;
      gsap.to(outline, { width: 42, height: 42, borderColor: 'rgba(255,255,255,0.35)', background: 'transparent', duration: 0.3 });
      gsap.to(dot, { opacity: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', handleHoverStart, true);
    document.addEventListener('mouseleave', handleHoverEnd, true);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', handleHoverStart, true);
      document.removeEventListener('mouseleave', handleHoverEnd, true);
    };
  }, [isCinematic]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.clip-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        );
      });

      // ponytail: LandingPage runs its own reveal; all other vp-home pages need this
      if (location.pathname !== '/' && location.pathname !== '/blueprint') {
        gsap.utils.toArray<HTMLElement>('.vp-home .reveal, .vp-home .fade-up').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 36 },
            {
              opacity: 1, y: 0, duration: 1.05, ease: 'power4.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <HelmetProvider>
    <div className={`relative min-h-screen transition-colors duration-500 selection:bg-[var(--color-primary)] selection:text-[var(--color-text-inverse)] ${isCinematic ? 'cursor-none' : ''} bg-[var(--color-background)] text-[var(--color-text-primary)]`}>
      {/* Custom Cursor (Cinematic theme only) */}
      {isCinematic && (
        <>
          <div
            ref={cursorDotRef}
            className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[9999] mix-blend-difference bg-white rounded-full"
            style={{ width: '6px', height: '6px' }}
          />
          <div
            ref={cursorOutlineRef}
            className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[9998] mix-blend-difference rounded-full border transition-[width,height,background,border-color] duration-300"
            style={{ width: '42px', height: '42px', borderColor: 'rgba(255,255,255,0.35)' }}
          />
        </>
      )}

      <div className="absolute inset-0 noise-bg pointer-events-none z-10 select-none" />

      {!(currentUser && isPortalRoute) && <Navbar />}
      <SEOHead />

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/blueprint" element={<BlueprintPage />} />
        <Route path="/investor" element={<RequireAuth role="investor"><InvestorPage /></RequireAuth>} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/advertiser" element={<RequireAuth role="advertiser"><AdvertiserPage /></RequireAuth>} />
        <Route path="/vendor" element={<RequireAuth role="vendor"><VendorPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
      </Routes>

      {/* Route-aware footer — landing page has its own footer */}
      {!isLanding && (
        isPortalRoute ? (
          <footer className="relative z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)] py-5">
            <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 px-6 font-mono text-caption uppercase tracking-[0.12em] text-[var(--color-text-muted)] sm:flex-row sm:px-12">
              <span>Vantage Point partner network</span>
              <span>Secure marketplace operations · 2026</span>
            </div>
          </footer>
        ) : (
          <footer className="border-t border-[var(--color-border)] py-16 mt-20 bg-[var(--color-black)] text-[var(--color-text-secondary)] clip-reveal">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[var(--color-primary)] flex items-center justify-center rounded-sm">
                    <div className="w-2.5 h-2.5 bg-[var(--color-black)] rotate-45"></div>
                  </div>
                  <span className="font-serif font-bold text-[var(--color-text-primary)] uppercase tracking-widest text-sm">Vantage Point</span>
                </div>
                <p className="font-sans leading-relaxed text-[var(--color-text-secondary)]">
                  The premium programmatic exchange platform connecting international media agencies with strategic metropolitan billboards across developing trade regions.
                </p>
              </div>
              <div className="space-y-4 font-mono">
                <span className="text-[var(--color-primary)] block uppercase text-caption tracking-[0.2em] font-bold">SYSTEM METRIC NODES</span>
                <div className="grid grid-cols-2 gap-4 text-body-xs text-[var(--color-text-secondary)]">
                  <div className="hover:text-[var(--color-primary)] transition-colors cursor-pointer">• Lagos [NGR-LG-01]</div>
                  <div className="hover:text-[var(--color-primary)] transition-colors cursor-pointer">• Accra [GHA-ACC-01]</div>
                  <div className="hover:text-[var(--color-primary)] transition-colors cursor-pointer">• Nairobi [KEN-NBO-01]</div>
                  <div className="hover:text-[var(--color-primary)] transition-colors cursor-pointer font-bold">• Sandton [RSA-JNB-01]</div>
                </div>
              </div>
              <div className="space-y-4 font-sans">
                <span className="text-[var(--color-primary)] block uppercase text-caption tracking-[0.2em] font-bold">REGULATORY PROTECTION</span>
                <p className="text-[var(--color-text-secondary)] text-body-xs leading-relaxed">
                  All transactional programmatic booking values are protected by escrow. Early factoring, multi-regional payment settlements in partnership with Paystack clearance models.
                </p>
              </div>
            </div>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 mt-12 border-t border-[var(--color-border)] flex justify-between items-center text-caption font-mono text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              <span>© 2026 VANTAGE POINT. ALL RIGHTS RESERVED.</span>
              <span>Designed with absolute cinematic discipline</span>
            </div>
          </footer>
        )
      )}

      <BookingDrawer
        billboard={selectedBillboard}
        onClose={() => setSelectedBillboard(null)}
        onConfirmBooking={registerBooking}
      />

      {authMode === 'signin' && (
        <SignIn
          onSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('vantage_current_user', JSON.stringify(user));
            setAuthMode(null);
            navigate(`/${user.role}`);
          }}
          onSwitchToRegister={() => setAuthMode('register')}
          onCancel={() => setAuthMode(null)}
        />
      )}
      {authMode === 'register' && (
        <Register
          onSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('vantage_current_user', JSON.stringify(user));
            setAuthMode(null);
            navigate(`/${user.role}`);
          }}
          onSwitchToSignIn={() => setAuthMode('signin')}
          onCancel={() => setAuthMode(null)}
        />
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-2.5 bg-emerald-500/10 border border-emerald-500/35 hover:bg-emerald-500 hover:text-black hover:border-transparent text-emerald-400 rounded-full cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
    </HelmetProvider>
  );
}
