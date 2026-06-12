import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="ff-footer">
      <div className="ff-footer-inner">
        <div className="ff-footer-brand">
          <span className="ff-footer-logo">FlowFit</span>
          <p className="ff-footer-tagline">Train smart. Track progress. Achieve more.</p>
        </div>
        <nav className="ff-footer-links" aria-label="Footer navigation">
          <div className="ff-footer-col">
            <span className="ff-footer-col-title">Train</span>
            <Link href="/workouts">Workouts</Link>
            <Link href="/programs">Programs</Link>
            <Link href="/progress">Progress</Link>
          </div>
          <div className="ff-footer-col">
            <span className="ff-footer-col-title">Account</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/subscription">Subscription</Link>
          </div>
          <div className="ff-footer-col">
            <span className="ff-footer-col-title">App</span>
            <Link href="/">Home</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </div>
        </nav>
      </div>
      <p className="ff-footer-copy">© {new Date().getFullYear()} FlowFit. All rights reserved.</p>
    </footer>
  );
}
