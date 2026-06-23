'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthAPI } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import Footer from '@/components/footer';

type Step = 1 | 2 | 3;

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] || '' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'taken' | 'available'>('idle');
  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const strength = passwordStrength(password);

  /* ── Email availability debounce ── */
  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailStatus('idle'); return; }
    setEmailStatus('checking');
    if (emailTimer.current) clearTimeout(emailTimer.current);
    emailTimer.current = setTimeout(async () => {
      try {
        const { available } = await AuthAPI.checkEmail(email);
        setEmailStatus(available ? 'available' : 'taken');
      } catch { setEmailStatus('idle'); }
    }, 600);
    return () => { if (emailTimer.current) clearTimeout(emailTimer.current); };
  }, [email]);

  /* ── Step 1 submit ── */
  async function handleDetails(e: FormEvent) {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (strength.score < 2) { setError('Please choose a stronger password'); return; }
    if (!agreed) { setError('Please accept the Terms of Service'); return; }
    if (emailStatus === 'taken') { setError('That email is already registered'); return; }
    setLoading(true);
    try {
      const result = await AuthAPI.register({ name, email, password });
      if (result.step === 'done' && result.user) {
        setUser(result.user);
        router.push('/dashboard');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  }

  /* ── OTP input helpers ── */
  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  /* ── Step 2 OTP verify ── */
  async function handleVerify(e: FormEvent) {
    e.preventDefault(); setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const { user } = await AuthAPI.verifyEmail(email, code);
      if (user) setUser(user);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally { setLoading(false); }
  }

  /* ── Step indicator ── */
  const steps = ['Details', 'Verify', 'Done'];

  return (
    <main className="form-wrap">
      <div style={{ position: 'fixed', top: 20, right: 20 }}><ThemeToggle /></div>

      <div className="auth-card" style={{ width: 'min(500px,100%)' }}>
        <p className="eyebrow">Join FlowFit</p>
        <h1 style={{ marginBottom: '1.5rem' }}>Create Account</h1>

        {/* Step indicator */}
        <div className="step-indicator">
          {steps.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : undefined }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div className={`step-dot ${active ? 'active' : done ? 'done' : ''}`}>
                    {done ? <Check size={14} /> : num}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: active ? 'var(--Au)' : 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`step-line ${done ? 'done' : ''}`} style={{ margin: '0 0.5rem', marginBottom: '1.2rem' }} />
                )}
              </div>
            );
          })}
        </div>

        {error && <div className="alert">{error}</div>}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <form onSubmit={handleDetails}>
            <div className="field">
              <label>Full Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
            </div>

            <div className="field" style={{ position: 'relative' }}>
              <label>Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" placeholder="you@example.com"
                style={{ borderColor: emailStatus === 'taken' ? 'var(--red)' : emailStatus === 'available' ? 'var(--sage)' : undefined }}
              />
              {emailStatus === 'checking' && <span style={{ position: 'absolute', right: '0.9rem', bottom: '0.85rem', fontSize: '0.72rem', color: 'var(--t2)' }}>Checking…</span>}
              {emailStatus === 'available' && <span style={{ position: 'absolute', right: '0.9rem', bottom: '0.85rem', color: 'var(--sage)', fontSize: '0.75rem' }}>✓ Available</span>}
              {emailStatus === 'taken' && <span style={{ position: 'absolute', right: '0.9rem', bottom: '0.85rem', color: 'var(--red)', fontSize: '0.75rem' }}>Already registered</span>}
            </div>

            <div className="field-row">
              <label>Password</label>
              <input
                type={showPw ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" minLength={6} placeholder="Min 6 characters"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {password && (
                <>
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${strength.score}`} />
                  </div>
                  <span className="strength-label">{strength.label}</span>
                </>
              )}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                style={{ borderColor: confirm && confirm !== password ? 'var(--red)' : undefined }}
              />
              {confirm && confirm !== password && (
                <span style={{ fontSize: '0.72rem', color: 'var(--red)' }}>Passwords don't match</span>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '0.2rem', width: 'auto' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
                I agree to the{' '}
                <Link href="/legal/terms" style={{ color: 'var(--Au)' }}>Terms of Service</Link>
                {' & '}
                <Link href="/legal/privacy" style={{ color: 'var(--Au)' }}>Privacy Policy</Link>
              </span>
            </label>

            <button className="primary-btn" style={{ width: '100%' }} disabled={loading || emailStatus === 'taken'}>
              {loading ? 'Creating account…' : 'Continue'}
            </button>
            <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Already registered? <Link href="/auth/login" style={{ color: 'var(--Au)' }}>Login</Link>
            </p>
          </form>
        )}

        {/* ── STEP 2: Verify OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p className="muted" style={{ marginBottom: '0.5rem' }}>
              Enter the 6-digit code sent to <strong style={{ color: 'var(--t1)' }}>{email}</strong>
            </p>
            <div className="otp-group">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className="otp-box"
                  type="text" inputMode="numeric" maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                />
              ))}
            </div>
            <button className="primary-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
            <button
              type="button" className="secondary-btn"
              style={{ width: '100%', marginTop: '0.75rem' }}
              onClick={async () => {
                setOtp(['','','','','','']);
                setError('');
                try { await AuthAPI.register({ name, email, password }); }
                catch { /* silent */ }
              }}
            >
              Resend Code
            </button>
          </form>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'var(--sage-dim)',
              border: '2px solid var(--sage-30)', display: 'grid', placeItems: 'center',
              margin: '0 auto 1.25rem', color: 'var(--sage)',
            }}>
              <Check size={32} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Account Created!</h2>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              Welcome to FlowFit, {name}. Your journey starts now.
            </p>
            <button className="primary-btn" style={{ width: '100%' }} onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
