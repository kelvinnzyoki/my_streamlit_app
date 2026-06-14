'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Plus, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { imageUrl, formatTime } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type SetRow = { reps: string; load: string; done: boolean };

function makeQueryWorkout(params: URLSearchParams, id: string): Workout | null {
  const name = params.get('name');
  if (!name) return null;

  const perMinuteCalories = Number(params.get('cal') || 8);
  const duration = Number(params.get('duration') || 10);
  const category = params.get('category') || 'Program';
  const guide = params.get('guide') || id;

  return {
    id,
    slug: guide,
    name,
    description: 'Program workout. Complete this session, log it, and FlowFit will return you to your active program day.',
    image: `${guide}.webp`,
    category,
    level: 'Program',
    difficulty: 'Program',
    duration,
    calories: Math.max(1, Math.round(perMinuteCalories * duration)),
    muscles: [],
    instructions: [
      'Start the timer when you begin the exercise.',
      'Complete the prescribed sets and reps with controlled form.',
      'Log the workout after finishing so your program progress updates.',
    ],
    equipment: 'Bodyweight',
  } as Workout;
}

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id') || 'pushups';
  const returnUrl = params.get('returnUrl') || '';
  const programId = params.get('program') || '';
  const enrollmentId = params.get('enrollment') || '';
  const dayIndex = params.get('dayIndex') || '';
  const exIndex = params.get('exIndex') || '';

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWo, setLoadingWo] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', load: '', done: false }]);
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
  const [bodyWeight, setBodyWeight] = useState('');
  const [logged, setLogged] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    getWorkoutById(id)
      .then((data) => {
        if (!active) return;
        setWorkout(data || makeQueryWorkout(params, id));
      })
      .catch(() => {
        if (active) setWorkout(makeQueryWorkout(params, id));
      })
      .finally(() => {
        if (active) setLoadingWo(false);
      });

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, params]);

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    }

    setRunning((value) => !value);
  }

  function resetTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setSeconds(0);
  }

  const liveCals = useMemo(() => {
    if (!workout) return 0;
    const perMinute = Number(workout.calories || 0) / Math.max(Number(workout.duration || 1), 1);
    return Math.round((perMinute / 60) * seconds);
  }, [workout, seconds]);

  function addSet() {
    setSets((previous) => [...previous, { reps: '', load: '', done: false }]);
  }

  function updateSet(index: number, field: keyof SetRow, value: string | boolean) {
    setSets((previous) => previous.map((set, itemIndex) => (itemIndex === index ? { ...set, [field]: value } : set)));
  }

  function removeSet(index: number) {
    setSets((previous) => (previous.length === 1 ? previous : previous.filter((_, itemIndex) => itemIndex !== index)));
  }

  function buildReturnUrl() {
    if (returnUrl) return returnUrl;
    if (!programId) return '';

    const search = new URLSearchParams({
      enrollmentId,
      exDone: '1',
      dayIndex,
      exIndex,
    });

    return `/programs/${encodeURIComponent(programId)}?${search.toString()}`;
  }

  async function handleLog() {
    if (!workout) return;

    setError('');
    setLogLoading(true);

    try {
      await logWorkout({
        exerciseId: workout.id,
        workoutId: workout.id,
        workoutSlug: workout.slug,
        name: workout.name,
        category: workout.category,
        duration: Math.max(Math.round(seconds / 60), 1),
        caloriesBurned: liveCals,
        difficulty,
        notes,
        sets: sets.filter((set) => set.reps || set.done),
        bodyWeight,
        programId: programId || undefined,
        enrollmentId: enrollmentId || undefined,
        dayIndex: dayIndex || undefined,
        exerciseIndex: exIndex || undefined,
      });

      setLogged(true);

      const nextUrl = buildReturnUrl();
      if (nextUrl) {
        setRedirecting(true);
        window.setTimeout(() => {
          router.replace(nextUrl);
        }, 850);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log workout. Please try again.');
    } finally {
      setLogLoading(false);
    }
  }

  if (loadingWo) {
    return (
      <DashboardShell>
        <section className="page-section"><p className="muted">Loading session…</p></section>
      </DashboardShell>
    );
  }

  if (!workout) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Workout not found.</p>
          <Link href="/workouts" className="secondary-btn" style={{ marginTop: '1rem' }}>Browse library</Link>
        </section>
      </DashboardShell>
    );
  }

  const backHref = programId ? `/programs/${encodeURIComponent(programId)}${enrollmentId ? `?enrollmentId=${encodeURIComponent(enrollmentId)}` : ''}` : '/workouts';
  const ytQuery = encodeURIComponent(`${workout.name} exercise tutorial proper form`);

  return (
    <DashboardShell>
      <section className="page-section workout-session-page">
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t2)', marginBottom: '1rem' }}>
          <ArrowLeft size={15} /> {programId ? 'Back to Program' : 'Back to Workouts'}
        </Link>

        <div className="session-hero">
          <img src={imageUrl(workout.altImage || workout.image)} alt={workout.name} />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row">
              <span className="badge badge-cat">{workout.category}</span>
              <span className="badge">{workout.level || workout.difficulty}</span>
            </div>
            <h1 style={{ margin: 0, color: '#fff' }}>{workout.name}</h1>
            <div className="metric-row">
              <span>⏱ {workout.duration} min</span>
              <span>🔥 {workout.calories} kcal</span>
              <span>🏋️ {workout.equipment || 'Bodyweight'}</span>
            </div>
          </div>
        </div>

        {programId && (
          <div className="success-alert" style={{ marginBottom: '1rem' }}>
            Program session mode: after logging, FlowFit will return you to the program detail page to continue the day’s remaining workouts.
          </div>
        )}
        {error && <div className="alert">{error}</div>}

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="timer-card">
              <p className="timer-label">Session Timer</p>
              <div className={`timer-display ${running ? 'running' : ''}`}>{formatTime(seconds)}</div>
              <div className="timer-controls">
                <button className="timer-btn timer-btn-start" onClick={toggleTimer}>
                  {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {seconds > 0 ? 'Resume' : 'Start'}</>}
                </button>
                <button className="timer-btn timer-btn-reset" onClick={resetTimer}><RotateCcw size={16} /></button>
              </div>
              {seconds > 0 && <div className="live-cals"><span className="live-cals-label">Live calories burned</span><span className="live-cals-value">{liveCals} kcal</span></div>}
            </div>

            <div className="sets-card">
              <div className="sets-header"><div><p className="sets-title">PERFORMANCE TRACKER</p><p className="sets-subtitle">Log sets, reps, and load</p></div><button className="sets-add-btn" onClick={addSet}><Plus size={14} /> Add Set</button></div>
              <div className="sets-table-head"><span>#</span><span>Reps</span><span>Load</span><span>✓</span><span /></div>
              {sets.map((row, index) => (
                <div key={index} className="set-row">
                  <span className="set-num">{index + 1}</span>
                  <input className="set-input" type="number" min="0" value={row.reps} onChange={(event) => updateSet(index, 'reps', event.target.value)} placeholder="0" />
                  <input className="set-input" type="number" min="0" step="0.5" value={row.load} onChange={(event) => updateSet(index, 'load', event.target.value)} placeholder="BW" />
                  <button className={`set-done-btn ${row.done ? 'done' : ''}`} onClick={() => updateSet(index, 'done', !row.done)} aria-label="Mark done"><Check size={12} /></button>
                  <button className="set-del-btn" onClick={() => removeSet(index)} disabled={sets.length === 1}>×</button>
                </div>
              ))}
            </div>

            {!logged ? (
              <div className="premium-card">
                <h2>Log This Workout</h2>
                <div className="field">
                  <label>How did it feel?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['Easy', 'Moderate', 'Hard'] as const).map((level) => (
                      <button key={level} className={difficulty === level ? 'primary-btn' : 'secondary-btn'} style={{ flex: 1 }} onClick={() => setDifficulty(level)}>{level}</button>
                    ))}
                  </div>
                </div>
                <div className="field"><label>Body weight snapshot (optional)</label><input type="number" min="20" max="500" step="0.1" value={bodyWeight} onChange={(event) => setBodyWeight(event.target.value)} placeholder="kg" /></div>
                <div className="field"><label>Notes</label><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="How did it go?" /></div>
                <button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={logLoading}>{logLoading ? 'Saving…' : `Save · ${formatTime(seconds)} · ${liveCals} kcal`}</button>
              </div>
            ) : (
              <div className="premium-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>Workout Logged!</h2>
                <p className="muted">{redirecting ? 'Returning to your program so you can continue the remaining workouts…' : 'Great work. Your server progress has been updated.'}</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <Link href={backHref} className="secondary-btn" style={{ flex: 1 }}>Back to Program</Link>
                  <Link href="/progress" className="primary-btn" style={{ flex: 1 }}>View Progress</Link>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <p className="eyebrow">About this exercise</p>
              <p className="muted">{workout.description}</p>
              <div className="pill-row">{(workout.muscles || []).map((muscle) => <span className="pill" key={muscle}>{muscle}</span>)}</div>
            </div>
            {workout.instructions?.length ? <div className="premium-card" style={{ marginBottom: '1.25rem' }}><h2>Instructions</h2>{workout.instructions.map((step, index) => <div key={`${index}-${step}`} className="mini-link"><strong>{index + 1}</strong><span className="muted">{step}</span></div>)}</div> : null}
            <div className="premium-card"><h2>Tutorial Video</h2><p className="muted">Watch a guided demonstration of {workout.name} technique and form.</p><a href={`https://www.youtube.com/results?search_query=${ytQuery}`} target="_blank" rel="noopener noreferrer" className="secondary-btn" style={{ width: '100%', gap: '0.5rem' }}><ExternalLink size={15} /> Watch on YouTube</a></div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense fallback={<DashboardShell><section className="page-section"><p className="muted">Loading session…</p></section></DashboardShell>}>
      <SessionContent />
    </Suspense>
  );
}
