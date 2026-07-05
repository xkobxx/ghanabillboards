import { generate } from 'otplib';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:4010';

async function request(path, init = {}, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(payload)}`);
  return { status: response.status, payload };
}

const login = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'buyer@vantagepoint.com', password: 'password' }),
});
const accessToken = login.payload.token;

const initial = await request('/api/buyer/settings', {}, accessToken);
const saved = await request('/api/buyer/settings', {
  method: 'PATCH',
  body: JSON.stringify({
    version: initial.payload.version,
    billingCurrency: 'GHS',
    defaultFlightDays: 21,
    budgetCapMinor: 100_000_000,
    approvalWorkflow: 'MANAGER',
    bookingStatusAlerts: true,
    availabilityAlerts: true,
    invoiceAlerts: true,
    sessionAlerts: true,
    creativeReviewRequired: true,
  }),
}, accessToken);

const booking = await request('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({
    billboardId: 'acc-01',
    startDate: '2026-10-01',
    endDate: '2026-10-22',
    startAt: '2026-10-01T09:00:00.000Z',
    endAt: '2026-10-22T17:00:00.000Z',
    campaignName: 'Settings verification campaign',
    clientName: 'Vanguard Media Group',
    totalCost: 1,
    slogan: 'Verified operational settings',
  }),
}, accessToken);

if (booking.payload.totalCost === 1 || booking.payload.status !== 'AwaitingCreative') {
  throw new Error('Server did not enforce authoritative pricing and creative gate');
}

const creative = await request('/api/creative', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: booking.payload.id,
    fileName: 'verification-creative.png',
    contentType: 'image/png',
    sizeBytes: 1024,
    storageUrl: 'https://storage.example.test/verification-creative.png',
  }),
}, accessToken);
await request(`/api/creative/${creative.payload.id}/review`, {
  method: 'PATCH',
  body: JSON.stringify({ decision: 'APPROVED' }),
}, accessToken);
await request(`/api/approvals/${booking.payload.id}/decision`, {
  method: 'POST',
  body: JSON.stringify({ decision: 'APPROVE' }),
}, accessToken);
await request('/api/availability-watches/lag-01', { method: 'POST' }, accessToken);

const invoices = await request('/api/invoices', {}, accessToken);
const notifications = await request('/api/notifications', {}, accessToken);
if (!invoices.payload.some((invoice) => invoice.bookingId === booking.payload.id)) {
  throw new Error('Invoice was not issued');
}
if (notifications.payload.length < 2) {
  throw new Error('Expected booking and invoice notifications');
}

const enrollment = await request('/api/auth/mfa/enroll', { method: 'POST' }, accessToken);
const totp = await generate({ secret: enrollment.payload.secret });
const confirmation = await request('/api/auth/mfa/confirm', {
  method: 'POST',
  body: JSON.stringify({ token: totp }),
}, accessToken);

const challenged = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'buyer@vantagepoint.com', password: 'password' }),
});
if (!challenged.payload.mfaRequired) throw new Error('Login did not require MFA after enrollment');
await request('/api/auth/login/mfa', {
  method: 'POST',
  body: JSON.stringify({
    mfaToken: challenged.payload.mfaToken,
    token: confirmation.payload.recoveryCodes[0],
  }),
});

console.log(JSON.stringify({
  settingsVersion: saved.payload.version,
  bookingStatus: booking.payload.status,
  invoiceCount: invoices.payload.length,
  notificationCount: notifications.payload.length,
  mfaEnabled: true,
  verified: true,
}, null, 2));
