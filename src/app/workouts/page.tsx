'use client';
import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';

const categories = ['All','Strength','Cardio','Core','Mobility','Recovery'];

export default function WorkoutsPage() {
  const { workouts, query, setQuery, category, setCategory } = useWorkouts();
  return (
    <DashboardShell>
      <section>
        <div className="page-head"><div><p className="eyebrow">Exercise Library</p><h1 className="title">Workouts</h1><p className="muted">All uploaded exercise images are wired here for an image-rich experience like the original HTML version.</p></div></div>
        <div className="filter-bar"><input className="input" style={{ maxWidth:360 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search workouts..." /> <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="grid grid-3">{workouts.map((workout) => <WorkoutCard key={workout.id} workout={workout}/>)}</div>
      </section>
    </DashboardShell>
  );
}
