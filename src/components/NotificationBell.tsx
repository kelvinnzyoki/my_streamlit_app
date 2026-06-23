'use client';

import { Bell, CheckCheck, Loader2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  NotificationsAPI,
  type FlowFitNotification,
} from '@/lib/api';

function formatNotificationTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<FlowFitNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const hasUnread = unreadCount > 0;

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const res = await NotificationsAPI.getAll(20);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err: any) {
      setError(err?.message || 'Unable to load notifications.');
      if (!silent) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await NotificationsAPI.getUnreadCount();
      setUnreadCount(res.count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const timer = window.setInterval(loadUnreadCount, 60_000);
    return () => window.clearInterval(timer);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  async function handleToggle() {
    setOpen((value) => !value);
  }

  async function handleMarkRead(notification: FlowFitNotification) {
    if (!notification.id) return;

    if (notification.readAt) {
      if (notification.link) window.location.href = notification.link;
      return;
    }

    setActionLoading(notification.id);
    try {
      await NotificationsAPI.markRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: item.readAt || new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      if (notification.link) window.location.href = notification.link;
    } catch (err: any) {
      setError(err?.message || 'Failed to mark notification as read.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkAllRead() {
    if (!notifications.length) return;
    setActionLoading('all');

    try {
      await NotificationsAPI.markAllRead();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || now })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err?.message || 'Failed to mark all notifications as read.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);

    try {
      const target = notifications.find((item) => item.id === id);
      await NotificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (target && !target.readAt) setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete notification.');
    } finally {
      setActionLoading(null);
    }
  }

  const notificationLabel = useMemo(() => {
    if (unreadCount <= 0) return 'Notifications';
    if (unreadCount === 1) return '1 unread notification';
    return `${unreadCount} unread notifications`;
  }, [unreadCount]);

  return (
    <div className="ff-notification-wrap">
      <button
        type="button"
        className="icon-btn ff-notification-trigger"
        onClick={handleToggle}
        aria-label={notificationLabel}
        aria-expanded={open}
      >
        <Bell size={17} />
        {hasUnread && (
          <span className="notification-dot ff-notification-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="ff-notification-backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />

          <section className="premium-card ff-notification-panel" aria-label="Notifications panel">
            <div className="ff-notification-head">
              <div>
                <p className="eyebrow">Notifications</p>
                <strong>{notificationLabel}</strong>
              </div>

              <button
                type="button"
                className="ff-notification-close"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>

            <div className="ff-notification-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => loadNotifications()}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="ff-spin" /> : 'Refresh'}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleMarkAllRead}
                disabled={actionLoading === 'all' || unreadCount === 0}
              >
                <CheckCheck size={14} />
                Read all
              </button>
            </div>

            {error && <p className="alert ff-notification-error">{error}</p>}

            <div className="ff-notification-list">
              {loading ? (
                <div className="ff-notification-empty">
                  <Loader2 size={20} className="ff-spin" />
                  <span>Loading notifications…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="ff-notification-empty">
                  <span className="ff-empty-icon">🔔</span>
                  <strong>No notifications yet</strong>
                  <p className="muted">Workout reminders, milestones, and system updates will appear here.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <article
                    key={item.id}
                    className={`ff-notification-item ${item.readAt ? 'is-read' : 'is-unread'}`}
                  >
                    <button
                      type="button"
                      className="ff-notification-content"
                      onClick={() => handleMarkRead(item)}
                    >
                      <span className="ff-notification-icon">{item.icon || '🔔'}</span>

                      <span className="ff-notification-copy">
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                        <small>{formatNotificationTime(item.createdAt)}</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="ff-notification-delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoading === item.id}
                      aria-label="Delete notification"
                    >
                      {actionLoading === item.id ? (
                        <Loader2 size={14} className="ff-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
