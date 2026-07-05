import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buyerSettingsApi } from '../lib/buyerSettingsApi';
import { sessionStore } from '../lib/apiClient';

describe('buyerSettingsApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads the authenticated buyer settings', async () => {
    sessionStore.setToken('buyer-token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      billingCurrency: 'GHS',
      defaultFlightDays: 21,
      budgetCapMinor: 250000,
      approvalWorkflow: 'MANAGER',
      bookingStatusAlerts: true,
      availabilityAlerts: false,
      invoiceAlerts: true,
      sessionAlerts: true,
      creativeReviewRequired: true,
      mfaEnabled: false,
      version: 3,
    }), { status: 200, headers: { 'content-type': 'application/json' } }));

    const settings = await buyerSettingsApi.get();

    expect(settings.defaultFlightDays).toBe(21);
    expect(fetch).toHaveBeenCalledWith('/api/buyer/settings', expect.any(Object));
    const [, request] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer buyer-token');
  });

  it('saves a validated settings draft with its version', async () => {
    sessionStore.setToken('buyer-token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      billingCurrency: 'USD',
      defaultFlightDays: 30,
      budgetCapMinor: null,
      approvalWorkflow: 'DIRECT',
      bookingStatusAlerts: true,
      availabilityAlerts: true,
      invoiceAlerts: true,
      sessionAlerts: true,
      creativeReviewRequired: false,
      mfaEnabled: false,
      version: 2,
    }), { status: 200, headers: { 'content-type': 'application/json' } }));

    await buyerSettingsApi.update({
      defaultFlightDays: 30,
      version: 1,
    });

    expect(fetch).toHaveBeenCalledWith('/api/buyer/settings', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ defaultFlightDays: 30, version: 1 }),
    }));
  });
});
