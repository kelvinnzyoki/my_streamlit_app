'use client';
// src/app/profile/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useAuth } from '@/context/authContext';
import { api } from '@/lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '1rem 1.25rem',
  background: 'var(--ink-1)', border: '1px solid var(--b1)',
  borderRadius: 10, color: 'var(--t1)',
  fontFamily: 'var(--f-display)', fontSize: '.9rem',
  fontWeight: 300, letterSpacing: '.02em', outline: 'none',
  transition: 'border-color .3s ease, box-shadow .3s ease',
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '.5rem',
  color: 'var(--t4)', fontSize: '.78rem', fontWeight: 300,
  letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)',
};

export default function ProfilePage() {
  const { user, isLoggedIn, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/auth/login');
    if (user) setName(user.name);
  }, [loading, isLoggedIn, user, router]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put('/auth/profile', { name });
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
      <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em' }}>Loading...</div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '.4rem' }}>Settings</p>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.8rem,3vw,3rem)', color: 'var(--t1)' }}>Your Profile</h1>
          </div>

          {/* Avatar block */}
          <div style={{ background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-card)', padding: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--g-Au)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 200, color: 'var(--ink)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.25rem' }}>{user?.name}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)' }}>{user?.email}</div>
              <div style={{ marginTop: '.5rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'var(--Au-12)', border: '1px solid var(--b1)', borderRadius: 3, padding: '.2rem .65rem', fontFamily: 'var(--f-display)', fontSize: '.6rem', color: 'var(--Au-hi)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                {user?.subscription ?? 'free'} plan
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div style={{ background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-card)', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '2rem' }}>Edit Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--Au-40)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--Au-10)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--b1)'; (e.target as HTMLInputElement).style.boxShadow = ''; }}/>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={user?.email ?? ''} disabled style={{ ...inputStyle, opacity: .5, cursor: 'not-allowed' }}/>
              </div>
            </div>

            {error && <div style={{ background: 'var(--red-10)', border: '1px solid var(--red-30)', borderRadius: 8, padding: '.75rem 1rem', color: 'var(--red)', fontSize: '.85rem', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>{error}</div>}
            {success && <div style={{ background: 'var(--sage-dim)', border: '1px solid var(--sage-25)', borderRadius: 8, padding: '.75rem 1rem', color: 'var(--sage)', fontSize: '.85rem', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>{success}</div>}

            <button onClick={handleSave} disabled={saving} style={{ padding: '.85rem 2.5rem', background: 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.8rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1, boxShadow: '0 6px 20px var(--Au-30)' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Stats */}
          <div style={{ background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-card)', padding: '2rem', marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            {[
              { label: 'Total Workouts', value: user?.totalWorkouts ?? 0, color: 'var(--Au)' },
              { label: 'Day Streak', value: `${user?.streakDays ?? 0}d`, color: 'var(--sage)' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026', color: 'var(--sky)' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.5rem', fontWeight: 300, color, marginBottom: '.25rem' }}>{value}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
                }

