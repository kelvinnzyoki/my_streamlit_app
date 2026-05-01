'use client';
// src/app/auth/login/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/authContext';
import type { AuthResponse } from '@/types/user';

const inputStyle: React.CSSProperties = { width: '100%', padding: '1rem 1.25rem', background: 'rgba(12,11,18,0.8)', border: '1px solid var(--b1)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 300, letterSpacing: '.02em', outline: 'none', transition: 'border-color .3s ease, box-shadow .3s ease', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '.5rem', color: 'var(--t4)', fontSize: '.78rem', fontWeight: 300, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' };

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      login(res.accessToken, res.user);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', padding: '2rem' }}>
      <div className="blob blob-1" aria-hidden="true"/>
      <div className="blob blob-2" aria-hidden="true"/>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 2 }}>
        <Link href="/" style={{ display: 'block', marginBottom: '2rem', fontFamily: 'var(--f-display)', fontSize: '.8rem', color: 'var(--t2)', textDecoration: 'none', letterSpacing: '.06em' }}>← Back to Home</Link>
        <div style={{ background: 'var(--g-card)', border: '1px solid var(--b2)', borderRadius: 20, padding: '3rem 2.5rem', boxShadow: '0 30px 80px var(--overlay-60)' }}>
          <Link href="/" style={{ display: 'block', fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '2rem', background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlowFit</Link>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.5rem', letterSpacing: '.02em' }}>Welcome Back</h1>
          <p style={{ color: 'var(--t2)', fontSize: '.88rem', marginBottom: '2rem' }}>Login to continue your fitness journey</p>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--Au-40)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--Au-10)'; }} onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--b1)'; (e.target as HTMLInputElement).style.boxShadow = ''; }}/>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--Au-40)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--Au-10)'; }} onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--b1)'; (e.target as HTMLInputElement).style.boxShadow = ''; }} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
              <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '1.1rem' }}>{showPwd ? '🙈' : '👁'}</button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--Au)', cursor: 'pointer', fontFamily: 'var(--f-display)', fontSize: '.8rem' }}>Forgot password?</button>
          </div>
          {error && <div style={{ background: 'var(--red-10)', border: '1px solid var(--red-30)', borderRadius: 8, padding: '.75rem 1rem', color: 'var(--red)', fontSize: '.85rem', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? 'var(--Au-30)' : 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.85rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .3s ease', boxShadow: '0 6px 20px var(--Au-30)' }}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--t2)', fontSize: '.85rem', fontFamily: 'var(--f-display)' }}>
            Don&apos;t have an account?{' '}<Link href="/auth/register" style={{ color: 'var(--Au)', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
                     }
