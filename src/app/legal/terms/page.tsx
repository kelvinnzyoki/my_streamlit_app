import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const SECTIONS = [
  ['Use of FlowFit', 'FlowFit provides home workout programs, workout logging, progress analytics, AI coaching, and related fitness tools. You agree to use the platform lawfully and responsibly.'],
  ['Health notice', 'FlowFit does not replace professional medical advice. Stop exercising and seek professional help if you experience pain, dizziness, chest discomfort, or unusual symptoms.'],
  ['Accounts', 'You are responsible for keeping your login details secure and for activity performed through your account.'],
  ['Subscriptions', 'FlowFit may offer paid plans, trials, renewals, or payment features. Making the website free does not remove the subscription system; it only means access may temporarily be unrestricted.'],
  ['AI Coach', 'AI responses are guidance only. Always apply your judgment and adapt workouts to your fitness level, equipment, and health condition.'],
  ['Limitations', 'We aim to keep FlowFit reliable, but we do not guarantee uninterrupted service or error-free functionality.'],
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="premium-card">
            <p className="eyebrow">Legal</p>
            <h1>Terms of Service</h1>
            <p className="muted">Last updated: June 2026</p>
          </div>
        </section>
        <section className="page-section" style={{ paddingBottom: '4rem' }}>
          <div className="grid" style={{ gap: '1rem' }}>
            {SECTIONS.map(([title, body]) => (
              <article key={title} className="premium-card">
                <h2>{title}</h2>
                <p className="muted">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
