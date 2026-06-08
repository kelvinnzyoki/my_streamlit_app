export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fit.cctamcc.site/api/v1';

export type ApiResponse<T = unknown> = {
  status?: string;
  message?: string;
  data?: T;
  user?: T;
  accessToken?: string;
  token?: string;
  error?: string;
};

export type DashboardSummary = {
  totalWorkouts: number;
  completedWorkouts: number;
  totalCalories: number;
  streak: number;
  activeProgram?: string;
};

function cleanEndpoint(endpoint: string) {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function getMessage(payload: any, fallback = 'Request failed. Please try again.') {
  if (!payload) return fallback;
  return payload.message || payload.error || payload.data?.message || fallback;
}

function unwrapData<T = any>(payload: any, fallback: T): T {
  if (!payload) return fallback;
  if (Array.isArray(payload)) return payload as T;
  if (payload.data !== undefined) return payload.data as T;
  if (payload.result !== undefined) return payload.result as T;
  if (payload.items !== undefined) return payload.items as T;
  return payload as T;
}

function unwrapArray<T = any>(payload: any): T[] {
  const data = unwrapData<any>(payload, []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.workouts)) return data.workouts;
  if (Array.isArray(data?.programs)) return data.programs;
  if (Array.isArray(data?.logs)) return data.logs;
  return [];
}

function unwrapUser(payload: any) {
  return payload?.user || payload?.data?.user || payload?.data || null;
}

function unwrapAccessToken(payload: any) {
  return payload?.accessToken || payload?.data?.accessToken || payload?.token || null;
}

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${cleanEndpoint(endpoint)}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(getMessage(payload));
    }

    return payload as T;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

async function safeApi<T>(endpoint: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const payload = await apiRequest<any>(endpoint, options || {});
    return unwrapData<T>(payload, fallback);
  } catch {
    return fallback;
  }
}

async function safeArray<T>(endpoint: string, fallback: T[] = []): Promise<T[]> {
  try {
    const payload = await apiRequest<any>(endpoint);
    const items = unwrapArray<T>(payload);
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}

export const AuthAPI = {
  async login(email: string, password: string) {
    const payload = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      user: unwrapUser(payload),
      accessToken: unwrapAccessToken(payload),
      raw: payload,
    };
  },

  async register(data: Record<string, unknown>) {
    const payload = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      user: unwrapUser(payload),
      accessToken: unwrapAccessToken(payload),
      raw: payload,
    };
  },

  async me() {
    const payload = await apiRequest<any>('/auth/me');
    return {
      user: unwrapUser(payload),
      raw: payload,
    };
  },

  async refresh() {
    const payload = await apiRequest<any>('/auth/refresh', {
      method: 'POST',
    });

    return {
      user: unwrapUser(payload),
      accessToken: unwrapAccessToken(payload),
      raw: payload,
    };
  },

  async logout() {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

// Named exports below are intentionally kept for compatibility with the existing pages.
// They prevent Turbopack missing-export failures while still routing through the real backend.
export async function getWorkouts<T = any>(): Promise<T[]> {
  return safeArray<T>('/workouts', []);
}

export async function getWorkoutById<T = any>(id: string): Promise<T | null> {
  if (!id) return null;
  return safeApi<T | null>(`/workouts/${encodeURIComponent(id)}`, null);
}

export async function getPrograms<T = any>(): Promise<T[]> {
  return safeArray<T>('/programs', []);
}

export async function getProgramById<T = any>(id: string): Promise<T | null> {
  if (!id) return null;
  return safeApi<T | null>(`/programs/${encodeURIComponent(id)}`, null);
}

export async function getProgress<T = any>(): Promise<T> {
  return safeApi<T>('/progress', [] as T);
}

export async function getProfile<T = any>(): Promise<T> {
  return safeApi<T>('/profile', null as T);
}

export async function getSubscription<T = any>(): Promise<T> {
  return safeApi<T>('/subscription', null as T);
}

export async function getDashboard(): Promise<DashboardSummary> {
  return safeApi<DashboardSummary>('/dashboard', {
    totalWorkouts: 0,
    completedWorkouts: 0,
    totalCalories: 0,
    streak: 0,
  });
}

export async function login(email: string, password: string) {
  return AuthAPI.login(email, password);
}

export async function register(data: Record<string, unknown>) {
  return AuthAPI.register(data);
}

export async function logout() {
  return AuthAPI.logout();
}

export const FlowFitAPI = {
  workouts: getWorkouts,
  workout: getWorkoutById,
  programs: getPrograms,
  program: getProgramById,
  progress: getProgress,
  profile: getProfile,
  subscription: getSubscription,
  dashboard: getDashboard,
};




export async function getCurrentUser() {
  return AuthAPI.me();
}

export async function refreshAccessToken() {
  return AuthAPI.refresh();
}
