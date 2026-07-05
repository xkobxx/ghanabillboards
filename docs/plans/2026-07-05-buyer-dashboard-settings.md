# Buyer Dashboard Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the buyer Settings prototype with account-scoped, API-backed settings whose booking, approval, notification, creative-review, currency, budget, and security effects are enforced end to end.

**Architecture:** Keep `BuyerPage` as the route shell, but move settings state and interactions into a focused feature module backed by authenticated Express endpoints and PostgreSQL. Domain services—not React toggles—enforce booking defaults, approval gates, alert preferences, creative review, and MFA. Implement one observable behavior at a time with API integration tests and React user-flow tests before adding the next behavior.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Express 4, Zod, Prisma 5, PostgreSQL, JWT, bcryptjs, otplib TOTP, Supertest.

---

## Audit findings

The active buyer route renders `src/pages/BuyerPage.tsx`; `src/components/BuyerDashboard.tsx` is an unreferenced legacy component and is outside this plan.

| Visible or claimed capability | Current evidence | Classification | Required outcome |
|---|---|---|---|
| Save settings | `BuyerPage.tsx:672` only exits edit mode; `useLocalStorage` already persisted every change | Broken | Save one validated draft through the API and show pending/success/error state |
| Cancel settings | `BuyerPage.tsx:673` only exits edit mode | Broken | Discard the draft and restore the last server value |
| Per-account persistence | One browser-wide `vantage_buyer_settings` key at `BuyerPage.tsx:36` | Prototype only | Store one settings record per authenticated buyer |
| Billing currency | `BuyerPage.tsx:83` replaces the symbol but never converts the amount | Partially simulated | Format converted values while retaining base-currency and rate metadata; calculate booking totals on the server |
| Default flight length | Displayed at `BuyerPage.tsx:418/468`; `BookingDrawer.tsx:32/131` is hard-coded to 14 days | Disabled downstream effect | Prefill new booking end dates from the saved setting |
| Approval workflow | Read only outside Settings; no organization, manager, or approval models | Disabled | Route manager-governed bookings to an internal approval queue before publisher submission |
| Booking status alerts | Toggle only controls a navigation dot; notifications are always created in `AppContext.tsx:184-220` | Disabled | Persist preferences and suppress/deliver actual booking events accordingly |
| Availability alerts | Toggle only controls a navigation dot; no watch/subscription model | Disabled | Let buyers watch inventory and notify them when a slot or board becomes available |
| Invoice alerts | No invoice model or invoice lifecycle exists | Disabled | Issue server-side invoice records and notify on issue/payment/overdue events |
| Two-factor authentication | Boolean only; login never challenges for a second factor | Disabled and security-sensitive | TOTP enrollment, confirmation, recovery codes, login challenge, disable flow, and replay protection |
| Creative review required | Toggle only controls a navigation dot and explanatory copy | Disabled | Require an approved creative asset before the booking advances |
| Budget cap | Claimed at `BuyerPage.tsx:726` but absent from settings state and UI | Missing control | Add an optional account budget cap and enforce it on server-side booking estimates/submission |
| Session alerts | Claimed at `BuyerPage.tsx:729` but absent from settings state and UI | Missing control | Record sessions and alert on a new device/sign-in context |
| Accessibility of switches | `Toggle.tsx` renders unnamed `role="switch"` controls | Broken | Give every control a programmatic label, description, focus state, and status announcement |

## Constraints and decisions

- Do not retain `localStorage` as the source of truth for authenticated settings. A short-lived cache is acceptable only after server data is loaded.
- Do not allow the client to submit authoritative totals or converted prices. The server calculates base amount, exchange rate, display amount, and budget-cap result.
- Do not model MFA as a normal boolean setting. Its displayed status is derived from confirmed MFA factors.
- Do not enable manager approval until organization membership and a manager role exist.
- Do not enable invoice alerts until an invoice event exists.
- Do not store TOTP secrets or recovery codes in plaintext. Encrypt TOTP secrets with AES-256-GCM and hash single-use recovery codes.
- Use otplib's current async functional API (`generateSecret`, `generateURI`, `verify`) and reject replayed time steps with `afterTimeStep`.
- Preserve the premium editorial dashboard language and flat hierarchy from `.impeccable.md`; use progressive disclosure for MFA setup, alert channels, and advanced governance.
- The working tree already contains unrelated edits. Implement on a dedicated `codex/` branch/worktree and never overwrite those edits.

## Baseline quality gate

As of 2026-07-05:

- `npm run lint` fails because `src/__tests__/AuthModals.test.tsx` still passes removed `AuthStage` props.
- `npm test` reports 24 passing and 67 failing tests. Most failures predate this plan and include missing `IntersectionObserver`, stale page copy assertions, stale auth tests, and stale typography expectations.

Before claiming any settings slice is complete, establish a green baseline in the implementation worktree or explicitly split the unrelated baseline repair into a prerequisite PR. Targeted new tests must still follow RED → GREEN even while that repair is in review.

### Task 1: Create an API integration test seam and real authenticated frontend session

**Files:**
- Create: `server/app.ts`
- Create: `server/__tests__/auth.test.ts`
- Create: `src/lib/apiClient.ts`
- Create: `src/lib/authApi.ts`
- Create: `src/__tests__/authApi.test.ts`
- Modify: `server/index.ts`
- Modify: `src/components/SignIn.tsx`
- Modify: `src/components/Register.tsx`
- Modify: `src/context/AppContext.tsx`
- Modify: `src/App.tsx`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `.env.example`

**Behavior:** A successful login through the public UI uses `/api/auth/login`, stores the returned bearer token through one session abstraction, hydrates `/api/auth/me`, and clears both token and user on sign-out.

**Step 1: Add the failing API test**

Export an Express application without binding a port, then test it through Supertest:

```ts
// server/__tests__/auth.test.ts
// @vitest-environment node
it('returns a bearer token and public buyer payload for valid credentials', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'buyer@vantagepoint.com', password: 'password' });

  expect(response.status).toBe(200);
  expect(response.body.token).toEqual(expect.any(String));
  expect(response.body.user).toMatchObject({
    email: 'buyer@vantagepoint.com',
    role: 'buyer',
  });
  expect(response.body.user.password).toBeUndefined();
});
```

**Step 2: Run the test and verify RED**

Run: `npx vitest run server/__tests__/auth.test.ts`

Expected: FAIL because the app is not exported and the server test is not configured.

**Step 3: Extract the app and add the test dependency**

Move middleware and route mounting from `server/index.ts` into:

```ts
// server/app.ts
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.APP_BASE_URL || 'http://localhost:3000', credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(generalLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/billboards', billboardRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  return app;
}
```

Keep `server/index.ts` responsible only for calling `createApp().listen(...)`. Add `supertest` and `@types/supertest`.

**Step 4: Run the API test and verify GREEN**

Run: `npx vitest run server/__tests__/auth.test.ts`

Expected: PASS.

**Step 5: Add the failing frontend session test**

Test `login`, authenticated `get`, `401` cleanup, and logout through the public `authApi`/`apiClient` interface. Mock only `fetch`, which is a system boundary.

**Step 6: Run the frontend test and verify RED**

Run: `npx vitest run src/__tests__/authApi.test.ts`

Expected: FAIL because no shared API client exists.

**Step 7: Implement the smallest shared client and wire the UI**

The public interface should remain small:

```ts
export interface SessionStore {
  getToken(): string | null;
  setToken(token: string): void;
  clear(): void;
}

export const authApi = {
  login(input: LoginInput): Promise<AuthSession>,
  register(input: RegisterInput): Promise<AuthSession>,
  me(): Promise<User>,
  logout(): void,
};
```

Use the API result as the source of truth. Remove plaintext `vantage_users` authentication from `SignIn`, `Register`, and password/account operations before settings are connected.

**Step 8: Run targeted checks and commit**

Run:

```bash
npx vitest run server/__tests__/auth.test.ts src/__tests__/authApi.test.ts src/__tests__/AuthModals.test.tsx
npm run lint
```

Expected: Targeted tests pass; lint has no new errors.

Commit: `feat(auth): connect dashboard session to gateway`

### Task 2: Persist buyer settings behind an authenticated API

**Files:**
- Create: `prisma/migrations/20260705120000_add_buyer_settings/migration.sql`
- Create: `server/routes/buyerSettings.ts`
- Create: `server/schemas/buyerSettings.ts`
- Create: `server/__tests__/buyerSettings.test.ts`
- Create: `src/types/buyerSettings.ts`
- Create: `src/lib/buyerSettingsApi.ts`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `server/app.ts`

**Data contract:**

```ts
export type BillingCurrency = 'USD' | 'GHS' | 'NGN' | 'KES' | 'ZAR';
export type ApprovalWorkflow = 'DIRECT' | 'MANAGER';

export interface BuyerSettings {
  billingCurrency: BillingCurrency;
  defaultFlightDays: number;
  budgetCapMinor: number | null;
  approvalWorkflow: ApprovalWorkflow;
  bookingStatusAlerts: boolean;
  availabilityAlerts: boolean;
  invoiceAlerts: boolean;
  sessionAlerts: boolean;
  creativeReviewRequired: boolean;
  mfaEnabled: boolean; // derived, never accepted by PATCH
  version: number;
}
```

**Step 1: Write the failing GET test**

Test that `GET /api/buyer/settings` creates/returns defaults for an authenticated buyer and returns `403` for a publisher.

**Step 2: Run and verify RED**

Run: `npx vitest run server/__tests__/buyerSettings.test.ts -t "returns buyer defaults"`

Expected: FAIL with 404.

**Step 3: Add the Prisma model and GET endpoint**

Add enums and a one-to-one record:

```prisma
enum BillingCurrency {
  USD
  GHS
  NGN
  KES
  ZAR
}

enum ApprovalWorkflow {
  DIRECT
  MANAGER
}

model BuyerSetting {
  userId                  String           @id
  user                    User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  billingCurrency         BillingCurrency  @default(USD)
  defaultFlightDays       Int              @default(14)
  budgetCapMinor          BigInt?
  approvalWorkflow        ApprovalWorkflow @default(DIRECT)
  bookingStatusAlerts     Boolean          @default(true)
  availabilityAlerts      Boolean          @default(true)
  invoiceAlerts           Boolean          @default(true)
  sessionAlerts           Boolean          @default(true)
  creativeReviewRequired  Boolean          @default(false)
  version                 Int              @default(1)
  createdAt               DateTime         @default(now())
  updatedAt               DateTime         @updatedAt
}
```

Serialize `budgetCapMinor` to a JSON-safe decimal string or safe integer at the route boundary.

**Step 4: Run GET test and verify GREEN**

Run: `npx vitest run server/__tests__/buyerSettings.test.ts -t "returns buyer defaults"`

Expected: PASS.

**Step 5: Write the failing PATCH tests**

Cover:

- valid partial update;
- `defaultFlightDays` outside 1–365 rejected;
- negative budget rejected;
- unknown fields rejected;
- publisher rejected;
- stale `version` returns `409`.

**Step 6: Run and verify RED**

Expected: FAIL because PATCH does not exist.

**Step 7: Implement validated optimistic-concurrency PATCH**

Use a strict Zod schema and update where `{ userId, version }`; increment `version`. Never accept `mfaEnabled` from the request.

**Step 8: Run tests and commit**

Run:

```bash
npx prisma validate
npx vitest run server/__tests__/buyerSettings.test.ts
```

Expected: PASS.

Commit: `feat(settings): persist buyer preferences`

### Task 3: Replace immediate local mutations with a transactional Settings form

**Files:**
- Create: `src/hooks/useBuyerSettings.ts`
- Create: `src/components/buyer-settings/BuyerSettingsForm.tsx`
- Create: `src/components/buyer-settings/SettingsSection.tsx`
- Create: `src/__tests__/BuyerSettings.test.tsx`
- Modify: `src/pages/BuyerPage.tsx:33-36`
- Modify: `src/pages/BuyerPage.tsx:658-733`
- Modify: `src/components/Toggle.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing Save test**

Render the authenticated buyer route, open Settings, edit currency and flight length, save, and assert the request payload plus announced success.

**Step 2: Run and verify RED**

Run: `npx vitest run src/__tests__/BuyerSettings.test.tsx -t "saves one validated draft"`

Expected: FAIL because Settings writes directly to local storage.

**Step 3: Implement query/draft/save state**

`useBuyerSettings` owns `{ data, draft, status, error }`. The form owns no persistence logic. Disable Save when unchanged, while saving, or invalid. Use `aria-live="polite"` for success and `role="alert"` for failure.

**Step 4: Run Save test and verify GREEN**

Expected: PASS.

**Step 5: Write the failing Cancel test**

Change several controls, press Cancel, reopen Edit, and assert the last server values are restored and no PATCH occurred.

**Step 6: Run RED, implement reset, run GREEN**

Reset `draft` from `data`; do not issue a request.

**Step 7: Write and implement accessibility behavior**

Change `Toggle` to accept `label`, `descriptionId`, and `disabled`:

```tsx
<button
  type="button"
  role="switch"
  aria-label={label}
  aria-describedby={descriptionId}
  aria-checked={checked}
  disabled={disabled}
  onClick={onChange}
/>
```

Test keyboard activation, accessible names, focus visibility, mobile layout, loading, empty, and API error states.

**Step 8: Remove the settings `useLocalStorage` source of truth and commit**

Run: `npx vitest run src/__tests__/BuyerSettings.test.tsx`

Expected: PASS.

Commit: `feat(settings): add transactional buyer settings form`

### Task 4: Make flight length, currency, and budget cap affect booking

**Files:**
- Create: `server/services/money.ts`
- Create: `server/services/exchangeRates.ts`
- Create: `server/__tests__/bookingPreferences.test.ts`
- Create: `src/lib/money.ts`
- Create: `src/__tests__/BookingPreferences.test.tsx`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260705130000_add_booking_money/migration.sql`
- Modify: `server/routes/bookings.ts`
- Modify: `src/components/BookingDrawer.tsx`
- Modify: `src/components/MarketplaceMap.tsx`
- Modify: `src/pages/BuyerPage.tsx`
- Modify: `src/types.ts`

**Step 1: Write the failing flight-default UI test**

Given `defaultFlightDays: 21`, opening a new booking must prefill an end date 21 days after its start; changing the start date preserves a 21-day proposed window until the user manually changes the end date.

**Step 2: Run RED, pass the setting into `BookingDrawer`, run GREEN**

Replace both hard-coded `daysFromNow(14)` calls. Keep user-overridden end dates intact.

**Step 3: Write the failing server-price test**

Submit only the billboard, interval, and requested billing currency. Assert the server ignores a forged client total, calculates from the stored daily rate, stores base/display currency metadata, and rejects totals above `budgetCapMinor`.

**Step 4: Run and verify RED**

Expected: FAIL because `totalCost` is client-authored and no currency metadata exists.

**Step 5: Add server-authoritative money calculation**

Store monetary values as decimal/minor-unit-safe values, not binary `Float`. Add:

```ts
interface ExchangeRateProvider {
  getRate(base: BillingCurrency, quote: BillingCurrency, at: Date): Promise<Decimal>;
}
```

Inject the provider into the booking service. Persist base amount, selected currency, rate, converted amount, and rate timestamp so invoices remain reproducible.

**Step 6: Run server test and verify GREEN**

Run: `npx vitest run server/__tests__/bookingPreferences.test.ts`

Expected: PASS.

**Step 7: Write and implement converted display tests**

Use `Intl.NumberFormat` with the saved currency in Marketplace, Shortlist, Locks, and Booking Drawer. Display the base currency/rate timestamp near checkout; never create a fake conversion by changing only the symbol.

**Step 8: Run checks and commit**

Run:

```bash
npx prisma validate
npx vitest run src/__tests__/BookingPreferences.test.tsx server/__tests__/bookingPreferences.test.ts
```

Expected: PASS.

Commit: `feat(bookings): enforce buyer planning defaults`

### Task 5: Implement organization-scoped manager approval

**Files:**
- Create: `prisma/migrations/20260705140000_add_organizations_and_approvals/migration.sql`
- Create: `server/services/bookingSubmission.ts`
- Create: `server/routes/approvals.ts`
- Create: `server/__tests__/approvalWorkflow.test.ts`
- Create: `src/lib/approvalsApi.ts`
- Create: `src/components/buyer/ApprovalQueue.tsx`
- Create: `src/__tests__/ApprovalWorkflow.test.tsx`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `server/routes/auth.ts`
- Modify: `server/routes/bookings.ts`
- Modify: `server/app.ts`
- Modify: `src/pages/BuyerPage.tsx`
- Modify: `src/types.ts`

**Step 1: Write the failing booking submission test**

For a buyer whose organization uses `MANAGER`, submitting a booking creates `AWAITING_BUYER_APPROVAL`, does not place it in the publisher queue, and creates one pending approval request.

**Step 2: Run RED**

Expected: FAIL because users have only a free-text company and bookings have no buyer owner.

**Step 3: Add organization ownership and status model**

Add `Organization`, `OrganizationMember`, and `BookingApproval`. Relate every booking to `buyerId` and `organizationId`; stop using `clientName` as an authorization key. Split ambiguous `PendingApproved` into explicit workflow states such as:

```prisma
enum BookingStatus {
  DRAFT
  AWAITING_CREATIVE
  AWAITING_BUYER_APPROVAL
  PENDING_PUBLISHER_APPROVAL
  LIVE
  COMPLETED
  REJECTED
}
```

**Step 4: Run booking submission test and verify GREEN**

Expected: PASS.

**Step 5: Write failing approve/reject authorization tests**

Prove that:

- a manager in the same organization can approve;
- a normal member cannot approve;
- a manager from another organization cannot inspect or approve;
- approval advances to the next required gate exactly once;
- rejection records actor, reason, and timestamp.

**Step 6: Run RED, implement routes/service, run GREEN**

Expose `GET /api/approvals` and `POST /api/approvals/:id/decision`; keep state transitions in `bookingSubmission.ts`, not route handlers.

**Step 7: Add the failing buyer UI test**

Managers see a compact Approval Queue in Campaigns; normal buyers see the booking's waiting state and approver status. Approve/reject interactions update without a full reload and announce the result.

**Step 8: Implement UI, run tests, and commit**

Run: `npx vitest run server/__tests__/approvalWorkflow.test.ts src/__tests__/ApprovalWorkflow.test.tsx`

Expected: PASS.

Commit: `feat(approvals): enforce manager booking review`

### Task 6: Enforce creative review before submission

**Files:**
- Create: `prisma/migrations/20260705150000_add_creative_review/migration.sql`
- Create: `server/services/creativeStorage.ts`
- Create: `server/routes/creative.ts`
- Create: `server/__tests__/creativeReview.test.ts`
- Create: `src/lib/creativeApi.ts`
- Create: `src/components/buyer/CreativeWorkspace.tsx`
- Create: `src/__tests__/CreativeReview.test.tsx`
- Modify: `prisma/schema.prisma`
- Modify: `server/services/bookingSubmission.ts`
- Modify: `server/app.ts`
- Modify: `src/pages/BuyerPage.tsx:474-508`
- Modify: `.env.example`

**Step 1: Write the failing enforcement test**

When `creativeReviewRequired` is true, a booking without an approved creative enters `AWAITING_CREATIVE` and cannot enter buyer or publisher approval.

**Step 2: Run RED**

Expected: FAIL because only slogan text exists.

**Step 3: Add creative domain and storage boundary**

Add `CreativeAsset` and `CreativeReview` with ownership, content type, size, checksum, version, status, reviewer, reason, and timestamps. Use a narrow storage interface:

```ts
interface CreativeStorage {
  createUpload(input: UploadRequest): Promise<{ uploadUrl: string; objectKey: string }>;
  createDownloadUrl(objectKey: string): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
```

Provide a local development adapter and require a configured S3-compatible adapter in production.

**Step 4: Run enforcement test and verify GREEN**

Expected: PASS.

**Step 5: Add failing upload/review/state-transition tests**

Cover allowed MIME types, size limit, checksum, buyer ownership, reviewer authorization, rejection reason, version replacement, and one-time advancement after approval.

**Step 6: Implement the endpoints and service behavior**

Expose upload-intent, upload-complete, list, and review endpoints. Do not proxy large creative binaries through Express.

**Step 7: Add failing UI tests, then implement the Creative workspace**

Replace static readiness copy with upload progress, asset versions, review state, rejection guidance, and accessible status announcements. Keep advanced metadata progressively disclosed.

**Step 8: Run tests and commit**

Run: `npx vitest run server/__tests__/creativeReview.test.ts src/__tests__/CreativeReview.test.tsx`

Expected: PASS.

Commit: `feat(creative): gate bookings on creative approval`

### Task 7: Implement persisted notifications, availability watches, and invoice alerts

**Files:**
- Create: `prisma/migrations/20260705160000_add_notifications_invoices_and_watches/migration.sql`
- Create: `server/services/notificationService.ts`
- Create: `server/services/notificationDispatcher.ts`
- Create: `server/services/invoiceService.ts`
- Create: `server/routes/notifications.ts`
- Create: `server/routes/availabilityWatches.ts`
- Create: `server/routes/invoices.ts`
- Create: `server/__tests__/notificationPreferences.test.ts`
- Create: `server/__tests__/availabilityAlerts.test.ts`
- Create: `server/__tests__/invoiceAlerts.test.ts`
- Create: `src/lib/notificationsApi.ts`
- Create: `src/lib/invoicesApi.ts`
- Create: `src/components/buyer/AvailabilityWatchButton.tsx`
- Create: `src/components/buyer/InvoiceList.tsx`
- Modify: `prisma/schema.prisma`
- Modify: `server/services/bookingSubmission.ts`
- Modify: `server/routes/bookings.ts`
- Modify: `server/app.ts`
- Modify: `src/context/AppContext.tsx`
- Modify: `src/components/NotificationBell.tsx`
- Modify: `src/pages/BuyerPage.tsx`

**Step 1: Write the failing booking-alert preference test**

Changing a booking state creates an in-app notification only when `bookingStatusAlerts` is enabled. Assert through `GET /api/notifications`, not by querying the database directly.

**Step 2: Run RED, implement persisted notifications, run GREEN**

Add `Notification` and `NotificationOutbox`. Domain transactions write an outbox event; a dispatcher sends configured channels with idempotency keys and records attempts. Keep email/SMS providers behind injected boundaries.

**Step 3: Write the failing availability watch test**

A buyer with `availabilityAlerts` enabled can watch a board/interval. Releasing the conflicting booking creates one alert; disabled preferences or duplicate events create none.

**Step 4: Run RED, implement watches and trigger, run GREEN**

Add `AvailabilityWatch` with buyer, billboard, optional interval, status, and unique active-watch constraint. Add Watch/Unwatch actions to Marketplace and Locks.

**Step 5: Write the failing invoice alert test**

Publisher approval issues one invoice with server-authoritative money metadata. `invoiceAlerts` determines whether issue/payment/overdue events create notifications.

**Step 6: Run RED, implement invoice lifecycle, run GREEN**

Add `Invoice` and `InvoiceEvent`; remove the fake client-only receipt in `BookingDrawer.tsx`. Expose buyer-scoped invoice listing and details.

**Step 7: Replace local notifications in the UI**

`NotificationBell` loads, marks read, and clears through `/api/notifications`. Add invoice listing to the buyer workspace. Test unread counts, preference suppression, retries, empty states, and keyboard behavior.

**Step 8: Run tests and commit**

Run:

```bash
npx vitest run \
  server/__tests__/notificationPreferences.test.ts \
  server/__tests__/availabilityAlerts.test.ts \
  server/__tests__/invoiceAlerts.test.ts
```

Expected: PASS.

Commit: `feat(alerts): deliver buyer booking availability and invoice events`

### Task 8: Implement TOTP MFA and session alerts

**Files:**
- Create: `prisma/migrations/20260705170000_add_mfa_and_sessions/migration.sql`
- Create: `server/lib/secretEncryption.ts`
- Create: `server/services/mfaService.ts`
- Create: `server/services/sessionService.ts`
- Create: `server/routes/mfa.ts`
- Create: `server/__tests__/mfa.test.ts`
- Create: `server/__tests__/sessionAlerts.test.ts`
- Create: `src/lib/mfaApi.ts`
- Create: `src/components/buyer-settings/MfaSettings.tsx`
- Create: `src/components/auth/MfaChallenge.tsx`
- Create: `src/__tests__/MfaFlow.test.tsx`
- Modify: `prisma/schema.prisma`
- Modify: `server/routes/auth.ts`
- Modify: `server/app.ts`
- Modify: `server/middleware/rateLimiter.ts`
- Modify: `src/components/SignIn.tsx`
- Modify: `src/components/buyer-settings/BuyerSettingsForm.tsx`
- Modify: `package.json`
- Modify: `.env.example`

**Step 1: Write the failing enrollment test**

Authenticated buyer starts enrollment and receives an `otpauth://` URI plus manual key; MFA remains disabled until a valid TOTP confirms enrollment.

**Step 2: Run RED**

Expected: FAIL because no factor model or route exists.

**Step 3: Add encrypted MFA models and enrollment**

Add `MfaFactor`, hashed `MfaRecoveryCode`, and `AuthSession`. Encrypt the TOTP secret with an environment-provided 32-byte key and AES-256-GCM. Never log the URI, secret, TOTP, or recovery codes.

**Step 4: Run enrollment test and verify GREEN**

Expected: PASS.

**Step 5: Write failing challenge/security tests**

Cover:

- password success returns a short-lived MFA transaction, not an app bearer token;
- valid TOTP exchanges the transaction for a normal session;
- invalid/replayed codes are rejected and rate-limited;
- each recovery code works once;
- disabling MFA requires password plus TOTP/recovery proof;
- publisher/admin cannot mutate another user's factor.

**Step 6: Implement using otplib's async functional API**

Use `generateSecret`, `generateURI`, and `verify({ secret, token, epochTolerance, afterTimeStep })`. Store the last accepted time step to prevent replay.

**Step 7: Write failing session-alert tests**

Successful authentication records a hashed refresh/session identifier and normalized device context. A materially new user-agent/IP prefix creates a notification only when `sessionAlerts` is enabled; known-device logins do not spam.

**Step 8: Implement session alerts and the UI flows**

Replace the raw Settings toggle with “Set up MFA” / “Manage MFA”. Use an inline progressive panel rather than a generic modal; show QR plus manual key, verification input, recovery-code download/copy acknowledgement, disable confirmation, and accessible errors. Add the login challenge screen.

**Step 9: Run tests and commit**

Run:

```bash
npx vitest run server/__tests__/mfa.test.ts server/__tests__/sessionAlerts.test.ts src/__tests__/MfaFlow.test.tsx
npm run lint
```

Expected: PASS.

Commit: `feat(security): add buyer MFA and session alerts`

### Task 9: End-to-end verification, migration safety, and release documentation

**Files:**
- Create: `src/__tests__/BuyerSettingsJourney.test.tsx`
- Create: `docs/runbooks/buyer-settings.md`
- Modify: `README.md`
- Modify: `PRD.md`
- Modify: `prisma/seed.ts`
- Modify: `.env.example`

**Step 1: Add the failing end-to-end behavior test**

Cover one complete buyer journey through public interfaces:

1. Sign in.
2. Change flight length, currency, budget, alerts, approval, and creative requirements.
3. Cancel once and verify no persistence.
4. Save and reload.
5. Start a booking and observe defaults/conversion.
6. Exceed the cap and receive a server validation error.
7. Submit a valid booking through creative and manager gates.
8. Observe only enabled notifications.
9. Enroll MFA, sign out, and complete an MFA login.

**Step 2: Run RED, fix only missing integration seams, run GREEN**

Do not add new features during this step.

**Step 3: Verify migration/backfill behavior**

On a copy of production-shaped data:

- every buyer receives default settings;
- existing bookings gain a valid buyer/organization owner or are quarantined for manual repair;
- historical totals preserve their original value/currency;
- no MFA factor is auto-enabled;
- legacy local settings are ignored after one optional, validated import prompt.

**Step 4: Run the full quality gate**

Run:

```bash
npm run lint
npm test
npm run build
npx prisma validate
npx prisma migrate status
```

Expected: all commands pass.

**Step 5: Manual accessibility and responsive verification**

Verify at 390×844, 768×1024, and 1440×1000:

- keyboard-only edit/save/cancel;
- named switches and inputs;
- visible focus;
- status announcements;
- no critical function hidden on mobile;
- reduced-motion behavior;
- 200% zoom without horizontal loss;
- MFA recovery codes are readable but not exposed after acknowledgement.

**Step 6: Document operations**

Document exchange-rate provider configuration, outbox dispatcher operation, email/SMS/storage adapters, MFA encryption-key rotation, recovery procedure, invoice event replay, availability-watch cleanup, and alert-delivery monitoring.

**Step 7: Commit**

Commit: `docs(settings): add operations and release verification`

## Recommended delivery order

Ship as separate reviewable changes:

1. Auth/session connection and test seam.
2. Settings persistence and transactional UI.
3. Flight/currency/budget enforcement.
4. Organization approvals.
5. Creative review.
6. Notifications, watches, and invoices.
7. MFA and session alerts.
8. End-to-end hardening and documentation.

Do not expose a setting as “Enabled” until its corresponding domain slice is deployed. For work still behind later phases, show a factual “Not configured” state or keep the control absent.

