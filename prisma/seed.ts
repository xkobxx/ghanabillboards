import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = bcrypt.hashSync('password', 12);

async function main() {
  // ── Users ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'buyer@vantagepoint.com' },
    update: {},
    create: {
      id: 'usr_demo_adv',
      email: 'buyer@vantagepoint.com',
      password: DEMO_PASSWORD,
      name: 'Vanguard Brands Corp',
      role: 'buyer',
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
      role: 'publisher',
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
      startAt: new Date('2026-06-01T00:00:00.000Z'),
      endAt: new Date('2026-06-15T00:00:00.000Z'),
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
      startAt: new Date('2026-05-10T00:00:00.000Z'),
      endAt: new Date('2026-06-10T00:00:00.000Z'),
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
      startAt: new Date('2026-04-01T00:00:00.000Z'),
      endAt: new Date('2026-04-30T00:00:00.000Z'),
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
  console.log('  buyer       →  buyer@vantagepoint.com');
  console.log('  publisher   →  publisher@vantagepoint.com');
  console.log('  admin       →  admin@vantagepoint.com');
  console.log('  investor    →  investor@vantagepoint.com');

  // ── Impression logs (last 30 days) ─────────────────────────────────────────
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    for (const b of billboards) {
      const base = b.monthlyImpressions === '3.8M' ? 126000
        : b.monthlyImpressions === '2.9M' ? 96000
        : b.monthlyImpressions === '2.2M' ? 73000
        : b.monthlyImpressions === '1.9M' ? 63000
        : 56000;
      const noise = Math.round(Math.sin(i * 0.6) * 12000 + Math.random() * 8000);
      await prisma.impressionLog.create({
        data: { billboardId: b.id, date, count: Math.max(base + noise, 10000) },
      });
    }
  }
  console.log('✅ Impression logs seeded (30 days × 5 billboards)');

  // ── Blog posts ──────────────────────────────────────────────────────────
  const blogPosts = [
    {
      slug: 'state-of-ooh-advertising-africa-2026',
      title: 'The State of OOH Advertising in Africa 2026',
      excerpt: 'Out-of-home advertising across Sub-Saharan Africa is projected to reach $1.6B by 2028, driven by urbanisation, digital screen adoption, and programmatic buying.',
      body: '<p>Out-of-home advertising across Sub-Saharan Africa is projected to reach $1.6B by 2028, driven by urbanisation, digital screen adoption, and programmatic buying. The market is evolving rapidly as cities like Lagos, Accra, Nairobi, Cape Town and Johannesburg invest in infrastructure that makes outdoor media more measurable and effective for advertisers.</p><p>Several key trends are converging. First, digital billboard uptake is surging—LED screens now account for over 35% of new inventory across the continent. Second, programmatic platforms are replacing the old method of phone calls and PDF rate cards, compressing booking times from weeks to minutes. Third, audiences are denser and younger than ever, with median ages between 18 and 22 across most Sub-Saharan markets.</p><p>We expect continued double-digit growth in the sector through the end of the decade.</p>',
      category: 'Industry',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
    {
      slug: 'programmatic-booking-changing-outdoor-media',
      title: 'How Programmatic Booking Is Changing Outdoor Media',
      excerpt: 'The shift from phone calls and PDF rate cards to real-time programmatic marketplace is reducing booking times from 18 days to under 5 minutes.',
      body: '<p>The shift from phone calls and PDF rate cards to real-time programmatic marketplace is reducing booking times from 18 days to under 5 minutes. For media agencies accustomed to manually coordinating with multiple publishers across cities, this represents a step-change in efficiency.</p><p>Programmatic booking on Vantage Point works across three phases: inventory discovery (search by city, format, traffic volume, and availability), creative submission and approval (upload assets, track review status), and campaign management (real-time proof of play, impression data, and invoicing).</p><p>Buyers who used programmatic booking in our Q1 2026 cohort reported a 92% reduction in time-to-live and a 40% increase in campaigns placed across multiple cities.</p>',
      category: 'Product',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
    {
      slug: 'digital-vs-static-billboard-format',
      title: 'Digital vs Static: Which Billboard Format Wins?',
      excerpt: 'Digital billboards command 4x higher rates than static but offer dynamic creative switching. We break down the ROI case for each format.',
      body: '<p>Digital billboards command 4x higher daily rates than static billboards, but they offer dynamic creative switching, real-time scheduling, and higher recall rates. Static billboards, on the other hand, provide consistent 24/7 visibility at a lower price point.</p><p>Our data shows that digital billboards deliver a 2.3x higher unaided recall rate in high-traffic urban corridors. However, static mega billboards along highways have longer dwell times and can be more cost-effective for long-running brand awareness campaigns.</p><p>The verdict? Use digital for time-sensitive, multi-creative, and targeted campaigns. Use static mega for sustained brand presence, highway corridors, and budget-conscious clients who need maximum square footage.</p>',
      category: 'Market data',
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
    {
      slug: 'accra-west-africa-ad-hub',
      title: "Why Accra Is Becoming West Africa's Ad Hub",
      excerpt: 'With a 7% GDP growth rate and a booming creative sector, Accra is attracting major advertising spend from multinational brands targeting West Africa.',
      body: '<p>With a 7% GDP growth rate and a booming creative sector, Accra is attracting major advertising spend from multinational brands targeting the West African market. The city\'s strategic position at the centre of the ECOWAS corridor, combined with an English-speaking workforce and improving infrastructure, makes it a natural hub.</p><p>Several factors are accelerating this trend. The Kotoka International Airport upgrade has increased business travel capacity, the Tema Motorway expansion is improving traffic flow to major billboard corridors, and a wave of agency talent from Ghana\'s top universities is building the local media buying ecosystem.</p><p>We expect Accra to surpass Lagos in per-capita OOH spend by 2028, making it the most efficient market for outdoor advertising in the region.</p>',
      category: 'Industry',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
    {
      slug: 'real-time-traffic-verification',
      title: 'Introducing Real-Time Traffic Verification',
      excerpt: 'Our new telemetry integration gives buyers verified traffic counts, dwell time data, and proof-of-play for every campaign running on the platform.',
      body: '<p>Our new telemetry integration gives buyers verified traffic counts, dwell time data, and proof-of-play for every campaign running on the platform. This feature, available to all buyers on the Vantage Point platform, addresses the single largest concern advertisers have about outdoor media: verifiable delivery.</p><p>The telemetry system works by ingesting data from multiple sources—road sensor arrays, mobile location aggregates, and publisher-reported counts—then triangulating an audience estimate per billboard per day. Buyers can view daily breakdowns, compare against booked impressions, and download verified proof-of-play reports for client billing.</p><p>In beta testing, our telemetry data matched independent third-party audits within a 4% margin of error, making it the most reliable verification system in African OOH today.</p>',
      category: 'Product',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
    {
      slug: 'nairobi-ooh-market-2026-buyers-guide',
      title: "Nairobi OOH Market: 2026 Buyer's Guide",
      excerpt: 'Nairobi\'s billboard inventory grew 34% year-over-year. We map the key corridors, price ranges, and audience demographics for media buyers.',
      body: '<p>Nairobi\'s billboard inventory grew 34% year-over-year, driven by infrastructure projects along the Thika Superhighway, the expansion of the JKIA expressway, and new digital installations in the CBD. This guide maps the key corridors, price ranges, and audience demographics for media buyers entering the market.</p><p><strong>Key corridors:</strong> Uhuru Highway (CBD commuters, 2.2M monthly impressions), Mombasa Road (airport traffic, 1.8M impressions), Thika Road (suburban professionals, 1.5M impressions), and Ngong Road (affluent residential, 900K impressions).</p><p><strong>Price ranges:</strong> Digital LED billboards range from $290-$450/day depending on location and traffic volume. Static mega formats run $120-$250/day. Most publishers offer volume discounts for multi-week campaigns and multi-site packages.</p><p>Our recommendation for first-time buyers: start with a 2-week campaign on a high-traffic digital board to benchmark performance, then expand to static formats for sustained presence.</p>',
      category: 'Market data',
      imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
      published: true,
      authorId: 'usr_demo_adm',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('✅ Blog posts seeded (6 posts)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
