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

/* ─────────────────────────────────────────────────────────────
   Ported from old api.js:
   - Access token is in memory only.
   - Refresh/auth cookies are sent with credentials:'include'.
   - ff_session cookie triggers silent refresh after reload.
   - Concurrent refreshes are deduplicated.
───────────────────────────────────────────────────────────── */

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
  return (
    payload?.accessToken ||
    payload?.token ||
    payload?.data?.accessToken ||
    payload?.data?.token
  );
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
      if (token) {
        TokenManager.setTokens(token);
        return true;
      }
      return false;
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

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (typeof payload.data === 'object') {
      for (const key of keys) {
        if (Array.isArray(payload.data[key])) return payload.data[key];
      }
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

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function compactExerciseSlug(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function parseMetadata(input: any): any {
  const value = input?.metadata;
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

function fallbackWorkoutImage(name = '') {
  const slug = compactExerciseSlug(name);
  const known = [
    'boxjumps','burpees','buttkicks','childpose','crunches','downwarddog','glutebridges',
    'highknees','hipflexor','jumpingjacks','jumpsquats','legraises','lunges','mountainclimbers',
    'pikepushups','plank','pushups','russiantwists','sprints','squats','tricepdips','pushups',
  ];
  const match = known.find((k) => slug.includes(k));
  return match ? `${match}.webp` : 'fit.webp';
}

function normalizeExerciseName(name = '') {
  const raw = String(name || '').trim();
  const lower = raw.toLowerCase();
  if (lower === 'push-ups' || lower === 'push ups') return 'Pushups';
  if (lower === 'glute bridges') return 'Glute Bridges';
  if (lower === 'tricep dips') return 'Tricep Dips';
  if (lower === 'leg raises') return 'Leg Raises';
  if (lower === 'mountain climbers') return 'Mountain Climbers';
  if (lower === 'russian twists') return 'Russian Twists';
  if (lower === 'jumping jacks') return 'Jumping Jacks';
  return raw || 'Program Exercise';
}

function programTemplateExercises(category?: string, difficulty?: string) {
  const cat = String(category || '').toLowerCase();
  const level = String(difficulty || '').toLowerCase();

  if (cat.includes('strength')) {
    return [
      { name: 'Pushups', sets: level.includes('advanced') ? 5 : 4, reps: level.includes('beginner') ? '8-12' : '10-15', restSeconds: 75, notes: 'Upper-body strength' },
      { name: 'Squats', sets: level.includes('advanced') ? 5 : 4, reps: level.includes('beginner') ? '10-12' : '12-18', restSeconds: 75, notes: 'Lower-body strength' },
      { name: 'Lunges', sets: 3, reps: '10 each side', restSeconds: 60, notes: 'Single-leg control' },
      { name: 'Plank', sets: 3, reps: '30-60s', restSeconds: 45, notes: 'Core stability' },
    ];
  }

  if (cat.includes('hiit') || cat.includes('conditioning')) {
    return [
      { name: 'Jumping Jacks', sets: 4, reps: '30-45s', restSeconds: 30, notes: 'Warm-up and cardio' },
      { name: 'Burpees', sets: level.includes('beginner') ? 3 : 4, reps: level.includes('advanced') ? '12-18' : '8-12', restSeconds: 45, notes: 'Full-body conditioning' },
      { name: 'Mountain Climbers', sets: 4, reps: '30-45s', restSeconds: 30, notes: 'Core/cardio drive' },
      { name: 'High Knees', sets: 4, reps: '30-45s', restSeconds: 30, notes: 'Speed and endurance' },
    ];
  }

  if (cat.includes('core')) {
    return [
      { name: 'Plank', sets: 4, reps: '30-60s', restSeconds: 45, notes: 'Anti-extension core strength' },
      { name: 'Crunches', sets: 4, reps: '12-20', restSeconds: 45, notes: 'Controlled spinal flexion' },
      { name: 'Russian Twists', sets: 3, reps: '16-24 total', restSeconds: 45, notes: 'Rotational control' },
      { name: 'Leg Raises', sets: 3, reps: '10-15', restSeconds: 45, notes: 'Lower-ab focus' },
    ];
  }

  if (cat.includes('mobility')) {
    return [
      { name: 'Child Pose', sets: 2, reps: '45-60s', restSeconds: 20, notes: 'Breathing and spinal decompression' },
      { name: 'Downward Dog', sets: 3, reps: '30-45s', restSeconds: 20, notes: 'Posterior chain mobility' },
      { name: 'Hip Flexor Stretch', sets: 2, reps: '45s each side', restSeconds: 20, notes: 'Hip opening' },
      { name: 'Glute Bridges', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Low-impact posterior chain activation' },
    ];
  }

  return [
    { name: 'Pushups', sets: 3, reps: '8-15', restSeconds: 60, notes: 'Strength block' },
    { name: 'Squats', sets: 3, reps: '12-20', restSeconds: 60, notes: 'Lower-body block' },
    { name: 'Mountain Climbers', sets: 3, reps: '30-45s', restSeconds: 45, notes: 'Conditioning block' },
    { name: 'Plank', sets: 3, reps: '30-60s', restSeconds: 45, notes: 'Core finisher' },
  ];
}

function exerciseItemFromPlanExercise(ex: any, index: number) {
  const name = normalizeExerciseName(ex?.name || ex?.exerciseName || `Exercise ${index + 1}`);
  const id = ex?.exerciseId || ex?.id || slugify(name);

  return {
    id: `${id}-${index + 1}`,
    exerciseId: String(id),
    exerciseName: name,
    sets: Number(ex?.sets || 3),
    reps: String(ex?.reps || '10-15'),
    restSeconds: Number(ex?.restSeconds || ex?.rest || 60),
    notes: ex?.notes || '',
    orderIndex: index,
    exercise: {
      id: String(id),
      slug: slugify(name),
      name,
      category: ex?.category || 'Program',
      description: ex?.description || ex?.notes || 'Program exercise from your FlowFit plan.',
      caloriesPerMin: Number(ex?.caloriesPerMin || 7),
      image: fallbackWorkoutImage(name),
    },
  };
}

function buildSyntheticWeeks(input: any, metadata: any) {
  const existingWeeks = Array.isArray(input?.weeks) ? input.weeks : [];
  if (existingWeeks.length) return existingWeeks;

  const aiPlan = metadata?.aiPlan || metadata?.plan || {};
  const aiExercises = Array.isArray(aiPlan?.exercises) ? aiPlan.exercises : [];
  const baseExercises = aiExercises.length
    ? aiExercises
    : programTemplateExercises(input?.category || metadata?.category, input?.difficulty || metadata?.level);

  const durationWeeks = Math.max(1, Number(input?.durationWeeks ?? input?.duration_weeks ?? aiPlan?.durationWeeks ?? metadata?.durationWeeks ?? 1));
  const daysPerWeek = Math.max(1, Number(input?.daysPerWeek ?? input?.days_per_week ?? aiPlan?.daysPerWeek ?? metadata?.daysPerWeek ?? 1));

  return Array.from({ length: durationWeeks }).map((_, weekIndex) => ({
    id: `${input?.id || 'program'}-week-${weekIndex + 1}`,
    weekNumber: weekIndex + 1,
    name: `Week ${weekIndex + 1}`,
    description: weekIndex === 0 ? (aiPlan?.weeklyRecommendations || 'Start controlled and focus on clean form.') : 'Progress gradually while maintaining good form.',
    days: Array.from({ length: daysPerWeek }).map((__, dayIndex) => ({
      id: `${input?.id || 'program'}-week-${weekIndex + 1}-day-${dayIndex + 1}`,
      dayNumber: dayIndex + 1,
      name: daysPerWeek === 1 ? 'Workout Day' : `Day ${dayIndex + 1}`,
      isRestDay: false,
      exercises: baseExercises.map((ex: any, exerciseIndex: number) => exerciseItemFromPlanExercise(ex, exerciseIndex)),
    })),
  }));
}

export function normalizeWorkout(input: any): Workout {
  const name = input?.name || input?.title || input?.exerciseName || 'Untitled Exercise';
  const caloriesPerMin = Number(input?.caloriesPerMin ?? input?.calories_per_min ?? 7);
  const duration = Number(input?.duration ?? input?.minutes ?? input?.estimatedDuration ?? 10);
  const calories = Number(input?.calories ?? input?.caloriesBurned ?? Math.max(1, Math.round(caloriesPerMin * duration)));

  return {
    id: String(input?.id || input?.slug || slugify(name)),
    slug: input?.slug || slugify(name),
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

export function normalizeProgram(input: any): Program & {
  weeks?: any[];
  days?: any[];
  raw?: any;
  totalWeeks?: number;
  totalDays?: number;
  totalExercises?: number;
} {
  const metadata = parseMetadata(input);
  const aiPlan = metadata?.aiPlan || metadata?.plan || {};
  const title = input?.title || input?.name || aiPlan?.workoutName || metadata?.title || 'Untitled Program';

  const weeks = buildSyntheticWeeks(input, metadata);

  const workoutIds: string[] = weeks.flatMap((week: any) =>
    (week.days || []).flatMap((day: any) =>
      (day.exercises || [])
        .map((ex: any) => String(ex?.exercise?.id || ex?.exerciseId || ex?.id || slugify(ex?.exerciseName || ex?.name || '')))
        .filter(Boolean),
    ),
  );

  const totalDays = weeks.reduce((sum: number, week: any) => sum + (Array.isArray(week.days) ? week.days.length : 0), 0);
  const totalExercises = weeks.reduce(
    (sum: number, week: any) =>
      sum + (week.days || []).reduce((dSum: number, day: any) => dSum + (Array.isArray(day.exercises) ? day.exercises.length : 0), 0),
    0,
  );

  const durationWeeks = Number(input?.durationWeeks ?? input?.duration_weeks ?? aiPlan?.durationWeeks ?? metadata?.durationWeeks ?? weeks.length ?? 1);
  const daysPerWeek = Number(input?.daysPerWeek ?? input?.days_per_week ?? aiPlan?.daysPerWeek ?? metadata?.daysPerWeek ?? (weeks[0]?.days?.length ?? 1));

  return {
    id: String(input?.id || input?.slug || slugify(title)),
    slug: input?.slug || input?.id || slugify(title),
    title,
    name: input?.name || title,
    description: input?.description || metadata?.description || aiPlan?.scienceNotes || 'Structured FlowFit program from your protected server.',
    level: input?.level || input?.difficulty || metadata?.level || aiPlan?.level || 'Beginner',
    difficulty: input?.difficulty || input?.level || metadata?.level || 'Beginner',
    focus: input?.focus || input?.category || metadata?.focus || aiPlan?.focus || 'General fitness',
    category: input?.category || metadata?.category || 'general_fitness',
    duration: input?.duration || `${durationWeeks} week${durationWeeks === 1 ? '' : 's'} · ${daysPerWeek} day${daysPerWeek === 1 ? '' : 's'}/week`,
    durationWeeks,
    daysPerWeek,
    image: input?.image || input?.imageUrl || metadata?.image || 'fit1.webp',
    workouts: workoutIds,
    weeks,
    days: input?.days,
    totalWeeks: weeks.length,
    totalDays,
    totalExercises,
    raw: input,
  } as Program & {
    weeks?: any[];
    days?: any[];
    raw?: any;
    totalWeeks?: number;
    totalDays?: number;
    totalExercises?: number;
  };
}

async function serverFirstArray<T>(path: string, fallback: T[], keys: string[], normalizer: (item: any) => T): Promise<T[]> {
  try {
    const response = await apiRequest<any>(path);
    const items = asArray(response, keys).map(normalizer);
    return items.length ? items : fallback;
  } catch (error) {
    console.warn(`[FlowFit] Server unavailable for ${path}. Using frontend fallback.`, error);
    return fallback;
  }
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
    try {
      await apiRequest('/auth/logout', { method: 'POST' }, false);
    } catch {}
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

/* ───────────────────── Workouts ───────────────────── */

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

/* ───────────────────── Programs ───────────────────── */

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
}).catch(() => apiRequest<any>('/programs', { method: 'POST', body: JSON.stringify({ ...body, type: 'ai_generated' }) }));

export const saveAiProgram = ProgramsAPI.saveAiProgram;

/* ───────────────────── Progress ───────────────────── */

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
    const [stats, streaks, history] = await Promise.all([
      ProgressAPI.getStats('30d').catch(() => null),
      ProgressAPI.getStreaks().catch(() => null),
      ProgressAPI.getWorkoutHistory(7).catch(() => null),
    ]);
    return {
      stats: firstData(stats)?.stats || firstData(stats) || {},
      streak: firstData(streaks),
      recentWorkouts: asArray(history, ['history', 'logs', 'workouts', 'items']),
    };
  } catch {
    return {};
  }
}

export async function getProgress(period = '7d') {
  try {
    const [stats, history] = await Promise.all([
      ProgressAPI.getStats(period).catch(() => null),
      ProgressAPI.getWorkoutHistory(period === '7d' ? 7 : period === '90d' ? 90 : 30).catch(() => null),
    ]);
    const statData = firstData(stats)?.stats || firstData(stats) || {};
    const logs = asArray(history, ['history', 'logs', 'workouts', 'items']);
    return {
      summary: {
        workouts: statData.totalWorkouts ?? statData.workouts ?? logs.length,
        calories: statData.totalCalories ?? statData.calories ?? 0,
        streak: statData.currentStreak ?? statData.streak ?? 0,
        minutes: statData.totalMinutes ?? statData.minutes ?? 0,
      },
      weekly: statData.weekly || statData.daily || Array.from({ length: 7 }, (_, i) => logs[i] ? 1 : 0),
      daily: statData.daily,
      calories: statData.caloriesByDay || statData.calories || [],
      bestWorkout: logs[0]?.exercise || logs[0] || null,
      raw: { stats, history },
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
  try { return asArray(await SubscriptionAPI.getPlans(), ['plans', 'items']).length ? asArray(await SubscriptionAPI.getPlans(), ['plans', 'items']) : []; }
  catch { return []; }
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
