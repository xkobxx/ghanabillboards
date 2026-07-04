# Authentication Stage Design

## Objective

Redesign the Sign In and Register modals as a shared cinematic authentication stage that gives advertisers and billboard publishers equal priority, feels premium and dramatic, and meets WCAG AA.

## Audience and Jobs

- Advertisers and media agencies need to enter campaign, booking, and performance workspaces.
- Billboard vendors need to enter inventory, approval, and payout workspaces.
- New organizations need to select the correct role and create an account without ambiguity.
- Demo users need a fast route into either role without competing with the primary form.

## Direction

The authentication experience is a deliberate threshold into the Vantage Point exchange. On desktop, an asymmetric split composition pairs a dark cinematic narrative panel with a focused form surface. On mobile, the form becomes a full-screen stage with the narrative reduced to a concise masthead.

The composition uses Fraunces for expressive editorial hierarchy, Archivo for readable controls, and IBM Plex Mono only for compact operational metadata. Drama comes from scale, contrast, geometry, and a restrained entrance transition—not glow, glassmorphism, or decorative cards.

## Interaction Model

- Sign In remains the primary action.
- Registration switches through an explicit text action.
- Demo access is collapsed initially and revealed on demand.
- Advertiser and Publisher demo choices receive equal weight; Admin remains visually secondary.
- Registration role selection behaves as an accessible radio group.
- Errors are announced through an `aria-live` region.
- Escape closes the dialog, Tab stays trapped inside it, and focus returns to the trigger.
- Backdrop click closes the dialog, but clicks inside do not.
- Body scroll is locked while authentication is open.

## Responsive Behavior

- Desktop: maximum width around 1040px, two-column 42/58 split, bounded height with the form side scrolling when required.
- Tablet: retain two columns when space permits but reduce narrative density.
- Mobile: full viewport, single-column form, sticky compact header, no nested card or clipped content.

## Accessibility

- `role="dialog"`, `aria-modal="true"`, and title/description associations.
- Visible focus states and controls at least 44px high.
- Programmatic labels for every input and password visibility control.
- Focus trap, Escape handling, focus restoration, and reduced-motion support.
- WCAG AA color contrast in light and cinematic themes.

## Validation

Automated tests cover dialog semantics, keyboard handling, demo disclosure, labelled fields, password visibility, and role selection. Browser validation covers desktop and 390px mobile layouts in both themes.
