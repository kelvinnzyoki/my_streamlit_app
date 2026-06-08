import { fallbackPrograms, fallbackWorkouts } from '@/lib/fallback';
import type { Program } from '@/types/program';
import type { User } from '@/types/user';
import type { Workout } from '@/types/workout';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fit.cctamcc.site/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token?: string | null) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearClientSession() {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('flowfit:user');
    sessionStorage.removeItem('flowfit:dashboard');
    sessionStorage.removeItem('flowfit:progress');
    sessionStorage.removeItem('flowfit:profile');
  }
}

type ApiEnvelope<T> = {
  status?: string;
  message?: string;
  accessToken?: string;
  token?: string;
  user?: User;
  data?: T & { user?: User; accessToken?: string; token?: string };
};

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload && (payload as ApiEnvelope<T>).data) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers,
  });

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiRequest<T>(endpoint, options, false);
  }

  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload.message || `Request failed: ${res.status}`);
  return unwrap<T>(payload);
}

export async function refreshAccessToken() {
  try {
    const data = await apiRequest<ApiEnvelope<User>>('/auth/refresh', { method: 'POST' }, false);
    const token = (data as ApiEnvelope<User>).accessToken || (data as ApiEnvelope<User>).token || (data as ApiEnvelope<User>).data?.accessToken || (data as ApiEnvelope<User>).data?.token;
    if (token) setAccessToken(token);
    return Boolean(token);
  } catch {
    return false;
  }
}

export async function login(email: string, password: string) {
  const payload = await apiRequest<ApiEnvelope<User>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);

  const token = payload.accessToken || payload.token || payload.data?.accessToken || payload.data?.token;
  const user = payload.user || payload.data?.user || (payload.data as unknown as User);
  if (token) setAccessToken(token);
  if (user && typeof window !== 'undefined') localStorage.setItem('flowfit:user', JSON.stringify(user));
  return user;
}

export async function register(payload: Record<string, unknown>) {
  const data = await apiRequest<ApiEnvelope<User>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  const token = data.accessToken || data.token || data.data?.accessToken || data.data?.token;
  const user = data.user || data.data?.user || (data.data as unknown as User);
  if (token) setAccessToken(token);
  if (user && typeof window !== 'undefined') localStorage.setItem('flowfit:user', JSON.stringify(user));
  return user;
}

export async function logout() {
  try { await apiRequest('/auth/logout', { method: 'POST' }, false); } finally { clearClientSession(); }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await apiRequest<User>('/auth/me');
    if (user && typeof window !== 'undefined') localStorage.setItem('flowfit:user', JSON.stringify(user));
    return user;
  } catch {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem('flowfit:user');
    return cached ? JSON.parse(cached) : null;
  }
}

async function withFallback<T>(endpoint: string, fallback: T, cacheKey?: string): Promise<T> {
  try {
    const data = await apiRequest<T>(endpoint);
    if (cacheKey && typeof window !== 'undefined') sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    if (cacheKey && typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as T;
    }
    return fallback;
  }
}

export function getWorkouts() {
  return withFallback<Workout[]>('/workouts', fallbackWorkouts, 'flowfit:workouts');
}

export function getWorkoutById(id: string) {
  return getWorkouts().then((items) => items.find((item) => item.id === id || item.slug === id) || null);
}

export function getPrograms() {
  return withFallback<Program[]>('/programs', fallbackPrograms, 'flowfit:programs');
}

export function getProgramById(id: string) {
  return getPrograms().then((items) => items.find((item) => item.id === id || item.slug === id) || null);
}

export function getDashboard() {
  return withFallback('/dashboard', {
    stats: { workouts: 0, calories: 0, streak: 0, minutes: 0 },
    nextWorkout: fallbackWorkouts[0],
    recent: [],
  }, 'flowfit:dashboard');
}

export function getProgress() {
  return withFallback('/progress', {
    summary: { workouts: 0, calories: 0, streak: 0, completion: 0 },
    weekly: [20, 35, 30, 50, 45, 60, 70],
  }, 'flowfit:progress');
}

export function getProfile() {
  return withFallback<User | null>('/profile', null, 'flowfit:profile');
}

export function getSubscription() {
  return withFallback('/subscription', {
    plan: 'Free',
    status: 'inactive',
    renewalDate: null,
    features: ['Basic workouts', 'Progress tracking', 'Limited AI coach'],
  }, 'flowfit:subscription');
}
