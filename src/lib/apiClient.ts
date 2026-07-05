const TOKEN_KEY = 'vantage_access_token';

export const sessionStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStore.getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) sessionStore.clear();
    throw new ApiError(payload?.error || 'Request failed', response.status, payload?.details);
  }
  return payload as T;
}
