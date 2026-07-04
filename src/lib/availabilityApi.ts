export interface AvailabilitySlot {
  id: string;
  startAt: string;
  endAt: string;
  status: 'PendingApproved' | 'Live';
}

export interface AvailabilityResponse {
  billboardId: string;
  from: string;
  to: string;
  available: boolean;
  reason: 'maintenance' | 'booked' | null;
  bookedSlots: AvailabilitySlot[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function getBillboardAvailability(
  billboardId: string,
  from: Date,
  to: Date,
  signal?: AbortSignal,
): Promise<AvailabilityResponse> {
  const query = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const response = await fetch(
    `${API_BASE_URL}/api/billboards/${encodeURIComponent(billboardId)}/availability?${query}`,
    { signal },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load billboard availability');
  }
  return payload as AvailabilityResponse;
}
