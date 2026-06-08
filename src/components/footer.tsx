import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-3">
        <div><div className="side-logo">FlowFit</div><p className="muted">No-equipment home workouts powered by AI, analytics, and premium progress tracking.</p></div>
        <div><strong className="gold">Platform</strong><p><Link href="/workouts">Workouts</Link></p><p><Link href="/programs">Programs</Link></p><p><Link href="/progress">Progress</Link></p></div>
        <div><strong className="gold">Legal</strong><p><Link href="/legal/privacy">Privacy Policy</Link></p><p><Link href="/legal/terms">Terms</Link></p><p><Link href="/legal/cookies">Cookies</Link></p></div>
      </div>
      <div className="container muted" style={{ marginTop:'2rem' }}>© 2026 FlowFit. All rights reserved.</div>
    </footer>
  );
}
