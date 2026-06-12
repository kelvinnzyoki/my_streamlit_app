'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BarChart3, Bot, CreditCard, Dumbbell, Grid3X3, Home, LogOut, Menu, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', Icon: Home },
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell },
  { label: 'Programs', href: '/programs', Icon: Grid3X3 },
  { label: 'Progress', href: '/progress', Icon: BarChart3 },
  { label: 'AI Coach', href: '/coach', Icon: Bot },
  { label: 'Generate Plan', href: '/generate-plan', Icon: Sparkles },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Profile', href: '/profile', Icon: User },
] as const;

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = '/auth/login';
  }, [loading, user]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open || confirmLogout);
    return () => document.body.classList.remove('sidebar-open');
  }, [open, confirmLogout]);

  useEffect(() => setOpen(false), [pathname]);

  if (loading) {
    return <main className="form-wrap"><div className="premium-card"><p className="muted">Checking your session…</p></div></main>;
  }
  if (!user) return null;

  const displayName = user.name || user.fullName || user.email || 'FlowFit User';
  const initial = String(displayName)[0]?.toUpperCase() || 'F';
  const plan = String(user.plan || 'Free');

  return (
    <div className="app-shell">
      <button type="button" className="mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Open sidebar">
        <Menu size={20} />
      </button>

      {open && <button type="button" className="sidebar-backdrop" aria-label="Close sidebar" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top-row">
          <Link href="/dashboard" className="flowfit-logo" aria-label="FlowFit Dashboard">
            <span className="flowfit-mark">FF</span>
            <span className="flowfit-word"><b>Flow</b><i>Fit</i></span>
          </Link>
          <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Dashboard navigation">
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-text">
            <strong>{displayName}</strong>
            <span>{user.email || 'No email'}</span>
            <em>{plan} Plan</em>
          </div>
        </div>

        <button type="button" className="logout-btn" onClick={() => setConfirmLogout(true)}>
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-copy">
            <p className="eyebrow">FlowFit</p>
            <strong>{displayName}</strong>
          </div>
          <div className="top-actions">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>
        {children}
      </main>

      {confirmLogout && (
        <div className="ff-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ff-confirm-box">
            <div className="ff-confirm-icon">⚠</div>
            <h2>Log out?</h2>
            <p>You are about to leave your protected FlowFit dashboard. Unsaved workout notes or generated plans may be lost.</p>
            <div className="ff-confirm-actions">
              <button type="button" className="secondary-btn" onClick={() => setConfirmLogout(false)}>Stay</button>
              <button type="button" className="primary-btn danger-btn" onClick={logout}>Yes, log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
