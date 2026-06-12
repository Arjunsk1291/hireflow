'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  type: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unread = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
  }, [session?.user?.id]);

  useEffect(() => {
    fetchNotifications();

    if (!session?.user?.id) return;

    let socket: import('socket.io-client').Socket | null = null;

    import('socket.io-client').then(({ io }) => {
      socket = io(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', {
        auth: { userId: session.user?.id },
        reconnectionAttempts: 3,
      });

      socket.on('notification', (n: NotificationItem) => {
        setNotifications((prev) => [n, ...prev.slice(0, 49)]);
      });
    }).catch(() => {
      // Socket.io optional — fall back to polling
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    });

    return () => { socket?.disconnect(); };
  }, [session?.user?.id, fetchNotifications]);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  return { notifications, unread, markAllRead, markRead, refresh: fetchNotifications };
}
