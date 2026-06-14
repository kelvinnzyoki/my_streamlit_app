import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgramCard from '@/components/programCard';
import WorkoutCard from '@/components/workoutCard';
import { getPrograms, getWorkouts } from '@/lib/api';

export default async function HomePage() {
  const [programsResult, workoutsResult] = await Promise.allSettled([
    getPrograms(),
    getWorkouts(),
  ]);

  const programs =
    programsResult.status === 'fulfilled' && Array.isArray(programsResult.value)
      ? programsResult.value
      : [];

  const workouts =
    workoutsResult.status === 'fulfilled' && Array.isArray(workoutsResult.value)
      ? workoutsResult.value
      : [];

  return (
    <>
      <Navbar />

      <main className="ff-home">
        {/* ── Hero ── */}
        <section className="ff-landing-hero-wrap">
          <div className="hero-card ff-landing-hero">
            <div className="ff-hero-content">
              <p className="eyebrow ff-hero-eyebrow">
                AI Home Fitness Platform
              </p>

              <h1 className="hero-title ff-hero-title">
                Train smarter.
                <br />
                Track deeper.
                <br />
                Transform at home.
              </h1>

              <p className="muted ff-hero-text">
                FlowFit brings home workouts, analytics, progress tracking,
                programs, and AI coaching into one premium fitness dashboard.
              </p>

              <div className="ff-hero-actions">
                <Link href="/auth/register" className="primary-btn ff-premium-btn">
                  Start Free
                </Link>

                <Link href="/workouts" className="secondary-btn ff-glass-btn">
                  Explore Workouts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Programs ── */}
        <section className="ff-public-section">
          <div className="page-section">
            <p className="eyebrow ff-section-eyebrow">Featured Programs</p>
            <h2 className="ff-section-title">Structured Training Plans</h2>

            <div className="grid grid-3">
              {programs.slice(0, 3).map((p: any) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Workouts ── */}
        <section className="ff-public-section">
          <div className="page-section">
            <p className="eyebrow ff-section-eyebrow">Popular Workouts</p>
            <h2 className="ff-section-title">Start a Quick Session</h2>

            <div className="grid grid-4">
              {workouts.slice(0, 4).map((w: any) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ff-public-section ff-final-cta-wrap">
          <div className="page-section">
            <div className="premium-card ff-final-cta">
              <p className="eyebrow ff-section-eyebrow">Get Started Today</p>

              <h2 className="ff-section-title">
                Your fitness journey starts now
              </h2>

              <p className="muted ff-cta-text">
                Free forever plan available. Upgrade anytime for AI coaching,
                advanced analytics, and personalised programs.
              </p>

              <Link href="/auth/register" className="primary-btn ff-premium-btn">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
