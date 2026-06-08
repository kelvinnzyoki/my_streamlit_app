'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const f = new FormData(e.currentTarget);
    try { await register({ name:String(f.get('name')), email:String(f.get('email')), password:String(f.get('password')) }); router.push('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); }
    finally { setLoading(false); }
  }
  return <main className="form-wrap"><div style={{ position:'fixed', top:20, right:20 }}><ThemeToggle/></div><form className="auth-card" onSubmit={submit}><p className="eyebrow">Join FlowFit</p><h1>Create Account</h1>{error && <div className="alert">{error}</div>}<div className="field"><label>Name</label><input name="name" required /></div><div className="field"><label>Email</label><input name="email" type="email" required /></div><div className="field"><label>Password</label><input name="password" type="password" required minLength={6} /></div><button className="primary-btn" style={{ width:'100%' }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button><p className="muted">Already registered? <Link href="/auth/login">Login</Link></p></form></main>;
}
