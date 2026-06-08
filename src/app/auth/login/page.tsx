'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const f = new FormData(e.currentTarget);
    try { await login(String(f.get('email')), String(f.get('password'))); router.push('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  }
  return <main className="form-wrap"><div style={{ position:'fixed', top:20, right:20 }}><ThemeToggle/></div><form className="auth-card" onSubmit={submit}><p className="eyebrow">Welcome Back</p><h1>Login</h1>{error && <div className="alert">{error}</div>}<div className="field"><label>Email</label><input name="email" type="email" required autoComplete="email" /></div><div className="field"><label>Password</label><input name="password" type="password" required autoComplete="current-password" /></div><button className="primary-btn" style={{ width:'100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button><p className="muted">No account? <Link href="/auth/register">Create one</Link></p></form></main>;
}
