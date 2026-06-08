'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  ['Programs', '/programs'],
  ['Workouts', '/workouts'],
  ['Progress', '/progress'],
  ['Login', '/auth/login'],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="public-nav">
      <Link href="/" className="brand public-brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">F</span>
        <span className="brand-text">FlowFit</span>
      </Link>

      <div className={`public-links ${open ? 'public-links-open' : ''}`}>
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <Link href="/auth/register" className="primary-btn nav-cta" onClick={() => setOpen(false)}>
          Start
        </Link>
        <ThemeToggle />
      </div>

      <div className="public-nav-actions">
        <ThemeToggle />
        <button
          className="icon-btn public-menu-btn"
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
