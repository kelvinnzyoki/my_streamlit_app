'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Bot,
  CalendarPlus,
  CreditCard,
  Dumbbell,
  Grid3X3,
  Home,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', Icon: Home },
  { label: 'AI Coach', href: '/coach', Icon: Bot },
  { label: 'Generate Plan', href: '/generate-plan', Icon: CalendarPlus },
  { label: 'Programs', href: '/programs', Icon: Grid3X3 },
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell },
  { label: 'Progress', href: '/progress', Icon: BarChart3 },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Profile', href: '/profile', Icon: User },
  { label: 'Admin', href: '/admin', Icon: Shield },
] as const;

function FlowFitLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="ff-logo" aria-label="FlowFit">
      <span className="ff-logo-mark">
        <svg viewBox="0 0 44 44" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="flowfitLogoGradient" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8C96A" />
              <stop offset="50%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#8E6E28" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="38" height="38" rx="13" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.34)" />
          <path d="M9 24h5l3-10 5 19 5-23 4 14h4" stroke="url(#flowfitLogoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="34" cy="24" r="3" fill="url(#flowfitLogoGradient)" />
        </svg>
      </span>
      {!compact && (
        <span className="ff-logo-text">
          <span>Flow</span>
          <strong>Fit</strong>
        </span>
      )}
    </span>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initial = useMemo(() => (user?.name || user?.fullName || user?.email || 'F')[0].toUpperCase(), [user]);
  const planLabel = user?.plan || 'Free';

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open);
    return () => document.body.classList.remove('sidebar-open');
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace('/auth/login');
  }

  return (
    <div className="app-shell">
      {!open && (
        <button className="mobile-menu-btn" type="button" onClick={() => setOpen(true)} aria-label="Open sidebar menu">
          <Menu size={20} />
        </button>
      )}

      <button
        className={`sidebar-backdrop ${open ? 'sidebar-backdrop-open' : ''}`}
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close sidebar menu"
      />

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="FlowFit navigation">
        <div className="sidebar-brand-row">
          <Link href="/dashboard" className="sidebar-logo-link" aria-label="FlowFit dashboard">
            <FlowFitLogo />
          </Link>
          <button className="sidebar-close-btn" type="button" onClick={() => setOpen(false)} aria-label="Close sidebar">
            <X size={17} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Dashboard pages">
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon className="nav-icon" size={17} />
                <span className="nav-text">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <section className="sidebar-user-card" aria-label="User account">
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-info">
              <strong>{user?.name || user?.fullName || 'FlowFit User'}</strong>
              <span>{user?.email || 'No email'}</span>
            </div>
          </div>
          <span className={`plan-badge plan-${String(planLabel).toLowerCase()}`}>{planLabel} Plan</span>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </section>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-copy">
            <p className="eyebrow">FlowFit</p>
            <strong>{user?.name || user?.fullName || 'Welcome back'}</strong>
          </div>
          <div className="top-actions">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
