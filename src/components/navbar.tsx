import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  return (
    <nav className="public-nav">
      <Link href="/" className="brand" style={{ margin:0 }}><span className="brand-mark">F</span><span className="brand-text">FlowFit</span></Link>
      <div className="public-links">
        <Link href="/programs">Programs</Link><Link href="/workouts">Workouts</Link><Link href="/progress">Progress</Link><Link href="/auth/login">Login</Link><Link href="/auth/register" className="primary-btn">Start</Link><ThemeToggle/>
      </div>
    </nav>
  );
}
