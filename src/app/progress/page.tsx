'use client';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { useProgress } from '@/hooks/useProgress';

export default function ProgressPage() {
  const { weekly, stats } = useProgress();
  return (
    <DashboardShell>
      <section><p className="eyebrow">Analytics</p><h1 className="title">Progress Tracking</h1><p className="muted">Optimized lightweight charting to avoid the hanging graph issue from the original HTML.</p></section>
      <section className="grid stats" style={{ marginTop:'2rem' }}>{stats.map((stat) => <article className="card" key={stat.label}><p className="muted">{stat.label}</p><div className="stat-value">{stat.value}</div><p className="muted">{stat.sub}</p></article>)}</section>
      <section className="section"><article className="premium-card"><p className="eyebrow">Weekly Score</p><ProgressChart data={weekly}/></article></section>
    </DashboardShell>
  );
}
