'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
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
  { label: 'Programs', href: '/programs', Icon: Grid3X3 },
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell },
  { label: 'Progress', href: '/progress', Icon: BarChart3 },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Profile', href: '/profile', Icon: User },
  { label: 'Admin', href: '/admin', Icon: Shield },
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.name || user?.fullName || 'FlowFit User';
  const displayEmail = user?.email || 'flowfit member';
  const initial = (displayName || displayEmail || 'F')[0].toUpperCase();
  const planLabel = user?.plan || 'Free';

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open);
    return () => document.body.classList.remove('sidebar-open');
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.push('/auth/login');
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
      setOpen(false);
    }
  }

  return (
    <div className="app-shell ff-app-shell">
      <button
        className="mobile-menu-btn ff-mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar menu"
        aria-expanded={open}
      >
        <Menu size={21} />
      </button>

      {open && (
        <button
          className="sidebar-backdrop ff-sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar menu"
        />
      )}

      <aside className={`sidebar ff-sidebar ${open ? 'sidebar-open' : ''}`} aria-label="FlowFit dashboard navigation">
        <div className="ff-sidebar-head">
          <Link href="/dashboard" className="ff-sidebar-brand" onClick={() => setOpen(false)} aria-label="FlowFit dashboard">
            <span className="ff-sidebar-brand-mark" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 42 42" fill="none">
                <defs>
                  <linearGradient id="ffSidebarPulse" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F5DC83" />
                    <stop offset="52%" stopColor="#C9A84C" />
                    <stop offset="100%" stopColor="#8E6E28" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="34" height="34" rx="12" stroke="url(#ffSidebarPulse)" strokeWidth="1.8" opacity="0.8" />
                <polyline
                  points="7,22 12,22 15,12 18,31 21,16 24,25 27,22 35,22"
                  stroke="url(#ffSidebarPulse)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="ff-sidebar-wordmark">
              <span>Flow</span>
              <strong>Fit</strong>
            </span>
          </Link>

          <button className="ff-sidebar-close" onClick={() => setOpen(false)} aria-label="Close sidebar">
            <X size={17} />
          </button>
        </div>

        <nav className="nav-list ff-sidebar-nav">
          {NAV.map(({ label, href, Icon }) => {
            const active = path === href || (href !== '/dashboard' && path?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ff-sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon className="ff-sidebar-link-icon" size={18} />
                <span className="ff-sidebar-link-text">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ff-sidebar-grow" />

        <section className="ff-sidebar-user-card" aria-label="Current account">
          <div className="ff-sidebar-user-main">
            <div className="ff-sidebar-avatar">{initial}</div>
            <div className="ff-sidebar-user-text">
              <strong title={displayName}>{displayName}</strong>
              <span title={displayEmail}>{displayEmail}</span>
            </div>
          </div>

          <div className="ff-sidebar-plan-row">
            <span className="ff-sidebar-plan-badge">{planLabel} Plan</span>
          </div>

          <button
            className="ff-sidebar-logout"
            onClick={() => setConfirmLogout(true)}
            type="button"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </section>
      </aside>

      {confirmLogout && (
        <div className="ff-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="ff-confirm-box">
            <span className="ff-confirm-icon" aria-hidden="true">⚠</span>
            <h2 id="logout-title" className="ff-confirm-title">Logout?</h2>
            <p className="ff-confirm-msg">
              You are about to leave your FlowFit session. Any unsaved form changes may be lost.
            </p>
            <div className="ff-confirm-actions">
              <button className="ff-confirm-cancel" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
                Stay
              </button>
              <button className="ff-confirm-ok danger" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-panel ff-main-panel">
        <header className="topbar ff-topbar">
          <div className="topbar-copy">
            <p className="eyebrow">FlowFit</p>
            <strong>{displayName || 'Welcome back'}</strong>
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
