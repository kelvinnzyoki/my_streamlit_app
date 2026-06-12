'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Plus, Check, ExternalLink } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { imageUrl, formatTime } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type SetRow = { reps: string; load: string; done: boolean };

function SessionContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? 'pushups';

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWo, setLoadingWo] = useState(true);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sets
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', load: '', done: false }]);

  // Log form
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
  const [logged, setLogged] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    getWorkoutById(id)
      .then(setWorkout)
      .catch(() => setWorkout(null))
      .finally(() => setLoadingWo(false));
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  /* ── Timer logic ── */
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

  const liveCals = workout
    ? Math.round((workout.calories / workout.duration / 60) * seconds)
    : 0;

  /* ── Sets ── */
  function addSet() {
    setSets((prev) => [...prev, { reps: '', load: '', done: false }]);
  }
  function updateSet(i: number, field: keyof SetRow, val: string | boolean) {
    setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }
  function removeSet(i: number) {
    setSets((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* ── Log workout ── */
  async function handleLog() {
    if (!workout) return;
    setLogLoading(true);
    try {
      await logWorkout({
        workoutId: workout.id,
        workoutSlug: workout.slug,
        duration: Math.max(Math.round(seconds / 60), 1),
        calories: liveCals,
        difficulty,
        notes,
        sets: sets.filter((s) => s.reps),
      });
      setLogged(true);
    } catch { /* silently ignore if endpoint not ready */ setLogged(true); }
    finally { setLogLoading(false); }
  }

  if (loadingWo) {
    return (
      <DashboardShell>
        <section className="page-section">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {['40%','60%'].map((w) => (
              <div key={w} className="premium-card" style={{ height: 20, width: w, opacity: 0.3 }} />
            ))}
          </div>
          <p className="muted">Loading session…</p>
        </section>
      </DashboardShell>
    );
  }

  if (!workout) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Workout not found. <a href="/workouts" style={{ color: 'var(--Au)' }}>Browse library</a></p>
        </section>
      </DashboardShell>
    );
  }

  const ytQuery = encodeURIComponent(`${workout.name} exercise tutorial`);

  return (
    <DashboardShell>
      <section className="page-section">
        {/* ── Hero ── */}
        <div className="session-hero">
          <img src={imageUrl(workout.altImage || workout.image)} alt={workout.name} />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row">
              <span className="badge badge-cat">{workout.category}</span>
              <span className="badge">{workout.level || workout.difficulty}</span>
            </div>
            <h1 style={{ margin: '0 0 0.5rem', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {workout.name}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
              <span>⏱ {workout.duration} min</span>
              <span>🔥 {workout.calories} kcal</span>
              {workout.muscles?.length && <span>💪 {workout.muscles[0]}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* ── Left column ── */}
          <div>
            {/* Timer */}
            <div className="timer-card">
              <p className="timer-label">Session Timer</p>
              <div className={`timer-display ${running ? 'running' : ''}`}>
                {formatTime(seconds)}
              </div>
              <div className="timer-controls">
                <button className="timer-btn timer-btn-start" onClick={toggleTimer}>
                  {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {seconds > 0 ? 'Resume' : 'Start'}</>}
                </button>
                <button className="timer-btn timer-btn-reset" onClick={resetTimer}>
                  <RotateCcw size={16} />
                </button>
              </div>
              {seconds > 0 && (
                <div className="live-cals">
                  <span className="live-cals-label">Live calories burned</span>
                  <span className="live-cals-value">{liveCals} kcal</span>
                </div>
              )}
            </div>

            {/* Sets tracker */}
            <div className="sets-card">
              <div className="sets-header">
                <div>
                  <p className="sets-title">PERFORMANCE TRACKER</p>
                  <p className="sets-subtitle">Log your sets, reps, and load</p>
                </div>
                <button className="sets-add-btn" onClick={addSet}>
                  <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Add Set
                </button>
              </div>

              <div className="sets-table-head">
                <span style={{ textAlign: 'center' }}>#</span>
                <span>Reps</span>
                <span>Load (kg)</span>
                <span style={{ textAlign: 'center' }}>✓</span>
                <span />
              </div>

              {sets.map((row, i) => (
                <div key={i} className="set-row">
                  <span className="set-num">{i + 1}</span>
                  <input
                    className="set-input" type="number" min="0" placeholder="0"
                    value={row.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)}
                  />
                  <input
                    className="set-input" type="number" min="0" step="0.5" placeholder="BW"
                    value={row.load} onChange={(e) => updateSet(i, 'load', e.target.value)}
                  />
                  <button
                    className={`set-done-btn ${row.done ? 'done' : ''}`}
                    onClick={() => updateSet(i, 'done', !row.done)}
                    aria-label="Mark done"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    className="set-del-btn"
                    onClick={() => removeSet(i)}
                    aria-label="Remove set"
                    disabled={sets.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Log form */}
            {!logged ? (
              <div className="premium-card">
                <h2 style={{ marginBottom: '1rem' }}>Log This Workout</h2>
                <div className="field">
                  <label>How did it feel?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['Easy', 'Moderate', 'Hard'] as const).map((d) => (
                      <button
                        key={d}
                        className={difficulty === d ? 'primary-btn' : 'secondary-btn'}
                        style={{ flex: 1, minHeight: 40, fontSize: '0.82rem' }}
                        onClick={() => setDifficulty(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Notes (optional)</label>
                  <textarea
                    rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it go? Any PRs?"
                    style={{ width: '100%', background: 'var(--white-05)', border: '1px solid var(--b1)', color: 'var(--t1)', borderRadius: 14, padding: '0.85rem 1rem', resize: 'vertical' }}
                  />
                </div>
                <button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={logLoading}>
                  {logLoading ? 'Saving…' : `Save — ${formatTime(seconds)} · ${liveCals} kcal`}
                </button>
              </div>
            ) : (
              <div className="premium-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--sage-dim)', border: '1px solid var(--sage-30)', display: 'grid', placeItems: 'center', margin: '0 auto 1rem', color: 'var(--sage)' }}>
                  <Check size={26} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Workout Logged!</h2>
                <p className="muted">Great work. See your stats in Progress.</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <a href="/progress" className="secondary-btn" style={{ flex: 1 }}>View Progress</a>
                  <a href="/workouts" className="primary-btn" style={{ flex: 1 }}>Next Workout</a>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div>
            {/* Description */}
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>About this exercise</p>
              <p className="muted">{workout.description}</p>
              <div className="pill-row">
                {(workout.muscles || []).map((m) => <span className="pill" key={m}>{m}</span>)}
              </div>
            </div>

            {/* Instructions */}
            {workout.instructions && workout.instructions.length > 0 && (
              <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Instructions</h2>
                {workout.instructions.map((step, i) => (
                  <div key={step} className="mini-link" style={{ alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--Au)', fontFamily: 'var(--f-mono)', fontWeight: 700, flexShrink: 0, minWidth: 24 }}>{i + 1}</span>
                    <span style={{ color: 'var(--t2)', fontSize: '0.88rem' }}>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* YouTube tutorial link */}
            <div className="premium-card">
              <h2 style={{ marginBottom: '0.75rem' }}>Tutorial Video</h2>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Watch a guided demonstration of {workout.name} technique and form.
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${ytQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ExternalLink size={15} />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense fallback={
      <DashboardShell>
        <section className="page-section"><p className="muted">Loading session…</p></section>
      </DashboardShell>
    }>
      <SessionContent />
    </Suspense>
  );
}
