import Link from 'next/link';
import { imageUrl } from '@/lib/utils';
import type { Program } from '@/types/program';

export default function ProgramCard({ program }: { program: Program }) {
  const href = `/programs/${encodeURIComponent(program.slug || program.id)}`;
  const count = Array.isArray(program.workouts) ? program.workouts.length : 0;
  return (
    <article className="premium-card content-card program-card">
      <img src={imageUrl(program.image)} alt={program.title} className="card-img" loading="lazy" />
      <div className="card-body">
        <p className="eyebrow">{program.level || 'Program'}</p>
        <h3>{program.title}</h3>
        <p className="muted clamp-3">{program.description}</p>
        <div className="metric-row">
          <span>{program.duration || 'Structured plan'}</span>
          {program.focus && <span>{program.focus}</span>}
          <span>{count} workouts</span>
        </div>
        <Link href={href} className="secondary-btn card-btn">View Program</Link>
      </div>
    </article>
  );
}
