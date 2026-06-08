import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <DashboardShell><section className="page-section"><p className="eyebrow">Programs</p><h1>Structured Training Plans</h1><div className="grid grid-3">{programs.map((p)=><ProgramCard key={p.id} program={p}/>)}</div></section></DashboardShell>;
}
