import { Brain, CalendarCheck, Flame, Gauge, Trophy, type LucideIcon } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';

const stats: Array<[string, string, string, LucideIcon]> = [
  ['Today Score','92%','Strong readiness',Gauge], ['Calories','640','burned this week',Flame], ['Streak','12','days active',CalendarCheck], ['Rank','Top 8%','FlowFit members',Trophy]
];

export default function DashboardPage() {
  return (
    <DashboardShell>
      <section className="grid stats">{stats.map(([label,value,sub,Icon]) => <article className="card" key={label}><Icon size={22} className="gold"/><p className="muted">{label}</p><div className="stat-value">{value}</div><p className="muted">{sub}</p></article>)}</section>
      <section className="section grid grid-2">
        <article className="premium-card"><p className="eyebrow">Weekly Training Load</p><ProgressChart data={[45,58,62,71,68,86,93]}/></article>
        <article className="premium-card"><Brain className="gold"/><h2>AI Coach Summary</h2><p className="muted">Your consistency is improving. Keep today&apos;s session moderate, then push intensity tomorrow with jump squats and mountain climbers.</p><button className="primary-btn">Open AI Coach</button></article>
      </section>
    </DashboardShell>
  );
}
