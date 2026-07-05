import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import MarketplaceMap from '../components/MarketplaceMap';
import SEOHead from '../components/SEOHead';
import gsap from 'gsap';

export default function BookingPage() {
  const { allBillboards, setSelectedBillboard, currentUser, setAuthMode } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectBillboard = (billboard: typeof allBillboards[number]) => {
    if (!currentUser) {
      setAuthMode('signin');
      return;
    }
    setSelectedBillboard(billboard);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.fromTo(container, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--color-background)]">
      <SEOHead />
      <div className="max-w-[1200px] mx-auto pt-28 pb-6">
        <MarketplaceMap billboards={allBillboards} onSelectBillboard={handleSelectBillboard} />
      </div>
    </div>
  );
}
