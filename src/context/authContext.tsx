'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthAPI } from '@/lib/api';
import { getStoredUser, hasSession } from '@/lib/auth';
import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<{ step: string; raw: unknown }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      // Quick paint: show cached user immediately, verify in background
      const cached = getStoredUser();
      if (active && cached) setUser(cached);

      if (hasSession()) {
        try {
          const { user: fresh } = await AuthAPI.me();
          if (active) setUser(fresh);
        } catch {
          if (active) setUser(null);
        }
      } else if (!cached) {
        if (active) setUser(null);
      }

      if (active) setLoading(false);
    }
    bootstrap();
    return () => { active = false; };
  }, []);

  async function login(email: string, password: string) {
    const { user: u } = await AuthAPI.login(email, password);
    setUser(u);
  }

  async function register(payload: Record<string, unknown>) {
    const result = await AuthAPI.register(payload);
    if (result.user) setUser(result.user);
    return { step: result.step, raw: result.raw };
  }

  async function logout() {
    await AuthAPI.logout();
    setUser(null);
  }

  async function refresh() {
    try {
      const { user: u } = await AuthAPI.refresh();
      if (u) setUser(u);
    } catch {
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout, refresh, setUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
