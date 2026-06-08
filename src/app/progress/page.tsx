'use client';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { useProgress } from '@/hooks/useProgress';
import { formatNumber } from '@/lib/utils';

export default function ProgressPage() {
  const { progress, loading } = useProgress();
  const summary = progress?.summary || {};
  return <DashboardShell><section className="page-section"><p className="eyebrow">Progress Analytics</p><h1>Your Performance Trend</h1>{loading ? <p className="muted">Loading progress...</p> : <><div className="grid grid-4"><div className="premium-card"><p className="muted">Workouts</p><div className="stat-value">{formatNumber(summary.workouts)}</div></div><div className="premium-card"><p className="muted">Calories</p><div className="stat-value">{formatNumber(summary.calories)}</div></div><div className="premium-card"><p className="muted">Streak</p><div className="stat-value">{formatNumber(summary.streak)}</div></div><div className="premium-card"><p className="muted">Completion</p><div className="stat-value">{formatNumber(summary.completion)}%</div></div></div><div className="premium-card" style={{ marginTop:'1.2rem' }}><h2>Weekly Trend</h2><ProgressChart values={progress?.weekly || []}/></div></>}</section></DashboardShell>;
}
