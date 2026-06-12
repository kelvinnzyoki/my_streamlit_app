'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { AuthAPI } from '@/lib/api';
import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const result = await AuthAPI.me();
      const currentUser = result?.user ?? result?.data?.user ?? result;
      setUser(currentUser || null);
    } catch {
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const result = await AuthAPI.login(email, password);
    const loggedInUser = result?.user ?? result?.data?.user ?? result;

    if (!loggedInUser) {
      throw new Error('Login failed');
    }

    setUser(loggedInUser);
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch {
      // Ignore logout API failure and clear local state anyway.
    }

    setUser(null);
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      setUser,
      login,
      logout,
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}
