'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  BrainCircuit,
  Dumbbell,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  UserRound,
  Zap,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { askCoach, getCoachHistory } from '@/lib/api';
import styles from './coach.module.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt?: string;
};

const STARTER_PROMPTS = [
  'What should I train today?',
  'Correct my push-up form in simple steps.',
  'Give me a recovery plan for sore legs.',
  'What should I eat before my workout?',
  'How do I improve my consistency this week?',
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
      messages.push({
        id: `${item.id || index}-u`,
        role: 'user',
        text: String(item.user),
        createdAt: item.createdAt,
      });
    }
    if (item?.assistant) {
      messages.push({
        id: `${item.id || index}-a`,
        role: 'assistant',
        text: String(item.assistant),
        createdAt: item.createdAt,
      });
    }
  });

  return messages;
}

function getAnswerMode(text: string) {
  const clean = text.trim().toLowerCase();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  const asksForPlan = /(plan|program|routine|schedule|diet|meal|weekly|steps|explain|why|how do i|how can i|breakdown)/i.test(clean);
  const shortQuestion = wordCount <= 9 || /^(yes|no|is|are|can|should|do|does|which|what is|ok|okay|thanks|hi|hello)\b/i.test(clean);

  if (asksForPlan) return 'detailed';
  if (shortQuestion) return 'short';
  return 'balanced';
}

function formatTextBlocks(text: string) {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) return [];

  return normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
}

function FormattedCoachText({ text }: { text: string }) {
  const blocks = useMemo(() => formatTextBlocks(text), [text]);

  return (
    <div className={styles.messageContent}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const isList = lines.length > 1 && lines.every((line) => /^([-•*]|\d+[.)])\s+/.test(line));

        if (isList) {
          return (
            <ul key={`${blockIndex}-${block.slice(0, 12)}`} className={styles.messageList}>
              {lines.map((line, lineIndex) => (
                <li key={`${lineIndex}-${line.slice(0, 12)}`}>{line.replace(/^([-•*]|\d+[.)])\s+/, '')}</li>
              ))}
            </ul>
          );
        }

        if (lines.length > 1) {
          return (
            <div key={`${blockIndex}-${block.slice(0, 12)}`} className={styles.messageStack}>
              {lines.map((line, lineIndex) => (
                <p key={`${lineIndex}-${line.slice(0, 12)}`}>{line}</p>
              ))}
            </div>
          );
        }

        return <p key={`${blockIndex}-${block.slice(0, 12)}`}>{block}</p>;
      })}
    </div>
  );
}

export default function CoachPage() {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to FlowFit AI Coach. Ask me about today’s workout, form, recovery, nutrition, or consistency. I’ll keep short questions short and format longer coaching clearly.',
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
        responseStyle: getAnswerMode(clean),
      });
      const reply = extractReply(response);
      setItems((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Coach is unavailable right now.');
      setItems((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: 'I could not reach the AI Coach server. Confirm you are logged in, then try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <section className={`page-section ${styles.page}`}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">AI Personal Coach</p>
            <h1>Train With a Smarter FlowFit Coach</h1>
            <p className="muted">
              Get concise answers for simple questions and clean, structured coaching for plans, recovery, form, nutrition, and performance decisions.
            </p>
            <div className={styles.heroStats}>
              <span><BrainCircuit size={16} /> Context aware</span>
              <span><Target size={16} /> Goal specific</span>
              <span><Zap size={16} /> Action focused</span>
            </div>
          </div>
          <div className={styles.heroBadge}>
            <Bot size={18} />
            <span>Premium Coach</span>
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
            <div className={styles.chatHeader}>
              <div>
                <p className="eyebrow">Live Coach Thread</p>
                <h2>Ask. Adjust. Improve.</h2>
              </div>
              <span className={styles.statusPill}>Online</span>
            </div>

            <div ref={threadRef} className={styles.thread}>
              {historyLoading ? (
                <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                  <Bot size={16} />
                  <FormattedCoachText text="Loading coach history…" />
                </div>
              ) : null}

              {items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.bubble} ${item.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                >
                  {item.role === 'assistant' ? <Bot size={16} /> : <UserRound size={16} />}
                  <FormattedCoachText text={item.text} />
                </div>
              ))}

              {loading && (
                <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                  <Loader2 className={styles.spin} size={16} />
                  <FormattedCoachText text="Coach is thinking through your context…" />
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
            <div className={styles.sideHeroIcon}><Sparkles size={26} /></div>
            <h2>High-value prompts</h2>
            <p className="muted">Tap one to get useful coaching immediately. Short prompts get short answers; plan prompts get structured output.</p>
            <div className={styles.promptGrid}>
              {STARTER_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" onClick={() => handleSubmit(undefined, prompt)} disabled={loading}>
                  <MessageSquareText size={16} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
            <div className={styles.coachTips}>
              <div><Dumbbell size={18} /><span>Form coaching with tempo cues</span></div>
              <div><Sparkles size={18} /><span>Recovery and deload logic</span></div>
              <div><Bot size={18} /><span>Training and nutrition context</span></div>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
