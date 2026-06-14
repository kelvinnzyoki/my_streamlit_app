import { programs as FALLBACK_PROGRAMS } from '@/data/programs';
import { workouts as FALLBACK_WORKOUTS } from '@/data/workouts';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fit.cctamcc.site/api/v1').replace(/\/$/, '');

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

function hasSessionCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('ff_session='));
}

function setAccessToken(token?: string | null) {
  accessToken = token || null;
}

function extractToken(payload: any) {
  return payload?.accessToken || payload?.token || payload?.data?.accessToken || payload?.data?.token || null;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) return false;
      const json = await res.json().catch(() => ({}));
      const token = extractToken(json);
      if (token) setAccessToken(token);
      return Boolean(token);
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function readResponse(res: Response) {
  const text = await res.text();
  let data: any = {};
  try {
    if (text) data = JSON.parse(text);
  } catch {
    data = text;
  }
  return data;
}

export async function apiRequest<T = any>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers || {});

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let res = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers,
  });

  if (res.status === 401 && retry) {
    const body = await res.clone().json().catch(() => ({}));
    if (body?.code === 'TOKEN_EXPIRED' || hasSessionCookie()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiRequest<T>(path, init, false);
    }
  }

  const data = await readResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  return data as T;
}

function arrayPayload(payload: any, keys: string[] = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  return [];
}

function objectPayload(payload: any, keys: string[] = []) {
  if (!payload) return null;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  for (const key of keys) {
    if (payload?.[key]) return payload[key];
    if (payload?.data?.[key]) return payload.data[key];
  }
  return payload;
}

function normaliseExercise(ex: any) {
  return {
    ...ex,
    id: ex?.id || ex?.exerciseId,
    slug: ex?.slug || ex?.id || ex?.exerciseId,
    name: ex?.name || ex?.exerciseName || 'Exercise',
    category: String(ex?.category || 'STRENGTH').toUpperCase(),
    description: ex?.description || ex?.notes || '',
    caloriesPerMin: Number(ex?.caloriesPerMin ?? ex?.calories_per_min ?? 0),
    calories: Math.round(Number(ex?.caloriesPerMin ?? 0) * 10),
    duration: Number(ex?.duration ?? 10),
    difficulty: ex?.difficulty || deriveDifficulty(ex?.caloriesPerMin),
    level: ex?.level || ex?.difficulty || deriveDifficulty(ex?.caloriesPerMin),
  };
}

function deriveDifficulty(caloriesPerMin: any) {
  const c = Number(caloriesPerMin || 0);
  if (c >= 12) return 'Advanced';
  if (c >= 8) return 'Intermediate';
  return 'Beginner';
}

function normaliseProgram(program: any) {
  const weeks = Array.isArray(program?.weeks)
    ? program.weeks.map((week: any) => ({
        ...week,
        title: week.title || week.name || `Week ${week.weekNumber || ''}`,
        name: week.name || week.title || `Week ${week.weekNumber || ''}`,
        days: Array.isArray(week.days)
          ? week.days.map((day: any) => ({
              ...day,
              title: day.title || day.name || `Day ${day.dayNumber || ''}`,
              name: day.name || day.title || `Day ${day.dayNumber || ''}`,
              exercises: Array.isArray(day.exercises)
                ? day.exercises.map((de: any) => {
                    const ex = de.exercise || de;
                    return {
                      ...de,
                      ...normaliseExercise(ex),
                      dayExerciseId: de.id,
                      exerciseId: de.exerciseId || ex.id,
                      sets: de.sets,
                      reps: de.reps,
                      restSeconds: de.restSeconds,
                    };
                  })
                : [],
            }))
          : [],
      }))
    : [];

  return {
    ...program,
    id: program?.id,
    title: program?.title || program?.name || 'Program',
    name: program?.name || program?.title || 'Program',
    level: program?.level || program?.difficulty || 'Intermediate',
    difficulty: program?.difficulty || program?.level || 'intermediate',
    focus: program?.focus || program?.category || 'general_fitness',
    category: program?.category || program?.focus || 'general_fitness',
    durationWeeks: Number(program?.durationWeeks ?? program?.duration_weeks ?? 1),
    daysPerWeek: Number(program?.daysPerWeek ?? program?.days_per_week ?? 1),
    weeks,
  };
}

async function serverFirst<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn('[FlowFit API] using fallback:', err);
    return fallback;
  }
}

export const AuthAPI = {
  async login(body: { email: string; password: string }) {
    const data = await apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    const token = extractToken(data);
    if (token) setAccessToken(token);
    return data;
  },
  async register(body: { name: string; email: string; password: string }) {
    const data = await apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    const token = extractToken(data);
    if (token) setAccessToken(token);
    return data;
  },
  async checkEmail(email: string) {
    const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
    return apiRequest<{ available: boolean }>(`/auth/check-email?email=${encodedEmail}`);
  },
  async verifyEmail(email: string, code: string) {
    const data = await apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
    });
    const token = extractToken(data);
    if (token) setAccessToken(token);
    return data;
  },
  clearStoredToken() {
    accessToken = null;
  },
  async me() {
    return apiRequest<any>('/auth/me').catch(() => apiRequest<any>('/users/me'));
  },
  async logout() {
    accessToken = null;
    return apiRequest<any>('/auth/logout', { method: 'POST' }, false).catch(() => null);
  },
  async refresh() {
    return refreshAccessToken();
  },
  async forgotPassword(email: string) {
    return apiRequest<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async verifyResetOtp(email: string, code: string) {
    return apiRequest<any>('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify({ email, code }) });
  },
  async resetPassword(email: string, code: string, password: string) {
    return apiRequest<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, password }) });
  },
};

export async function getWorkouts(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && String(val) !== '') query.set(key, String(val));
  });
  const qs = query.toString() ? `?${query.toString()}` : '';
  return serverFirst(async () => {
    const payload = await apiRequest<any>(`/workouts${qs}`);
    return arrayPayload(payload, ['workouts', 'exercises']).map(normaliseExercise);
  }, (FALLBACK_WORKOUTS as any[]).map(normaliseExercise));
}

export async function getWorkoutById(id: string) {
  return serverFirst(async () => {
    const payload = await apiRequest<any>(`/workouts/${encodeURIComponent(id)}`);
    const obj = objectPayload(payload, ['workout', 'exercise']);
    return obj ? normaliseExercise(obj) : null;
  }, ((FALLBACK_WORKOUTS as any[]).find((w) => w.id === id || w.slug === id) || null) as any);
}

export async function logWorkout(workoutData: any) {
  const setsArray = Array.isArray(workoutData.sets) ? workoutData.sets : [];
  const completedSets = setsArray.filter((s: any) => s.done !== false).length;
  const totalReps = setsArray.reduce((sum: number, s: any) => sum + (parseInt(String(s.reps || 0), 10) || 0), 0);

  const payload = {
    exerciseId: workoutData.exerciseId || workoutData.workoutId || workoutData.id,
    exerciseName: workoutData.name,
    category: workoutData.category,
    duration: Math.max(1, parseInt(String(workoutData.duration || 1), 10)),
    sets: (workoutData.setsCount ?? workoutData.setsTotal ?? completedSets) || undefined,
    reps: (workoutData.reps ?? totalReps) || undefined,
    caloriesBurned: workoutData.caloriesBurned ?? workoutData.calories ?? undefined,
    heartRate: workoutData.heartRate || undefined,
    difficulty: workoutData.difficulty,
    notes: workoutData.notes,
    completed: workoutData.completed ?? true,
  };

  return apiRequest<any>('/progress', { method: 'POST', body: JSON.stringify(payload) }).catch(() =>
    apiRequest<any>('/workouts/log', { method: 'POST', body: JSON.stringify(payload) }),
  );
}

export async function getPrograms() {
  return serverFirst(async () => {
    const payload = await apiRequest<any>('/programs');
    return arrayPayload(payload, ['programs']).map(normaliseProgram);
  }, (FALLBACK_PROGRAMS as any[]).map(normaliseProgram));
}

export async function getProgramById(id: string) {
  return serverFirst(async () => {
    const payload = await apiRequest<any>(`/programs/${encodeURIComponent(id)}`);
    const obj = objectPayload(payload, ['program']);
    return obj ? normaliseProgram(obj) : null;
  }, ((FALLBACK_PROGRAMS as any[]).find((p) => p.id === id || p.slug === id) || null) as any);
}

export async function enrollInProgram(programId: string) {
  return apiRequest<any>(`/programs/${encodeURIComponent(programId)}/enroll`, { method: 'POST' });
}

export async function restartProgram(programId: string) {
  return apiRequest<any>(`/programs/${encodeURIComponent(programId)}/restart`, { method: 'POST' });
}

export async function getUserPrograms() {
  const payload = await apiRequest<any>('/programs/enrollments/me');
  return arrayPayload(payload, ['enrollments']);
}

export async function getDashboard() {
  return apiRequest<any>('/progress/dashboard');
}

export async function getProgress(period = '7d') {
  return apiRequest<any>(`/progress?period=${encodeURIComponent(period)}`);
}

export const getProfile = () => apiRequest<any>('/users/me');
export const updateProfile = (body: any) => apiRequest<any>('/users/me', { method: 'PATCH', body: JSON.stringify(body) });
export const getSubscription = () => apiRequest<any>('/subscriptions/current');
export const getPlans = () => apiRequest<any>('/subscriptions/plans');
export const checkoutPlan = (planId: string, interval = 'MONTHLY') => apiRequest<any>('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ planId, interval }) });
export const cancelSubscription = () => apiRequest<any>('/subscriptions/cancel', { method: 'POST' });
export const askCoach = (message: string, context?: any) => apiRequest<any>('/ai/coach', { method: 'POST', body: JSON.stringify({ message, ...context }) });
export const generateWorkoutPlan = (body: any) => apiRequest<any>('/programs/generate', { method: 'POST', body: JSON.stringify(body) });
