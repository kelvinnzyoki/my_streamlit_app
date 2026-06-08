'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, refreshAccessToken } from '@/lib/api';
import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (payload: Record<string, unknown>) => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function boot() {
      await refreshAccessToken();
      const me = await getCurrentUser();
      if (active) {
        setUser(me);
        setLoading(false);
      }
    }
    boot().catch(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    async login(email, password) {
      const next = await apiLogin(email, password);
      setUser(next || null);
      return next || null;
    },
    async register(payload) {
      const next = await apiRegister(payload);
      setUser(next || null);
      return next || null;
    },
    async logout() {
      await apiLogout();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
