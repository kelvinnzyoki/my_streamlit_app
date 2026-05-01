'use client';
// src/app/auth/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/authContext';
import type { AuthResponse } from '@/types/user';

const inputStyle: React.CSSProperties = { width: '100%', padding: '1rem 1.25rem', background: 'rgba(12,11,18,0.8)', border: '1px solid var(--b1)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 300, letterSpacing: '.02em', outline: 'none', transition: 'border-color .3s ease, box-shadow .3s ease', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '.5rem', color: 'var(--t4)', fontSize: '.78rem', fontWeight: 300, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' };

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Weak','Fair','Good','Strong'];
  const colors = ['var(--red)','var(--coral)','var(--Au)','var(--sage)'];
  return { score, label: labels[score - 1] || '', color: colors[score - 1] || 'var(--t3)' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const strength = passwordStrength(password);

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--Au-40)'; e.target.style.boxShadow = '0 0 0 3px var(--Au-10)'; };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--b1)'; e.target.style.boxShadow = ''; };

  const submitStep1 = async () => {
    setError('');
    if (!name || !email || !password || password !== confirm) { setError('Please fill all fields correctly.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const submitOtp = async () => {
    setError(''); setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/verify-email', { email, otp: otp.join('') });
      login(res.accessToken, res.user);
      setStep(3);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid code.'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', padding: '2rem' }}>
      <div className="blob blob-1" aria-hidden="true"/>
      <div className="blob blob-2" aria-hidden="true"/>
      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 2 }}>
        <Link href="/" style={{ display: 'block', marginBottom: '2rem', fontFamily: 'var(--f-display)', fontSize: '.8rem', color: 'var(--t2)', textDecoration: 'none', letterSpacing: '.06em' }}>← Back to Home</Link>
        <div style={{ background: 'var(--g-card)', border: '1px solid var(--b2)', borderRadius: 20, padding: '3rem 2.5rem', boxShadow: '0 30px 80px var(--overlay-60)' }}>
          <Link href="/" style={{ display: 'block', fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '2rem', background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlowFit</Link>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '2rem' }}>
            {[1,2,3].map((s, i) => (
              <>
                <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 400, background: step >= s ? 'var(--g-Au)' : 'var(--Au-09)', color: step >= s ? 'var(--ink)' : 'var(--t3)', border: `1px solid ${step >= s ? 'transparent' : 'var(--b1)'}`, transition: 'all .3s ease' }}>{s}</div>
                {i < 2 && <div key={`l${s}`} style={{ flex: 1, height: 1, background: step > s ? 'var(--Au)' : 'var(--b1)', transition: 'background .3s ease', maxWidth: 60 }}/>}
              </>
            ))}
          </div>

          {step === 1 && (
            <>
              <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.5rem' }}>Create Account</h1>
              <p style={{ color: 'var(--t2)', fontSize: '.88rem', marginBottom: '2rem' }}>We&apos;ll send a confirmation code to your email</p>
              <div style={{ marginBottom: '1.2rem' }}><label style={labelStyle}>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/></div>
              <div style={{ marginBottom: '1.2rem' }}><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/></div>
              <div style={{ marginBottom: '.75rem' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}><input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={focusStyle} onBlur={blurStyle}/>
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '1.1rem' }}>{showPwd ? '🙈' : '👁'}</button></div>
                {password && (<div style={{ marginTop: '.5rem' }}><div style={{ height: 3, borderRadius: 2, background: 'var(--b3)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${strength.score * 25}%`, background: strength.color, transition: 'width .4s ease, background .4s ease', borderRadius: 2 }}/></div><span style={{ fontSize: '.72rem', color: strength.color, fontFamily: 'var(--f-display)', letterSpacing: '.06em' }}>{strength.label}</span></div>)}
              </div>
              <div style={{ marginBottom: '1.2rem' }}><label style={labelStyle}>Confirm Password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/></div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', fontSize: '.82rem', color: 'var(--t2)', fontFamily: 'var(--f-display)', cursor: 'pointer', marginBottom: '1.5rem' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--Au)' }}/>
                I agree to the <Link href="/legal/terms" style={{ color: 'var(--Au)' }}>Terms of Service</Link> and <Link href="/legal/privacy" style={{ color: 'var(--Au)' }}>Privacy Policy</Link>
              </label>
              {error && <div style={{ background: 'var(--red-10)', border: '1px solid var(--red-30)', borderRadius: 8, padding: '.75rem 1rem', color: 'var(--red)', fontSize: '.85rem', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>{error}</div>}
              <button onClick={submitStep1} disabled={loading} style={{ width: '100%', padding: '1rem', background: 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.85rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, boxShadow: '0 6px 20px var(--Au-30)' }}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--t2)', fontSize: '.85rem', fontFamily: 'var(--f-display)' }}>
                Already have an account? <Link href="/auth/login" style={{ color: 'var(--Au)', textDecoration: 'none' }}>Login</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.5rem' }}>Check Your Email</h1>
              <p style={{ color: 'var(--t2)', fontSize: '.88rem', marginBottom: '2rem' }}>We sent a 6-digit code to <strong style={{ color: 'var(--t1)' }}>{email}</strong></p>
              <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} style={{ width: 44, height: 52, textAlign: 'center', background: 'rgba(12,11,18,0.8)', border: '1px solid var(--b1)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'var(--f-mono)', fontSize: '1.2rem', outline: 'none', transition: 'border-color .3s ease' }} onFocus={e => e.target.style.borderColor = 'var(--Au)'} onBlur={e => e.target.style.borderColor = digit ? 'var(--Au-35)' : 'var(--b1)'}/>
                ))}
              </div>
              {error && <div style={{ background: 'var(--red-10)', border: '1px solid var(--red-30)', borderRadius: 8, padding: '.75rem 1rem', color: 'var(--red)', fontSize: '.85rem', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>{error}</div>}
              <button onClick={submitOtp} disabled={loading || otp.join('').length < 6} style={{ width: '100%', padding: '1rem', background: 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.85rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || otp.join('').length < 6 ? .7 : 1, boxShadow: '0 6px 20px var(--Au-30)' }}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '.75rem', padding: '.75rem', background: 'none', border: '1px solid var(--b1)', borderRadius: 10, color: 'var(--t2)', fontFamily: 'var(--f-display)', fontSize: '.82rem', cursor: 'pointer' }}>← Back</button>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.75rem' }}>Account Created!</h1>
              <p style={{ color: 'var(--t2)', fontSize: '.9rem' }}>Redirecting you to your dashboard...</p>
              <div style={{ marginTop: '1.5rem', height: 3, borderRadius: 2, background: 'var(--b3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--g-Au)', animation: 'none', width: '100%', borderRadius: 2 }}/>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
    }
