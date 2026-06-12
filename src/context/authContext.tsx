'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthAPI } from '@/lib/api';

export type FlowFitUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  plan?: string;
  isEmailVerified?: boolean;
  [key: string]: unknown;
};

type AuthContextValue = {
  user: FlowFitUser | null;
  setUser: (user: FlowFitUser | null) => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<FlowFitUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<FlowFitUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: FlowFitUser | null) => {
    setUserState(next);
    if (typeof window === 'undefined') return;
    if (next) localStorage.setItem('flowfit_user', JSON.stringify(next));
    else localStorage.removeItem('flowfit_user');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await AuthAPI.me();
      const normalized = me?.user || me?.data || me;
      setUser(normalized || null);
      return normalized || null;
    } catch {
      setUser(null);
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('flowfit_user');
        if (cached) {
          try { setUserState(JSON.parse(cached)); } catch { localStorage.removeItem('flowfit_user'); }
        }
      }
      const me = await refreshUser();
      if (active) {
        if (!me) await AuthAPI.refresh().then(refreshUser).catch(() => null);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await AuthAPI.logout();
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
  }, [setUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    logout,
  }), [user, setUser, loading, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
