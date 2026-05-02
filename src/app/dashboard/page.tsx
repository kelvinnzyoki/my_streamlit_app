'use client';
// src/app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgressChart from '@/components/progressChart';
import { useAuth } from '@/context/authContext';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/utils';

interface DashboardData {
  streak: number;
  totalWorkouts: number;
  weeklyWorkouts: number[];
  recentWorkouts: Array<{ id: string; name: string; duration: number; completedAt: string }>;
  upcomingProgram?: { name: string; nextSession: string };
}

const cardStyle: React.CSSProperties = {
  background: 'var(--g-card)',
  border: '1px solid var(--b1)',
  borderRadius: 'var(--r-card)',
  padding: '1.8rem',
};

export default function DashboardPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/auth/login');
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get<{ dashboard: DashboardData }>('/dashboard')
      .then(res => setData(res.dashboard))
      .catch(() => {
        // fallback mock data for development
        setData({
          streak: 7,
          totalWorkouts: 42,
          weeklyWorkouts: [3, 5, 4, 6, 4, 5, 3],
          recentWorkouts: [
            { id: '1', name: 'Upper Body Strength', duration: 45, completedAt: new Date(Date.now() - 86400000).toISOString() },
            { id: '2', name: 'Core & Mobility', duration: 30, completedAt: new Date(Date.now() - 172800000).toISOString() },
            { id: '3', name: 'HIIT Cardio Blast', duration: 25, completedAt: new Date(Date.now() - 259200000).toISOString() },
          ],
          upcomingProgram: { name: 'Bodyweight Elite', nextSession: 'Push Day — Chest & Triceps' },
        });
      })
      .finally(() => setFetching(false));
  }, [isLoggedIn]);

  if (loading || fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Day Streak', value: `${data?.streak ?? 0}`, unit: 'days', color: 'var(--Au)' },
    { label: 'Total Workouts', value: `${data?.totalWorkouts ?? 0}`, unit: 'sessions', color: 'var(--sage)' },
    { label: 'This Week', value: `${data?.weeklyWorkouts?.reduce((a, b) => a + b, 0) ?? 0}`, unit: 'workouts', color: 'var(--sky)' },
    { label: 'Plan Status', value: user?.subscription ?? 'Free', unit: 'tier', color: 'var(--Au-hi)' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '2rem var(--pad-x) 5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '.4rem' }}>Welcome back</p>
              <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.8rem,3vw,3rem)', color: 'var(--t1)' }}>
                {user?.name?.split(' ')[0] ?? 'Athlete'}
              </h1>
            </div>
            <Link href="/workouts/session" className="btn btn-primary">Start Workout</Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
            {stats.map(({ label, value, unit, color }) => (
              <div key={label} style={cardStyle}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '2rem', fontWeight: 300, color, letterSpacing: '-.03em', lineHeight: 1, marginBottom: '.35rem' }}>{value}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '.62rem', color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.15rem' }}>{unit}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '.78rem', color: 'var(--t2)', fontWeight: 300 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Weekly chart */}
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.5rem' }}>Weekly Activity</h2>
                <ProgressChart
                  data={data?.weeklyWorkouts ?? [0, 0, 0, 0, 0, 0, 0]}
                  labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  color="var(--Au)"
                  height={140}
                />
              </div>

              {/* Recent workouts */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)' }}>Recent Workouts</h2>
                  <Link href="/workouts" style={{ fontFamily: 'var(--f-display)', fontSize: '.7rem', color: 'var(--t2)', letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>View All →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {(data?.recentWorkouts ?? []).map(w => (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem 1rem', background: 'var(--Au-04)', borderRadius: 'var(--r-sm)', border: '1px solid var(--b3)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '.2rem' }}>{w.name}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: 'var(--t3)', letterSpacing: '.04em' }}>{formatDuration(w.duration)}</div>
                      </div>
                      <span style={{ background: 'var(--sage-dim)', color: 'var(--sage)', border: '1px solid var(--sage-20)', padding: '.22rem .65rem', borderRadius: 3, fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>Done</span>
                    </div>
                  ))}
                  {(!data?.recentWorkouts?.length) && (
                    <p style={{ color: 'var(--t3)', fontFamily: 'var(--f-display)', fontSize: '.85rem', textAlign: 'center', padding: '2rem' }}>No workouts yet — start your first one!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Upcoming session */}
              {data?.upcomingProgram && (
                <div style={{ ...cardStyle, border: '1px solid var(--Au-25)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--g-Au)' }}/>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '.62rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '.75rem' }}>Up Next</div>
                  <div style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--t1)', marginBottom: '.5rem' }}>{data.upcomingProgram.name}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)', marginBottom: '1.25rem' }}>{data.upcomingProgram.nextSession}</div>
                  <Link href="/workouts/session" style={{ display: 'block', textAlign: 'center', padding: '.7rem', background: 'var(--g-Au)', border: 'none', borderRadius: 'var(--r-sm)', color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    Begin Session
                  </Link>
                </div>
              )}

              {/* Quick links */}
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.2rem' }}>Quick Access</h2>
                {[
                  { href: '/programs', label: 'Browse Programs', icon: '📋' },
                  { href: '/progress', label: 'View Progress', icon: '📈' },
                  { href: '/profile', label: 'Edit Profile', icon: '👤' },
                  { href: '/subscription', label: 'Upgrade Plan', icon: '⚡' },
                ].map(({ href, label, icon }) => (
                  <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.75rem .85rem', borderRadius: 'var(--r-sm)', color: 'var(--t2)', textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: '.85rem', transition: 'background .2s, color .2s', marginBottom: '.4rem' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--Au-07)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t2)'; }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span> {label}
                  </Link>
                ))}
              </div>

              {/* Subscription nudge for free users */}
              {user?.subscription === 'free' && (
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, var(--Au-09), var(--Au-04))', border: '1px solid var(--Au-20)' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au-hi)', marginBottom: '.6rem' }}>Upgrade to Pro</div>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '1rem' }}>Unlock AI-generated plans, video demos, and advanced analytics.</p>
                  <Link href="/subscription" style={{ display: 'block', textAlign: 'center', padding: '.65rem', background: 'var(--g-Au)', borderRadius: 'var(--r-sm)', color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.73rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    Upgrade — $12/mo
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
          }
                       
