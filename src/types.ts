export interface Billboard {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  dailyRate: number;
  format: 'Digital LED' | 'Static Mega' | 'Spectacular Bridge' | 'Portrait Pillar';
  dimensions: string;
  monthlyImpressions: string;
  trafficVolume: 'High' | 'Very High' | 'Mega';
  status: 'Available' | 'Fully Booked' | 'Maintenance';
  lat: number;
  lng: number; // For map positions grid
  imageUrl: string;
  description: string;
}

export interface Booking {
  id: string;
  billboardId: string;
  startDate: string;
  endDate: string;
  startAt?: string;
  endAt?: string;
  campaignName: string;
  clientName: string;
  totalCost: number;
  status:
    | 'Awaiting Creative Review'
    | 'Awaiting Manager Approval'
    | 'Pending Approved'
    | 'Live'
    | 'Completed'
    | 'Rejected';
  slogan?: string;
  creativeApproved?: boolean;
  creativeAssetName?: string;
  creativeAssetDataUrl?: string;
  invoiceCode?: string;
}

export interface PitchSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  graphicType: 'problem' | 'solution' | 'market' | 'model' | 'architecture' | 'ask';
}

export interface AppNotification {
  id: string;
  channel: 'in-app' | 'email' | 'sms';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface GatewayLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  module: 'Auth' | 'Billboards' | 'Bookings' | 'Payments' | 'Analytics';
  status: number;
  latencyMs: number;
  payload?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  imageUrl: string;
  authorId?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'publisher' | 'admin' | 'investor';
  company?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
}
