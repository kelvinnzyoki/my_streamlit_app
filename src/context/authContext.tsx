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
import type { User } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────
     Load current user on startup
  ─────────────────────────────── */
  const refreshUser = async () => {
    try {
      const me = await AuthAPI.me();

      if (me) {
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  /* ───────────────────────────────
     Login
  ─────────────────────────────── */
  const login = async (
    email: string,
    password: string,
  ) => {
    const result = await AuthAPI.login(
      email,
      password,
    );

    const loggedInUser =
      result?.user ??
      result?.data?.user ??
      result;

    if (!loggedInUser) {
      throw new Error('Login failed');
    }

    setUser(loggedInUser);
  };

  /* ───────────────────────────────
     Logout
  ─────────────────────────────── */
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch {
      // ignore server logout failures
    }

    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,

      setUser,

      login,
      logout,

      refreshUser,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return ctx;
}
