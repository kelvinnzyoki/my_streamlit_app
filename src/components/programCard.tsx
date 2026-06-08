import Link from 'next/link';
import type { Program } from '@/types/program';
import { imageUrl } from '@/lib/utils';

export default function ProgramCard({ program }: { program: Program }) {
  const id = program.slug || program.id;
  return (
    <article className="premium-card">
      <img className="card-img" src={imageUrl(program.image)} alt={program.title}/>
      <p className="eyebrow">{program.level}</p>
      <h3>{program.title}</h3>
      <p className="muted">{program.description}</p>
      <div className="pill-row"><span className="pill">{program.duration}</span><span className="pill">{program.focus || 'Full body'}</span></div>
      <Link className="primary-btn" href={`/programs/${id}`}>View Program</Link>
    </article>
  );
}
