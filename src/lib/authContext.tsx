'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthAPI } from '@/lib/api';
import { getStoredUser, storeUser } from '@/lib/auth';
import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractUser(data: any): User | null {
  return data?.user || data?.data?.user || data?.data || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await AuthAPI.login(email, password);
    const nextUser = extractUser(data);
    setUser(nextUser);
    storeUser(nextUser);
  }

  async function register(payload: Record<string, unknown>) {
    const data = await AuthAPI.register(payload);
    const nextUser = extractUser(data);
    setUser(nextUser);
    storeUser(nextUser);
  }

  async function logout() {
    try { await AuthAPI.logout(); } catch { /* ignore network logout failures */ }
    setUser(null);
    storeUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
}
