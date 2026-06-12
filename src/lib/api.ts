import { programs as FALLBACK_PROGRAMS } from '@/data/programs';
import { workouts as FALLBACK_WORKOUTS } from '@/data/workouts';

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://fit.cctamcc.site/api/v1';

export const API_BASE = RAW_API_BASE.replace(/\/$/, '');

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  user?: T;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status = 0, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getStoredToken() {
  if (typeof window === 'undefined') return '';

  return (
    localStorage.getItem('flowfit_access_token') ||
    sessionStorage.getItem('flowfit_access_token') ||
    ''
  );
}

function setStoredToken(token?: string) {
  if (typeof window === 'undefined' || !token) return;

  localStorage.setItem('flowfit_access_token', token);
  sessionStorage.setItem('flowfit_access_token', token);
}

function clearStoredToken() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('flowfit_access_token');
  sessionStorage.removeItem('flowfit_access_token');
}

function extractToken(result: any) {
  return (
    result?.accessToken ||
    result?.token ||
    result?.data?.accessToken ||
    result?.data?.token
  );
}

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object') {
    const obj = payload as ApiEnvelope<T>;

    if ('data' in obj) return obj.data as T;
    if ('user' in obj) return obj.user as T;
  }

  return payload as T;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return false;

    const json = await res.json().catch(() => ({}));
    const token = extractToken(json);

    if (token) setStoredToken(token);

    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(
    `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`,
    {
      ...init,
      credentials: 'include',
      headers,
    },
  );

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequest<T>(path, init, false);
    }

    clearStoredToken();

    throw new ApiError(
      'Your session has expired. Please login again.',
      401,
    );
  }

  const contentType = res.headers.get('content-type') || '';

  const payload = contentType.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    const msg =
      typeof payload === 'object'
        ? (payload as any).message ||
          (payload as any).error ||
          `Request failed with ${res.status}`
        : `Request failed with ${res.status}`;

    throw new ApiError(msg, res.status, payload);
  }

  return unwrap<T>(payload as ApiEnvelope<T> | T);
}

async function serverFirst<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<T> {
  try {
    return await apiRequest<T>(path, init);
  } catch (error) {
    console.warn(
      `[FlowFit] Server unavailable for ${path}. Using frontend fallback.`,
      error,
    );

    return fallback;
  }
}

/* ───────────────────────────────
   Auth
─────────────────────────────── */

export const AuthAPI = {
  async register(body: {
    name: string;
    email: string;
    password: string;
  }) {
    const result = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const token = extractToken(result);
    if (token) setStoredToken(token);

    return result;
  },

  async login(body: {
    email: string;
    password: string;
  }) {
    const result = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const token = extractToken(result);
    if (token) setStoredToken(token);

    return result;
  },

  async logout() {
    try {
      await apiRequest(
        '/auth/logout',
        {
          method: 'POST',
        },
        false,
      );
    } finally {
      clearStoredToken();
    }
  },

  async me() {
    return apiRequest<any>('/users/me');
  },

  async refresh() {
    return refreshAccessToken();
  },

  async checkEmail(email: string) {
    return apiRequest<{ available: boolean }>(
      `/auth/check-email?email=${encodeURIComponent(email)}`,
    );
  },

  async verifyEmail(email: string, code: string) {
    const result = await apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
      }),
    });

    const token = extractToken(result);
    if (token) setStoredToken(token);

    return result;
  },

  async forgotPassword(email: string) {
    return apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    });
  },

  async verifyResetOtp(email: string, code: string) {
    return apiRequest<any>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
      }),
    });
  },

  async resetPassword(
    email: string,
    code: string,
    password: string,
  ) {
    return apiRequest<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
        password,
      }),
    });
  },

  clearStoredToken,
};

/* ───────────────────────────────
   Current user / profile
─────────────────────────────── */

export const getProfile = () =>
  apiRequest<any>('/users/me');

export const updateProfile = (body: any) =>
  apiRequest<any>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

/* ───────────────────────────────
   Dashboard / progress
─────────────────────────────── */

export const getDashboard = () =>
  apiRequest<any>('/progress/dashboard');

export const getProgress = (period = '7d') =>
  apiRequest<any>(
    `/progress?period=${encodeURIComponent(period)}`,
  );

export const getWorkoutHistory = (limit = 10) =>
  apiRequest<any>(`/progress/history?limit=${limit}`);

/* ───────────────────────────────
   Workouts
─────────────────────────────── */

export const getWorkouts = () =>
  serverFirst<any[]>('/workouts', FALLBACK_WORKOUTS as any[]);

export const getWorkoutById = async (id: string) => {
  try {
    return await apiRequest<any>(
      `/workouts/${encodeURIComponent(id)}`,
    );
  } catch {
    const local = (FALLBACK_WORKOUTS as any[]).find(
      (w) => w.id === id || w.slug === id,
    );

    return local || null;
  }
};

export const logWorkout = (body: any) =>
  apiRequest<any>('/workouts/log', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/* ───────────────────────────────
   Programs
─────────────────────────────── */

export const getPrograms = () =>
  serverFirst<any[]>('/programs', FALLBACK_PROGRAMS as any[]);

export const getProgramById = async (id: string) => {
  try {
    return await apiRequest<any>(
      `/programs/${encodeURIComponent(id)}`,
    );
  } catch {
    const local = (FALLBACK_PROGRAMS as any[]).find(
      (p) => p.id === id || p.slug === id,
    );

    return local || null;
  }
};

export const generateWorkoutPlan = (body: any) =>
  apiRequest<any>('/programs/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const saveAiProgram = (body: any) =>
  apiRequest<any>('/programs/ai', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/* ───────────────────────────────
   Subscriptions
─────────────────────────────── */

export const getSubscription = () =>
  apiRequest<any>('/subscriptions/current');

export const getPlans = () =>
  serverFirst<any[]>('/subscriptions/plans', []);

export const checkoutPlan = (
  planId: string,
  interval = 'monthly',
  provider = 'paystack',
) =>
  apiRequest<any>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({
      planId,
      interval,
      provider,
    }),
  });

export const cancelSubscription = () =>
  apiRequest<any>('/subscriptions/cancel', {
    method: 'POST',
  });

/* ───────────────────────────────
   AI Coach
─────────────────────────────── */

export const askCoach = (
  message: string,
  context?: any,
) =>
  apiRequest<any>('/ai/coach', {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...context,
    }),
  });

export const getCoachHistory = () =>
  serverFirst<any[]>('/ai/coach/history', []);

/* ───────────────────────────────
   Notifications
─────────────────────────────── */

export const getNotifications = () =>
  serverFirst<any[]>('/notifications', []);

export const markNotificationRead = (id: string) =>
  apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PUT',
  });
