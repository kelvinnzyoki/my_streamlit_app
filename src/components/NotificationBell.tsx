'use client';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';

const demo = [
  { id:'1', title:'Workout reminder', message:'Your Core Control session is ready.', read:false },
  { id:'2', title:'Progress milestone', message:'You improved your weekly consistency by 18%.', read:false },
  { id:'3', title:'AI Coach', message:'Recovery looks good. Keep today moderate.', read:true }
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(demo);
  const unread = items.some((item) => !item.read);
  return (
    <div style={{ position:'relative' }}>
      <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell size={18}/>{unread && <span className="badge-dot" />}
      </button>
      {open && (
        <div className="notif-panel">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.6rem' }}>
            <strong>Notifications</strong>
            <button className="secondary-btn" style={{ minHeight:34, padding:'.45rem .7rem' }} onClick={() => setItems(items.map((i) => ({...i, read:true})))}><CheckCheck size={14}/> Read</button>
          </div>
          {items.length ? items.map((item) => (
            <div className="notif-item" key={item.id} style={{ borderColor:item.read ? 'var(--b3)' : 'var(--Au)' }}>
              <strong>{item.title}</strong>
              <p className="muted" style={{ margin:'.25rem 0 0' }}>{item.message}</p>
            </div>
          )) : <div className="notif-empty">You are all caught up.</div>}
        </div>
      )}
    </div>
  );
}
