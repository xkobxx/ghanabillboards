import { apiRequest } from './apiClient';

export interface PaymentInitResult {
  authorization_url: string;
  reference: string;
}

export const paymentsApi = {
  initialize: (bookingId: string) =>
    apiRequest<PaymentInitResult>('/api/payments/initialize', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),
};
