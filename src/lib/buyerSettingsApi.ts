import type { BuyerSettings, BuyerSettingsUpdate } from '../types/buyerSettings';
import { apiRequest } from './apiClient';

export const buyerSettingsApi = {
  get: () => apiRequest<BuyerSettings>('/api/buyer/settings'),
  update: (input: BuyerSettingsUpdate) => apiRequest<BuyerSettings>('/api/buyer/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  }),
};
