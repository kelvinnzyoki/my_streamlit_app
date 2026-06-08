import { notFound } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [program, workouts] = await Promise.all([getProgramById(id), getWorkouts()]);
  if (!program) notFound();
  const programWorkouts = program.workouts.map((wid) => workouts.find((w) => w.id === wid || w.slug === wid)).filter(Boolean);
  return (
    <DashboardShell>
      <section className="grid grid-2" style={{ alignItems:'start' }}>
        <article className="premium-card"><img className="hero-img" src={imageUrl(program.image)} alt={program.title}/><p className="eyebrow">{program.level}</p><h1>{program.title}</h1><p className="muted">{program.description}</p><div className="metric-row"><span>{program.duration}</span><span>{program.focus || 'Full Body'}</span><span>{program.workouts.length} workouts</span></div></article>
        <article className="premium-card"><h2>Program Workouts</h2>{programWorkouts.map((workout) => workout && <Link key={workout.id} href={`/workouts/session?id=${workout.slug || workout.id}`} className="mini-link"><span>{workout.name}</span><small>{workout.duration} min</small></Link>)}</article>
      </section>
    </DashboardShell>
  );
}
