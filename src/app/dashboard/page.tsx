import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import ProgressChart from '@/components/progressChart';
import { getDashboard, getProgress, getWorkouts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default async function DashboardPage() {
  const [dashboard, progress, workouts] = await Promise.all([getDashboard(), getProgress(), getWorkouts()]);
  const stats = (dashboard as any).stats || {};
  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Dashboard</p><h1>Your FlowFit Control Center</h1>
        <div className="grid grid-4">
          <div className="premium-card"><p className="muted">Workouts</p><div className="stat-value">{formatNumber(stats.workouts)}</div></div>
          <div className="premium-card"><p className="muted">Calories</p><div className="stat-value">{formatNumber(stats.calories)}</div></div>
          <div className="premium-card"><p className="muted">Streak</p><div className="stat-value">{formatNumber(stats.streak)}</div></div>
          <div className="premium-card"><p className="muted">Minutes</p><div className="stat-value">{formatNumber(stats.minutes)}</div></div>
        </div>
        <div className="grid grid-2" style={{ marginTop:'1.2rem' }}>
          <div className="premium-card"><h2>Weekly Activity</h2><ProgressChart values={(progress as any).weekly || []}/></div>
          {workouts[0] && <WorkoutCard workout={workouts[0]}/>} 
        </div>
      </section>
    </DashboardShell>
  );
}
