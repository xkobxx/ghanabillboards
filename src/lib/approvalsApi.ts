import { apiRequest } from './apiClient';

export const approvalsApi = {
  decide: (bookingId: string, decision: 'APPROVE' | 'REJECT', reason?: string) =>
    apiRequest(`/api/approvals/${encodeURIComponent(bookingId)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason }),
    }),
};
