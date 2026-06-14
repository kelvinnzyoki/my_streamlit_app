import Link from 'next/link';
import { CalendarDays, Dumbbell, Layers3 } from 'lucide-react';
import { imageUrl } from '@/lib/utils';
import type { Program } from '@/types/program';

function countExercises(program: any) {
  if (typeof program.totalExercises === 'number') return program.totalExercises;
  if (Array.isArray(program.weeks)) {
    return program.weeks.reduce((sum: number, week: any) => sum + (week.days || []).reduce((daySum: number, day: any) => daySum + (day.exercises || []).length, 0), 0);
  }
  return Array.isArray(program.workouts) ? program.workouts.length : 0;
}

function countDays(program: any) {
  if (typeof program.totalDays === 'number') return program.totalDays;
  if (Array.isArray(program.weeks)) return program.weeks.reduce((sum: number, week: any) => sum + (week.days || []).length, 0);
  const weeks = Number(program.durationWeeks || 0);
  const days = Number(program.daysPerWeek || 0);
  return weeks && days ? weeks * days : 0;
}

export default function ProgramCard({ program }: { program: Program & any }) {
  const href = `/programs/${encodeURIComponent(program.slug || program.id)}`;
  const exerciseCount = countExercises(program);
  const dayCount = countDays(program);
  const weeks = Number(program.durationWeeks || program.totalWeeks || 1);

  return (
    <article className="premium-card content-card program-card">
      <img src={imageUrl(program.image)} alt={program.title || program.name || 'FlowFit Program'} className="card-img" loading="lazy" />

      <div className="card-body">
        <p className="eyebrow">{program.level || program.difficulty || 'Program'}</p>
        <h3>{program.title || program.name}</h3>
        <p className="muted clamp-3">{program.description}</p>

        <div className="metric-row">
          <span><CalendarDays size={13} /> {weeks} week{weeks === 1 ? '' : 's'}</span>
          <span><Layers3 size={13} /> {dayCount || program.daysPerWeek || 1} day{dayCount === 1 ? '' : 's'}</span>
          <span><Dumbbell size={13} /> {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}</span>
          {program.focus && <span>{program.focus}</span>}
        </div>

        {program.scheduleSource && (
          <p className="muted" style={{ fontSize: '0.74rem', marginTop: '0.75rem' }}>
            Schedule source: {program.scheduleSource === 'database' ? 'saved plan' : program.scheduleSource === 'metadata.aiPlan' ? 'AI metadata' : 'FlowFit template'}
          </p>
        )}

        <Link href={href} className="secondary-btn card-btn">View Program</Link>
      </div>
    </article>
  );
}
