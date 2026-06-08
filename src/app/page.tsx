import Navbar from '@/components/navbar';
import ProgramCard from '@/components/programCard';
import WorkoutCard from '@/components/workoutCard';
import { getPrograms, getWorkouts } from '@/lib/api';

export default async function HomePage() {
  const [programs, workouts] = await Promise.all([getPrograms(), getWorkouts()]);
  return (
    <>
      <Navbar />
      <main className="page-section" style={{ padding:'2rem' }}>
        <section className="hero-card">
          <p className="eyebrow">AI Home Fitness Platform</p>
          <h1 className="hero-title">Train smarter. Track deeper. Transform at home.</h1>
          <p className="muted" style={{ maxWidth:680 }}>FlowFit brings home workouts, analytics, progress tracking, programs, and AI coaching into one premium fitness dashboard.</p>
          <div className="metric-row"><a className="primary-btn" href="/auth/register">Start Free</a><a className="secondary-btn" href="/workouts">Explore Workouts</a></div>
        </section>
        <section style={{ marginTop:'2rem' }}>
          <p className="eyebrow">Featured Programs</p>
          <div className="grid grid-3">{programs.slice(0,3).map((p) => <ProgramCard key={p.id} program={p}/>)}</div>
        </section>
        <section style={{ marginTop:'2rem' }}>
          <p className="eyebrow">Popular Workouts</p>
          <div className="grid grid-4">{workouts.slice(0,4).map((w) => <WorkoutCard key={w.id} workout={w}/>)}</div>
        </section>
      </main>
    </>
  );
}
