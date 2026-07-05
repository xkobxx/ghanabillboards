import { apiRequest } from './apiClient';

export const mfaApi = {
  enroll: () => apiRequest<{ secret: string; uri: string }>('/api/auth/mfa/enroll', {
    method: 'POST',
  }),
  confirm: (token: string) => apiRequest<{ enabled: true; recoveryCodes: string[] }>('/api/auth/mfa/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
  disable: (token: string) => apiRequest<void>('/api/auth/mfa', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  }),
};
