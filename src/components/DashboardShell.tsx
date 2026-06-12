'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
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
        <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="flowfitShellLogoGradient" x1="7" y1="5" x2="41" y2="43" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8C96A" />
              <stop offset="48%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#8E6E28" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="15" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.34)" />
          <path d="M10 27h6l4-13 6 24 6-30 4 19h2" stroke="url(#flowfitShellLogoGradient)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="38" cy="27" r="3.2" fill="url(#flowfitShellLogoGradient)" />
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
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = useMemo(() => (user?.name || user?.fullName || user?.email || 'F')[0].toUpperCase(), [user]);
  const planLabel = user?.plan || 'Free';

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open || confirmLogout);
    return () => document.body.classList.remove('sidebar-open');
  }, [open, confirmLogout]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function confirmAndLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setConfirmLogout(false);
      setOpen(false);
      router.replace('/auth/login');
    } finally {
      setLoggingOut(false);
    }
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
          <button className="logout-btn" type="button" onClick={() => setConfirmLogout(true)}>
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

      {confirmLogout && (
        <div className="ff-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="ff-confirm-box">
            <span className="ff-confirm-icon">⚠</span>
            <h2 id="logout-title" className="ff-confirm-title">Log out of FlowFit?</h2>
            <p className="ff-confirm-msg">
              Your current session will end. Make sure any unsaved workout notes or profile changes are saved first.
            </p>
            <div className="ff-confirm-actions">
              <button className="ff-confirm-cancel" type="button" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
                Stay Logged In
              </button>
              <button className="ff-confirm-ok danger" type="button" onClick={confirmAndLogout} disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
