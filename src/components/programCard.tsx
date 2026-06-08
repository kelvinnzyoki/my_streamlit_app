import Image from 'next/image';
import Link from 'next/link';
import type { Program } from '@/types/program';
import { imageUrl } from '@/lib/utils';

export default function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="premium-card workout-card">
      <div className="workout-img"><Image src={imageUrl(program.image)} alt={program.title} fill sizes="(max-width: 900px) 100vw, 33vw" /></div>
      <div className="workout-body">
        <p className="eyebrow">{program.focus}</p>
        <h3>{program.title}</h3>
        <p className="muted">{program.description}</p>
        <div className="pill-row"><span className="pill">{program.level}</span><span className="pill">{program.duration}</span><span className="pill">{program.workouts.length} workouts</span></div>
        <Link className="secondary-btn" href={`/programs/${program.slug}`}>Open Program</Link>
      </div>
    </article>
  );
}
