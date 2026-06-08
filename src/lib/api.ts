export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fit.cctamcc.site/api/v1';

export type ApiResponse<T = unknown> = {
  status?: string;
  message?: string;
  data?: T;
  user?: T;
  accessToken?: string;
};

function cleanEndpoint(endpoint: string) {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function safeMessage(error: unknown) {
  if (error instanceof Error) return error.message;
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
      ? await response.json()
      : null;

    if (!response.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        'Request failed. Please try again.';
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    throw new Error(safeMessage(error));
  }
}

function unwrapUser(payload: any) {
  return payload?.user || payload?.data?.user || payload?.data || null;
}

function unwrapAccessToken(payload: any) {
  return (
    payload?.accessToken ||
    payload?.data?.accessToken ||
    payload?.token ||
    null
  );
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
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

export const FlowFitAPI = {
  workouts() {
    return apiRequest<any>('/workouts');
  },

  workout(id: string) {
    return apiRequest<any>(`/workouts/${id}`);
  },

  programs() {
    return apiRequest<any>('/programs');
  },

  program(id: string) {
    return apiRequest<any>(`/programs/${id}`);
  },

  progress() {
    return apiRequest<any>('/progress');
  },

  profile() {
    return apiRequest<any>('/profile');
  },

  subscription() {
    return apiRequest<any>('/subscription');
  },
};
