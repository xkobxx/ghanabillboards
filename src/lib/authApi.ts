import type { User } from '../types';
import { apiRequest, sessionStore } from './apiClient';

export interface AuthSession {
  token: string;
  user: User;
}

export interface MfaChallenge {
  mfaRequired: true;
  mfaToken: string;
}

export interface ProfileUpdate {
  name?: string;
  company?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
}

export const authApi = {
  async login(input: { email: string; password: string }) {
    const session = await apiRequest<AuthSession | MfaChallenge>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if ('token' in session) sessionStore.setToken(session.token);
    return session;
  },

  async register(input: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
    company?: string;
  }) {
    const session = await apiRequest<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    sessionStore.setToken(session.token);
    return session;
  },

  me: () => apiRequest<User>('/api/auth/me'),

  async completeMfa(input: { mfaToken: string; token: string }) {
    const session = await apiRequest<AuthSession>('/api/auth/login/mfa', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    sessionStore.setToken(session.token);
    return session;
  },

  updateProfile: (data: ProfileUpdate) =>
    apiRequest<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    apiRequest<void>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteAccount: (password: string) =>
    apiRequest<void>('/api/auth/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),

  sendVerificationEmail: () =>
    apiRequest<{ sent: boolean; token?: string }>('/api/auth/verify-email', {
      method: 'POST',
    }),

  confirmEmail: (token: string) =>
    apiRequest<User>('/api/auth/verify-email/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  logout() {
    sessionStore.clear();
  },
};
