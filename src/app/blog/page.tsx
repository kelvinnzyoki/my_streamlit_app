import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';

const POSTS = [
  {
    title: 'How to stay consistent with home workouts',
    tag: 'Consistency',
    body: 'Start with short sessions, track completion, and increase difficulty only after your routine feels natural.',
  },
  {
    title: 'Why progress tracking matters',
    tag: 'Analytics',
    body: 'Seeing workouts, calories, streaks, and minutes helps you connect effort with results and avoid guessing.',
  },
  {
    title: 'Beginner mistakes to avoid',
    tag: 'Training',
    body: 'Skipping warm-ups, doing too much too soon, and ignoring recovery are common reasons people stop early.',
  },
  {
    title: 'How AI coaching can guide your training',
    tag: 'AI Coach',
    body: 'A good coach helps you choose the next session, correct form, manage fatigue, and keep your plan realistic.',
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="premium-card">
            <p className="eyebrow">FlowFit Blog</p>
            <h1>Training tips for smarter home fitness.</h1>
            <p className="muted" style={{ maxWidth: 760 }}>
              Practical guidance on workouts, recovery, progress tracking, and using AI to build a sustainable home training habit.
            </p>
          </div>
        </section>

        <section className="page-section" style={{ paddingBottom: '4rem' }}>
          <div className="grid grid-2">
            {POSTS.map((post) => (
              <article key={post.title} className="premium-card content-card">
                <p className="eyebrow">{post.tag}</p>
                <h2>{post.title}</h2>
                <p className="muted">{post.body}</p>
                <Link href="/auth/register" className="secondary-btn card-btn">Train with FlowFit</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
