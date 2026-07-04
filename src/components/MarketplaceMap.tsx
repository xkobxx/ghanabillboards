import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Billboard } from '../types';
import {
  Info,
  Tv,
  Image,
  Layers,
  Columns,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const FORMAT_CONFIG: Record<string, { icon: typeof Tv; color: string; label: string }> = {
  'Digital LED':         { icon: Tv,      color: '#3cffd0', label: 'LED' },
  'Static Mega':         { icon: Image,   color: '#f59e0b', label: 'STM' },
  'Spectacular Bridge':  { icon: Layers,  color: '#60a5fa', label: 'BRG' },
  'Portrait Pillar':     { icon: Columns, color: '#fb7185', label: 'PIL' },
};

const STATUS_COLORS = {
  'Available':    { color: '#3cffd0', bg: 'rgba(60,255,208,0.12)',  border: 'rgba(60,255,208,0.28)'  },
  'Fully Booked': { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.28)' },
  'Maintenance':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)'  },
};

function createMarkerIcon(billboard: Billboard, isHovered: boolean, isSelected: boolean) {
  const cfg = FORMAT_CONFIG[billboard.format] || FORMAT_CONFIG['Digital LED'];
  const isBooked      = billboard.status === 'Fully Booked';
  const isMaintenance = billboard.status === 'Maintenance';
  const isAvailable   = billboard.status === 'Available';

  const color    = isMaintenance ? '#f59e0b' : cfg.color;
  const bodyFill = isBooked ? '#1c1c2e' : '#0a0a1a';
  const opacity  = isBooked ? 0.45 : 1;
  const sz       = isSelected ? 32 : isHovered ? 29 : 25;
  // teardrop aspect: viewBox is 28×40, so h = sz * 40/28
  const h        = Math.round(sz * 40 / 28);
  const strokeW  = isSelected ? 2.2 : isHovered ? 1.8 : 1.5;
  const glow     = isSelected ? 14 : isHovered ? 9 : 4;

  const pulseDiv = isAvailable
    ? `<div class="billboard-pin-pulse" style="position:absolute;top:0;left:0;width:${sz}px;height:${sz}px;border-radius:50%;border:1.5px solid ${color};pointer-events:none;"></div>`
    : '';
  const selectedRing = isSelected
    ? `<div style="position:absolute;top:-4px;left:-4px;width:${sz + 8}px;height:${sz + 8}px;border-radius:50%;border:2px solid ${color};opacity:0.55;pointer-events:none;"></div>`
    : '';

  return L.divIcon({
    className: '',
    iconSize:    [sz, h],
    iconAnchor:  [sz / 2, h],
    popupAnchor: [0, -(h + 6)],
    html: `
      <div style="position:relative;width:${sz}px;height:${h}px;opacity:${opacity};
                  filter:drop-shadow(0 ${Math.round(glow / 2)}px ${glow}px ${color}55);
                  transition:filter 0.2s,opacity 0.2s;">
        ${pulseDiv}
        ${selectedRing}
        <svg width="${sz}" height="${h}" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="position:relative;z-index:1;display:block;">
          <path d="M14 2C7.4 2 2 7.4 2 14C2 24.5 14 38 14 38C14 38 26 24.5 26 14C26 7.4 20.6 2 14 2Z"
                fill="${bodyFill}" stroke="${color}" stroke-width="${strokeW}"/>
          <circle cx="14" cy="14" r="6.5" fill="${color}" opacity="${isBooked ? 0.3 : 0.88}"/>
          <text x="14" y="14" text-anchor="middle" dominant-baseline="central"
                font-family="monospace" font-weight="900" font-size="7"
                fill="${bodyFill}" opacity="${isBooked ? 0.5 : 1}">${cfg.label}</text>
        </svg>
      </div>
    `,
  });
}

// ── Format + status legend rendered inside the map container ──────────────────
function MapLegend() {
  const map = useMap();
  const container = map.getContainer();

  return createPortal(
    <div style={{
      position:       'absolute',
      bottom:         '28px',
      left:           '10px',
      zIndex:         1000,
      background:     'rgba(8, 8, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      border:         '1px solid rgba(255,255,255,0.08)',
      borderRadius:   '10px',
      padding:        '9px 11px',
      minWidth:       '128px',
      pointerEvents:  'none',
    }}>
      {/* Format section */}
      <div style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 5 }}>
        Format
      </div>
      {Object.entries(FORMAT_CONFIG).map(([key, cfg]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.68)', lineHeight: 1 }}>{key}</span>
        </div>
      ))}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '6px 0' }} />

      {/* Status section */}
      <div style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 5 }}>
        Status
      </div>
      {[
        { label: 'Available',    color: '#3cffd0', pulse: true  },
        { label: 'Fully Booked', color: '#f87171', pulse: false },
        { label: 'Maintenance',  color: '#f59e0b', pulse: false },
      ].map(({ label, color, pulse }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: pulse ? color : 'transparent',
            border: `1.5px solid ${color}`,
            opacity: label === 'Fully Booked' ? 0.45 : 1,
          }} />
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.68)', lineHeight: 1 }}>{label}</span>
        </div>
      ))}
    </div>,
    container
  );
}

// ── Fly-to controller ─────────────────────────────────────────────────────────
const CITY_VIEWS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Lagos:         { lat: 6.5244,   lng: 3.3792,   zoom: 12 },
  Accra:         { lat: 5.6037,   lng: -0.1870,  zoom: 12 },
  Nairobi:       { lat: -1.2921,  lng: 36.8219,  zoom: 12 },
  Johannesburg:  { lat: -26.2041, lng: 28.0473,  zoom: 11 },
  'Cape Town':   { lat: -33.9249, lng: 18.4241,  zoom: 11 },
};

function MapController({ selectedCity, center }: { selectedCity: string; center: { lat: number; lng: number } | null }) {
  const map = useMap();
  const prevCity = useRef(selectedCity);

  useEffect(() => {
    if (selectedCity === prevCity.current) return;
    prevCity.current = selectedCity;
    if (selectedCity !== 'All' && CITY_VIEWS[selectedCity]) {
      const v = CITY_VIEWS[selectedCity];
      map.flyTo([v.lat, v.lng], v.zoom, { duration: 1.2 });
    } else {
      map.flyTo([2, 20], 4, { duration: 1.2 });
    }
  }, [selectedCity, map]);

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 10), { duration: 0.8 });
    }
  }, [center?.lat, center?.lng, map]);

  return null;
}

// ── Click handler for custom pin ──────────────────────────────────────────────
function MapClickHandler({ active, onMapClick }: { active: boolean; onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => { if (active) onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ── Tile URLs ─────────────────────────────────────────────────────────────────
const TILE_URLS = {
  default:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

// ── Distance util ─────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Landmarks ─────────────────────────────────────────────────────────────────
interface Landmark { id: string; name: string; city: string; lat: number; lng: number; }

const LANDMARKS: Landmark[] = [
  { id: 'lag-lcc', name: 'Lekki Conservation Centre',       city: 'Lagos',        lat: 6.4361,   lng: 3.5414   },
  { id: 'lag-eko', name: 'Eko Atlantic Boulevard',           city: 'Lagos',        lat: 6.4180,   lng: 3.4100   },
  { id: 'lag-icm', name: 'Ikeja City Mall',                  city: 'Lagos',        lat: 6.6018,   lng: 3.3415   },
  { id: 'acc-bss', name: 'Black Star Square',                city: 'Accra',        lat: 5.5488,   lng: -0.1823  },
  { id: 'acc-t3',  name: 'Kotoka Airport Terminal 3',        city: 'Accra',        lat: 5.6050,   lng: -0.1701  },
  { id: 'acc-am',  name: 'Accra Mall',                       city: 'Accra',        lat: 5.6251,   lng: -0.1724  },
  { id: 'nbo-kicc',name: 'Kenyatta Intl Convention Centre',  city: 'Nairobi',      lat: -1.2849,  lng: 36.8175  },
  { id: 'nbo-park',name: 'Nairobi National Park Gate',       city: 'Nairobi',      lat: -1.3563,  lng: 36.8270  },
  { id: 'nbo-west',name: 'Westgate Shopping Mall',           city: 'Nairobi',      lat: -1.2594,  lng: 36.8042  },
  { id: 'jnb-nms', name: 'Nelson Mandela Square',            city: 'Johannesburg', lat: -26.1070, lng: 28.0567  },
  { id: 'jnb-sow', name: 'Soweto Cooling Towers',            city: 'Johannesburg', lat: -26.2473, lng: 27.8853  },
  { id: 'jnb-con', name: 'Constitution Hill',                city: 'Johannesburg', lat: -26.1922, lng: 28.0430  },
  { id: 'cpt-tb',  name: 'Table Mountain Cableway',          city: 'Cape Town',    lat: -33.9563, lng: 18.4034  },
  { id: 'cpt-water',name: 'V&A Waterfront',                  city: 'Cape Town',    lat: -33.9038, lng: 18.4213  },
  { id: 'cpt-stad',name: 'Green Point Stadium',              city: 'Cape Town',    lat: -33.9028, lng: 18.4101  },
];

// ── Main component ────────────────────────────────────────────────────────────
interface MarketplaceMapProps {
  billboards: Billboard[];
  onSelectBillboard: (billboard: Billboard) => void;
}

export default function MarketplaceMap({ billboards, onSelectBillboard }: MarketplaceMapProps) {
  const [selectedCity,      setSelectedCity]      = useState<string>('All');
  const [selectedFormat,    setSelectedFormat]    = useState<string>('All');
  const [hoveredNode,       setHoveredNode]       = useState<Billboard | null>(null);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [priceMax,          setPriceMax]          = useState(600);
  const [trafficFilter,     setTrafficFilter]     = useState<Set<string>>(new Set());

  const [isProximityActive,  setIsProximityActive]  = useState(false);
  const [isFullscreen,       setIsFullscreen]       = useState(false);
  const [isRightListHidden,  setIsRightListHidden]  = useState(true);
  const [tileLayer,          setTileLayer]          = useState<'default' | 'satellite' | 'dark'>('dark');

  const [proximitySource,    setProximitySource]    = useState<'landmark' | 'current' | 'custom'>('landmark');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('lag-lcc');
  const [customPin,          setCustomPin]          = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation,       setUserLocation]       = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating,         setIsLocating]         = useState(false);
  const [proximityRadiusKm,  setProximityRadiusKm]  = useState(50);
  const [locationError,      setLocationError]      = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const fetchUserLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return; }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocating(false); },
      (err) => {
        setIsLocating(false);
        setLocationError(err.code === err.PERMISSION_DENIED ? 'Location permission denied' : 'Could not get location');
        const fallback = CITY_VIEWS[selectedCity] || CITY_VIEWS['Lagos'];
        setUserLocation({ lat: fallback.lat, lng: fallback.lng });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Proximity center
  let center: { lat: number; lng: number; label: string } | null = null;
  if (isProximityActive) {
    if (proximitySource === 'landmark') {
      const lm = LANDMARKS.find(l => l.id === selectedLandmarkId);
      if (lm) center = { lat: lm.lat, lng: lm.lng, label: lm.name };
    } else if (proximitySource === 'current') {
      if (userLocation) center = { lat: userLocation.lat, lng: userLocation.lng, label: 'GPS Location' };
      else { const fb = CITY_VIEWS[selectedCity] || CITY_VIEWS['Lagos']; center = { lat: fb.lat, lng: fb.lng, label: 'Locating...' }; }
    } else if (proximitySource === 'custom' && customPin) {
      center = { lat: customPin.lat, lng: customPin.lng, label: 'Custom Pin' };
    }
  }

  const cities  = ['All', 'Lagos', 'Accra', 'Nairobi', 'Johannesburg', 'Cape Town'];
  const formats = ['All', 'Digital LED', 'Static Mega', 'Spectacular Bridge', 'Portrait Pillar'];

  const filteredBillboards = billboards.filter((item) => {
    const matchCity    = selectedCity   === 'All' || item.city   === selectedCity;
    const matchFormat  = selectedFormat === 'All' || item.format === selectedFormat;
    const matchPrice   = item.dailyRate <= priceMax;
    const matchTraffic = trafficFilter.size === 0 || trafficFilter.has(item.trafficVolume);
    const q = searchQuery.trim().toLowerCase();
    const matchSearch  = !q || item.title.toLowerCase().includes(q) || item.location.toLowerCase().includes(q) || item.city.toLowerCase().includes(q);
    const baseMatch = matchCity && matchFormat && matchPrice && matchTraffic && matchSearch;
    if (isProximityActive && center) {
      return baseMatch && haversineKm(item.lat, item.lng, center.lat, center.lng) <= proximityRadiusKm;
    }
    return baseMatch;
  });

  const totalNodes = filteredBillboards.length;
  const totalReach = filteredBillboards.reduce((acc, b) => acc + (parseFloat(b.monthlyImpressions) || 0), 0).toFixed(1);

  const selectDropdownStyle = "bg-[var(--color-surface)] text-xs font-sans border border-[var(--color-border)] text-[var(--color-text-primary)] py-1.5 px-3 pr-8 cursor-pointer focus:outline-none focus:border-[var(--color-primary)] transition-all shrink-0 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat [color-scheme:dark]";
  const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  const mapContent = (
    <div
      id="marketplace-map"
      className={
        isFullscreen
          ? 'fixed inset-0 z-[99995] bg-[var(--color-background)] p-6 md:p-8 overflow-y-auto flex flex-col justify-start space-y-4 max-h-screen text-[var(--color-text-primary)]'
          : 'space-y-4 text-[var(--color-text-primary)]'
      }
    >
      {/* Filter bar */}
      <div className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
        {/* Row 1: keyword + price + traffic */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search boards, locations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-[var(--color-surface)] text-xs font-sans border border-[var(--color-border)] text-[var(--color-text-primary)] py-1.5 px-3 focus:outline-none focus:border-[var(--color-primary)] transition-all shrink-0 w-48 [color-scheme:dark]"
          />
          <div className="w-px h-6 bg-[var(--color-border)] shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-caption text-[var(--color-text-muted)] whitespace-nowrap">≤${priceMax}/day</span>
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              className="w-28 accent-[var(--color-primary)] cursor-pointer"
            />
          </div>
          <div className="w-px h-6 bg-[var(--color-border)] shrink-0" />
          <div className="flex items-center gap-1 shrink-0">
            {(['High', 'Very High', 'Mega'] as const).map(tv => (
              <button
                key={tv}
                type="button"
                onClick={() => setTrafficFilter(prev => {
                  const next = new Set(prev);
                  if (next.has(tv)) next.delete(tv); else next.add(tv);
                  return next;
                })}
                className={`px-2 py-0.5 text-caption font-mono border transition-all cursor-pointer ${
                  trafficFilter.has(tv)
                    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tv}
              </button>
            ))}
          </div>
        </div>
        {/* Row 2: city + format + proximity + tile + metrics + toggle */}
        <div className="flex items-center gap-2 overflow-x-auto">

          <select value={selectedCity} onChange={(e) => {
            setSelectedCity(e.target.value);
            if (e.target.value !== 'All') {
              const matched = LANDMARKS.find(lm => lm.city === e.target.value);
              if (matched) setSelectedLandmarkId(matched.id);
            }
          }} className={selectDropdownStyle} style={{ backgroundImage: chevronSvg }}>
            {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>)}
          </select>

          <div className="w-px h-6 bg-[var(--color-border)] shrink-0" />

          <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}
            className={selectDropdownStyle} style={{ backgroundImage: chevronSvg }}>
            {formats.map(f => <option key={f} value={f}>{f === 'All' ? 'All Formats' : f}</option>)}
          </select>

          <div className="w-px h-6 bg-[var(--color-border)] shrink-0" />

          <select value={isProximityActive ? proximitySource : 'off'} onChange={(e) => {
            const val = e.target.value;
            if (val === 'off') { setIsProximityActive(false); }
            else {
              setIsProximityActive(true);
              setProximitySource(val as 'landmark' | 'current' | 'custom');
              if (val === 'current' && !userLocation) fetchUserLocation();
              if (val === 'custom' && !customPin) setCustomPin({ lat: 6.5, lng: 3.4 });
            }
          }} className={selectDropdownStyle} style={{ backgroundImage: chevronSvg }}>
            <option value="off">No Proximity</option>
            <option value="landmark">By Landmark</option>
            <option value="current">By GPS</option>
            <option value="custom">By Pin</option>
          </select>

          <div className="flex-1 min-w-2" />

          {/* Tile layer toggle */}
          <div className="hidden sm:flex items-center gap-0.5 bg-[var(--color-background)] p-0.5 border border-[var(--color-border)] shrink-0">
            {(['dark', 'default', 'satellite'] as const).map((layer) => (
              <button key={layer} onClick={() => setTileLayer(layer)}
                className={`px-2 py-0.5 text-caption font-sans capitalize transition-all cursor-pointer ${
                  tileLayer === layer
                    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}>
                {layer === 'default' ? 'Street' : layer}
              </button>
            ))}
          </div>

          {/* Metrics */}
          <div className="hidden md:flex items-center gap-3 text-caption font-mono text-[var(--color-text-muted)] shrink-0">
            <span><span className="text-[var(--color-primary)] font-bold">{totalNodes}</span> nodes</span>
            <span className="text-[var(--color-border)]">·</span>
            <span><span className="text-[var(--color-primary)] font-bold">{totalReach}M</span> reach</span>
          </div>

          {/* List toggle */}
          <button type="button" onClick={() => setIsRightListHidden(!isRightListHidden)}
            className={`p-2 cursor-pointer transition-all duration-200 border shrink-0 ${
              isRightListHidden
                ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]'
            }`} title={isRightListHidden ? 'Show node list' : 'Hide node list'}>
            <Columns className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button type="button" onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 cursor-pointer transition-all duration-200 border shrink-0 ${
              isFullscreen
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`} title={isFullscreen ? 'Exit immersive (Esc)' : 'Immersive view'}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Proximity sub-row */}
        {isProximityActive && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
            <div className="flex bg-[var(--color-background)] p-0.5 border border-[var(--color-border)]">
              <button type="button" onClick={() => setProximitySource('landmark')}
                className={`px-3 py-1 text-xs font-sans transition-all cursor-pointer ${proximitySource === 'landmark' ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                Landmark
              </button>
              <button type="button" onClick={() => { setProximitySource('current'); if (!userLocation) fetchUserLocation(); }}
                className={`px-3 py-1 text-xs font-sans transition-all cursor-pointer flex items-center gap-1 ${proximitySource === 'current' ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                {isLocating && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-background)] animate-ping inline-block" />}
                GPS
              </button>
              <button type="button" onClick={() => { setProximitySource('custom'); if (!customPin) setCustomPin({ lat: 6.5, lng: 3.4 }); }}
                className={`px-3 py-1 text-xs font-sans transition-all cursor-pointer ${proximitySource === 'custom' ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                Pin
              </button>
            </div>

            {proximitySource === 'landmark' && (
              <select value={selectedLandmarkId}
                onChange={(e) => {
                  setSelectedLandmarkId(e.target.value);
                  const lmk = LANDMARKS.find(l => l.id === e.target.value);
                  if (lmk && selectedCity !== 'All' && lmk.city !== selectedCity) setSelectedCity(lmk.city);
                }}
                className="bg-[var(--color-surface)] text-xs font-sans border border-[var(--color-border)] text-[var(--color-text-primary)] py-1 px-3 cursor-pointer focus:outline-none focus:border-[var(--color-primary)] max-w-[220px] [color-scheme:dark]">
                {LANDMARKS.filter(l => selectedCity === 'All' || l.city === selectedCity).map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2 px-3 py-1 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <span className="text-caption font-mono text-[var(--color-text-muted)]">Radius</span>
              <input type="range" min="10" max="200" value={proximityRadiusKm}
                onChange={(e) => setProximityRadiusKm(Number(e.target.value))}
                className="w-20 cursor-pointer h-1 rounded" style={{ accentColor: 'var(--color-primary)' }} />
              <span className="text-caption font-mono text-[var(--color-primary)] font-bold w-12 text-right">
                {proximityRadiusKm}km
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-caption font-mono text-[var(--color-text-muted)] ml-auto">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)] font-bold">{center?.label}</span>
            </div>

            {locationError && <span className="text-caption font-mono text-yellow-500">{locationError}</span>}
          </div>
        )}
      </div>

      {/* Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* Leaflet map */}
        <div className={`${isRightListHidden ? 'lg:col-span-12' : 'lg:col-span-8'} border border-[var(--color-border)] overflow-hidden ${isFullscreen ? 'h-[80vh] min-h-[500px]' : 'h-[calc(100vh-220px)] min-h-[500px]'}`}>
          <MapContainer
            center={[2, 20]} zoom={4}
            className="w-full h-full"
            zoomControl={true}
            attributionControl={false}
            style={{ background: 'var(--color-background, #0a0a1a)' }}
          >
            <TileLayer url={TILE_URLS[tileLayer]} />
            <MapController selectedCity={selectedCity} center={center} />
            <MapClickHandler
              active={isProximityActive && proximitySource === 'custom'}
              onMapClick={(lat, lng) => setCustomPin({ lat, lng })}
            />
            <MapLegend />

            {/* Proximity circle */}
            {isProximityActive && center && (
              <>
                <Circle
                  center={[center.lat, center.lng]}
                  radius={proximityRadiusKm * 1000}
                  pathOptions={{ color: '#3cffd0', fillColor: '#3cffd0', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
                />
                <Circle
                  center={[center.lat, center.lng]}
                  radius={proximityRadiusKm * 500}
                  pathOptions={{ color: '#3cffd0', fillOpacity: 0, weight: 0.8, dashArray: '3 3' }}
                />
              </>
            )}

            {/* Billboard markers */}
            {filteredBillboards.map((b) => {
              const cfg = FORMAT_CONFIG[b.format] || FORMAT_CONFIG['Digital LED'];
              const sc  = STATUS_COLORS[b.status] || STATUS_COLORS['Available'];
              const isSelected = selectedBillboard?.id === b.id;

              return (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={createMarkerIcon(b, hoveredNode?.id === b.id, isSelected)}
                  eventHandlers={{
                    click:     () => { onSelectBillboard(b); setSelectedBillboard(b); },
                    mouseover: () => setHoveredNode(b),
                    mouseout:  () => setHoveredNode(null),
                  }}
                >
                  <Popup className="billboard-popup" closeButton={false}>
                    <div style={{
                      width: 224, borderRadius: 0, overflow: 'hidden',
                      background: '#0d0d1a',
                      border: `1px solid ${cfg.color}28`,
                      boxShadow: `0 12px 40px ${cfg.color}18, 0 2px 12px rgba(0,0,0,0.7)`,
                    }}>
                      {/* Image */}
                      <div style={{ position: 'relative', height: 104, overflow: 'hidden' }}>
                        <img src={b.imageUrl} alt={b.title} referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, #0d0d1a)' }} />
                        {/* Status badge */}
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          background: sc.bg, border: `1px solid ${sc.border}`,
                          color: sc.color, fontSize: 8, fontWeight: 800,
                          fontFamily: 'monospace', padding: '2px 7px',
                          borderRadius: 4, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                          {b.status}
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, marginBottom: 2 }}>
                          {b.title}
                        </div>
                        <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.38)', marginBottom: 7 }}>
                          {b.city}, {b.country}
                        </div>
                        {/* Format badge */}
                        <div style={{
                          display: 'inline-block', fontSize: 8, fontWeight: 700,
                          fontFamily: 'monospace', color: cfg.color,
                          background: `${cfg.color}15`, border: `1px solid ${cfg.color}28`,
                          padding: '2px 7px', borderRadius: 3, marginBottom: 9,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                          {b.format}
                        </div>
                        {/* Metrics row */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 9,
                        }}>
                          <div>
                            <span style={{ fontSize: 16, fontWeight: 900, color: cfg.color, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
                              ${b.dailyRate}
                            </span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginLeft: 2 }}>/day</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                              {b.monthlyImpressions}
                            </div>
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>monthly reach</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right panel: node list */}
        {!isRightListHidden && (
          <div className={`lg:col-span-4 flex flex-col space-y-4 overflow-hidden ${isFullscreen ? 'lg:h-[70vh]' : ''}`}>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 flex flex-col flex-1 space-y-4 min-h-0">

              <div className="space-y-1">
                <span className="font-mono text-caption text-[var(--color-primary)] uppercase tracking-[0.3em] block font-bold">
                  BILLBOARD INVENTORY ({filteredBillboards.length})
                </span>
                <h4 className="font-extrabold text-lg text-[var(--color-text-primary)] uppercase tracking-tight">Regional Nodes</h4>
              </div>

              <div className={`space-y-3 overflow-y-auto pr-1 flex-1 ${isFullscreen ? 'max-h-[50vh]' : 'max-h-[340px]'}`}>
                {filteredBillboards.map((b) => {
                  const cfg = FORMAT_CONFIG[b.format] || FORMAT_CONFIG['Digital LED'];
                  const sc  = STATUS_COLORS[b.status] || STATUS_COLORS['Available'];
                  const isSelected = selectedBillboard?.id === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => { onSelectBillboard(b); setSelectedBillboard(b); }}
                      onMouseEnter={() => setHoveredNode(b)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-3 border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                          : hoveredNode?.id === b.id
                            ? 'border-[var(--color-primary)]/50 bg-[var(--color-surface)] shadow-sm scale-[1.01]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)]/40'
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="relative shrink-0">
                          <img src={b.imageUrl} alt={b.title} referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover border border-[var(--color-border)]" />
                          {/* Format color strip */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: cfg.color, borderRadius: 0 }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-sans font-semibold text-[var(--color-text-primary)] text-xs truncate uppercase tracking-tight">
                            {b.title}
                          </div>
                          <div className="font-mono text-caption text-[var(--color-text-secondary)] flex justify-between items-center gap-1">
                            <span className="truncate">{b.city}, {b.country}</span>
                            {isProximityActive && center && (
                              <span className="font-sans font-bold text-caption shrink-0 text-[var(--color-primary)]">
                                {Math.round(haversineKm(b.lat, b.lng, center.lat, center.lng))}km
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-2 gap-2">
                            <span className="font-mono text-caption text-[var(--color-primary)] font-bold">${b.dailyRate}/day</span>
                            {/* Status badge */}
                            <span style={{
                              fontSize: 8, fontWeight: 800, fontFamily: 'monospace',
                              color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                              padding: '1px 5px', borderRadius: 0,
                              letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                            }}>
                              {b.status === 'Fully Booked' ? 'BOOKED' : b.status === 'Maintenance' ? 'MAINT.' : 'AVAIL.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredBillboards.length === 0 && (
                  <div className="py-12 text-center text-[var(--color-text-muted)] text-xs font-mono tracking-wider">
                    No nodes matching filters
                  </div>
                )}
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 flex gap-3 items-start text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans mt-auto">
                <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                <p>Click markers on the map or select from the list to configure campaigns.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen && typeof window !== 'undefined' && document.body) {
    return createPortal(mapContent, document.body);
  }
  return mapContent;
}
