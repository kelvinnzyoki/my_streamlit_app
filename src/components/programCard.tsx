import Link from 'next/link';
import { CalendarDays, CheckCircle2, Dumbbell, Layers3, LockKeyhole, PlayCircle, Sparkles } from 'lucide-react';
import type { Program } from '@/types/program';

const PROGRAM_IMAGE_BY_TITLE: Record<string, string> = {
  'beginner foundation': '/images/exercises/squats.webp',
  'fat burn hiit': '/images/exercises/burpees1 (1).webp',
  'core power': '/images/exercises/plank.webp',
  'full body strength': '/images/exercises/pushups.webp',
  'elite conditioning': '/images/exercises/sprints (1).webp',
  'athletic engine': '/images/exercises/boxjumps.webp',
  'lean muscle builder': '/images/exercises/tricepdips.webp',
  '30-minute shred': '/images/exercises/mountainclimbers.webp',
  'joint strong reset': '/images/exercises/childpose.webp',
  'elite core athlete': '/images/exercises/russiantwists.webp',
  'home hybrid performance': '/images/fit1 (1).webp',
};

const PROGRAM_IMAGE_BY_CATEGORY: Record<string, string> = {
  strength: '/images/exercises/pushups.webp',
  hiit: '/images/exercises/burpees1 (1).webp',
  core: '/images/exercises/plank.webp',
  mobility: '/images/exercises/downwarddog.webp',
  conditioning: '/images/exercises/sprints (1).webp',
  cardio: '/images/exercises/highknees.webp',
  general_fitness: '/images/fit1 (1).webp',
};

function pickProgramImage(program: any) {
  if (program.image || program.imageUrl || program.coverImage) {
    return program.image || program.imageUrl || program.coverImage;
  }

  const titleKey = String(program.title || program.name || '').toLowerCase();
  if (PROGRAM_IMAGE_BY_TITLE[titleKey]) return PROGRAM_IMAGE_BY_TITLE[titleKey];

  const category = String(program.category || program.focus || 'general_fitness').toLowerCase();
  return PROGRAM_IMAGE_BY_CATEGORY[category] || PROGRAM_IMAGE_BY_CATEGORY.general_fitness;
}

function countExercises(program: any) {
  if (typeof program.totalExercises === 'number') return program.totalExercises;

  if (Array.isArray(program.weeks)) {
    return program.weeks.reduce(
      (sum: number, week: any) =>
        sum + (week.days || []).reduce(
          (daySum: number, day: any) => daySum + (day.exercises || []).length,
          0,
        ),
      0,
    );
  }

  return Array.isArray(program.workouts) ? program.workouts.length : 0;
}

function countDays(program: any) {
  if (typeof program.totalDays === 'number') return program.totalDays;

  if (Array.isArray(program.weeks)) {
    return program.weeks.reduce(
      (sum: number, week: any) => sum + (week.days || []).length,
      0,
    );
  }

  const weeks = Number(program.durationWeeks || program.totalWeeks || 0);
  const days = Number(program.daysPerWeek || 0);

  return weeks && days ? weeks * days : 0;
}

function normalizeLabel(value: unknown, fallback = 'Program') {
  return String(value || fallback).replace(/[_-]+/g, ' ');
}

export default function ProgramCard({ program }: { program: Program & any }) {
  const href = `/programs/${encodeURIComponent(program.slug || program.id)}`;

  const title = program.title || program.name || 'FlowFit Program';
  const level = normalizeLabel(program.level || program.difficulty || 'Beginner');
  const focus = normalizeLabel(program.focus || program.category || 'General Fitness');
  const weeks = Number(program.durationWeeks || program.totalWeeks || 1);
  const days = countDays(program);
  const exerciseCount = countExercises(program);

  const isEnrolled = Boolean(
    program.isEnrolled ||
    program.enrolled ||
    program.activeEnrollment ||
    program.currentEnrollment ||
    program.enrollment,
  );

  const progress = Number(
    program.enrollmentProgress ??
    program.progress ??
    program.activeEnrollment?.progress ??
    program.currentEnrollment?.progress ??
    0,
  );

  const safeProgress = Number.isFinite(progress)
    ? Math.max(0, Math.min(100, Math.round(progress)))
    : 0;

  return (
    <article className={`premium-card content-card ff-program-card ${isEnrolled ? 'is-enrolled' : ''}`}>
      <div className="ff-card-media">
        <img
          src={pickProgramImage(program)}
          alt={title}
          className="ff-card-img"
          loading="lazy"
        />

        <div className="ff-card-shade" />

        <div className="ff-card-topline">
          <span className="ff-card-badge">
            <Sparkles size={13} />
            {level}
          </span>

          {isEnrolled ? (
            <span className="ff-enrolled-badge">
              <CheckCircle2 size={13} />
              Enrolled
            </span>
          ) : (
            <span className="ff-card-badge muted-badge">
              <LockKeyhole size={13} />
              Available
            </span>
          )}
        </div>

        <div className="ff-card-media-title">
          <p>{focus}</p>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="ff-card-body">
        <p className="ff-card-desc">{program.description || 'A structured FlowFit training plan built for steady progress.'}</p>

        <div className="ff-meta-grid">
          <span>
            <CalendarDays size={15} />
            <strong>{weeks}</strong>
            <small>{weeks === 1 ? 'week' : 'weeks'}</small>
          </span>

          <span>
            <Layers3 size={15} />
            <strong>{days || program.daysPerWeek || 1}</strong>
            <small>{(days || program.daysPerWeek) === 1 ? 'day' : 'days'}</small>
          </span>

          <span>
            <Dumbbell size={15} />
            <strong>{exerciseCount}</strong>
            <small>{exerciseCount === 1 ? 'exercise' : 'exercises'}</small>
          </span>
        </div>

        {isEnrolled && (
          <div className="ff-program-progress">
            <div className="ff-program-progress-head">
              <span>Program progress</span>
              <strong>{safeProgress}%</strong>
            </div>
            <div className="ff-program-progress-track">
              <i style={{ width: `${safeProgress}%` }} />
            </div>
          </div>
        )}

        <div className="ff-card-actions">
          <Link href={href} className={isEnrolled ? 'primary-btn ff-card-btn' : 'secondary-btn ff-card-btn'}>
            {isEnrolled ? (
              <>
                <PlayCircle size={16} />
                Continue Program
              </>
            ) : (
              'View Program'
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}
