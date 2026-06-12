'use client';

import { useMemo, useState } from 'react';
import { CalendarPlus, Dumbbell, Sparkles } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

type Goal = 'fat-loss' | 'muscle' | 'endurance' | 'mobility' | 'general';

export default function GeneratePlanPage() {
  const [goal, setGoal] = useState<Goal>('general');
  const [level, setLevel] = useState('Beginner');
  const [minutes, setMinutes] = useState(25);

  const plan = useMemo(() => {
    const warmup = ['Jumping jacks', 'Arm circles', 'Hip openers'];
    const core = goal === 'muscle'
      ? ['Pushups', 'Squats', 'Lunges', 'Tricep dips']
      : goal === 'endurance'
        ? ['High knees', 'Mountain climbers', 'Burpees', 'Sprint intervals']
        : goal === 'mobility'
          ? ['Child pose', 'Downward dog', 'Hip flexor stretch', 'Glute bridges']
          : ['Squats', 'Pushups', 'Plank', 'Russian twists'];
    return { warmup, core, rounds: level === 'Advanced' ? 4 : level === 'Intermediate' ? 3 : 2 };
  }, [goal, level]);

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Workout Generator</p>
        <h1>Generate Workout Session</h1>
        <p className="muted" style={{ maxWidth: 620, marginBottom: '1.5rem' }}>
          This page replaces the old dashboard modal. It gives users a dedicated place to generate a simple workout plan.
        </p>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <form className="premium-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <CalendarPlus size={20} style={{ color: 'var(--Au)' }} />
              <h2 style={{ margin: 0 }}>Session Details</h2>
            </div>
            <div className="field">
              <label>Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
                <option value="general">General Fitness</option>
                <option value="fat-loss">Fat Loss</option>
                <option value="muscle">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="mobility">Mobility</option>
              </select>
            </div>
            <div className="field">
              <label>Fitness Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="field">
              <label>Available Time: {minutes} minutes</label>
              <input type="range" min="10" max="60" step="5" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
            </div>
          </form>

          <article className="premium-card generated-plan-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Sparkles size={20} style={{ color: 'var(--Au)' }} />
              <h2 style={{ margin: 0 }}>Generated Plan</h2>
            </div>
            <p className="muted">{level} · {minutes} minutes · {goal.replace('-', ' ')}</p>
            <div className="mini-link">
              <strong>Warm-up</strong>
              <span style={{ color: 'var(--Au)' }}>5 min</span>
            </div>
            {plan.warmup.map((item) => <p key={item} className="muted">• {item}</p>)}
            <hr className="section-divider" />
            <div className="mini-link">
              <strong>Main Workout</strong>
              <span style={{ color: 'var(--Au)' }}>{plan.rounds} rounds</span>
            </div>
            {plan.core.map((item) => (
              <div key={item} className="mini-link">
                <span><Dumbbell size={14} /> {item}</span>
                <span style={{ color: 'var(--Au)' }}>40s work</span>
              </div>
            ))}
            <button className="primary-btn" style={{ width: '100%', marginTop: '1rem' }}>Save Plan Placeholder</button>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
