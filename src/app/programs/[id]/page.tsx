import Image from 'next/image';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { getProgram, programs } from '@/data/programs';
import { getWorkout } from '@/data/workouts';
import { imageUrl } from '@/lib/utils';

export function generateStaticParams() {
  return programs.map((program) => ({ id: program.slug }));
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getProgram(id);
  const programWorkouts = program.workouts.map(getWorkout);
  return (
    <DashboardShell>
      <section className="grid grid-2" style={{ alignItems:'start' }}>
        <div className="premium-card workout-card"><div className="workout-img" style={{ height:460 }}><Image src={imageUrl(program.image)} alt={program.title} fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div></div>
        <div className="premium-card"><p className="eyebrow">{program.focus}</p><h1 className="title">{program.title}</h1><p className="muted">{program.description}</p><div className="pill-row"><span className="pill">{program.level}</span><span className="pill">{program.duration}</span><span className="pill">{program.workouts.length} sessions</span></div><Link className="primary-btn" href={`/workouts/session?id=${program.workouts[0]}`}>Start Program</Link></div>
      </section>
      <section className="section"><p className="eyebrow">Program Workouts</p><div className="grid grid-3">{programWorkouts.map((workout) => <article className="card" key={workout.id}><h3>{workout.name}</h3><p className="muted">{workout.description}</p><Link className="secondary-btn" href={`/workouts/session?id=${workout.slug}`}>Open</Link></article>)}</div></section>
    </DashboardShell>
  );
}
