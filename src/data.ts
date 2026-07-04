import { Billboard, PitchSlide, GatewayLog } from './types';

export const BILLBOARDS_DATA: Billboard[] = [
  {
    id: 'lag-01',
    title: 'Lekki Toll Gate Mega Plaza LED',
    location: 'Lekki-Epe Expressway, Lagos',
    city: 'Lagos',
    country: 'Nigeria',
    dailyRate: 480,
    format: 'Digital LED',
    dimensions: '36m x 9m (Dual Sided)',
    monthlyImpressions: '3.8M',
    trafficVolume: 'Mega',
    status: 'Available',
    lat: 6.4375,
    lng: 3.4615,
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1200',
    description: 'The highest-traffic dynamic LED digital screen in West Africa. Captures primary commuter flow from Lekki Peninsula, Ikoyi, and Victoria Island. Full-motion video and creative programmatic scheduling enabled.'
  },
  {
    id: 'acc-01',
    title: 'Airport Residential Intersection Spectacular',
    location: 'Liberation Road, Accra Residential Hub',
    city: 'Accra',
    country: 'Ghana',
    dailyRate: 320,
    format: 'Spectacular Bridge',
    dimensions: '24m x 6m',
    monthlyImpressions: '1.9M',
    trafficVolume: 'High',
    status: 'Available',
    lat: 5.5913,
    lng: -0.1940,
    imageUrl: 'https://images.unsplash.com/photo-1590053132530-50d52f9b39e6?auto=format&fit=crop&q=80&w=1200',
    description: 'Breathtaking high-elevation bridge structure spanning Liberation Road. Maximizes visibility to elite business class commuters, dipolmatic corps, and inbound international leisure travelers from Kotoka Terminal 3.'
  },
  {
    id: 'nbo-01',
    title: 'Nairobi CBD Uhuru Highway Ring LED',
    location: 'Uhuru Highway / University Way Roundabout, Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    dailyRate: 290,
    format: 'Digital LED',
    dimensions: '18m x 12m',
    monthlyImpressions: '2.2M',
    trafficVolume: 'Very High',
    status: 'Available',
    lat: -1.2864,
    lng: 36.8172,
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a50b?auto=format&fit=crop&q=80&w=1200',
    description: 'High-density display positioning targeting Nairobi’s financial core. Perfectly captures rush-hour bottleneck delays, guaranteeing extraordinary dwell time of 4.5 minutes per vehicle average.'
  },
  {
    id: 'jnb-01',
    title: 'Sandton Retail Spire Spectacular',
    location: 'William Nicol Drive near Sandton City, Johannesburg',
    city: 'Johannesburg',
    country: 'South Africa',
    dailyRate: 410,
    format: 'Portrait Pillar',
    dimensions: '8m x 24m (Tower)',
    monthlyImpressions: '2.9M',
    trafficVolume: 'Mega',
    status: 'Available',
    lat: -26.1076,
    lng: 28.0567,
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200',
    description: 'Gigantic, vertical architectural tower positioned in Sandton, the richest square mile in Africa. Double-sided portrait format dominating high-income shopper traffic and institutional banking commuters.'
  },
  {
    id: 'cpt-01',
    title: 'Cape Town N1 Highway Gateway Arch',
    location: 'N1 Highway Outbound, Century City, Cape Town',
    city: 'Cape Town',
    country: 'South_Africa',
    dailyRate: 350,
    format: 'Static Mega',
    dimensions: '40m x 10m',
    monthlyImpressions: '1.7M',
    trafficVolume: 'High',
    status: 'Available',
    lat: -33.8913,
    lng: 18.5054,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1200',
    description: 'Unmissable wide-format static mega banner targeting outgoing city commuters. Backlit premium canvas displaying crystal-clear resolution under coastal climate factors.'
  }
];

export const INVESTMENT_DECK: PitchSlide[] = [
  {
    slideNumber: 1,
    title: "Billboard Marketplace Platform",
    subtitle: "The digital operating framework for Sub-Saharan Africa's $1.2B Out-of-Home advertising market.",
    bullets: [
      "45,000+ billboards across Sub-Saharan Africa. One booking terminal.",
      "Manual search-to-book: 18 days. Our platform: 4.5 minutes.",
      "Real-time traffic data, proof-of-play logs, instant compare.",
      "Programmatic booking — no email, no PDFs, no guesswork."
    ],
    graphicType: 'solution'
  },
  {
    slideNumber: 2,
    title: "The Problem",
    subtitle: "Analogue, opaque, and highly restrictive operations.",
    bullets: [
      "Zero traffic verification: clients pay without knowing who saw the ad.",
      "18-day booking cycle driven by phone calls and manual rate cards.",
      "Cross-border payments lose 6–12% in clearing fees, no escrow.",
      "42% of mid-tier billboard inventory sits empty every year."
    ],
    graphicType: 'problem'
  },
  {
    slideNumber: 3,
    title: "Our Solution: The Unified Terminal",
    subtitle: "Continuous programmatic campaign control.",
    bullets: [
      "Map-first search: filter by city, traffic tier, format, price, and status.",
      "Instant booking with integrated payment processing and scheduling.",
      "Verified traffic data via mobility telemetry — know your audience.",
      "API gateway for CRMs, ad servers, and programmatic campaign feeds."
    ],
    graphicType: 'solution'
  },
  {
    slideNumber: 4,
    title: "The Market Opportunity",
    subtitle: "$1.4B regional addressable market by 2028.",
    bullets: [
      "Sub-Saharan Africa: fastest urbanizing region in the world.",
      "Retail, FinTech, and FMCG growing ad spend 18% per year.",
      "Digital screens yield 4x more revenue than static billboards.",
      "Total Addressable Market: $2.2B | Serviceable Market: $280M."
    ],
    graphicType: 'market'
  },
  {
    slideNumber: 5,
    title: "The Business Model",
    subtitle: "Highly recurring marketplace fees with negative churn potential.",
    bullets: [
      "15% commission on programmatic bookings across the marketplace.",
      "SaaS subscriptions: advanced planning, brand intelligence, and reporting.",
      "Managed campaigns for enterprise brands with programmatic creative updates.",
      "Instant vendor payouts with early settlement options."
    ],
    graphicType: 'model'
  },
  {
    slideNumber: 6,
    title: "System Architecture (Modular Monolith)",
    subtitle: "Clear boundaries allowing smooth migration to Microservices.",
    bullets: [
      "Single API gateway enforces auth, rate limits, and response transforms.",
      "Bounded contexts: Auth, Billboards, Bookings, and Payments operate independently.",
      "PostgreSQL core for campaign schedule integrity and financial transactions.",
      "Designed for microservice extraction post-Series A — no rewrites."
    ],
    graphicType: 'architecture'
  }
];

export const INITIAL_GATEWAY_LOGS: GatewayLog[] = [
  {
    id: 'log-001',
    timestamp: '19:37:02',
    method: 'GET',
    endpoint: '/api/v1/billboards/search?city=Lagos',
    module: 'Billboards',
    status: 200,
    latencyMs: 34,
    payload: '{"filters": {"city": "Lagos"}, "limit": 10}'
  },
  {
    id: 'log-002',
    timestamp: '19:37:05',
    method: 'POST',
    endpoint: '/api/v1/bookings/estimate',
    module: 'Bookings',
    status: 200,
    latencyMs: 78,
    payload: '{"billboardId": "lag-01", "days": 5}'
  },
  {
    id: 'log-003',
    timestamp: '19:37:12',
    method: 'POST',
    endpoint: '/api/v1/payments/initialize',
    module: 'Payments',
    status: 201,
    latencyMs: 142,
    payload: '{"amount": 2400, "currency": "USD"}'
  },
  {
    id: 'log-004',
    timestamp: '19:37:15',
    method: 'GET',
    endpoint: '/api/v1/analytics/impressions?node=lag-01',
    module: 'Analytics',
    status: 200,
    latencyMs: 12,
    payload: '{"nodeId": "lag-01", "period": "all-time"}'
  }
];
