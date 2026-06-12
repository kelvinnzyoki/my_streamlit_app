'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Activity, BarChart3, CreditCard, Dumbbell,
  Home, LogOut, Menu, Shield, User, Grid3X3, X,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',    Icon: Home },
  { label: 'Programs',     href: '/programs',     Icon: Grid3X3 },
  { label: 'Workouts',     href: '/workouts',     Icon: Dumbbell },
  { label: 'Progress',     href: '/progress',     Icon: BarChart3 },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Profile',      href: '/profile',      Icon: User },
  { label: 'Admin',        href: '/admin',        Icon: Shield },
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initial = (user?.name || user?.email || 'F')[0].toUpperCase();
  const planLabel = user?.plan || 'Free';

  async function handleLogout() {
    await logout();
    router.push('/auth/login');
  }

  return (
    <div className="app-shell">
      {/* ── Mobile hamburger ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Sidebar backdrop ── */}
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/dashboard" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">{/* FlowFit logo mark */}
              <svg width="22" height="22" viewBox="0 0 38 38" fill="none">
                <defs>
                  <linearGradient id="sbPulse" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E8C96A" />
                    <stop offset="55%" stopColor="#C9A84C" />
                    <stop offset="100%" stopColor="#8E6E28" />
                  </linearGradient>
                </defs>
                <polyline
                  points="2,19 8,19 11,9 14,27 17,13 20,22 23,19 36,19"
                  stroke="url(#sbPulse)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--Au-hi)' }}>Flow</span>
              <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 700, fontSize: '0.5rem', letterSpacing: '0.56em', textTransform: 'uppercase', color: 'var(--Au)', opacity: 0.9 }}>Fit</span>
            </div>
          </Link>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close" style={{ display: open ? undefined : 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="nav-list">
          {NAV.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${path === href ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User card */}
        <div className="premium-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="brand-mark" style={{ width: 38, height: 38, fontSize: '0.9rem', flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.fullName || 'Guest'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || '—'}
              </p>
            </div>
          </div>
          <span className="pill" style={{ fontSize: '0.68rem', marginBottom: '0.75rem', display: 'inline-block' }}>
            {planLabel} Plan
          </span>
          <button
            className="secondary-btn"
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
            onClick={handleLogout}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
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
