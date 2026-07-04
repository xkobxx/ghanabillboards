import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// ponytail: SHA-256 is sufficient for demo seeds. Upgrade to bcrypt before production.
const hash = (pw: string) => createHash('sha256').update(pw).digest('hex');

const DEMO_PASSWORD = hash('password');

async function main() {
  // ── Users ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'advertiser@vantagepoint.com' },
    update: {},
    create: {
      id: 'usr_demo_adv',
      email: 'advertiser@vantagepoint.com',
      password: DEMO_PASSWORD,
      name: 'Vanguard Brands Corp',
      role: 'advertiser',
      company: 'Vanguard Media Group',
    },
  });

  await prisma.user.upsert({
    where: { email: 'publisher@vantagepoint.com' },
    update: {},
    create: {
      id: 'usr_demo_pub',
      email: 'publisher@vantagepoint.com',
      password: DEMO_PASSWORD,
      name: 'Apex OOH Screens',
      role: 'vendor',
      company: 'Apex Publishers Intern.',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@vantagepoint.com' },
    update: {},
    create: {
      id: 'usr_demo_adm',
      email: 'admin@vantagepoint.com',
      password: DEMO_PASSWORD,
      name: 'Regional Admin Director',
      role: 'admin',
      company: 'Vantage Point Global Admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'investor@vantagepoint.com' },
    update: {},
    create: {
      id: 'usr_demo_inv',
      email: 'investor@vantagepoint.com',
      password: DEMO_PASSWORD,
      name: 'Kalu Capital Partners',
      role: 'investor',
      company: 'Kalu Capital LLP',
    },
  });

  // ── Billboards ─────────────────────────────────────────────────────────────
  const billboards = [
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
      trafficVolume: 'Mega' as const,
      status: 'Available' as const,
      lat: 6.4375,
      lng: 3.4615,
      imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1200',
      description: 'The highest-traffic dynamic LED digital screen in West Africa.',
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
      trafficVolume: 'High' as const,
      status: 'Available' as const,
      lat: 5.5913,
      lng: -0.1940,
      imageUrl: 'https://images.unsplash.com/photo-1590053132530-50d52f9b39e6?auto=format&fit=crop&q=80&w=1200',
      description: 'Breathtaking high-elevation bridge structure spanning Liberation Road.',
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
      trafficVolume: 'VeryHigh' as const,
      status: 'Available' as const,
      lat: -1.2864,
      lng: 36.8172,
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a50b?auto=format&fit=crop&q=80&w=1200',
      description: 'High-density display positioning targeting Nairobi\'s financial core.',
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
      trafficVolume: 'Mega' as const,
      status: 'Available' as const,
      lat: -26.1076,
      lng: 28.0567,
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200',
      description: 'Gigantic vertical architectural tower positioned in Sandton.',
    },
    {
      id: 'cpt-01',
      title: 'Cape Town N1 Highway Gateway Arch',
      location: 'N1 Highway Outbound, Century City, Cape Town',
      city: 'Cape Town',
      country: 'South Africa',
      dailyRate: 350,
      format: 'Static Mega',
      dimensions: '40m x 10m',
      monthlyImpressions: '1.7M',
      trafficVolume: 'High' as const,
      status: 'Available' as const,
      lat: -33.8913,
      lng: 18.5054,
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1200',
      description: 'Unmissable wide-format static mega banner targeting outgoing city commuters.',
    },
  ];

  for (const b of billboards) {
    await prisma.billboard.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  }

  // ── Bookings ───────────────────────────────────────────────────────────────
  await prisma.booking.upsert({
    where: { id: 'bkg_4401' },
    update: {},
    create: {
      id: 'bkg_4401',
      billboardId: 'lag-01',
      startDate: '2026-06-01',
      endDate: '2026-06-15',
      campaignName: 'Summer Launch Gala',
      clientName: 'Global Brands Inc.',
      totalCost: 7200,
      status: 'PendingApproved',
      slogan: 'Reach the Summit of Visual Distinction',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'bkg_4402' },
    update: {},
    create: {
      id: 'bkg_4402',
      billboardId: 'nbo-01',
      startDate: '2026-05-10',
      endDate: '2026-06-10',
      campaignName: 'Neo-Tokyo Cyberpunk Showcase',
      clientName: 'Sora Dynamics',
      totalCost: 8700,
      status: 'Live',
      slogan: 'Precision-Engineered Future Tech',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'bkg_4403' },
    update: {},
    create: {
      id: 'bkg_4403',
      billboardId: 'cpt-01',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      campaignName: 'Autumn Couture Launch',
      clientName: 'Vanguard Atelier',
      totalCost: 10500,
      status: 'Completed',
      slogan: 'Timeless Elegance, Modern Scale',
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('');
  console.log('Demo credentials (password: "password" for all):');
  console.log('  advertiser  →  advertiser@vantagepoint.com');
  console.log('  vendor      →  publisher@vantagepoint.com');
  console.log('  admin       →  admin@vantagepoint.com');
  console.log('  investor    →  investor@vantagepoint.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
