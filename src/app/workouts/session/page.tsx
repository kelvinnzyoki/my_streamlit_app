'use client';
import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getWorkout } from '@/data/workouts';
import { imageUrl } from '@/lib/utils';

function SessionContent() {
  const params = useSearchParams();
  const workout = getWorkout(params.get('id'));
  const [done, setDone] = useState(false);
  return (
    <DashboardShell>
      <section className="grid grid-2" style={{ alignItems:'start' }}>
        <div className="premium-card workout-card"><div className="workout-img" style={{ height:420 }}><Image src={imageUrl(workout.image)} alt={workout.name} fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div></div>
        <div className="premium-card">
          <p className="eyebrow">Workout Session</p><h1 className="title">{workout.name}</h1><p className="muted">{workout.description}</p>
          <div className="pill-row"><span className="pill">{workout.level}</span><span className="pill">{workout.duration} min</span><span className="pill">{workout.calories} kcal</span></div>
          <h3>Instructions</h3><ol>{workout.instructions.map((step) => <li key={step}>{step}</li>)}</ol>
          <h3>Muscle Focus</h3><div className="pill-row">{workout.muscles.map((m) => <span className="pill" key={m}>{m}</span>)}</div>
          <button className="primary-btn" onClick={() => setDone(true)}>{done ? 'Completed ✓' : 'Complete Session'}</button>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return <Suspense fallback={<DashboardShell><div className="card">Loading workout...</div></DashboardShell>}><SessionContent /></Suspense>;
}
