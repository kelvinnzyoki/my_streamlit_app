'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flowfit-theme');
    const isLight = saved === 'light';
    setLight(isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    localStorage.setItem('flowfit-theme', next ? 'light' : 'dark');
    document.documentElement.classList.toggle('light-mode', next);
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
  }

  return <button className="icon-btn" aria-label="Toggle theme" onClick={toggle}>{light ? <Moon size={18}/> : <Sun size={18}/>}</button>;
}
