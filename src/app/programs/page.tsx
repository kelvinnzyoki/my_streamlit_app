import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { programs } from '@/data/programs';

export default function ProgramsPage() {
  return (
    <DashboardShell>
      <section>
        <div className="page-head"><div><p className="eyebrow">Training Programs</p><h1 className="title">Programs</h1><p className="muted">Structured FlowFit programs rebuilt from the HTML concept into scalable React cards.</p></div></div>
        <div className="grid grid-4">{programs.map((program) => <ProgramCard key={program.id} program={program}/>)}</div>
      </section>
    </DashboardShell>
  );
}
