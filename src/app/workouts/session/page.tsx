'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ExternalLink, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { formatTime, imageUrl } from '@/lib/utils';

type SetRow = { reps: string; load: string; done: boolean };

function SessionContent() {
  const params = useSearchParams();
  const id = params.get('id') || 'pushups';

  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', load: '', done: false }]);
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
  const [logged, setLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWorkoutById(id).then(setWorkout).catch(() => setWorkout(null)).finally(() => setLoading(false));
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
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

  const caloriesPerMin = Number(workout?.caloriesPerMin || (workout?.calories && workout?.duration ? workout.calories / workout.duration : 5));
  const liveCals = Math.round((caloriesPerMin / 60) * seconds);

  async function handleLog() {
    if (!workout) return;
    setSaving(true);
    try {
      await logWorkout({
        workoutId: workout.id,
        workoutSlug: workout.slug,
        exerciseId: workout.exerciseId || workout.id,
        exerciseName: workout.name,
        duration: Math.max(Math.round(seconds / 60), 1),
        caloriesBurned: liveCals,
        calories: liveCals,
        difficulty,
        notes,
        sets: sets.filter((s) => s.reps).length || undefined,
        reps: sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) || undefined,
        completed: true,
      });
      setLogged(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DashboardShell><section className="page-section"><p className="muted">Loading protected workout session…</p></section></DashboardShell>;
  if (!workout) return <DashboardShell><section className="page-section"><p className="muted">Workout not found.</p></section></DashboardShell>;

  const ytQuery = encodeURIComponent(`${workout.name} exercise tutorial`);

  return (
    <DashboardShell>
      <section className="page-section">
        <div className="session-hero">
          <img src={imageUrl(workout.altImage || workout.image || '/images/fit.webp')} alt={workout.name} />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row"><span className="badge badge-cat">{workout.category || 'Workout'}</span><span className="badge">{workout.level || workout.difficulty || 'All Levels'}</span></div>
            <h1>{workout.name}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}><span>⏱ {workout.duration || 10} min</span><span>🔥 {Math.round((workout.calories || caloriesPerMin * (workout.duration || 10)))} kcal</span></div>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="timer-card">
              <p className="timer-label">Protected Session Timer</p>
              <div className={`timer-display ${running ? 'running' : ''}`}>{formatTime(seconds)}</div>
              <div className="timer-controls"><button className="timer-btn timer-btn-start" onClick={toggleTimer}>{running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}</button><button className="timer-btn timer-btn-reset" onClick={resetTimer}><RotateCcw size={16} /></button></div>
              <div className="live-cals"><span className="live-cals-label">Live calories</span><span className="live-cals-value">{liveCals} kcal</span></div>
            </div>

            <div className="sets-card">
              <div className="sets-header"><div><p className="sets-title">PERFORMANCE TRACKER</p><p className="sets-subtitle">Saved to server when you log workout</p></div><button className="sets-add-btn" onClick={() => setSets((p) => [...p, { reps: '', load: '', done: false }])}><Plus size={14} /> Add Set</button></div>
              {sets.map((row, i) => <div key={i} className="set-row"><span className="set-num">{i + 1}</span><input className="set-input" type="number" value={row.reps} onChange={(e) => setSets((p) => p.map((s, idx) => idx === i ? { ...s, reps: e.target.value } : s))} placeholder="reps" /><input className="set-input" type="number" value={row.load} onChange={(e) => setSets((p) => p.map((s, idx) => idx === i ? { ...s, load: e.target.value } : s))} placeholder="kg" /><button className={`set-done-btn ${row.done ? 'done' : ''}`} onClick={() => setSets((p) => p.map((s, idx) => idx === i ? { ...s, done: !s.done } : s))}><Check size={12} /></button><button className="set-del-btn" disabled={sets.length === 1} onClick={() => setSets((p) => p.filter((_, idx) => idx !== i))}>×</button></div>)}
            </div>

            {!logged ? <div className="premium-card"><h2>Log This Workout</h2><div className="field"><label>How did it feel?</label><div style={{ display: 'flex', gap: '0.5rem' }}>{(['Easy', 'Moderate', 'Hard'] as const).map((d) => <button key={d} className={difficulty === d ? 'primary-btn' : 'secondary-btn'} onClick={() => setDifficulty(d)}>{d}</button>)}</div></div><div className="field"><label>Notes</label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div><button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={saving}>{saving ? 'Saving to server…' : `Save to Server — ${formatTime(seconds)} · ${liveCals} kcal`}</button></div>
              : <div className="premium-card" style={{ textAlign: 'center' }}><h2>Workout Logged!</h2><p className="muted">Your protected progress data has been saved.</p><a className="primary-btn" href="/progress">View Progress</a></div>}
          </div>

          <div><div className="premium-card"><p className="eyebrow">About this exercise</p><p className="muted">{workout.description || 'Server workout details loaded for this session.'}</p><a href={`https://www.youtube.com/results?search_query=${ytQuery}`} target="_blank" rel="noopener noreferrer" className="secondary-btn" style={{ width: '100%', marginTop: '1rem' }}><ExternalLink size={15} /> Watch Tutorial</a></div></div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return <Suspense fallback={<DashboardShell><section className="page-section"><p className="muted">Loading session…</p></section></DashboardShell>}><SessionContent /></Suspense>;
}
