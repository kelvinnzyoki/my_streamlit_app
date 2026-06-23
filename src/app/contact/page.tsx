import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="ff-landing-main">
        <section className="page-section" style={{ padding: 'clamp(2rem, 6vw, 5rem) 0' }}>
          <div className="premium-card">
            <p className="eyebrow">Contact FlowFit</p>
            <h1>Need help with your home fitness journey?</h1>
            <p className="muted" style={{ maxWidth: 760 }}>
              Reach out for account support, workout questions, feedback, partnerships, or technical issues affecting your FlowFit dashboard.
            </p>
          </div>
        </section>

        <section className="page-section" style={{ paddingBottom: '4rem' }}>
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <article className="premium-card">
              <h2>Support details</h2>
              <div className="mini-link"><strong>Email</strong><span>tam&amp;cc@cctamcc.site</span></div>
              <div className="mini-link"><strong>Phone</strong><span>+254748500065</span></div>
              <div className="mini-link"><strong>Location</strong><span>Nairobi, Kenya</span></div>
              <p className="muted">For faster help, include your account email, the page affected, and a short description of the issue.</p>
            </article>

            <article className="premium-card">
              <h2>What we can help with</h2>
              <div className="pill-row">
                <span className="pill">Login issues</span>
                <span className="pill">Workout logging</span>
                <span className="pill">Program progress</span>
                <span className="pill">AI Coach</span>
                <span className="pill">Payments</span>
                <span className="pill">Feedback</span>
              </div>
              <hr className="section-divider" />
              <p className="muted">You can also use the in-app feedback tool from your dashboard when logged in.</p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
