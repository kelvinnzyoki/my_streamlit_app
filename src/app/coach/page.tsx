'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

export default function CoachPage() {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<string[]>([
    'Welcome to FlowFit AI Personal Coach. Ask about form, motivation, recovery, diet direction, or your next workout.',
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = message.trim();
    if (!clean) return;
    setItems((prev) => [...prev, clean, 'AI Coach placeholder: connect this page to your backend AI coach endpoint when ready.']);
    setMessage('');
  }

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">AI Personal Coach</p>
        <h1>Train With FlowFit AI</h1>
        <p className="muted" style={{ maxWidth: 620, marginBottom: '1.5rem' }}>
          This replaces the old dashboard modal with a dedicated page. Connect the form to your AI coach API endpoint when your backend is ready.
        </p>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="premium-card coach-panel">
            <div className="coach-thread">
              {items.map((item, index) => (
                <div key={`${item}-${index}`} className={`coach-bubble ${index % 2 ? 'coach-user' : 'coach-ai'}`}>
                  {index % 2 === 0 && <Bot size={16} />}
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="coach-input-row">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask your coach anything…" />
              <button className="primary-btn" type="submit"><Send size={16} /> Send</button>
            </form>
          </div>

          <aside className="premium-card">
            <Sparkles size={24} style={{ color: 'var(--Au)' }} />
            <h2>Try asking</h2>
            <div className="pill-row">
              <span className="pill">How should I warm up?</span>
              <span className="pill">Correct push-up form?</span>
              <span className="pill">What should I train today?</span>
              <span className="pill">How do I recover faster?</span>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
