import { useEffect, useRef, type ReactNode } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from './context/ThemeContext';
import { useApp } from './context/AppContext';
import { useBuyerSettings } from './hooks/useBuyerSettings';

import SEOHead from './components/SEOHead';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import BlueprintPage from './pages/BlueprintPage';
import InvestorPage from './pages/InvestorPage';
import DeveloperPage from './pages/DeveloperPage';
import BuyerPage from './pages/BuyerPage';
import PublisherPage from './pages/PublisherPage';
import AdminPage from './pages/AdminPage';
import BookingPage from './pages/BookingPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import LocationsPage from './pages/LocationsPage';
import BlogPage from './pages/BlogPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import PublishPage from './pages/PublishPage';
import FaqPage from './pages/FaqPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BookingDrawer from './components/BookingDrawer';
import SignIn from './components/SignIn';
import Register from './components/Register';
import { Footer } from './components/Footer';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) setAuthMode('signin');
  }, [currentUser, setAuthMode]);

  if (!currentUser) return null;
  if (role && currentUser.role !== role) {
    navigate(`/${currentUser.role}`, { replace: true });
    return null;
  }
  return <>{children}</>;
}

export default function App() {
  const { theme } = useTheme();
  const isCinematic = theme === 'cinematic';
  const location = useLocation();
  const navigate = useNavigate();
  const isPortalRoute = ['/buyer', '/publisher', '/admin', '/investor'].includes(location.pathname);

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
  const { settings: buyerSettings } = useBuyerSettings(currentUser?.id || 'anonymous');

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

    // Nav entrance animation
    const navEl = document.querySelector('.vp-nav');
    if (navEl) {
      gsap.fromTo(navEl, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    }

    // Sticky nav — shrink on scroll
    const onScroll = ({ scroll }: { scroll: number }) => {
      const nav = document.querySelector('.vp-nav');
      if (!nav) return;
      if (scroll > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    lenis.on('scroll', onScroll);

    return () => {
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
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
            scrollTrigger: { trigger: el, start: 'top 80%' },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.clip-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
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
              opacity: 1, y: 0, duration: 1.05, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 80%', once: true },
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
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/buyer" element={<RequireAuth role="buyer"><BuyerPage /></RequireAuth>} />
        <Route path="/publisher" element={<RequireAuth role="publisher"><PublisherPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
      </Routes>

      {/* Public-page footer; portal metadata lives in the app shell sidebar. */}
      {!isPortalRoute && <Footer />}

      <BookingDrawer
        billboard={selectedBillboard}
        onClose={() => setSelectedBillboard(null)}
        onConfirmBooking={registerBooking}
        defaultFlightDays={buyerSettings.defaultFlightDays}
        billingCurrency={buyerSettings.billingCurrency}
        budgetCapMinor={buyerSettings.budgetCapMinor}
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
          onCancel={() => { setAuthMode(null); if (isPortalRoute) navigate('/'); }}
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
          onCancel={() => { setAuthMode(null); if (isPortalRoute) navigate('/'); }}
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
