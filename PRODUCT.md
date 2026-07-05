# Product

## Register

product

## Users

Media buyers and agencies booking out-of-home advertising campaigns across Sub-Saharan Africa, plus billboard publishers managing inventory, pricing, and approvals. Both groups have equal priority. Users operate in fast-turnaround media planning cycles — they need to discover, price, and confirm billboard placements quickly, often across multiple cities and formats.

Authentication must help returning users enter the correct role workspace (buyer vs. publisher) quickly and help new organizations register with confidence.

## Product Purpose

Vantage Point is the first unified marketplace for outdoor advertising in Sub-Saharan Africa. It consolidates discovery, pricing, proof, and booking — which today requires emailing 42+ separate operators over 18 days — into a single search-and-book flow that takes under 5 minutes. Success means buyers can search, price, and book billboards across Africa without leaving the platform, and publishers can list, price, and approve inventory through a single dashboard.

## Brand Personality

Premium, cinematic, and dramatic. The experience communicates trust, operational authority, and the sense of entering a high-value media exchange — without becoming theatrical or difficult to use. Voice is direct and confident; the product speaks like a trading desk, not a marketing brochure.

## Anti-references

- Generic glassmorphism as default surface treatment
- Neon-on-dark color schemes (terminal != neon)
- Repetitive identical card grids (icon + heading + text)
- Excessive monospace copy outside of actual data/metrics contexts
- "Corporate SaaS" beige/cream landing pages
- Decorative animation that doesn't convey state or feedback
- Modals as the first answer to any interaction

## Design Principles

1. **Equal visual weight.** Buyers and publishers get equally clear paths into the product. Neither persona is the "secondary" audience.
2. **Confident threshold.** Authentication feels like entering a premium exchange, not filling out a generic sign-up form.
3. **Drama in composition, not complexity.** Forms are direct and readable. Depth, contrast, and motion carry the personality — not nested modals or over-decorated components.
4. **WCAG AA compliance.** Visible focus rings, keyboard-operable interactions, focus trapping in dialogs, readable contrast ratios, and reduced-motion support.
5. **Progressive disclosure.** Demo access and secondary actions are available but don't compete with the primary task (search → book, or list → approve).

## Accessibility & Inclusion

- WCAG 2.1 AA minimum
- Reduced-motion support: all animations disabled or crossfaded when `prefers-reduced-motion: reduce` is active
- Keyboard-navigable throughout (focus trapping in modals, visible focus indicators)
- Color is never the sole differentiator for state or status
