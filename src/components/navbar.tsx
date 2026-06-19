'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="public-nav ff-public-nav">
      <Link href="/" className="ff-brand" onClick={closeMenu} aria-label="FlowFit Home">
        <span className="ff-brand-mark ff-brand-mark-premium" aria-hidden="true">
          <svg className="ff-brand-emblem" width="42" height="42" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="flowfitEmblemGold" x1="10" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF4BC" />
                <stop offset="38%" stopColor="#D8B557" />
                <stop offset="100%" stopColor="#7A5716" />
              </linearGradient>
              <linearGradient id="flowfitEmblemInk" x1="16" y1="12" x2="50" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15111D" />
                <stop offset="100%" stopColor="#050409" />
              </linearGradient>
              <filter id="flowfitEmblemShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#D8B557" floodOpacity="0.26" />
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>

            <rect x="7" y="7" width="50" height="50" rx="17" fill="url(#flowfitEmblemInk)" stroke="url(#flowfitEmblemGold)" strokeWidth="2" filter="url(#flowfitEmblemShadow)" />
            <path d="M14 42C21 22 34 16 50 18" stroke="url(#flowfitEmblemGold)" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M18 48C26 32 37 27 49 29" stroke="url(#flowfitEmblemGold)" strokeWidth="2.8" strokeLinecap="round" opacity="0.72" />
            <path d="M24 20H42" stroke="#FFF4BC" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M24 20V45" stroke="#FFF4BC" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M28 32H40" stroke="#FFF4BC" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />
            <path d="M45 24V45" stroke="#D8B557" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="45" cy="20" r="2.4" fill="#FFF4BC" />
          </svg>
        </span>

        <span className="ff-wordmark ff-wordmark-premium">
          <span>Flow</span><strong>Fit</strong>
          <em>Home Performance</em>
        </span>
      </Link>

      <div className={`public-links ff-public-links ${open ? 'public-links-open' : ''}`}>
        <Link href="/auth/login?redirect=/workouts" onClick={closeMenu}>Workouts</Link>
        <Link href="/auth/login?redirect=/programs" onClick={closeMenu}>Programs</Link>
        <Link href="/auth/login?redirect=/dashboard" onClick={closeMenu}>Dashboard</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <ThemeToggle />
        <Link href="/auth/login" className="secondary-btn nav-cta ff-nav-login" onClick={closeMenu}>Login</Link>
        <Link href="/auth/register" className="primary-btn nav-cta ff-nav-start" onClick={closeMenu}>Start Free</Link>
      </div>

      <div className="public-nav-actions ff-public-nav-actions">
        <ThemeToggle />
        <button
          type="button"
          className="icon-btn ff-nav-menu-btn"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </nav>
  );
}
