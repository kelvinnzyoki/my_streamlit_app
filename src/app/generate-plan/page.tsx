'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, Dumbbell, Sparkles, Timer, Target } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

type Goal = 'fat-loss' | 'muscle' | 'endurance' | 'mobility' | 'general';

const GOAL_LABELS: Record<Goal, string> = {
  general: 'General Fitness',
  'fat-loss': 'Fat Loss',
  muscle: 'Muscle Gain',
  endurance: 'Endurance',
  mobility: 'Mobility',
};

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
          : goal === 'fat-loss'
            ? ['Burpees', 'Mountain climbers', 'Jump squats', 'Russian twists']
            : ['Squats', 'Pushups', 'Plank', 'Russian twists'];

    return {
      warmup,
      core,
      rounds: level === 'Advanced' ? 4 : level === 'Intermediate' ? 3 : 2,
      work: minutes >= 40 ? 50 : 40,
      rest: level === 'Advanced' ? 20 : 30,
    };
  }, [goal, level, minutes]);

  return (
    <DashboardShell>
      <section className="page-section generate-plan-page">
        <div className="dashboard-hero compact-hero">
          <div>
            <p className="eyebrow">Workout Generator</p>
            <h1>Generate Workout Session</h1>
            <p className="muted" style={{ maxWidth: 650 }}>
              Build a clean home workout session from your goal, fitness level, and available time.
            </p>
          </div>
          <Link href="/coach" className="secondary-btn">
            Ask AI Coach
          </Link>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <form className="premium-card generator-form-card">
            <div className="modal-page-title">
              <CalendarPlus size={22} />
              <div>
                <h2>Session Details</h2>
                <p className="muted">Choose the training direction.</p>
              </div>
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

            <div className="grid grid-2 generator-mini-stats">
              <div className="stat-card">
                <Target size={18} />
                <strong>{GOAL_LABELS[goal]}</strong>
                <span>Goal</span>
              </div>
              <div className="stat-card">
                <Timer size={18} />
                <strong>{minutes} min</strong>
                <span>Duration</span>
              </div>
            </div>
          </form>

          <article className="premium-card generated-plan-card">
            <div className="modal-page-title">
              <Sparkles size={22} />
              <div>
                <h2>Generated Plan</h2>
                <p className="muted">{level} · {minutes} minutes · {GOAL_LABELS[goal]}</p>
              </div>
            </div>

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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}><Dumbbell size={14} /> {item}</span>
                <span style={{ color: 'var(--Au)' }}>{plan.work}s / {plan.rest}s</span>
              </div>
            ))}

            <button className="primary-btn" style={{ width: '100%', marginTop: '1rem' }} type="button">
              Save Plan Placeholder
            </button>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
