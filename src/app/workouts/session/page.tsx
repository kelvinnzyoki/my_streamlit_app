'use client';
// src/app/workouts/session/page.tsx
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/authContext';
import { api } from '@/lib/api';
import type { Exercise } from '@/types/workout';

const MOCK_EXERCISES: Exercise[] = [
  { id: '1', name: 'Push-ups', sets: 3, reps: '12-15', restSeconds: 60, primaryMuscles: ['Chest', 'Triceps'], notes: 'Keep core tight, full range of motion' },
  { id: '2', name: 'Squats', sets: 4, reps: '15-20', restSeconds: 90, primaryMuscles: ['Quads', 'Glutes'], notes: 'Drive through heels, depth below parallel' },
  { id: '3', name: 'Plank Hold', sets: 3, reps: '30-60s', restSeconds: 45, primaryMuscles: ['Core', 'Shoulders'], notes: 'Straight line from head to heels' },
  { id: '4', name: 'Glute Bridge', sets: 3, reps: '15', restSeconds: 60, primaryMuscles: ['Glutes', 'Hamstrings'], notes: 'Squeeze at the top for 1 second' },
  { id: '5', name: 'Mountain Climbers', sets: 3, reps: '20 each', restSeconds: 45, primaryMuscles: ['Core', 'Hip Flexors'], notes: 'Drive knees in fast for cardio effect' },
];

export default function WorkoutSessionPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_EXERCISES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/auth/login');
  }, [authLoading, isLoggedIn, router]);

  // Session elapsed timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startRest = (restSeconds: number) => {
    setResting(true);
    setRestLeft(restSeconds);
    const tick = setInterval(() => {
      setRestLeft(r => {
        if (r <= 1) { clearInterval(tick); setResting(false); return 0; }
        return r - 1;
      });
    }, 1000);
    restTimerRef.current = tick;
  };

  const completeSet = () => {
    const ex = exercises[currentIdx];
    const key = `${ex.id}-${currentSet}`;
    setCompleted(prev => new Set(prev).add(key));
    if (currentSet < ex.sets) {
      startRest(ex.restSeconds);
      setCurrentSet(s => s + 1);
    } else {
      if (currentIdx < exercises.length - 1) {
        startRest(ex.restSeconds);
        setCurrentIdx(i => i + 1);
        setCurrentSet(1);
      } else {
        setSessionDone(true);
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        api.post('/workouts/log', { duration: Math.floor(elapsed / 60), exercisesCompleted: exercises.length }).catch(() => {});
      }
    }
  };

  const current = exercises[currentIdx];
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = completed.size;
  const progress = (doneSets / totalSets) * 100;

  if (sessionDone) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', padding: '2rem' }}>
      <div className="blob blob-1" aria-hidden="true"/>
      <div style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏆</div>
        <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '3rem', color: 'var(--t1)', marginBottom: '1rem' }}>Workout Complete!</h1>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {[['Time', formatTime(elapsed)], ['Exercises', exercises.length], ['Sets', totalSets]].map(([label, val]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.8rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
          <Link href="/progress" style={{ padding: '.82rem 2rem', border: '1px solid var(--b1)', borderRadius: 'var(--r-sm)', color: 'var(--t2)', fontFamily: 'var(--f-display)', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>View Progress</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--b1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.1rem', color: 'var(--Au)', letterSpacing: '.05em' }}>{formatTime(elapsed)}</div>
        <div style={{ flex: 1, maxWidth: 400, margin: '0 2rem' }}>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--b3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--g-Au)', borderRadius: 2, transition: 'width .5s ease' }}/>
          </div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t3)', textAlign: 'center', marginTop: '.35rem', letterSpacing: '.08em' }}>
            {doneSets} / {totalSets} sets
          </div>
        </div>
        <Link href="/dashboard" style={{ fontFamily: 'var(--f-display)', fontSize: '.7rem', color: 'var(--t2)', textDecoration: 'none', letterSpacing: '.08em', textTransform: 'uppercase' }}>End</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '2rem', padding: '2.5rem 3rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* Exercise list sidebar */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: '.62rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1rem' }}>Exercises</div>
          {exercises.map((ex, i) => {
            const exDone = Array.from({ length: ex.sets }, (_, s) => completed.has(`${ex.id}-${s + 1}`)).every(Boolean);
            return (
              <div key={ex.id} onClick={() => { setCurrentIdx(i); setCurrentSet(1); }} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', padding: '.75rem .85rem', borderRadius: 'var(--r-sm)', marginBottom: '.4rem', cursor: 'pointer', background: i === currentIdx ? 'var(--Au-09)' : 'transparent', border: `1px solid ${i === currentIdx ? 'var(--b1)' : 'transparent'}`, transition: 'all .2s ease' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: exDone ? 'var(--sage)' : i === currentIdx ? 'var(--Au-20)' : 'var(--white-05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: exDone ? '#fff' : i === currentIdx ? 'var(--Au)' : 'var(--t3)' }}>
                  {exDone ? '✓' : i + 1}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: i === currentIdx ? 'var(--t1)' : 'var(--t2)', fontWeight: 300 }}>{ex.name}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t3)' }}>{ex.sets}×{ex.reps}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main exercise area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {resting ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: '1rem' }}>Rest Period</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '6rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '1.5rem' }}>{formatTime(restLeft)}</div>
              <button onClick={() => { setResting(false); if (restTimerRef.current) clearInterval(restTimerRef.current); }} style={{ padding: '.7rem 2rem', background: 'none', border: '1px solid var(--b1)', borderRadius: 'var(--r-sm)', color: 'var(--t2)', fontFamily: 'var(--f-display)', fontSize: '.75rem', letterSpacing: '.1em', cursor: 'pointer', textTransform: 'uppercase' }}>Skip Rest</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: 500 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t3)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.75rem' }}>Exercise {currentIdx + 1} of {exercises.length}</div>
              <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem,4vw,3.5rem)', color: 'var(--t1)', marginBottom: '.75rem' }}>{current.name}</h2>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.4rem', color: 'var(--Au)', marginBottom: '.5rem' }}>Set {currentSet} of {current.sets}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1rem', color: 'var(--t2)', marginBottom: '1rem' }}>{current.reps} reps</div>
              {current.primaryMuscles && (
                <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {current.primaryMuscles.map(m => (
                    <span key={m} style={{ background: 'var(--Au-09)', border: '1px solid var(--b1)', borderRadius: 3, padding: '.2rem .65rem', fontSize: '.6rem', color: 'var(--Au)', fontFamily: 'var(--f-display)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{m}</span>
                  ))}
                </div>
              )}
              {current.notes && <p style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t3)', fontStyle: 'italic', marginBottom: '2.5rem' }}>{current.notes}</p>}
              <button onClick={completeSet} style={{ padding: '1.2rem 3.5rem', background: 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 30px var(--Au-40)', transition: 'transform .2s ease, box-shadow .2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 16px 40px var(--Au-50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px var(--Au-40)'; }}>
                Complete Set ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
          }
      
