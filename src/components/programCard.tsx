import Link from 'next/link';
import { imageUrl } from '@/lib/utils';
import type { Program } from '@/types/program';

type SafeProgram = Program & {
  name?: string;
  title?: string;
  slug?: string;
  workouts?: string[];
  workoutIds?: string[];
};

export default function ProgramCard({ program }: { program: SafeProgram }) {
  const title = program.title || program.name || 'Untitled Program';
  const href = `/programs/${program.slug || program.id}`;
  const workouts = Array.isArray(program.workouts)
    ? program.workouts
    : Array.isArray(program.workoutIds)
      ? program.workoutIds
      : [];

  return (
    <article className="premium-card content-card program-art-card">
      <img
        src={imageUrl(program.image)}
        alt={title}
        className="card-img"
        loading="lazy"
      />
      <div className="card-body">
        <p className="eyebrow">{program.level || 'All Levels'}</p>
        <h3>{title}</h3>
        <p className="muted clamp-3">{program.description || 'Structured FlowFit training plan for home workouts.'}</p>
        <div className="metric-row">
          <span>{program.duration || 'Flexible'}</span>
          {program.focus && <span>{program.focus}</span>}
          <span>{workouts.length} workouts</span>
        </div>
        <Link href={href} className="secondary-btn card-btn">
          View Program
        </Link>
      </div>
    </article>
  );
}
