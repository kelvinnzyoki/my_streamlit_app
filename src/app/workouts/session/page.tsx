'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Plus, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { imageUrl, formatTime } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type SetRow = { reps: string; load: string; done: boolean };

function SessionContent() {
  const params = useSearchParams();
  const id = params.get('id') || 'pushups';

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
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    getWorkoutById(id)
      .then((data) => { if (active) setWorkout(data); })
      .catch(() => { if (active) setWorkout(null); })
      .finally(() => { if (active) setLoadingWo(false); });
    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    setRunning((v) => !v);
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

  function addSet() { setSets((prev) => [...prev, { reps: '', load: '', done: false }]); }
  function updateSet(i: number, field: keyof SetRow, val: string | boolean) {
    setSets((prev) => prev.map((set, idx) => (idx === i ? { ...set, [field]: val } : set)));
  }
  function removeSet(i: number) { setSets((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))); }

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
        sets: sets.filter((s) => s.reps || s.done),
        bodyWeight,
      });
      setLogged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log workout. Please try again.');
    } finally {
      setLogLoading(false);
    }
  }

  if (loadingWo) {
    return <DashboardShell><section className="page-section"><p className="muted">Loading session…</p></section></DashboardShell>;
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

  const ytQuery = encodeURIComponent(`${workout.name} exercise tutorial proper form`);

  return (
    <DashboardShell>
      <section className="page-section workout-session-page">
        <Link href="/workouts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t2)', marginBottom: '1rem' }}>
          <ArrowLeft size={15} /> Back to Workouts
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
              <div className="live-cals">
                <span className="live-cals-label">Live calories burned</span>
                <span className="live-cals-value">{liveCals} kcal</span>
              </div>
            </div>

            <div className="sets-card">
              <div className="sets-header">
                <div><p className="sets-title">Performance Tracker</p><p className="sets-subtitle">Track sets, reps, and optional load</p></div>
                <button className="sets-add-btn" onClick={addSet}><Plus size={14} /> Add Set</button>
              </div>
              <div className="sets-table-head"><span>#</span><span>Reps</span><span>Load (kg)</span><span>✓</span><span /></div>
              {sets.map((row, i) => (
                <div key={i} className="set-row">
                  <span className="set-num">{i + 1}</span>
                  <input className="set-input" type="number" min="0" value={row.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)} placeholder="0" />
                  <input className="set-input" type="number" min="0" step="0.5" value={row.load} onChange={(e) => updateSet(i, 'load', e.target.value)} placeholder="BW" />
                  <button className={`set-done-btn ${row.done ? 'done' : ''}`} onClick={() => updateSet(i, 'done', !row.done)} aria-label="Mark done"><Check size={12} /></button>
                  <button className="set-del-btn" onClick={() => removeSet(i)} disabled={sets.length === 1}>×</button>
                </div>
              ))}
            </div>

            {!logged ? (
              <div className="premium-card">
                <h2>Log This Workout</h2>
                <div className="field">
                  <label>How did it feel?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['Easy', 'Moderate', 'Hard'] as const).map((d) => (
                      <button key={d} className={difficulty === d ? 'primary-btn' : 'secondary-btn'} style={{ flex: 1 }} onClick={() => setDifficulty(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="field"><label>Body weight snapshot (optional)</label><input type="number" min="20" max="500" step="0.1" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} placeholder="kg" /></div>
                <div className="field"><label>Notes</label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" /></div>
                <button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={logLoading}>{logLoading ? 'Saving…' : `Save · ${formatTime(seconds)} · ${liveCals} kcal`}</button>
              </div>
            ) : (
              <div className="premium-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>Workout Logged!</h2>
                <p className="muted">Great work. Your server progress has been updated.</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}><Link href="/progress" className="secondary-btn" style={{ flex: 1 }}>View Progress</Link><Link href="/workouts" className="primary-btn" style={{ flex: 1 }}>Next Workout</Link></div>
              </div>
            )}
          </div>

          <div>
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <p className="eyebrow">About this exercise</p>
              <p className="muted">{workout.description}</p>
              <div className="pill-row">{(workout.muscles || []).map((m) => <span className="pill" key={m}>{m}</span>)}</div>
            </div>
            {workout.instructions?.length ? <div className="premium-card" style={{ marginBottom: '1.25rem' }}><h2>Instructions</h2>{workout.instructions.map((step, i) => <div key={`${i}-${step}`} className="mini-link"><strong>{i + 1}</strong><span className="muted">{step}</span></div>)}</div> : null}
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
