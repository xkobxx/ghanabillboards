import { useApp } from '../context/AppContext';
import MarketplaceMap from '../components/MarketplaceMap';
import SEOHead from '../components/SEOHead';

export default function BookingPage() {
  const { allBillboards, setSelectedBillboard, currentUser, setAuthMode } = useApp();

  const handleSelectBillboard = (billboard: typeof allBillboards[number]) => {
    if (!currentUser) {
      setAuthMode('signin');
      return;
    }
    setSelectedBillboard(billboard);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <SEOHead />
      <div className="max-w-[1200px] mx-auto pt-28 pb-6">
        <MarketplaceMap billboards={allBillboards} onSelectBillboard={handleSelectBillboard} />
      </div>
    </div>
  );
}
