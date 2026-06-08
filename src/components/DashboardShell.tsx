'use client';
import Link from 'next/link';
import { Activity, BarChart3, Crown, Dumbbell, Home, Shield, User, Zap, type LucideIcon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const links: Array<[string, string, LucideIcon]> = [
  ['Dashboard','/dashboard',Home], ['Workouts','/workouts',Dumbbell], ['Programs','/programs',Zap], ['Progress','/progress',BarChart3], ['Subscription','/subscription',Crown], ['Profile','/profile',User], ['Admin','/admin',Shield]
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link href="/" className="side-logo">FlowFit</Link>
        {links.map(([label, href, Icon]) => <Link key={href} className="side-link" href={href}><Icon size={16}/>{label}</Link>)}
        <div className="card" style={{ marginTop:'1.4rem' }}>
          <Activity size={20} className="gold" />
          <p className="muted">AI Coach is ready to adjust today&apos;s workout using your progress, recovery, and consistency.</p>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div><p className="eyebrow">FlowFit Command Center</p><h1 className="title">Train smarter at home</h1></div>
          <div style={{ display:'flex', gap:'.65rem' }}><NotificationBell/><ThemeToggle/></div>
        </div>
        {children}
      </main>
    </div>
  );
}
