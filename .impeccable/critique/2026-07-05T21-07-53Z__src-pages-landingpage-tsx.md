---
timestamp: 2026-07-05T21-07-53Z
slug: src-pages-landingpage-tsx
---
{
  "target": "src/pages/LandingPage.tsx — hero section",
  "score": 62,
  "p0": 0,
  "p1": 2,
  "p2": 1,
  "p3": 0,
  "findings": [
    { "priority": "P1", "id": "eyebrow-every-section", "title": "Eyebrow on every section (absolute ban)", "description": "Hero eyebrow 'Africa's out-of-home marketplace' restates the h1; same tracked-uppercase eyebrow pattern on all 5 sections. Fixed: removed from hero, h1 elevated to declarative brand statement.", "status": "fixed" },
    { "priority": "P1", "id": "centered-hero-sparse-content", "title": "100svh centered hero with sparse content after carousel removal", "description": "Removing the carousel left 40% empty vertical space. Fixed: added geographic presence layer — city coordinate pins (Accra, Lagos, Nairobi, Johannesburg, Cape Town) positioned in corners/edges, animated in during cinematic entrance, hidden on mobile.", "status": "fixed" },
    { "priority": "P2", "id": "aphoristic-lead-copy", "title": "Aphoristic triple-cadence lead copy", "description": "\"One search, one price, one booking\" is the marketing-brochure rhythm the PRODUCT.md rejects. Fixed: replaced with specific geographic copy naming all 5 live cities.", "status": "fixed" },
    { "priority": "P2", "id": "eyebrow-remaining-sections", "title": "Eyebrow still on all non-hero sections (absolute ban, open)", "description": "Problem, Roles, Operating Model, and CTA sections still use the same tracked uppercase eyebrow pattern. Each instance is a separate violation.", "status": "open" },
    { "priority": "P3", "id": "inter-body-font", "title": "Inter body font — not distinctive for a cinematic brand", "description": "Detector flagged Inter as oversaturated. For a premium exchange brand, a more distinctive body pairing would differentiate.", "status": "open" }
  ]
}
