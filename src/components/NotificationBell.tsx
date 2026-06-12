'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={17} />
        <span className="notification-dot" />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 28 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="premium-card"
            style={{ position: 'absolute', right: 0, top: 52, width: 300, zIndex: 29 }}
          >
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Notifications</p>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Workout reminders, plan alerts, and subscription notices will appear here.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
