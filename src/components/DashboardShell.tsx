'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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

const nav = [
  ['Dashboard', '/dashboard', Home],
  ['Programs', '/programs', Grid3X3],
  ['Workouts', '/workouts', Dumbbell],
  ['Progress', '/progress', BarChart3],
  ['Subscription', '/subscription', CreditCard],
  ['Profile', '/profile', User],
  ['Admin', '/admin', Shield],
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/auth/login');
  }

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-btn"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link href="/dashboard" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">F</span>
          <span className="brand-text">FlowFit</span>
        </Link>

        <nav className="nav-list" aria-label="Dashboard navigation">
          {nav.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-link ${path === href ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="premium-card sidebar-user-card">
          <p className="eyebrow">Signed In</p>
          <p className="user-email">{user?.email || 'Guest session'}</p>
          <button className="secondary-btn full-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-copy">
            <p className="eyebrow">FlowFit Command</p>
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
