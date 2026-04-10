'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';

const BellIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

function formatTimestamp(value) {
  if (!value) return 'Just now';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationBell({ iconColor, iconClass }) {
  const { user } = useUser();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/notifications?limit=6'), {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = await response.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount) || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadNotifications, user]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || unreadCount === 0) return undefined;

    let active = true;

    const markAllAsRead = async () => {
      try {
        const response = await fetch(getApiUrl('/api/notifications'), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        });

        if (!response.ok || !active) return;

        setUnreadCount(0);
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      } catch {

      }
    };

    void markAllAsRead();

    return () => {
      active = false;
    };
  }, [open, unreadCount]);

  if (!user) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => {
          setOpen((current) => !current);
          if (!open) {
            void loadNotifications();
          }
        }}
        className="relative rounded-full p-2 transition-all hover:scale-110 hover:bg-white/8"
        title="Notifications"
        style={{ color: iconColor }}
      >
        <BellIcon className={`h-5 w-5 ${iconClass}`} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] rounded-full bg-theme-bronze px-1 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-[22rem] rounded-[1.6rem] bg-white/95 p-3 shadow-2xl dark:bg-[rgba(34,27,23,0.96)]">
          <div className="mb-3 flex items-center justify-between px-2 pt-1">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Notifications</p>
              <p className="mt-1 text-xs text-theme-walnut/60 dark:text-theme-ivory/55">
                Order updates for {user.email}
              </p>
            </div>
            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze hover:underline"
            >
              Track Order
            </Link>
          </div>

          <div className="max-h-[22rem] space-y-2 overflow-auto pr-1">
            {loading && notifications.length === 0 ? (
              <div className="rounded-2xl border border-theme-line/50 bg-theme-ivory/50 px-4 py-5 text-sm text-theme-walnut/60 dark:bg-white/5 dark:text-theme-ivory/60">
                Loading updates...
              </div>
            ) : null}

            {!loading && notifications.length === 0 ? (
              <div className="rounded-2xl border border-theme-line/50 bg-theme-ivory/50 px-4 py-5 text-sm text-theme-walnut/60 dark:bg-white/5 dark:text-theme-ivory/60">
                No order updates yet. We will show shipment alerts here.
              </div>
            ) : null}

            {notifications.map((notification) => (
              <Link
                key={notification._id}
                href={notification.href || '/track-order'}
                onClick={() => setOpen(false)}
                className="block rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-3 transition hover:border-theme-bronze/40 hover:bg-theme-ivory/78 dark:bg-white/5 dark:hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                      {notification.status || 'order update'}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                      {notification.title}
                    </p>
                  </div>
                  <span className="text-[0.68rem] text-theme-walnut/50 dark:text-theme-ivory/44">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-theme-walnut/68 dark:text-theme-ivory/62">
                  {notification.message}
                </p>
                {notification.trackingNumber ? (
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-theme-walnut/54 dark:text-theme-ivory/46">
                    {notification.trackingNumber}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
