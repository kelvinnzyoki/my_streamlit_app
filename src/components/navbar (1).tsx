'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="public-nav">
      {/* Brand */}
      <Link href="/" className="brand public-brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 38 38" fill="none">
            <defs>
              <linearGradient id="navPulse" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8C96A" />
                <stop offset="55%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#8E6E28" />
              </linearGradient>
            </defs>
            <polyline
              points="2,19 8,19 11,9 14,27 17,13 20,22 23,19 36,19"
              stroke="url(#navPulse)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="brand-text">FlowFit</span>
      </Link>

      {/* Desktop links */}
      <div className={`public-links ${open ? 'public-links-open' : ''}`}>
        <Link href="/workouts" onClick={() => setOpen(false)}>Workouts</Link>
        <Link href="/programs" onClick={() => setOpen(false)}>Programs</Link>
        <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
        <ThemeToggle />
        <Link href="/auth/login" className="secondary-btn nav-cta" onClick={() => setOpen(false)}>Login</Link>
        <Link href="/auth/register" className="primary-btn nav-cta" onClick={() => setOpen(false)}>Start Free</Link>
      </div>

      {/* Mobile right controls */}
      <div className="public-nav-actions">
        <ThemeToggle />
        <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>
  );
}
