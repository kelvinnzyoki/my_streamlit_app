'use client';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell size={18}/><span className="notification-dot" />
      </button>
      {open && (
        <div className="premium-card" style={{ position:'absolute', right:0, top:52, width:300, zIndex:30 }}>
          <p className="eyebrow">Notifications</p>
          <p className="muted">Your latest workout reminders, plan alerts, and subscription notices will appear here.</p>
        </div>
      )}
    </div>
  );
}
