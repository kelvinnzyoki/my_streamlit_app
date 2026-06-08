'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refreshAccessToken,
} from '@/lib/api';

import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (payload: Record<string, unknown>) => Promise<void>;

  logout: () => Promise<void>;

  refresh: () => Promise<void>;

  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const result = await getCurrentUser();

        if (active) {
          setUser(result?.user ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const result = await apiLogin(email, password);

    setUser(result?.user ?? null);
  }

  async function register(
    payload: Record<string, unknown>
  ) {
    const result = await apiRegister(payload);

    setUser(result?.user ?? null);
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }

  async function refresh() {
    try {
      const result = await refreshAccessToken();

      if (result?.user) {
        setUser(result.user);
      }
    } catch {
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      login,
      register,
      logout,
      refresh,

      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
