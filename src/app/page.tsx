import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import './landing-premium.patch.css';
import './global.css';

const PROGRAM_PREVIEWS = [
  {
    title: 'Structured Programs',
    desc: 'Goal-based plans with weeks, days, and guided sessions.',
    meta: 'Login to view plans',
    image: '/images/exercises/sprints (1).webp',
    href: '/auth/login?redirect=/programs',
    cta: 'Login to View',
  },
  {
    title: 'AI Workout Planning',
    desc: 'Generate focused training plans based on your goal and level.',
    meta: 'Create account first',
    image: '/images/exercises/lunges (1).webp',
    href: '/auth/login?redirect=/generate-plan',
    cta: 'Generate Plan',
  },
  {
    title: 'AI Coach & Analytics',
    desc: 'Ask the coach, review your progress, and adjust training with better feedback.',
    meta: 'Protected dashboard',
    image: '/images/exercises/squats.webp',
    href: '/auth/login?redirect=/ai-coach',
    cta: 'Open Coach',
  },
];

const WORKOUT_PREVIEWS = [
  {
    title: 'Strength',
    desc: 'Push-ups, squats, lunges, dips, and full-body strength blocks.',
    image: '/images/exercises/pushups.webp',
  },
  {
    title: 'Cardio',
    desc: 'Burpees, sprints, high knees, jumping jacks, and conditioning.',
    image: '/images/exercises/burpees (1).webp',
  },
  {
    title: 'Core',
    desc: 'Planks, crunches, leg raises, Russian twists, and stability work.',
    image: '/images/exercises/crunches (1).webp',
  },
  {
    title: 'Mobility',
    desc: 'Recovery sessions, stretches, posture, and joint-friendly movement.',
    image: '/images/exercises/downwarddog.webp',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="ff-landing-main">
        <section className="ff-landing-hero-wrap">
          <div className="hero-card ff-landing-hero">
            <div className="ff-hero-content">
              <p className="eyebrow ff-hero-eyebrow">AI Home Fitness Platform</p>

              <h1 className="hero-title ff-hero-title">
                Train smarter.<br />Track deeper.<br />Transform at home.
              </h1>

              <p className="muted ff-hero-text">
                FlowFit brings home workouts, analytics, progress tracking,
                programs, and AI coaching into one premium fitness dashboard.
              </p>

              <div className="ff-hero-actions">
                <Link href="/auth/register" className="primary-btn ff-premium-btn">
                  Start Free
                </Link>
                <Link href="/auth/login?redirect=/workouts" className="secondary-btn ff-glass-btn">
                  Explore Workouts
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="ff-public-section">
          <div className="page-section">
            <p className="eyebrow ff-section-eyebrow">Featured Programs</p>
            <h2 className="ff-section-title">Structured Training Plans</h2>
            <div className="grid grid-3">
              {PROGRAM_PREVIEWS.map((item) => (
                <Link key={item.title} href={item.href} className="premium-card ff-public-preview-card ff-image-preview-card">
                  <div className="ff-preview-image-wrap">
                    <img src={item.image} alt={item.title} className="ff-preview-image" />
                    <span className="ff-preview-shine" />
                  </div>
                  <div className="ff-preview-body">
                    <p className="eyebrow">{item.meta}</p>
                    <h3>{item.title}</h3>
                    <p className="muted">{item.desc}</p>
                    <span className="secondary-btn">{item.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ff-public-section">
          <div className="page-section">
            <p className="eyebrow ff-section-eyebrow">Popular Workouts</p>
            <h2 className="ff-section-title">Start a Quick Session</h2>
            <div className="grid grid-4">
              {WORKOUT_PREVIEWS.map((item) => (
                <Link key={item.title} href="/auth/login?redirect=/workouts" className="premium-card ff-public-preview-card ff-workout-preview-card ff-image-preview-card">
                  <div className="ff-preview-image-wrap ff-workout-image-wrap">
                    <img src={item.image} alt={`${item.title} workout`} className="ff-preview-image" />
                    <span className="ff-preview-shine" />
                  </div>
                  <div className="ff-preview-body">
                    <p className="eyebrow">Workout Category</p>
                    <h3>{item.title}</h3>
                    <p className="muted">{item.desc}</p>
                    <span className="primary-btn">Login to Start</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ff-public-section ff-final-cta-wrap">
          <div className="page-section">
            <div className="premium-card ff-final-cta">
              <p className="eyebrow ff-section-eyebrow">Get Started Today</p>
              <h2 className="ff-section-title">Your fitness journey starts now</h2>
              <p className="muted ff-cta-text">
                Free forever plan available. Upgrade anytime for AI coaching,
                advanced analytics, and personalised programs.
              </p>
              <Link href="/auth/register" className="primary-btn ff-premium-btn ff-inline-premium-btn">
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
