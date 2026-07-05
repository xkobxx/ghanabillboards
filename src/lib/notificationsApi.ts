import { apiRequest } from './apiClient';

interface ServerNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () => apiRequest<ServerNotification[]>('/api/notifications'),
  markAllRead: () => apiRequest<void>('/api/notifications/read-all', { method: 'PATCH' }),
  clear: () => apiRequest<void>('/api/notifications', { method: 'DELETE' }),
};
