import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgramCard from '@/components/programCard';
import WorkoutCard from '@/components/workoutCard';
import { getPrograms, getWorkouts } from '@/lib/api';
import Link from 'next/link';

export default async function HomePage() {
  const [programs, workouts] = await Promise.all([getPrograms(), getWorkouts()]);

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section style={{ padding: 'clamp(1rem,3vw,2rem)', paddingTop: '1.5rem' }}>
          <div className="hero-card">
            <div>
              <p className="eyebrow">AI Home Fitness Platform</p>
              <h1 className="hero-title">
                Train smarter.<br />Track deeper.<br />Transform at home.
              </h1>
              <p className="muted" style={{ maxWidth: 620, marginBottom: '1.5rem' }}>
                FlowFit brings home workouts, analytics, progress tracking, programs,
                and AI coaching into one premium fitness dashboard.
              </p>
              <div className="metric-row" style={{ marginTop: 0 }}>
                <Link href="/auth/register" className="primary-btn">Start Free</Link>
                <Link href="/workouts" className="secondary-btn">Explore Workouts</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Programs ── */}
        <section style={{ padding: 'clamp(1rem,3vw,2rem)', paddingTop: '2rem' }}>
          <div className="page-section">
            <p className="eyebrow">Featured Programs</p>
            <h2 style={{ marginBottom: '1.25rem' }}>Structured Training Plans</h2>
            <div className="grid grid-3">
              {programs.slice(0, 3).map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Workouts ── */}
        <section style={{ padding: 'clamp(1rem,3vw,2rem)', paddingTop: '2rem' }}>
          <div className="page-section">
            <p className="eyebrow">Popular Workouts</p>
            <h2 style={{ marginBottom: '1.25rem' }}>Start a Quick Session</h2>
            <div className="grid grid-4">
              {workouts.slice(0, 4).map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: 'clamp(1rem,3vw,2rem)', paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="page-section">
            <div className="premium-card" style={{ textAlign: 'center', padding: 'clamp(2rem,4vw,3.5rem)' }}>
              <p className="eyebrow">Get Started Today</p>
              <h2 style={{ marginBottom: '0.75rem' }}>Your fitness journey starts now</h2>
              <p className="muted" style={{ maxWidth: 520, margin: '0 auto 1.5rem' }}>
                Free forever plan available. Upgrade anytime for AI coaching, advanced analytics,
                and personalised programs.
              </p>
              <Link href="/auth/register" className="primary-btn" style={{ display: 'inline-flex' }}>
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
