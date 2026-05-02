'use client';
// src/app/progress/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgressChart from '@/components/progressChart';
import { useAuth } from '@/context/authContext';
import { useProgress } from '@/hooks/useProgress';

const cardStyle: React.CSSProperties = {
  background: 'var(--g-card)',
  border: '1px solid var(--b1)',
  borderRadius: 'var(--r-card)',
  padding: '2rem',
};

export default function ProgressPage() {
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const { progress, loading } = useProgress();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/auth/login');
  }, [authLoading, isLoggedIn, router]);

  // Fallback mock data
  const weeklyData = progress?.weeklyWorkouts ?? [2, 4, 3, 5, 4, 6, 3];
  const monthlyData = progress?.monthlyStats?.map(m => m.count) ?? [8, 12, 15, 18, 14, 20, 22, 19, 24, 28, 25, 30];
  const monthLabels = progress?.monthlyStats?.map(m => m.month) ?? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const weekLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const achievements = [
    { icon: '🔥', label: 'First Workout', desc: 'Completed your first session', earned: true },
    { icon: '📅', label: '7-Day Streak', desc: 'Trained 7 days in a row', earned: (user?.streakDays ?? 0) >= 7 },
    { icon: '💯', label: '10 Workouts', desc: 'Logged 10 total workouts', earned: (user?.totalWorkouts ?? 0) >= 10 },
    { icon: '⚡', label: '30-Day Streak', desc: 'Trained 30 days in a row', earned: (user?.streakDays ?? 0) >= 30 },
    { icon: '🏆', label: '50 Workouts', desc: 'Logged 50 total workouts', earned: (user?.totalWorkouts ?? 0) >= 50 },
    { icon: '🌟', label: 'Century Club', desc: 'Logged 100 total workouts', earned: (user?.totalWorkouts ?? 0) >= 100 },
  ];

  if (loading || authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
      <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em' }}>Loading...</div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>

          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '.4rem' }}>Analytics</p>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.8rem,3vw,3rem)', color: 'var(--t1)' }}>Your Progress</h1>
          </div>

          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Total Workouts', value: user?.totalWorkouts ?? 0, color: 'var(--Au)' },
              { label: 'Current Streak', value: `${user?.streakDays ?? 0}d`, color: 'var(--sage)' },
              { label: 'This Week', value: weeklyData.reduce((a, b) => a + b, 0), color: 'var(--sky)' },
              { label: 'This Month', value: monthlyData[monthlyData.length - 1] ?? 0, color: 'var(--coral)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={cardStyle}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '2rem', fontWeight: 300, color, letterSpacing: '-.03em', lineHeight: 1, marginBottom: '.4rem' }}>{value}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', color: 'var(--t2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Weekly chart */}
            <div style={cardStyle}>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.5rem' }}>This Week</h2>
              <ProgressChart data={weeklyData} labels={weekLabels} color="var(--Au)" height={140}/>
            </div>

            {/* Monthly chart */}
            <div style={cardStyle}>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '1.5rem' }}>Monthly Activity</h2>
              <ProgressChart data={monthlyData} labels={monthLabels} color="var(--sage)" height={140}/>
            </div>
          </div>

          {/* Achievements */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.5rem' }}>Achievements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {achievements.map(({ icon, label, desc, earned }) => (
                <div key={label} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start', padding: '1rem', background: earned ? 'var(--Au-07)' : 'var(--white-03)', borderRadius: 'var(--r-sm)', border: `1px solid ${earned ? 'var(--b1)' : 'var(--b3)'}`, opacity: earned ? 1 : .5, transition: 'all .3s ease' }}>
                  <div style={{ fontSize: '1.5rem', filter: earned ? 'none' : 'grayscale(1)' }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: earned ? 'var(--t1)' : 'var(--t3)', fontWeight: 300, marginBottom: '.2rem' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', color: 'var(--t3)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
                 }
            
