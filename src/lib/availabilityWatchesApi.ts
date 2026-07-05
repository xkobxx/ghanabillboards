import { apiRequest } from './apiClient';

export const availabilityWatchesApi = {
  list: () => apiRequest<Array<{ id: string; billboardId: string }>>('/api/availability-watches'),
  watch: (billboardId: string) => apiRequest<{ id: string; billboardId: string }>(
    `/api/availability-watches/${encodeURIComponent(billboardId)}`,
    { method: 'POST' },
  ),
  unwatch: (billboardId: string) => apiRequest<void>(
    `/api/availability-watches/${encodeURIComponent(billboardId)}`,
    { method: 'DELETE' },
  ),
};
