import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const SECTIONS = [
  ['Information we collect', 'We may collect account details, profile information, workout logs, generated plans, progress metrics, feedback, device/session data, and payment-related metadata where applicable.'],
  ['How we use data', 'We use your data to authenticate your account, show dashboard progress, generate workout guidance, improve recommendations, provide support, and secure the platform.'],
  ['AI features', 'When you use AI Coach or Generate Plan, your prompts and relevant fitness context may be processed to produce helpful responses. Avoid submitting highly sensitive medical information.'],
  ['Payments', 'Payment providers may process transaction information. FlowFit should not store full card details.'],
  ['Security', 'We use reasonable technical and organizational measures to protect your data, including protected routes, authentication checks, and server-side access controls.'],
  ['Your choices', 'You may request support for account updates, correction, or deletion where applicable. Some logs may be retained where required for security, legal, or accounting reasons.'],
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="premium-card">
            <p className="eyebrow">Legal</p>
            <h1>Privacy Policy</h1>
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
