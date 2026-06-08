'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types/user';
import { login as apiLogin, logout as apiLogout, refreshAccessToken, tokenManager } from '@/lib/api';

type AuthContextValue = { user: User | null; loading: boolean; login: (email:string,password:string)=>Promise<void>; logout:()=>Promise<void>; setUser:(u:User|null)=>void; };
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,setUser] = useState<User|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ setUser(tokenManager.getUser()); refreshAccessToken().finally(()=>{ setUser(tokenManager.getUser()); setLoading(false); }); },[]);
  const value = useMemo(()=>({ user, loading, setUser, login: async(email:string,password:string)=>{ const res=await apiLogin(email,password); setUser(res.user); }, logout: async()=>{ await apiLogout(); setUser(null); }}),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuthContext(){ const ctx=useContext(AuthContext); if(!ctx) throw new Error('useAuthContext must be used inside AuthProvider'); return ctx; }
