import { getStoredUser, storeUser, hasSession } from '@/lib/auth';
import type { User } from '@/types/user';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://fit.cctamcc.site/api/v1';

// ── In-memory token store (never in localStorage for security) ──────────────
let _accessToken: string | null = null;
let _refreshing: Promise<string | null> | null = null;

export const TokenManager = {
  get: () => _accessToken,
  set: (t: string | null) => { _accessToken = t; },
  clear: () => {
    _accessToken = null;
    storeUser(null);
  },
};

// ── Core request with silent 401→refresh→retry ───────────────────────────────
export async function apiRequest<T = unknown>(
  endpoint: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers,
  });

  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await res.json().catch(() => null)
    : null;

  if (res.status === 401 && retry && hasSession()) {
    const fresh = await silentRefresh();
    if (fresh) return apiRequest<T>(endpoint, init, false);
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const msg =
      payload?.message || payload?.error || payload?.data?.message || 'Request failed';
    throw new Error(msg);
  }

  return payload as T;
}

async function silentRefresh(): Promise<string | null> {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { TokenManager.clear(); return null; }
      const data = await res.json();
      const token = data?.accessToken || data?.data?.accessToken || null;
      const user: User | null = data?.user || data?.data?.user || null;
      TokenManager.set(token);
      if (user) storeUser(user);
      return token;
    } catch {
      TokenManager.clear();
      return null;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

// ── Safe wrappers used by pages ──────────────────────────────────────────────
async function safeGet<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const p = await apiRequest<any>(endpoint);
    const d = p?.data !== undefined ? p.data : p?.result !== undefined ? p.result : p;
    return (d ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function unwrapArray<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p;
  const obj = p as Record<string, unknown>;
  for (const key of ['data', 'items', 'workouts', 'programs', 'logs', 'result']) {
    if (Array.isArray(obj?.[key])) return obj[key] as T[];
  }
  return [];
}

async function safeList<T>(endpoint: string, fallback: T[]): Promise<T[]> {
  try {
    const p = await apiRequest<unknown>(endpoint);
    const arr = unwrapArray<T>(p);
    return arr.length ? arr : fallback;
  } catch {
    return fallback;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  async login(email: string, password: string) {
    const p = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = p?.accessToken || p?.data?.accessToken || p?.token || null;
    const user: User | null = p?.user || p?.data?.user || p?.data || null;
    TokenManager.set(token);
    storeUser(user);
    return { user, accessToken: token };
  },

  async register(data: Record<string, unknown>) {
    const p = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Registration may return { message, step:'verify' } (OTP flow) OR user directly
    const token = p?.accessToken || p?.data?.accessToken || null;
    const user: User | null = p?.user || p?.data?.user || null;
    if (token) TokenManager.set(token);
    if (user) storeUser(user);
    return { user, accessToken: token, step: p?.step || (user ? 'done' : 'verify'), raw: p };
  },

  async verifyEmail(email: string, otp: string) {
    const p = await apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    const token = p?.accessToken || p?.data?.accessToken || null;
    const user: User | null = p?.user || p?.data?.user || p?.data || null;
    if (token) TokenManager.set(token);
    if (user) storeUser(user);
    return { user, accessToken: token };
  },

  async checkEmail(email: string): Promise<{ available: boolean }> {
    return safeGet<{ available: boolean }>(
      `/auth/check-email?email=${encodeURIComponent(email)}`,
      { available: true },
    );
  },

  async forgotPassword(email: string) {
    return apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyResetOtp(email: string, otp: string) {
    return apiRequest<any>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async resetPassword(email: string, otp: string, password: string) {
    return apiRequest<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
  },

  async me() {
    const p = await apiRequest<any>('/auth/me');
    const user: User | null = p?.user || p?.data?.user || p?.data || null;
    const token = p?.accessToken || p?.data?.accessToken || null;
    if (token) TokenManager.set(token);
    if (user) storeUser(user);
    return { user };
  },

  async refresh() {
    const token = await silentRefresh();
    return { accessToken: token, user: getStoredUser() };
  },

  async logout() {
    try { await apiRequest('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    TokenManager.clear();
  },
};

// ── Data endpoints ───────────────────────────────────────────────────────────
import { fallbackWorkouts, fallbackPrograms } from '@/lib/fallback';
import type { Workout } from '@/types/workout';
import type { Program } from '@/types/program';

export async function getWorkouts(): Promise<Workout[]> {
  return safeList<Workout>('/workouts', fallbackWorkouts);
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  if (!id) return null;
  try {
    return await safeGet<Workout | null>(`/workouts/${encodeURIComponent(id)}`, null);
  } catch {
    return fallbackWorkouts.find((w) => w.slug === id || w.id === id) ?? null;
  }
}

export async function getPrograms(): Promise<Program[]> {
  return safeList<Program>('/programs', fallbackPrograms);
}

export async function getProgramById(id: string): Promise<Program | null> {
  if (!id) return null;
  try {
    return await safeGet<Program | null>(`/programs/${encodeURIComponent(id)}`, null);
  } catch {
    return fallbackPrograms.find((p) => p.slug === id || p.id === id) ?? null;
  }
}

export type DashboardStats = {
  totalWorkouts: number;
  completedWorkouts: number;
  totalCalories: number;
  streak: number;
  totalMinutes?: number;
  activeProgram?: string;
  weekly?: number[];
  stats?: Record<string, number>;
};

export async function getDashboard(): Promise<DashboardStats> {
  return safeGet<DashboardStats>('/dashboard', {
    totalWorkouts: 0, completedWorkouts: 0, totalCalories: 0,
    streak: 0, totalMinutes: 0, weekly: [],
  });
}

export async function getProgress(period = '7d'): Promise<any> {
  return safeGet<any>(`/progress?period=${period}`, { summary: {}, weekly: [] });
}

export async function getProfile(): Promise<any> {
  return safeGet<any>('/profile', null);
}

export async function updateProfile(data: Record<string, unknown>): Promise<any> {
  return apiRequest('/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getSubscription(): Promise<any> {
  return safeGet<any>('/subscription', null);
}

export async function getPlans(): Promise<any[]> {
  return safeList<any>('/subscription/plans', []);
}

export async function logWorkout(data: Record<string, unknown>): Promise<any> {
  return apiRequest('/workouts/log', { method: 'POST', body: JSON.stringify(data) });
}

export async function checkoutPlan(planId: string): Promise<{ authorizationUrl: string }> {
  return apiRequest(`/subscription/plans/${planId}/checkout`, { method: 'POST' });
}

export async function cancelSubscription(): Promise<any> {
  return apiRequest('/subscription/cancel', { method: 'POST' });
}
