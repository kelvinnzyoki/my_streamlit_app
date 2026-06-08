'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  notify: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function sanitizeClientMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const raw = error instanceof Error ? error.message : String(error || '');
  const lower = raw.toLowerCase();
  if (!raw || lower.includes('stack') || lower.includes('prisma') || lower.includes('database') || lower.includes('jwt') || lower.includes('token') || lower.includes('sql') || lower.includes('internal server')) return fallback;
  if (raw.length > 140) return fallback;
  return raw;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items, { id, message, type }].slice(-4));
    window.setTimeout(() => remove(id), type === 'error' ? 6500 : 4200);
  }, [remove]);

  const value = useMemo(() => ({
    notify,
    success: (message: string) => notify(message, 'success'),
    error: (message: string) => notify(message, 'error'),
    warning: (message: string) => notify(message, 'warning'),
    info: (message: string) => notify(message, 'info'),
  }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <button key={toast.id} type="button" className={`toast toast-${toast.type}`} onClick={() => remove(toast.id)}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '⚠' : 'i'}</span>
            <span>{toast.message}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
