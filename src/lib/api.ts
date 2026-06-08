import type { User } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fit.cctamcc.site/api/v1';
let accessToken: string | null = null;

export const tokenManager = {
  get: () => accessToken,
  set: (token?: string | null) => { accessToken = token || null; },
  clear: () => { accessToken = null; if (typeof window !== 'undefined') localStorage.removeItem('user'); },
  getUser: (): User | null => { if (typeof window === 'undefined') return null; try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  setUser: (user: User) => { if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(user)); },
  hasSession: () => typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('ff_session=')),
};

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = tokenManager.get();
  if (token) (headers as Record<string,string>).Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include', cache: 'no-store', ...options, headers });
  if (res.status === 401 && retry && tokenManager.hasSession()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiRequest<T>(endpoint, options, false);
  }
  return handleResponse<T>(res);
}

export async function refreshAccessToken() {
  try { const data = await apiRequest<{accessToken?: string; user?: User}>('/auth/refresh', { method: 'POST' }, false); tokenManager.set(data.accessToken); if (data.user) tokenManager.setUser(data.user); return true; } catch { tokenManager.clear(); return false; }
}

export async function login(email: string, password: string) { const data = await apiRequest<{accessToken?: string; user: User}>('/auth/login', { method:'POST', body: JSON.stringify({email,password}) }); tokenManager.set(data.accessToken); tokenManager.setUser(data.user); return data; }
export async function register(payload: Record<string, unknown>) { const data = await apiRequest<{accessToken?: string; user: User}>('/auth/register', { method:'POST', body: JSON.stringify(payload) }); tokenManager.set(data.accessToken); tokenManager.setUser(data.user); return data; }
export async function logout() { try { await apiRequest('/auth/logout', { method:'POST' }); } finally { tokenManager.clear(); } }
export { API_BASE };
