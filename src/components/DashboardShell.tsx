'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, BarChart3, CreditCard, Dumbbell, Home, LogOut, Shield, User, Grid3X3 } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  ['Dashboard','/dashboard', Home],
  ['Programs','/programs', Grid3X3],
  ['Workouts','/workouts', Dumbbell],
  ['Progress','/progress', BarChart3],
  ['Subscription','/subscription', CreditCard],
  ['Profile','/profile', User],
  ['Admin','/admin', Shield],
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand"><span className="brand-mark">F</span><span className="brand-text">FlowFit</span></Link>
        <nav className="nav-list">
          {nav.map(([label, href, Icon]) => <Link key={href} href={href} className={`nav-link ${path === href ? 'active' : ''}`}><Icon size={17}/>{label}</Link>)}
        </nav>
        <div className="premium-card" style={{ marginTop:'2rem' }}>
          <p className="eyebrow">Signed In</p>
          <p style={{ wordBreak:'break-word' }}>{user?.email || 'Guest session'}</p>
          <button className="secondary-btn" style={{ width:'100%', marginTop:'.8rem' }} onClick={async()=>{ await logout(); router.push('/auth/login'); }}><LogOut size={16}/> Logout</button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div><p className="eyebrow">FlowFit Command</p><strong>{user?.name || user?.fullName || 'Welcome back'}</strong></div>
          <div className="top-actions"><NotificationBell/><ThemeToggle/></div>
        </header>
        {children}
      </main>
    </div>
  );
}
