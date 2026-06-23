import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const SECTIONS = [
  ['What cookies are', 'Cookies and similar technologies are small files or browser storage items used to remember sessions, preferences, and security state.'],
  ['How FlowFit uses cookies', 'We may use cookies or local/session storage for login sessions, theme preference, authentication state, security checks, and basic platform functionality.'],
  ['Essential cookies', 'Some cookies are required for protected pages, dashboard access, workout logging, and account security. Disabling them may break key features.'],
  ['Analytics and improvements', 'FlowFit may use limited usage data to understand performance, fix bugs, and improve user experience.'],
  ['Managing cookies', 'You can control cookies through your browser settings, but blocking essential cookies may prevent login and protected-route access.'],
];

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="premium-card">
            <p className="eyebrow">Legal</p>
            <h1>Cookie Policy</h1>
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
