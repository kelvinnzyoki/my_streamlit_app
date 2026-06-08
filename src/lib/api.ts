const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type ApiOptions = RequestInit & { skipJson?: boolean };

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed with ${response.status}`);
  }

  return data as T;
}

export const AuthAPI = {
  login: (email: string, password: string) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload: Record<string, unknown>) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest<any>('/auth/me'),
  logout: () => apiRequest<any>('/auth/logout', { method: 'POST' })
};

export const NotificationAPI = {
  list: () => apiRequest<any>('/notifications?limit=30'),
  markAllRead: () => apiRequest<any>('/notifications/read-all', { method: 'PATCH' })
};
