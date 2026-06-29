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
    isEnrolled: Boolean(input?.isEnrolled || input?.enrolled || input?.activeEnrollment || input?.currentEnrollment || input?.enrollment),
    enrolled: Boolean(input?.isEnrolled || input?.enrolled || input?.activeEnrollment || input?.currentEnrollment || input?.enrollment),
    activeEnrollment: input?.activeEnrollment || input?.currentEnrollment || input?.enrollment || (Array.isArray(input?.enrollments) ? input.enrollments[0] : null),
    currentEnrollment: input?.currentEnrollment || input?.activeEnrollment || input?.enrollment || (Array.isArray(input?.enrollments) ? input.enrollments[0] : null),
    enrollmentProgress: Number(input?.enrollmentProgress ?? input?.progress ?? 0) || 0,
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

export type ProgramEnrollmentDTO = {
  id?: string;
  programId?: string;
  userId?: string;
  completedDays?: number;
  currentWeek?: number;
  currentDay?: number;
  progress?: number;
  isActive?: boolean;
  completedAt?: string | null;
  program?: any;
  completed_days?: number;
  current_week?: number;
  current_day?: number;
  is_active?: boolean;
  completed_at?: string | null;
};

function normalizeEnrollment(input: any, fallbackProgramId?: string): ProgramEnrollmentDTO | null {
  const raw = input?.data?.enrollment || input?.enrollment || input?.data || input;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const programId = raw.programId || raw.program_id || raw.program?.id || fallbackProgramId;
  const completedDays = Number(raw.completedDays ?? raw.completed_days ?? 0);
  const currentWeek = Number(raw.currentWeek ?? raw.current_week ?? 1);
  const currentDay = Number(raw.currentDay ?? raw.current_day ?? 1);
  const explicitProgress = raw.progress ?? raw.percent ?? raw.completion;

  return {
    ...raw,
    id: raw.id ? String(raw.id) : undefined,
    programId: programId ? String(programId) : undefined,
    userId: raw.userId || raw.user_id,
    completedDays: Number.isFinite(completedDays) ? completedDays : 0,
    currentWeek: Number.isFinite(currentWeek) ? currentWeek : 1,
    currentDay: Number.isFinite(currentDay) ? currentDay : 1,
    progress: explicitProgress !== undefined && Number.isFinite(Number(explicitProgress)) ? Number(explicitProgress) : undefined,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    completedAt: raw.completedAt ?? raw.completed_at ?? null,
    program: raw.program ? normalizeProgram(raw.program) : undefined,
  };
}

function enrollmentArray(payload: any): ProgramEnrollmentDTO[] {
  return asArray(payload, ['enrollments', 'programEnrollments', 'items', 'results', 'records'])
    .map((item) => normalizeEnrollment(item))
    .filter(Boolean) as ProgramEnrollmentDTO[];
}


function mergeProgramsWithEnrollments(programs: any[], enrollments: ProgramEnrollmentDTO[]) {
  const map = new Map<string, ProgramEnrollmentDTO>();

  for (const enrollment of enrollments || []) {
    const programId = String(enrollment?.programId || enrollment?.program?.id || '');
    if (programId && enrollment?.isActive !== false && !enrollment?.completedAt) {
      map.set(programId, enrollment);
    }
  }

  return (programs || []).map((program: any) => {
    const enrollment = map.get(String(program.id));
    if (!enrollment) return program;

    const totalDays = Number(program.totalDays || 0);
    const completedDays = Number(enrollment.completedDays || 0);
    const progress = totalDays > 0
      ? Math.max(0, Math.min(100, Math.round((completedDays / totalDays) * 100)))
      : Number(enrollment.progress || 0);

    return {
      ...program,
      isEnrolled: true,
      enrolled: true,
      activeEnrollment: enrollment,
      currentEnrollment: enrollment,
      enrollment,
      enrollmentProgress: Number.isFinite(progress) ? progress : 0,
    };
  });
}

export const ProgramsAPI = {
  async getPrograms(filters: Record<string, unknown> = {}) {
    const response = await apiRequest<any>(`/programs${toQueryString(filters)}`);
    let data = asArray(response, ['programs', 'items', 'results', 'records']).map(normalizeProgram);

    // Prefer server-provided enrollment fields. If the list endpoint does not
    // include them yet, fetch my-enrollments from the server and merge locally.
    if (!data.some((program: any) => program.isEnrolled || program.activeEnrollment || program.currentEnrollment)) {
      try {
        const enrollmentResponse = await apiRequest<any>('/programs/my-enrollments');
        data = mergeProgramsWithEnrollments(data, enrollmentArray(enrollmentResponse));
      } catch {
        // Do not fail the programs grid if enrollment status is temporarily unavailable.
      }
    }

    return { ...response, success: response?.success !== false, data };
  },

  async getProgramById(id: string) {
    const response = await apiRequest<any>(`/programs/${encodeURIComponent(id)}`);
    return { ...response, success: response?.success !== false, data: normalizeProgram(firstData(response)) };
  },

  async getUserPrograms() {
    const response = await apiRequest<any>('/programs/my-enrollments');
    return {
      ...response,
      success: response?.success !== false,
      data: enrollmentArray(response),
    };
  },

  async getEnrollmentForProgram(programId: string) {
    const response = await ProgramsAPI.getUserPrograms();
    const enrollments = enrollmentArray(response);
    return enrollments.find((item) =>
      String(item.programId || item.program?.id || '') === String(programId) &&
      item.isActive !== false &&
      !item.completedAt
    ) || null;
  },

  async enrollInProgram(programId: string) {
    try {
      const response = await apiRequest<any>(`/programs/${encodeURIComponent(programId)}/enroll`, { method: 'POST' });
      const enrollment = normalizeEnrollment(response, programId);
      return { ...response, success: response?.success !== false, data: enrollment, enrollment };
    } catch (error) {
      // Backend correctly returns 409 when the user is already enrolled. For the UI,
      // that is not a failure: we fetch the active enrollment and continue the flow.
      if (error instanceof ApiError && error.status === 409) {
        const enrollment = await ProgramsAPI.getEnrollmentForProgram(programId);
        if (enrollment) {
          return {
            success: true,
            alreadyEnrolled: true,
            message: 'You are already enrolled in this program.',
            data: enrollment,
            enrollment,
          };
        }
      }
      throw error;
    }
  },

  async restartProgram(programId: string) {
    try {
      const response = await apiRequest<any>(`/programs/${encodeURIComponent(programId)}/restart`, { method: 'POST' });
      const enrollment = normalizeEnrollment(response, programId);
      return { ...response, success: response?.success !== false, data: enrollment, enrollment };
    } catch (error) {
      // Some older backends do not expose /restart separately. Fall back to enroll.
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        return ProgramsAPI.enrollInProgram(programId);
      }
      throw error;
    }
  },

  async cancelEnrollment(enrollmentId: string) {
    return apiRequest<any>(`/programs/enrollments/${encodeURIComponent(enrollmentId)}`, { method: 'DELETE' });
  },

  async updateProgress(enrollmentId: string, data: any) {
    const response = await apiRequest<any>(`/programs/enrollments/${encodeURIComponent(enrollmentId)}/progress`, {
      method: 'PUT',
      body: JSON.stringify({
        completedDays: data.completedDays ?? data.completed_days,
        currentWeek: data.currentWeek ?? data.current_week,
        currentDay: data.currentDay ?? data.current_day,
      }),
    });
    const enrollment = normalizeEnrollment(response);
    return { ...response, success: response?.success !== false, data: enrollment, enrollment };
  },

  async getAiProgram() {
    return apiRequest<any>('/ai/saved-program');
  },

  async saveAiProgram(payload: any) {
    return apiRequest<any>('/ai/save-program', {
      method: 'POST',
      body: JSON.stringify(payload),
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

export const generateWorkoutPlan = (body: any) => apiRequest<any>('/ai/generate-workout', {
  method: 'POST',
  body: JSON.stringify({
    goal: body?.goal || body?.fitnessGoal || 'general_fitness',
    fitnessLevel: body?.fitnessLevel || body?.level || 'beginner',
    equipment: Array.isArray(body?.equipment) ? body.equipment : ['bodyweight'],
    sessionDuration: Number(body?.sessionDuration || body?.minutes || 30),
    trainingDaysPerWeek: Number(body?.trainingDaysPerWeek || body?.daysPerWeek || 3),
    limitations: body?.limitations || body?.injuries || undefined,
  }),
});

export const saveAiProgram = (payload: any) => apiRequest<any>('/ai/save-program', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const getSavedAiProgram = () => apiRequest<any>('/ai/saved-program');

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
        programId: workoutData.programId || workoutData.program || undefined,
        enrollmentId: workoutData.enrollmentId || workoutData.enrollment || undefined,
        dayIndex: workoutData.dayIndex !== undefined ? Number(workoutData.dayIndex) : undefined,
        exerciseIndex: workoutData.exerciseIndex !== undefined ? Number(workoutData.exerciseIndex) : (workoutData.exIndex !== undefined ? Number(workoutData.exIndex) : undefined),
        dayExerciseCount: workoutData.dayExerciseCount !== undefined ? Number(workoutData.dayExerciseCount) : undefined,
        currentWeek: workoutData.currentWeek !== undefined ? Number(workoutData.currentWeek) : undefined,
        currentDay: workoutData.currentDay !== undefined ? Number(workoutData.currentDay) : undefined,
        nextWeek: workoutData.nextWeek !== undefined ? Number(workoutData.nextWeek) : undefined,
        nextDay: workoutData.nextDay !== undefined ? Number(workoutData.nextDay) : undefined,
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

export type FlowFitNotification = {
  id: string;
  type?: string;
  title: string;
  body: string;
  icon?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt?: string;
};

function normalizeNotificationsPayload(payload: any): {
  notifications: FlowFitNotification[];
  unreadCount: number;
} {
  const source = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  const notifications = asArray(source, ['notifications', 'items', 'data']).map((item: any) => ({
    id: String(item.id),
    type: item.type,
    title: String(item.title || 'Notification'),
    body: String(item.body || item.message || ''),
    icon: item.icon ?? '🔔',
    link: item.link ?? null,
    readAt: item.readAt ?? item.read_at ?? null,
    createdAt: item.createdAt ?? item.created_at,
  }));

  const unreadCount = Number(
    source?.unreadCount ??
    source?.unread_count ??
    source?.count ??
    notifications.filter((item) => !item.readAt).length ??
    0,
  );

  return {
    notifications,
    unreadCount: Number.isFinite(unreadCount) ? unreadCount : 0,
  };
}

export const NotificationsAPI = {
  async getAll(limit = 20, unreadOnly = false) {
    const query = toQueryString({ limit, unread: unreadOnly ? 'true' : undefined });
    const res = await apiRequest<any>(`/notifications${query}`);
    return normalizeNotificationsPayload(res);
  },

  async getUnreadCount() {
    const res = await apiRequest<any>('/notifications/unread');
    const source = res?.data && typeof res.data === 'object' ? res.data : res;
    const count = Number(source?.count ?? source?.unreadCount ?? source?.unread_count ?? 0);
    return { count: Number.isFinite(count) ? count : 0 };
  },

  async markRead(id: string) {
    if (!id) return { success: false };
    return apiRequest<any>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
  },

  async markAllRead() {
    return apiRequest<any>('/notifications/read-all', { method: 'PUT' });
  },

  async delete(id: string) {
    if (!id) return { success: false };
    return apiRequest<any>(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const getNotifications = async (limit = 20, unreadOnly = false) =>
  (await NotificationsAPI.getAll(limit, unreadOnly)).notifications;

export const getUnreadNotificationCount = async () =>
  (await NotificationsAPI.getUnreadCount()).count;

export const markNotificationRead = NotificationsAPI.markRead;

export const askCoach = (message: string, context?: any) => apiRequest<any>('/ai/coach', {
  method: 'POST',
  body: JSON.stringify({ message, ...(context || {}) }),
});

export const getCoachHistory = () =>
  apiRequest<any>('/ai/coach/history').catch(() => ({ success: true, data: [] }));

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


/* ─────────────────────────────────────────────────────────────
   Admin + Feedback frontend API
   - /admin is protected server-side by authenticate + requireAdmin.
   - Feedback is authenticated user feedback.
   - Admin summary is normalised here so existing Admin UI cards do not show 0
     when the backend returns nested { data: { totals, recent } } shapes.
───────────────────────────────────────────────────────────── */

export type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'praise';
export type FeedbackStatus = 'NEW' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

type AdminListParams = { page?: number; limit?: number; q?: string; status?: string };

function adminUnwrap(payload: any) {
  return payload?.data && typeof payload.data === 'object' ? payload.data : payload || {};
}

function adminNumber(value: unknown): number {
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function adminFirstNumber(...values: unknown[]): number {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const parsed = adminNumber(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function adminFirstArray<T = any>(...values: unknown[]): T[] {
  for (const value of values) {
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

export function normalizeAdminSummary(payload: any) {
  const data = adminUnwrap(payload);
  const totals = data?.totals || data?.summary || data?.stats || {};
  const recent = data?.recent || {};
  const subscriptions = data?.subscriptions || {};

  const normalised = {
    ...data,
    totals,
    recent,
    subscriptions,

    totalUsers: adminFirstNumber(data.totalUsers, totals.totalUsers, totals.users, data.usersTotal),
    newUsersToday: adminFirstNumber(data.newUsersToday, totals.newUsersToday, totals.usersToday),
    verifiedUsers: adminFirstNumber(data.verifiedUsers, totals.verifiedUsers, totals.emailVerifiedUsers),

    totalWorkoutLogs: adminFirstNumber(data.totalWorkoutLogs, totals.totalWorkoutLogs, totals.workoutLogs, totals.workouts),
    workoutsToday: adminFirstNumber(data.workoutsToday, totals.workoutsToday, totals.workoutLogsToday),

    totalPrograms: adminFirstNumber(data.totalPrograms, totals.totalPrograms, totals.programs),
    activePrograms: adminFirstNumber(data.activePrograms, totals.activePrograms),

    totalEnrollments: adminFirstNumber(data.totalEnrollments, totals.totalEnrollments, totals.enrollments),
    activeEnrollments: adminFirstNumber(data.activeEnrollments, totals.activeEnrollments),

    feedbackNew: adminFirstNumber(data.feedbackNew, totals.feedbackNew, totals.newFeedback),
    feedbackTotal: adminFirstNumber(data.feedbackTotal, totals.feedbackTotal, totals.feedback),

    successfulRevenueCents: adminFirstNumber(
      data.successfulRevenueCents,
      totals.successfulRevenueCents,
      totals.revenueCents,
      totals.successRevenueCents,
      data.successfulPayments?._sum?.amountCents,
      totals.successfulPayments?._sum?.amountCents,
    ),
    totalRevenueCents: adminFirstNumber(
      data.totalRevenueCents,
      totals.totalRevenueCents,
      totals.grossPaymentVolumeCents,
      totals.revenueGrossCents,
      data.totalPayments?._sum?.amountCents,
      totals.totalPayments?._sum?.amountCents,
    ),

    recentFeedback: adminFirstArray(data.recentFeedback, recent.feedback, data.feedback),
    recentUsers: adminFirstArray(data.recentUsers, recent.users),
    recentWorkouts: adminFirstArray(data.recentWorkouts, recent.workouts),
    recentSubscriptions: adminFirstArray(data.recentSubscriptions, recent.subscriptions),
  };

  return normalised;
}

export const FeedbackAPI = {
  create(body: { type?: FeedbackType; message: string; pageUrl?: string | null }) {
    return apiRequest<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        type: body.type || 'suggestion',
        message: body.message,
        pageUrl: body.pageUrl || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      }),
    });
  },
};

export const submitFeedback = FeedbackAPI.create;

export const AdminAPI = {
  async getSummary() {
    const payload = await apiRequest<any>('/admin/summary');
    return normalizeAdminSummary(payload);
  },

  // Backward-compatible names for admin pages that use older function names.
  async getOverview() {
    return this.getSummary();
  },

  async getDashboardSummary() {
    return this.getSummary();
  },

  getUsers(params: AdminListParams = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
      q: params.q || undefined,
    });
    return apiRequest<any>(`/admin/users${query}`);
  },

  getSubscriptions(params: AdminListParams = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status || undefined,
    });
    return apiRequest<any>(`/admin/subscriptions${query}`);
  },

  getWorkouts(params: AdminListParams = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
      q: params.q || undefined,
    });
    return apiRequest<any>(`/admin/workouts${query}`);
  },

  getPrograms(params: AdminListParams = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
      q: params.q || undefined,
    });
    return apiRequest<any>(`/admin/programs${query}`);
  },

  getEnrollments(params: AdminListParams = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
    });
    return apiRequest<any>(`/admin/program-enrollments${query}`);
  },

  getFeedback(params: { page?: number; limit?: number; status?: FeedbackStatus | 'ALL' } = {}) {
    const query = toQueryString({
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status && params.status !== 'ALL' ? params.status : undefined,
    });
    return apiRequest<any>(`/admin/feedback${query}`);
  },

  updateFeedbackStatus(id: string, status: FeedbackStatus) {
    return apiRequest<any>(`/admin/feedback/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getActivity() {
    return apiRequest<any>('/admin/activity');
  },

  getUserActivity(userId: string, params: { limit?: number } = {}) {
    const query = toQueryString({ limit: params.limit || 80 });
    return apiRequest<any>(`/admin/users/${encodeURIComponent(userId)}/activity${query}`);
  },
};
