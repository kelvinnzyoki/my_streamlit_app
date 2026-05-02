'use client';
// src/app/workouts/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import WorkoutCard from '@/components/workoutCard';
import { useAuth } from '@/context/authContext';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutsPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const { workouts, loading, refetch } = useWorkouts();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/auth/login');
  }, [authLoading, isLoggedIn, router]);

  const handleStart = (id: string) => {
    router.push(`/workouts/session?id=${id}`);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '.4rem' }}>My Training</p>
              <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.8rem,3vw,3rem)', color: 'var(--t1)' }}>Workouts</h1>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <Link href="/programs" style={{ padding: '.7rem 1.4rem', border: '1px solid var(--b1)', borderRadius: 'var(--r-sm)', color: 'var(--t2)', fontFamily: 'var(--f-display)', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all .25s' }}>Browse Programs</Link>
              <Link href="/workouts/session" className="btn btn-primary">+ New Workout</Link>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em' }}>Loading workouts...</div>
          ) : workouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-card)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️</div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--t1)', letterSpacing: '.04em', marginBottom: '.75rem' }}>No Workouts Yet</h2>
              <p style={{ fontFamily: 'var(--f-display)', color: 'var(--t2)', fontSize: '.88rem', marginBottom: '2rem' }}>Start your first workout or browse programs to get going.</p>
              <Link href="/workouts/session" className="btn btn-primary">Start Your First Workout</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {workouts.map(workout => (
                <WorkoutCard key={workout.id} workout={workout} onStart={handleStart} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
              }

