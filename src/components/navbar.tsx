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
      <Link href="/" className="ff-brand" onClick={closeMenu} aria-label="FlowFit home">
        <span className="ff-brand-mark" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="ffNavGold" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff1a8" />
                <stop offset="42%" stopColor="#d6ad3f" />
                <stop offset="100%" stopColor="#8f681c" />
              </linearGradient>
              <filter id="ffNavGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0.9  0 1 0 0 0.68  0 0 1 0 0.18  0 0 0 0.45 0"
                />
                <feBlend in="SourceGraphic" />
              </filter>
            </defs>
            <rect x="4" y="4" width="36" height="36" rx="12" fill="url(#ffNavGold)" opacity="0.16" />
            <path
              d="M7 23H14.3L17.2 14L21.5 31L25.3 19L28.5 23H37"
              stroke="url(#ffNavGold)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ffNavGlow)"
            />
            <circle cx="22" cy="22" r="18" stroke="url(#ffNavGold)" strokeOpacity="0.28" />
          </svg>
        </span>

        <span className="ff-wordmark">
          <span>Flow</span>
          <strong>Fit</strong>
        </span>
      </Link>

      <div className={`public-links ff-public-links ${open ? 'public-links-open' : ''}`}>
        <Link href="/workouts" onClick={closeMenu}>Workouts</Link>
        <Link href="/programs" onClick={closeMenu}>Programs</Link>
        <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <Link href="/contact" onClick={closeMenu}>Contact</Link>

        <div className="ff-desktop-theme">
          <ThemeToggle />
        </div>

        <Link href="/auth/login" className="secondary-btn nav-cta ff-nav-login" onClick={closeMenu}>
          Login
        </Link>

        <Link href="/auth/register" className="primary-btn nav-cta ff-nav-start" onClick={closeMenu}>
          Start Free
        </Link>
      </div>

      <div className="public-nav-actions">
        <ThemeToggle />
        <button
          type="button"
          className="icon-btn ff-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
