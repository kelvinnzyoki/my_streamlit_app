'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getWorkout } from '@/data/workouts';
import { imageUrl } from '@/lib/utils';

function SessionContent() {
  const params = useSearchParams();

  const workoutId = params.get('id') ?? 'pushups';
  const workout = getWorkout(workoutId);

  const [done, setDone] = useState(false);

  if (!workout) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="eyebrow">Workout Not Found</p>
          <h1>Invalid Workout</h1>
          <p className="muted">The workout you requested does not exist.</p>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <section className="page-section">
        <article className="premium-card">
          <img
            src={imageUrl(workout.image)}
            alt={workout.name}
            className="hero-img"
          />

          <p className="eyebrow">{workout.category}</p>
          <h1>{workout.name}</h1>

          <p className="muted">
            Complete the session and track your progress.
          </p>

          <div className="metric-row">
            <span>{workout.duration} min</span>
            <span>{workout.calories} kcal</span>
            <span>{workout.difficulty}</span>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button className="primary-btn" onClick={() => setDone(true)}>
              Mark Complete
            </button>

            <button className="secondary-btn" onClick={() => setDone(false)}>
              Reset
            </button>
          </div>

          {done && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(59,191,138,0.12)',
                border: '1px solid rgba(59,191,138,0.25)',
              }}
            >
              ✅ Workout completed successfully.
            </div>
          )}
        </article>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <section className="page-section">
            <h2>Loading workout...</h2>
          </section>
        </DashboardShell>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
