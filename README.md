# Vantage Point — Unified OOH Advertising Terminal

The digital marketplace for outdoor advertising in Sub-Saharan Africa. Discover, book, and manage billboard campaigns across Lagos, Accra, Nairobi, Johannesburg, and Cape Town — from 18 days to 4.5 minutes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, GSAP |
| Backend | Express 4, Prisma ORM, PostgreSQL |
| Auth | bcryptjs, JSON Web Tokens (Bearer) |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |

## Architecture

```
Browser (SPA) ──▶ Express Gateway (:4000) ──▶ PostgreSQL
                      │
          ┌───────────┼───────────┐
     /api/auth    /api/billboards  /api/bookings
```

The frontend is a Vite SPA on `:3000`. The Express gateway on `:4000` handles authentication, authorization, and all data access. Role-based access control gates publisher, admin, buyer, and investor dashboards.

## Quick Start

**Prerequisites:** Node.js ≥18, PostgreSQL

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and a strong JWT_SECRET

# 3. Set up the database
npm run db:setup

# 4. Start both servers
npm run server &    # Express API on :4000
npm run dev         # Vite frontend on :3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on `:3000` |
| `npm run server` | Start Express API gateway on `:4000` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:setup` | Migrate + seed in one step |
| `npm run lint` | TypeScript type check |
| `npm run test` | Run Vitest test suite |

## Project Structure

```
src/
  components/     React components (dashboards, auth, maps)
  context/        AppContext, ThemeContext
  hooks/          useLocalStorage
  lib/            Validation helpers
  pages/          Route-level page components
  config/         SEO metadata
server/
  index.ts        Express entry point (helmet, CORS, rate limiter)
  db.ts           Prisma client singleton
  middleware/
    auth.ts       JWT verification + role guards
    rateLimiter.ts Auth + general rate limiting
    validate.ts   Zod schema validation
  routes/
    auth.ts       POST /register, POST /login, GET /me
    billboards.ts CRUD with publisher/admin guards
    bookings.ts   CRUD with role-scoped access
prisma/
  schema.prisma   Data model (User, Billboard, Booking, GatewayLog)
  seed.ts         Demo data seeder
```

## API Endpoints

### Auth

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/auth/register` | Public | — |
| POST | `/api/auth/login` | Public | — |
| GET | `/api/auth/me` | Bearer | Any |

### Billboards

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/billboards` | Public | — |
| GET | `/api/billboards/:id` | Public | — |
| POST | `/api/billboards` | Bearer | publisher, admin |
| PATCH | `/api/billboards/:id` | Bearer | publisher, admin |
| DELETE | `/api/billboards/:id` | Bearer | publisher, admin |

### Bookings

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/bookings` | Bearer | Any (admin sees all) |
| POST | `/api/bookings` | Bearer | buyer, admin |
| PATCH | `/api/bookings/:id/status` | Bearer | publisher, admin |

## Demo Credentials

After seeding, log in with password `password`:

| Role | Email |
|------|-------|
| Buyer | `buyer@vantagepoint.com` |
| Publisher | `publisher@vantagepoint.com` |
| Admin | `admin@vantagepoint.com` |
| Investor | `investor@vantagepoint.com` |

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT Bearer tokens with role claims
- Role-based middleware on all protected routes
- Rate limiting on auth endpoints (20 req/15min)
- Zod input validation on all mutations
- Helmet security headers on all responses
- Admin registration restricted to `@vantage.africa` emails
- `.env` is gitignored — never commit secrets
