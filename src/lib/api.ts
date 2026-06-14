import { programs as FALLBACK_PROGRAMS } from '@/data/programs';
import { workouts as FALLBACK_WORKOUTS } from '@/data/workouts';
import type { Program } from '@/types/program';
import type { Workout } from '@/types/workout';

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fit.cctamcc.site/api/v1';
export const API_BASE = RAW_API_BASE.replace(/\/$/, '');

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  user?: T;
  message?: string;
  error?: string;
  code?: string;
  meta?: unknown;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  code?: string;

  constructor(message: string, status = 0, payload?: unknown, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    this.code = code;
  }
}

/*
  FlowFit browser auth model, ported from the old HTML api.js:
  - access token stays in memory only;
  - backend httpOnly cookies are sent with credentials:'include';
  - ff_session cookie allows silent refresh after reload;
  - concurrent refreshes are deduplicated.
*/
const TokenManager = {
  _accessToken: null as string | null,

  getAccessToken() {
    return this._accessToken;
  },

  setTokens(accessToken?: string | null) {
    this._accessToken = accessToken || null;
  },

  clearTokens() {
    this._accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      try { sessionStorage.clear(); } catch {}
    }
  },

  hasSession() {
    if (typeof document === 'undefined') return false;
    try {
      return document.cookie.split(';').some((c) => c.trim().startsWith('ff_session='));
    } catch {
      return false;
    }
  },

  getUser<T = any>(): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user: unknown) {
    if (typeof window === 'undefined' || !user) return;
    try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
  },
};

export const FlowFitTokenManager = TokenManager;

function extractToken(payload: any): string | undefined {
  return payload?.accessToken || payload?.token || payload?.data?.accessToken || payload?.data?.token;
}

function extractUser(payload: any): any {
  return payload?.user || payload?.data?.user || payload?.data || payload;
}

function readJsonText(text: string) {
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

let refreshInFlight: Promise<boolean> | null = null;
let lastResetToken = '';

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) return false;
      const data = await response.json().catch(() => ({}));
      const token = extractToken(data);
      if (!token) return false;

      TokenManager.setTokens(token);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  const token = TokenManager.getAccessToken();

  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  const config: RequestInit = {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new ApiError('Network error. Check your connection.', 0);
  }

  if (response.status === 401 && retry) {
    let body: any = {};
    try { body = await response.clone().json(); } catch {}

    if (body?.code === 'TOKEN_EXPIRED' || TokenManager.hasSession()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiRequest<T>(endpoint, options, false);
    }

    TokenManager.clearTokens();
    throw new ApiError(
      body?.error || body?.message || 'Session expired. Please log in again.',
      401,
      body,
      body?.code,
    );
  }

  const text = await response.text();
  const payload = readJsonText(text);

  if (!response.ok) {
    throw new ApiError(
      payload?.error || payload?.message || `Request failed (${response.status})`,
      response.status,
      payload,
      payload?.code,
    );
  }

  return payload as T;
}

function asArray(payload: any, keys: string[] = []): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of keys) if (Array.isArray(payload[key])) return payload[key];

  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (typeof payload.data === 'object') {
      for (const key of keys) if (Array.isArray(payload.data[key])) return payload.data[key];
    }
  }

  return [];
}

function firstData(payload: any): any {
  return payload?.data ?? payload?.program ?? payload?.exercise ?? payload?.user ?? payload;
}

function toQueryString(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });
  const stringified = query.toString();
  return stringified ? `?${stringified}` : '';
}

function fallbackWorkoutImage(name = '') {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const known = [
    'boxjumps','burpees','buttkicks','childpose','crunches','downwarddog','glutebridges',
    'highknees','hipflexor','jumpingjacks','jumpsquats','legraises','lunges','mountainclimbers',
    'pikepushups','plank','pushups','russiantwists','sprints','squats','tricepdips',
  ];
  const match = known.find((k) => slug.includes(k));
  return match ? `${match}.webp` : 'fit.webp';
}

function minutesSeriesFromByDate(byDate: Record<string, number> | undefined, days: number) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return Number(byDate?.[key] || 0);
  });
}

export function normalizeWorkout(input: any): Workout {
  const name = input?.name || input?.title || input?.exerciseName || 'Untitled Exercise';
  const caloriesPerMin = Number(input?.caloriesPerMin ?? input?.calories_per_min ?? 7);
  const duration = Number(input?.duration ?? input?.minutes ?? input?.estimatedDuration ?? 10);
  const calories = Number(input?.calories ?? input?.caloriesBurned ?? Math.max(1, Math.round(caloriesPerMin * duration)));

  return {
    id: String(input?.id || input?.exerciseId || input?.slug || name.toLowerCase().replace(/\s+/g, '-')),
    slug: input?.slug || input?.id || input?.exerciseId,
    name,
    description: input?.description || input?.notes || 'Guided FlowFit bodyweight exercise from your protected server library.',
    image: input?.image || input?.imageUrl || input?.thumbnail || fallbackWorkoutImage(name),
    altImage: input?.altImage || input?.imageAlt,
    category: input?.category || 'General',
    level: input?.level || input?.difficulty || 'Beginner',
    difficulty: input?.difficulty || input?.level || 'Beginner',
    duration,
    calories,
    muscles: input?.muscles || input?.targetMuscles || [],
    instructions: input?.instructions || input?.steps || [],
    equipment: input?.equipment || 'Bodyweight',
  };
}

export function normalizeProgram(input: any): Program & { weeks?: any[]; days?: any[]; raw?: any } {
  const metadata = input?.metadata && typeof input.metadata === 'object' ? input.metadata : {};
  const title = input?.title || input?.name || metadata?.title || 'Untitled Program';
  const weeks = Array.isArray(input?.weeks) ? input.weeks : [];
  const workoutIds: string[] = Array.isArray(input?.workouts)
    ? input.workouts.map((w: any) => String(w?.id || w))
    : weeks.flatMap((week: any) => (week.days || []).flatMap((day: any) =>
        (day.exercises || []).map((ex: any) => String(ex?.exercise?.id || ex?.exerciseId || ex?.id)).filter(Boolean),
      ));

  const durationWeeks = Number(input?.durationWeeks ?? input?.duration_weeks ?? metadata?.durationWeeks ?? 1);
  const daysPerWeek = Number(input?.daysPerWeek ?? input?.days_per_week ?? metadata?.daysPerWeek ?? 1);
  const focus = input?.focus || input?.category || metadata?.focus || input?.type;

  return {
    id: String(input?.id || input?.slug || title.toLowerCase().replace(/\s+/g, '-')),
    slug: input?.slug || input?.id,
    title,
    description: input?.description || metadata?.description || 'Structured FlowFit program from your protected server.',
    level: input?.level || input?.difficulty || metadata?.level || 'Beginner',
    focus,
    duration: input?.duration || `${durationWeeks} week${durationWeeks === 1 ? '' : 's'} · ${daysPerWeek} day${daysPerWeek === 1 ? '' : 's'}/week`,
    image: input?.image || input?.imageUrl || metadata?.image || 'fit1.webp',
    workouts: workoutIds,
    weeks,
    days: input?.days,
    raw: input,
  };
}

let workoutsBasePath: '/workouts' | '/exercises' | null = null;
async function resolveWorkoutsPath() {
  if (workoutsBasePath) return workoutsBasePath;

  try {
    const response = await fetch(`${API_BASE}/workouts?limit=1`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(TokenManager.getAccessToken() ? { Authorization: `Bearer ${TokenManager.getAccessToken()}` } : {}),
      },
    });
    if (response.status !== 404) {
      workoutsBasePath = '/workouts';
      return workoutsBasePath;
    }
  } catch {}

  workoutsBasePath = '/exercises';
  return workoutsBasePath;
}

/* ───────────────────── Auth ───────────────────── */

export const AuthAPI = {
  async checkSession() {
    try {
      const response = await fetch(`${API_BASE}/auth/session`, { credentials: 'include', cache: 'no-store' });
      if (!response.ok) return false;
      const data = await response.json().catch(() => ({}));
      return data?.valid === true;
    } catch {
      return false;
    }
  },

  async register(body: { name: string; email: string; password: string }) {
    const result = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const token = extractToken(result);
    if (token) TokenManager.setTokens(token);
    const user = extractUser(result);
    if (user) TokenManager.setUser(user);
    return result;
  },

  async login(bodyOrEmail: { email: string; password: string } | string, maybePassword?: string) {
    const body = typeof bodyOrEmail === 'string'
      ? { email: bodyOrEmail, password: String(maybePassword || '') }
      : bodyOrEmail;

    const result = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const token = extractToken(result);
    if (token) TokenManager.setTokens(token);

    try {
      const me = await AuthAPI.getCurrentUser();
      const user = extractUser(me);
      if (user) TokenManager.setUser(user);
    } catch {
      const user = extractUser(result);
      if (user) TokenManager.setUser(user);
    }

    return result;
  },

  async logout() {
    TokenManager.clearTokens();
    try { await apiRequest('/auth/logout', { method: 'POST' }, false); } catch {}
  },

  async me() { return AuthAPI.getCurrentUser(); },
  async getCurrentUser() { return apiRequest<any>('/auth/me'); },
  async refresh() { return refreshAccessToken(); },

  async checkEmail(email: string) {
    return apiRequest<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
  },

  async verifyEmail(email: string, code: string) {
    const result = await apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose: 'registration' }),
    });
    const token = extractToken(result);
    if (token) TokenManager.setTokens(token);
    const user = extractUser(result);
    if (user) TokenManager.setUser(user);
    return result;
  },

  async forgotPassword(email: string) {
    return apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyResetOtp(email: string, code: string) {
    const result = await apiRequest<any>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: code, code }),
    });
    lastResetToken = String(result?.resetToken || result?.data?.resetToken || '');
    return result;
  },

  async resetPassword(email: string, codeOrResetToken: string, password: string) {
    const resetToken = lastResetToken || codeOrResetToken;
    const result = await apiRequest<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password, resetToken }),
    });
    lastResetToken = '';
    TokenManager.clearTokens();
    return result;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  clearStoredToken: TokenManager.clearTokens.bind(TokenManager),
};

/* ───────────────────── Workouts / Exercises ─────────────────────
   Backend route alignment:
   GET    /api/v1/workouts?category=&q=&limit=&page=
   GET    /api/v1/workouts/search?q=
   GET    /api/v1/workouts/:id
   Schema model: Exercise. The frontend normalizes Exercise => Workout.
───────────────────────────────────────────────────────────── */

export const WorkoutsAPI = {
  async getExercises(filters: Record<string, unknown> = {}) {
    const base = await resolveWorkoutsPath();
    const response = await apiRequest<any>(`${base}${toQueryString(filters)}`);
    const data = asArray(response, ['exercises', 'workouts', 'items', 'results']).map(normalizeWorkout);
    return { ...response, success: response?.success !== false, data };
  },

  async searchExercises(query: string) {
    const base = await resolveWorkoutsPath();
    const response = await apiRequest<any>(`${base}/search?q=${encodeURIComponent(query)}`);
    const data = asArray(response, ['exercises', 'workouts', 'items', 'results']).map(normalizeWorkout);
    return { ...response, success: response?.success !== false, data };
  },

  async getExerciseById(id: string) {
    const base = await resolveWorkoutsPath();
    const response = await apiRequest<any>(`${base}/${encodeURIComponent(id)}`);
    return { ...response, success: response?.success !== false, data: normalizeWorkout(firstData(response)) };
  },
};

export async function getWorkouts(filters: Record<string, unknown> = {}) {
  const fallback = (FALLBACK_WORKOUTS as any[]).map(normalizeWorkout);
  try {
    const res = await WorkoutsAPI.getExercises({ limit: 100, ...filters });
    return res.data.length ? res.data : fallback;
  } catch (error) {
    console.warn('[FlowFit] Workouts server failed. Using fallback.', error);
    return fallback;
  }
}

export async function getWorkoutById(id: string) {
  try {
    const res = await WorkoutsAPI.getExerciseById(id);
    return res.data;
  } catch {
    return (FALLBACK_WORKOUTS as any[]).map(normalizeWorkout).find((w) => w.id === id || w.slug === id) || null;
  }
}

/* ───────────────────── Programs ─────────────────────
   Backend route alignment:
   GET    /api/v1/programs?difficulty=&category=&type=&mine=&limit=&page=
   GET    /api/v1/programs/:id
   POST   /api/v1/programs
   PATCH  /api/v1/programs/:id
   POST   /api/v1/programs/:id/enroll
   GET    /api/v1/programs/my-enrollments
   PUT    /api/v1/programs/enrollments/:enrollmentId/progress
   DELETE /api/v1/programs/enrollments/:enrollmentId
───────────────────────────────────────────────────────────── */

export const ProgramsAPI = {
  async getPrograms(filters: Record<string, unknown> = {}) {
    const response = await apiRequest<any>(`/programs${toQueryString(filters)}`);
    const data = asArray(response, ['programs', 'items', 'results', 'records']).map(normalizeProgram);
    return { ...response, success: response?.success !== false, data };
  },

  async getProgramById(id: string) {
    const response = await apiRequest<any>(`/programs/${encodeURIComponent(id)}`);
    return { ...response, success: response?.success !== false, data: normalizeProgram(firstData(response)) };
  },

  async createProgram(payload: any) {
    return apiRequest<any>('/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProgram(programId: string, payload: any) {
    return apiRequest<any>(`/programs/${encodeURIComponent(programId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async enrollInProgram(programId: string) {
    return apiRequest<any>(`/programs/${encodeURIComponent(programId)}/enroll`, { method: 'POST' });
  },

  async restartProgram(programId: string) {
    return ProgramsAPI.enrollInProgram(programId);
  },

  async getUserPrograms() {
    const response = await apiRequest<any>('/programs/my-enrollments');
    return {
      ...response,
      success: response?.success !== false,
      data: asArray(response, ['enrollments', 'programEnrollments', 'items', 'results', 'records']),
    };
  },

  async cancelEnrollment(enrollmentId: string) {
    return apiRequest<any>(`/programs/enrollments/${encodeURIComponent(enrollmentId)}`, { method: 'DELETE' });
  },

  async updateProgress(enrollmentId: string, data: any) {
    return apiRequest<any>(`/programs/enrollments/${encodeURIComponent(enrollmentId)}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAiProgram() { return apiRequest<any>('/programs/ai-generated'); },

  async saveAiProgram(payload: any) {
    return apiRequest<any>('/programs', {
      method: 'POST',
      body: JSON.stringify({ ...payload, type: 'ai_generated' }),
    });
  },
};

export async function getPrograms(filters: Record<string, unknown> = {}) {
  const fallback = (FALLBACK_PROGRAMS as any[]).map(normalizeProgram);
  try {
    const res = await ProgramsAPI.getPrograms({ limit: 100, ...filters });
    return res.data.length ? res.data : fallback;
  } catch (error) {
    console.warn('[FlowFit] Programs server failed. Using fallback.', error);
    return fallback;
  }
}

export async function getProgramById(id: string) {
  try {
    const res = await ProgramsAPI.getProgramById(id);
    return res.data;
  } catch {
    return (FALLBACK_PROGRAMS as any[]).map(normalizeProgram).find((p) => p.id === id || p.slug === id) || null;
  }
}

export const generateWorkoutPlan = (body: any) => apiRequest<any>('/ai/generate-workout-plan', {
  method: 'POST',
  body: JSON.stringify(body),
}).catch(() => ProgramsAPI.saveAiProgram(body));

export const saveAiProgram = ProgramsAPI.saveAiProgram;

/* ───────────────────── Progress ─────────────────────
   Backend route alignment:
   POST /api/v1/progress body:
   { exerciseId, duration, sets?, reps?, caloriesBurned?, heartRate?, difficulty?, notes?, bodyWeight? }
───────────────────────────────────────────────────────────── */

export const ProgressAPI = {
  async logWorkout(workoutData: any) {
    const setsArray = Array.isArray(workoutData?.sets) ? workoutData.sets : [];
    const totalReps = setsArray.reduce((sum: number, set: any) => sum + (Number(set?.reps) || 0), 0);
    const completedSets = setsArray.filter((set: any) => set?.done || set?.reps).length;

    const exerciseId = workoutData.exerciseId || workoutData.workoutId || workoutData.workoutSlug || workoutData.id;

    return apiRequest<any>('/progress', {
      method: 'POST',
      body: JSON.stringify({
        exerciseId,
        exerciseName: workoutData.name,
        category: workoutData.category,
        duration: Math.max(1, parseInt(String(workoutData.duration || 1), 10)),
        sets: (workoutData.setsCount ?? workoutData.setsTotal ?? completedSets) || undefined,
        reps: (workoutData.reps ?? totalReps) || undefined,
        caloriesBurned: workoutData.caloriesBurned ?? workoutData.calories ?? undefined,
        heartRate: workoutData.heartRate || undefined,
        difficulty: workoutData.difficulty,
        notes: workoutData.notes,
        bodyWeight: workoutData.bodyWeight || undefined,
      }),
    });
  },

  getUserProgress: () => apiRequest<any>('/progress/me'),
  getStats: (period = '30d') => apiRequest<any>(`/progress/stats?period=${encodeURIComponent(period)}`),
  getWorkoutHistory: (limit = 20) => apiRequest<any>(`/progress/history?limit=${limit}`),
  getStreaks: () => apiRequest<any>('/progress/streaks'),
  getAchievements: () => apiRequest<any>('/progress/achievements'),
  recalculateAchievements: () => apiRequest<any>('/progress/achievements/recalculate', { method: 'POST' }),
};

export const logWorkout = ProgressAPI.logWorkout;

export async function getDashboard() {
  try {
    const [statsPayload, streakPayload, historyPayload] = await Promise.all([
      ProgressAPI.getStats('30d').catch(() => null),
      ProgressAPI.getStreaks().catch(() => null),
      ProgressAPI.getWorkoutHistory(7).catch(() => null),
    ]);

    const stats = firstData(statsPayload) || {};
    const streak = firstData(streakPayload) || {};
    const recentWorkouts = asArray(historyPayload, ['history', 'logs', 'workouts', 'items']).map((log) => ({
      ...log,
      workout: log.exercise || log.workout,
      exercise: log.exercise || log.workout,
    }));

    return {
      stats: {
        ...stats,
        streak: streak.currentStreak ?? streak.streak ?? 0,
        totalStreak: streak.currentStreak ?? streak.streak ?? 0,
        completedWorkouts: stats.totalWorkouts ?? stats.workouts ?? recentWorkouts.length,
        totalWorkouts: stats.totalWorkouts ?? stats.workouts ?? recentWorkouts.length,
        totalMinutes: stats.totalDuration ?? stats.totalMinutes ?? stats.minutes ?? 0,
        minutes: stats.totalDuration ?? stats.totalMinutes ?? stats.minutes ?? 0,
        totalCalories: stats.totalCalories ?? stats.calories ?? 0,
        calories: stats.totalCalories ?? stats.calories ?? 0,
      },
      streak,
      recentWorkouts,
      weekly: minutesSeriesFromByDate(stats.byDate, 7),
      raw: { statsPayload, streakPayload, historyPayload },
    };
  } catch {
    return {};
  }
}

export async function getProgress(period = '7d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  try {
    const [statsPayload, streakPayload, historyPayload] = await Promise.all([
      ProgressAPI.getStats(period).catch(() => null),
      ProgressAPI.getStreaks().catch(() => null),
      ProgressAPI.getWorkoutHistory(days).catch(() => null),
    ]);

    const stats = firstData(statsPayload) || {};
    const streak = firstData(streakPayload) || {};
    const logs = asArray(historyPayload, ['history', 'logs', 'workouts', 'items']);
    const weekly = Array.isArray(stats.weekly) ? stats.weekly : minutesSeriesFromByDate(stats.byDate, Math.min(days, 30));

    return {
      summary: {
        workouts: stats.totalWorkouts ?? stats.workouts ?? logs.length,
        calories: stats.totalCalories ?? stats.calories ?? 0,
        streak: streak.currentStreak ?? stats.currentStreak ?? stats.streak ?? 0,
        minutes: stats.totalDuration ?? stats.totalMinutes ?? stats.minutes ?? 0,
      },
      weekly,
      daily: weekly,
      calories: Array.isArray(stats.caloriesByDay) ? stats.caloriesByDay : [],
      bestWorkout: logs[0]?.exercise || logs[0]?.workout || logs[0] || null,
      raw: { statsPayload, streakPayload, historyPayload },
    };
  } catch {
    return { summary: {}, weekly: [], calories: [] };
  }
}

export const getWorkoutHistory = ProgressAPI.getWorkoutHistory;

/* ───────────────────── User / subscription / notifications / AI ───────────────────── */

export const UserAPI = {
  getProfile: () => apiRequest<any>('/users/me'),
  updateProfile: (profileData: any) => apiRequest<any>('/users/me', { method: 'PUT', body: JSON.stringify(profileData) }),
  updateMetrics: (metrics: any) => apiRequest<any>('/users/metrics', { method: 'POST', body: JSON.stringify(metrics) }),
  getMetricsHistory: (limit = 30) => apiRequest<any>(`/users/metrics/history?limit=${limit}`),
};

export const getProfile = UserAPI.getProfile;
export const updateProfile = UserAPI.updateProfile;

export const SubscriptionAPI = {
  async getPlans() {
    const res = await apiRequest<any>('/subscriptions/plans');
    return Array.isArray(res?.plans) ? { success: true, data: res.plans } : res;
  },

  async getCurrentSubscription() {
    const res = await apiRequest<any>('/subscriptions/current');
    if (res && 'subscription' in res) return { success: true, data: res.subscription, plan: res.plan || res.subscription?.plan || null };
    return res;
  },

  createCheckoutSession: (planId: string, interval = 'MONTHLY', callbackUrl?: string) => apiRequest<any>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ planId, interval, ...(callbackUrl ? { callbackUrl } : {}) }),
  }),

  createPaystackCheckout: (planId: string, interval = 'MONTHLY', callbackUrl?: string) => SubscriptionAPI.createCheckoutSession(planId, interval, callbackUrl),
  verifyPayment: (reference: string) => apiRequest<any>(`/subscriptions/paystack/verify/${encodeURIComponent(reference)}`),
  cancelSubscription: () => apiRequest<any>('/subscriptions/cancel', { method: 'POST' }),
};

export const getSubscription = async () => firstData(await SubscriptionAPI.getCurrentSubscription());
export const getPlans = async () => {
  try {
    const response = await SubscriptionAPI.getPlans();
    return asArray(response, ['plans', 'items']);
  } catch {
    return [];
  }
};
export const checkoutPlan = (planId: string, interval = 'MONTHLY') => SubscriptionAPI.createPaystackCheckout(planId, interval);
export const cancelSubscription = SubscriptionAPI.cancelSubscription;

export const NotificationsAPI = {
  getAll: (limit = 30) => apiRequest<any>(`/notifications?limit=${limit}`).catch(() => ({ notifications: [], unreadCount: 0 })),
  getUnreadCount: () => apiRequest<any>('/notifications/unread').catch(() => ({ count: 0 })),
  markRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiRequest<any>('/notifications/read-all', { method: 'PUT' }),
  delete: (id: string) => apiRequest<any>(`/notifications/${id}`, { method: 'DELETE' }),
};

export const getNotifications = async () => asArray(await NotificationsAPI.getAll(), ['notifications', 'items']);
export const markNotificationRead = NotificationsAPI.markRead;

export const askCoach = (message: string, context?: any) => apiRequest<any>('/ai/coach', {
  method: 'POST',
  body: JSON.stringify({ message, ...context }),
});
export const getCoachHistory = () => apiRequest<any>('/ai/coach/history').catch(() => []);

export function isAuthenticated() {
  return !!TokenManager.getAccessToken() || TokenManager.hasSession();
}

export async function requireAuth() {
  if (TokenManager.getAccessToken()) return true;
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    try {
      const me = await AuthAPI.getCurrentUser();
      const user = extractUser(me);
      if (user) TokenManager.setUser(user);
    } catch {}
    return true;
  }
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('redirectAfterLogin', window.location.pathname); } catch {}
    window.location.href = '/auth/login';
  }
  return false;
}
