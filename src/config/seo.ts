export interface SEORoute {
  title: string;
  description: string;
  ogImage?: string;
}

export const SEO_MAP: Record<string, SEORoute> = {
  '/': {
    title: 'Vantage Point — Book Billboards Across Africa in Minutes',
    description:
      'Find, compare, and book outdoor advertising billboards in Lagos, Accra, Nairobi, Johannesburg, and Cape Town. No email chains. Instant pricing.',
  },
  '/blueprint': {
    title: 'Platform Architecture — Vantage Point',
    description:
      'See how Vantage Point\'s modular infrastructure delivers instant billboard search across Ghana, Nigeria, Kenya, and South Africa.',
  },
  '/investor': {
    title: 'Investor Deck — Vantage Point OOH Marketplace',
    description:
      'Series A strategy deck for Africa\'s first unified outdoor advertising marketplace. $2.2B TAM, 15% commission model, Sub-Saharan Africa.',
  },
  '/developer': {
    title: 'Developer Console — Vantage Point API Gateway',
    description:
      'Explore the API gateway logs, modular monolith architecture, and PostgreSQL schema powering the billboard marketplace.',
  },
  '/booking': {
    title: 'Book Billboards — Vantage Point OOH Marketplace',
    description:
      'Browse live billboard inventory across Africa. Search by city, format, and proximity. Click any marker to book billboards in minutes.',
  },
  '/buyer': {
    title: 'Buyer Dashboard — Vantage Point',
    description:
      'Browse billboard inventory, compare locations, submit bookings, and track campaigns across African markets from one workspace.',
  },
  '/publisher': {
    title: 'Publisher Dashboard — Vantage Point',
    description:
      'Manage billboard inventory, approve booking requests, set rates, and track revenue. The media owner control panel for African OOH supply.',
  },
  '/admin': {
    title: 'Admin Console — Vantage Point Platform',
    description:
      'Monitor gateway telemetry, inspect API payloads, manage role privileges, and resolve disputes across the OOH marketplace.',
  },
};

export const SITE_NAME = 'Vantage Point';
export const BASE_URL = 'https://vantagepoint.africa';
export const OG_IMAGE_DEFAULT = 'https://vantagepoint.africa/og-image.png';
export const TWITTER_HANDLE = '@vantagepoint';

export function getSEO(pathname: string): SEORoute {
  return (
    SEO_MAP[pathname] ?? {
      title: 'Vantage Point — Unified OOH Advertising Terminal',
      description:
        'The first unified marketplace for outdoor advertising in Sub-Saharan Africa. Discover, book, and manage billboard campaigns in minutes.',
    }
  );
}
