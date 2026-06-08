'use client';
import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const links = [
  ['Home','/'], ['Workouts','/workouts'], ['Programs','/programs'], ['Progress','/progress'], ['Pricing','/subscription'], ['Blog','/blog']
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav">
      <Link href="/" className="logo-wrap" aria-label="FlowFit home">
        <span className="logo-mark">F</span>
        <span className="logo-wordmark"><span className="logo-flow">Flow</span><span className="logo-fit">Fit</span></span>
      </Link>
      <ul className="nav-links">{links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
      <div className="nav-right">
        <NotificationBell />
        <ThemeToggle />
        <Link className="secondary-btn" href="/auth/login">Login</Link>
        <Link className="primary-btn" href="/auth/register"><Sparkles size={15}/> Start</Link>
        <button className="icon-btn mobile-nav" onClick={() => setOpen(!open)}><Menu size={18}/></button>
      </div>
      {open && <div className="notif-panel" style={{ top:70, right:16 }}>{links.map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} className="side-link" href={href}>{label}</Link>)}</div>}
    </nav>
  );
}
