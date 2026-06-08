import { notFound } from 'next/navigation';
import Link from 'next/link';

import DashboardShell from '@/components/DashboardShell';
import { getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';

import type { Workout } from '@/types/workout';
import type { Program } from '@/types/program';

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [program, workouts] = await Promise.all([
    getProgramById(id),
    getWorkouts(),
  ]);

  if (!program) {
    notFound();
  }

  const typedProgram = program as Program;
  const typedWorkouts = workouts as Workout[];

  const programWorkouts: Workout[] = [];

  for (const wid of typedProgram.workouts as string[]) {
    const matchedWorkout = typedWorkouts.find(
      (workout: Workout) =>
        workout.id === wid || workout.slug === wid
    );

    if (matchedWorkout) {
      programWorkouts.push(matchedWorkout);
    }
  }

  return (
    <DashboardShell>
      <section
        className="grid grid-2"
        style={{ alignItems: 'start' }}
      >
        <article className="premium-card">
          <img
            src={imageUrl(typedProgram.image)}
            alt={typedProgram.title}
            className="hero-img"
          />

          <p className="eyebrow">
            {typedProgram.level}
          </p>

          <h1>{typedProgram.title}</h1>

          <p className="muted">
            {typedProgram.description}
          </p>

          <div className="metric-row">
            <span>{typedProgram.duration}</span>

            {'focus' in typedProgram && (
              <span>{typedProgram.focus}</span>
            )}

            <span>
              {typedProgram.workouts.length} workouts
            </span>
          </div>
        </article>

        <article className="premium-card">
          <h2>Program Workouts</h2>

          {programWorkouts.length === 0 ? (
            <p className="muted">
              No workouts available.
            </p>
          ) : (
            <div className="stack">
              {programWorkouts.map((workout: Workout) => (
                <Link
                  key={workout.id}
                  href={`/workouts/session?id=${
                    workout.slug || workout.id
                  }`}
                  className="mini-link"
                >
                  <div>
                    <strong>{workout.name}</strong>
                  </div>

                  <small>
                    {workout.duration} min
                  </small>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </DashboardShell>
  );
}
