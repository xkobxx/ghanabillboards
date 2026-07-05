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

  logout() {
    sessionStore.clear();
  },
};
