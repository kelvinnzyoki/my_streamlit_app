import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-section">
      <p className="eyebrow">FlowFit</p>
      <h1>Transform Your Body at Home</h1>
      <p className="muted">
        AI-powered home workouts, progress tracking, analytics, and personalized programs.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <Link href="/auth/register" className="primary-btn">
          Start Free
        </Link>
        <Link href="/workouts" className="secondary-btn">
          View Workouts
        </Link>
      </div>
    </main>
  );
}
