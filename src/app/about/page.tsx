import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';

const VALUES = [
  'No-equipment home training for real people with busy schedules.',
  'Progress tracking that turns small daily effort into visible momentum.',
  'AI guidance that keeps workouts practical, safe, and easy to follow.',
  'Simple programs for beginners, intermediate users, and advanced users.',
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="hero-card" style={{ minHeight: 360 }}>
            <p className="eyebrow">About FlowFit</p>
            <h1 className="hero-title">Home fitness built for consistency.</h1>
            <p className="muted">
              FlowFit is a home workout platform designed to help users train smarter, track deeper, and stay consistent without expensive gym equipment.
            </p>
            <div className="ff-hero-actions">
              <Link href="/auth/register" className="primary-btn">Start Free</Link>
              <Link href="/auth/login" className="secondary-btn">Login</Link>
            </div>
          </div>
        </section>

        <section className="page-section" style={{ paddingBottom: '3rem' }}>
          <div className="grid grid-2">
            <article className="premium-card">
              <p className="eyebrow">Mission</p>
              <h2>Make serious training simple at home</h2>
              <p className="muted">
                Our goal is to give every user a clean fitness system: workouts, programs, AI coaching, progress analytics, and recovery guidance in one protected dashboard.
              </p>
            </article>
            <article className="premium-card">
              <p className="eyebrow">Who it helps</p>
              <h2>Beginners, returners, and disciplined athletes</h2>
              <p className="muted">
                FlowFit supports anyone who wants structure. Whether you are starting from zero or improving your current routine, the platform keeps your training clear and measurable.
              </p>
            </article>
          </div>
        </section>

        <section className="page-section" style={{ paddingBottom: '4rem' }}>
          <div className="grid grid-4">
            {VALUES.map((value, index) => (
              <article key={value} className="premium-card">
                <p className="stat-value">0{index + 1}</p>
                <p className="muted">{value}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
