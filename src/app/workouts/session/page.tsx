'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

function SessionContent() {
  const params = useSearchParams();
  const workoutId = params.get('id') ?? 'pushups';
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => { getWorkoutById(workoutId).then(setWorkout); }, [workoutId]);
  if (!workout) return <DashboardShell><section className="page-section"><p className="muted">Loading workout...</p></section></DashboardShell>;
  return (
    <DashboardShell>
      <section className="grid grid-2" style={{ alignItems:'start' }}>
        <article className="premium-card"><img className="hero-img" src={imageUrl(workout.altImage || workout.image)} alt={workout.name}/><p className="eyebrow">{workout.category}</p><h1>{workout.name}</h1><p className="muted">{workout.description}</p><div className="metric-row"><span>{workout.duration} min</span><span>{workout.calories} kcal</span><span>{workout.level || workout.difficulty}</span></div><button className="primary-btn" style={{ marginTop:'1rem' }} onClick={()=>setDone(true)}>{done ? 'Completed' : 'Mark Complete'}</button></article>
        <article className="premium-card"><h2>Instructions</h2>{(workout.instructions || []).map((step,i)=><div className="mini-link" key={step}><span>{i+1}. {step}</span></div>)}<h2>Muscles</h2><div className="pill-row">{(workout.muscles || []).map((m)=><span className="pill" key={m}>{m}</span>)}</div></article>
      </section>
    </DashboardShell>
  );
}
export default function WorkoutSessionPage(){return <Suspense fallback={<DashboardShell><section className="page-section">Loading...</section></DashboardShell>}><SessionContent/></Suspense>}
