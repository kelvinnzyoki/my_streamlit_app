'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Dumbbell, Loader2, Send, Sparkles, UserRound } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { askCoach, getCoachHistory } from '@/lib/api';
import styles from './coach.module.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const STARTER_PROMPTS = [
  'What should I train today?',
  'Correct push-up form?',
  'How do I recover faster?',
  'Give me a simple diet direction.',
];

function extractReply(payload: any) {
  return String(
    payload?.reply ||
    payload?.data?.reply ||
    payload?.messageText ||
    payload?.data?.message ||
    payload?.message ||
    'I received your message, but the server returned an empty coach reply.',
  );
}

function normaliseHistory(payload: any): Message[] {
  const raw = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  const messages: Message[] = [];

  raw.forEach((item: any, index: number) => {
    if (item?.user) {
      messages.push({ id: `${item.id || index}-u`, role: 'user', text: String(item.user) });
    }
    if (item?.assistant) {
      messages.push({ id: `${item.id || index}-a`, role: 'assistant', text: String(item.assistant) });
    }
  });

  return messages;
}

export default function CoachPage() {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to FlowFit AI Personal Coach. Ask about form, motivation, recovery, diet direction, or your next workout.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    getCoachHistory()
      .then((history) => {
        if (!active) return;
        const messages = normaliseHistory(history);
        if (messages.length) setItems(messages);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHistoryLoading(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, loading]);

  async function handleSubmit(e?: React.FormEvent, prompt?: string) {
    e?.preventDefault();
    const clean = (prompt || message).trim();
    if (!clean || loading) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', text: clean };
    setItems((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await askCoach(clean, {
        source: 'coach-page',
      });
      const reply = extractReply(response);
      setItems((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Coach is unavailable right now.');
      setItems((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: 'I could not reach the AI Coach server. Please check your login/session and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <section className={`page-section ${styles.page}`}>
        <div className={styles.hero}>
          <div>
            <p className="eyebrow">AI Personal Coach</p>
            <h1>Train With FlowFit AI</h1>
            <p className="muted">
              Chat with your server-connected coach for training, recovery, form, and next-session guidance.
            </p>
          </div>
          <div className={styles.heroBadge}>
            <Bot size={18} />
            <span>Coach Tool</span>
          </div>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className={`grid grid-2 ${styles.coachGrid}`}>
          <div className={`premium-card ${styles.chatCard}`}>
            <div ref={threadRef} className={styles.thread}>
              {historyLoading ? (
                <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                  <Bot size={16} />
                  <span>Loading coach history…</span>
                </div>
              ) : null}

              {items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.bubble} ${item.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                >
                  {item.role === 'assistant' ? <Bot size={16} /> : <UserRound size={16} />}
                  <span>{item.text}</span>
                </div>
              ))}

              {loading && (
                <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                  <Loader2 className={styles.spin} size={16} />
                  <span>Coach is thinking…</span>
                </div>
              )}
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className={styles.inputRow}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your coach anything…"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button className="primary-btn" type="submit" disabled={loading || !message.trim()}>
                {loading ? <Loader2 className={styles.spin} size={16} /> : <Send size={16} />}
                Send
              </button>
            </form>
          </div>

          <aside className={`premium-card ${styles.sideCard}`}>
            <Sparkles size={26} />
            <h2>Try asking</h2>
            <p className="muted">Use quick prompts or type your own question. This page is only for AI Coach.</p>
            <div className={styles.promptGrid}>
              {STARTER_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" onClick={() => handleSubmit(undefined, prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>
            <div className={styles.coachTips}>
              <div><Dumbbell size={18} /><span>Form coaching</span></div>
              <div><Sparkles size={18} /><span>Recovery direction</span></div>
              <div><Bot size={18} /><span>Context-aware guidance</span></div>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
