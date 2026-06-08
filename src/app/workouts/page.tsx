'use client';
import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutsPage() {
  const { workouts, categories, query, setQuery, category, setCategory, loading } = useWorkouts();
  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Workout Library</p><h1>Choose Your Session</h1>
        <div className="premium-card" style={{ marginBottom:'1.2rem' }}>
          <div className="grid grid-2">
            <input className="secondary-btn" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search workouts..." />
            <select className="secondary-btn" value={category} onChange={(e)=>setCategory(e.target.value)}>{categories.map((c)=><option key={c}>{c}</option>)}</select>
          </div>
        </div>
        {loading ? <p className="muted">Loading workouts...</p> : <div className="grid grid-3">{workouts.map((w)=><WorkoutCard key={w.id} workout={w}/>)}</div>}
      </section>
    </DashboardShell>
  );
}
