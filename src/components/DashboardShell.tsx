'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Dumbbell,
  Grid3X3,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', Icon: Home },
  { label: 'Programs', href: '/programs', Icon: Grid3X3 },
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell },
  { label: 'Progress', href: '/progress', Icon: BarChart3 },
  { label: 'Profile', href: '/profile', Icon: User },
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const displayName = user?.name || user?.fullName || 'FlowFit User';
  const email = user?.email || 'No email available';
  const initial = (displayName || email || 'F').trim()[0]?.toUpperCase() || 'F';
  const planLabel = user?.plan || 'Free';

  function closeSidebar() {
    setOpen(false);
  }

  async function confirmAndLogout() {
    await logout();
    setConfirmLogout(false);
    closeSidebar();
    router.push('/auth/login');
  }

  return (
    <div className={`app-shell ${open ? 'is-sidebar-open' : ''}`}>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {open && (
        <button
          type="button"
          className="sidebar-backdrop sidebar-backdrop-open"
          onClick={closeSidebar}
          aria-label="Close menu backdrop"
        />
      )}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="FlowFit navigation">
        <div className="sidebar-inner">
          <div className="sidebar-brand-row">
            <Link href="/dashboard" className="sidebar-logo-link" onClick={closeSidebar} aria-label="FlowFit dashboard">
              <span className="ff-logo-mark" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1.5" y="1.5" width="41" height="41" rx="13" stroke="currentColor" strokeWidth="2" opacity="0.82" />
                  <path
                    d="M7 22h6l2.4-8.5 3.8 18 3.6-14.5 3.1 8 2.3-3H37"
                    stroke="currentColor"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="ff-logo-text">
                <strong>FlowFit</strong>
                <small>Home Fitness</small>
              </span>
            </Link>

            <button
              type="button"
              className="sidebar-close-btn"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="nav-list" aria-label="Main menu">
            {NAV.map(({ label, href, Icon }) => {
              const active = path === href || (href !== '/dashboard' && path?.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Icon className="nav-icon" size={19} />
                  <span className="nav-text">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-spacer" />

          <section className="sidebar-user-card" aria-label="Account summary">
            <div className="sidebar-user-row">
              <div className="sidebar-avatar" aria-hidden="true">{initial}</div>
              <div className="sidebar-user-info">
                <strong title={displayName}>{displayName}</strong>
                <span title={email}>{email}</span>
              </div>
            </div>

            <span className="plan-badge">{planLabel} Plan</span>

            <button
              type="button"
              className="logout-btn"
              onClick={() => setConfirmLogout(true)}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </section>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
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
        <FeedbackWidget />
        <Footer />
      </main>

      {confirmLogout && (
        <div className="ff-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="ff-confirm-box">
            <span className="ff-confirm-icon" aria-hidden="true">↪</span>
            <h2 id="logout-title" className="ff-confirm-title">Logout?</h2>
            <p className="ff-confirm-msg">
              You are about to end your FlowFit session. You will need to log in again to access protected pages.
            </p>
            <div className="ff-confirm-actions">
              <button type="button" className="ff-confirm-cancel" onClick={() => setConfirmLogout(false)}>
                Stay
              </button>
              <button type="button" className="ff-confirm-ok danger" onClick={confirmAndLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
