import { apiRequest } from './apiClient';
import type { BillingCurrency } from '../types/buyerSettings';

export interface Invoice {
  id: string;
  code: string;
  currency: BillingCurrency;
  totalMinor: number;
  status: 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';
  issuedAt: string;
  dueAt: string;
  booking: { campaignName: string; billboardId: string };
}

export const invoicesApi = {
  list: () => apiRequest<Invoice[]>('/api/invoices'),
};
