# BlueprintPage Redesign — Design Spec
_Date: 2026-07-04 · Approach: Scrollytelling narrative (A)_

## Goal
Replace the thin existing BlueprintPage with a full credibility page targeting two audiences:
- **Media buyers / agency planners** — need business trust before committing budget
- **Technical stakeholders** — CTO / IT lead at an agency vetting the integration

Both read the same linear page. Business readers stop when satisfied; technical readers keep scrolling for depth.

## Navbar Change
Add `Platform` link to `Navbar.tsx` pointing to `/blueprint`, between `Billboards` and the auth actions.

---

## Page Sections

### §1 — Hero
- **Eyebrow:** `PLATFORM OVERVIEW`
- **H1:** `Built for serious buyers.`
- **Lead:** `Vantage Point is Africa's first unified outdoor advertising marketplace. This page is for media buyers, agencies, and technical teams who need more than a homepage before they commit.`
- **No CTA** — three inline anchor links instead: `Coverage ↓` · `How it works ↓` · `Architecture ↓`
- **Animation:** `clip-reveal` on load, same as LandingPage hero

### §2 — Coverage & Scale
- **Eyebrow:** `COVERAGE`
- **H2:** `Five cities. 42+ vendors. One search.`
- **Metrics row** (reuse `data-count` count-up pattern):
  - `5` — Cities live today
  - `42+` — Vendors consolidated
  - `4.5 min` — Avg. time to book
  - `100%` — Transparent pricing
- **City chips row:** Accra · Lagos · Nairobi · Johannesburg · Cape Town
- **Animation:** `scrollTrigger` reveal on enter

### §3 — Booking Flow
- **Eyebrow:** `HOW IT WORKS`
- **H2:** `From search to live campaign in six steps.`
- **Layout:** Vertical numbered timeline, left-aligned numbers, right-side content
- **Steps:**

| # | Title | Description | Role badge |
|---|-------|-------------|------------|
| 01 | Search | Filter by city, format, traffic volume, and price range. | Buyer |
| 02 | Compare | View specs, daily rates, traffic data, and photos side by side. | Buyer |
| 03 | Price | Daily rate × flight duration = total. No fees added at checkout. | Buyer |
| 04 | Schedule | Lock calendar dates. A pending booking record is created instantly. | Buyer |
| 05 | Approve | Vendor confirms availability and accepts the booking. | Vendor |
| 06 | Report | Campaign goes live. Telemetry tracks delivery status. | Both |

- **Animation:** Each step reveals on scroll with stagger

### §4 — Trust Signals
- **Eyebrow:** `WHY BUYERS TRUST US`
- **H2:** `No surprises. No gatekeepers. No guessing.`
- **Layout:** 2×2 `glass-panel` card grid
- **Cards:**
  1. **Transparent pricing** — Daily rate × flight duration = total. Nothing buried in email attachments.
  2. **Vendor verification** — Every operator is vetted before their inventory goes live.
  3. **Real-time availability** — Calendar locks on your dates the moment you schedule. No double-booking.
  4. **Escrow-ready payments** — Paystack integration holds funds until campaign confirmation. No pay-and-pray.
- **Animation:** Cards reveal with stagger on scroll

### §5 — Technical Architecture
- **Eyebrow:** `TECHNICAL OVERVIEW`
- **H2:** `Three tiers. One coherent system.`
- **Layout:** Two-column — architecture map left, stack + security right
- **Architecture map** (absorb from existing BlueprintPage):
  1. Client Tier (React Multi-Module Router) — Lenis smooth scrolling, GSAP triggers
  2. API Gateway (Rate Limiter Proxy) — Nginx config, secure credential signing
  3. Modular Monolith DB Hub — Prisma abstraction, active campaign timetables
- **Stack pill row:** React · Vite · TypeScript · Paystack · Prisma · Nginx
- **Security callouts** (3 inline items):
  - Rate-limited API gateway — no credential exposure to client
  - Paystack escrow — funds held until vendor confirmation
  - 100% client-side sandbox — dev environment mirrors Auth, Booking & Payments modules
- **Build metadata panel** (absorb from existing BlueprintPage): Environment · Version · Stack

### §6 — CTA
- **Eyebrow:** `GET STARTED`
- **H2:** `Ready to evaluate the platform?`
- **Lead:** `Dashboards and deep workflows sit behind each role. Pick where you want to go.`
- **Two buttons:**
  - `Start booking` → `/booking` (primary)
  - `View investor deck` → `/investor` (secondary)

---

## Implementation Notes

### Patterns to reuse (no new CSS)
- `vp-stage` / `vp-wrap` — section + content container
- `vp-eyebrow` — section label
- `vp-lead` — subtext
- `vp-btn primary` / `vp-btn` — CTA buttons
- `vp-metrics` / `vp-metric` — count-up stat row
- `glass-panel` — trust signal cards
- `data-count` / `data-suffix` / `data-prefix` — count-up wiring
- GSAP `scrollTrigger` with `reveal` / `fade-up` classes — same setup as LandingPage

### Files to change
| File | Change |
|------|--------|
| `src/pages/BlueprintPage.tsx` | Full rewrite — 6 sections |
| `src/components/Navbar.tsx` | Add `Platform` link to `/blueprint` |

### What gets absorbed from existing BlueprintPage
- Architecture map (§5)
- Build metadata panel (§5)
- Paystack / security bullet points (§5)

### What gets removed
- "VIEW SECRETS SLIDES" and "MONITOR GATEWAY LOGS" buttons (too internal for a public credibility page)
- Raw build version panel as a standalone section (absorbed into §5)

---

## Out of scope
- New CSS classes
- Backend / API changes
- Animation library changes (GSAP already installed)
- Mobile-specific layout overrides beyond what `vp-wrap` / responsive grid already handles
