'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

const workouts = [
  { id: 'pushups', name: 'Push Ups', duration: '12 min' },
  { id: 'squats', name: 'Squats', duration: '15 min' },
  { id: 'lunges', name: 'Lunges', duration: '14 min' },
  { id: 'jumping-jacks', name: 'Jumping Jacks', duration: '10 min' },
];

function WorkoutSessionContent() {
  const params = useSearchParams();
  const workoutId = params.get('id') || 'pushups';

  const workout =
    workouts.find((item) => item.id === workoutId) || workouts[0];

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Workout Session</p>
        <h1>{workout.name}</h1>
        <p className="muted">
          Follow the session, complete your sets, and save your progress.
        </p>

        <div className="card-grid">
          <article className="premium-card">
            <h2>Today&apos;s Plan</h2>
            <p>Duration: {workout.duration}</p>
            <p>Focus on controlled reps, clean breathing, and full range.</p>
          </article>

          <article className="premium-card">
            <h2>Session Controls</h2>
            <button className="primary-btn">Start Session</button>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="page-section">Loading session...</div>}>
      <WorkoutSessionContent />
    </Suspense>
  );
}
