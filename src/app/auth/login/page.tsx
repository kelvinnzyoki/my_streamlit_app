'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthAPI } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import Footer from '@/components/footer';

type View = 'login' | 'forgot' | 'otp' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [view, setView] = useState<View>('login');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Login ── */
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      await login(String(f.get('email')), String(f.get('password')));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  }

  /* ── Forgot password ── */
  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await AuthAPI.forgotPassword(email);
      setInfo(`OTP sent to ${email}`);
      setView('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP');
    } finally { setLoading(false); }
  }

  /* ── OTP input handling ── */
  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); setLoading(false); return; }
    try {
      await AuthAPI.verifyResetOtp(email, code);
      setView('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally { setLoading(false); }
  }

  /* ── Reset password ── */
  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const f = new FormData(e.currentTarget);
    const pw = String(f.get('password'));
    const confirm = String(f.get('confirm'));
    if (pw !== confirm) { setError('Passwords do not match'); setLoading(false); return; }
    try {
      await AuthAPI.resetPassword(email, otp.join(''), pw);
      setInfo('Password reset! Please log in.');
      setView('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally { setLoading(false); }
  }

  const resetState = () => { setError(''); setInfo(''); };

  return (
    <main className="form-wrap">
      <div style={{ position: 'fixed', top: 20, right: 20 }}><ThemeToggle /></div>

      {/* ── LOGIN ── */}
      {view === 'login' && (
        <form className="auth-card" onSubmit={handleLogin}>
          <p className="eyebrow">Welcome Back</p>
          <h1>Login</h1>
          {error && <div className="alert">{error}</div>}
          {info && <div className="success-alert">{info}</div>}

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" required autoComplete="email" />
          </div>

          <div className="field-row">
            <label>Password</label>
            <input name="password" type={showPw ? 'text' : 'password'} required autoComplete="current-password" />
            <button type="button" className="eye-btn" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button
            type="button"
            style={{ background: 'none', border: 0, color: 'var(--Au)', fontSize: '0.82rem', marginBottom: '1rem', cursor: 'pointer', padding: 0 }}
            onClick={() => { resetState(); setView('forgot'); }}
          >
            Forgot password?
          </button>

          <button className="primary-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            No account? <Link href="/auth/register" style={{ color: 'var(--Au)' }}>Create one</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link href="/" style={{ color: 'var(--t2)', fontSize: '0.82rem' }}>← Back to home</Link>
          </p>
        </form>
      )}

      {/* ── FORGOT PASSWORD ── */}
      {view === 'forgot' && (
        <form className="auth-card" onSubmit={handleForgot}>
          <p className="eyebrow">Reset Password</p>
          <h1>Forgot Password</h1>
          <p className="muted" style={{ marginBottom: '1.25rem' }}>Enter your email and we'll send you a reset code.</p>
          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <button className="primary-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
          <button
            type="button" className="secondary-btn"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => { resetState(); setView('login'); }}
          >
            ← Back to Login
          </button>
        </form>
      )}

      {/* ── OTP ── */}
      {view === 'otp' && (
        <form className="auth-card" onSubmit={handleVerifyOtp}>
          <p className="eyebrow">Verify Code</p>
          <h1>Enter OTP</h1>
          {info && <div className="success-alert">{info}</div>}
          {error && <div className="alert">{error}</div>}
          <p className="muted">Enter the 6-digit code sent to <strong>{email}</strong></p>

          <div className="otp-group">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
              />
            ))}
          </div>

          <button className="primary-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Code'}
          </button>
          <button
            type="button" className="secondary-btn"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => { resetState(); setView('forgot'); }}
          >
            Resend Code
          </button>
        </form>
      )}

      {/* ── RESET PASSWORD ── */}
      {view === 'reset' && (
        <form className="auth-card" onSubmit={handleReset}>
          <p className="eyebrow">New Password</p>
          <h1>Reset Password</h1>
          {error && <div className="alert">{error}</div>}

          <div className="field-row">
            <label>New Password</label>
            <input name="password" type={showPw ? 'text' : 'password'} required minLength={6} />
            <button type="button" className="eye-btn" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input name="confirm" type="password" required minLength={6} />
          </div>

          <button className="primary-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting…' : 'Set New Password'}
          </button>
        </form>
      )}
    </main>
  );
}
