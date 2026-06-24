'use client';

import { useState, useEffect, useCallback } from 'react';

import { useAuth } from "@/contexts/auth-context";
import { fetchJson, HttpError } from "@/lib/fetch-json";
import { useGlobalState } from './use-global-state';

export type NotificationType = 'activity' | 'reminder' | 'promotion' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(initialData?: Notification[]): UseNotificationsReturn {
  const { user, getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    setUnreadNotifications,
    resetUnreadNotifications,
    readNotificationIds,
    markNotificationAsRead,
    decrementUnreadNotifications,
  } = useGlobalState();

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  useEffect(() => {
    setUnreadNotifications(unreadCount);
  }, [unreadCount, setUnreadNotifications]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setNotifications([]);
        return;
      }

      const token = await getToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }

      const data = await fetchJson<{ notifications: Notification[] }>('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      });

      const updatedNotifications = (data.notifications || []).map((notif) => ({
        ...notif,
        isRead: notif.isRead || readNotificationIds.includes(notif.id),
      }));

      setNotifications(updatedNotifications);
    } catch (err) {
      setError('加载通知失败');
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, getToken, readNotificationIds]);

  useEffect(() => {
    if (initialData) {
      const updatedNotifications = initialData.map((notif) => ({
        ...notif,
        isRead: notif.isRead || readNotificationIds.includes(notif.id),
      }));

      setNotifications(updatedNotifications);
      setLoading(false);
    } else {
      loadNotifications();
    }

    resetUnreadNotifications();
  }, [initialData, loadNotifications, resetUnreadNotifications, readNotificationIds]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }

      await fetchJson('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) => {
        const target = prev.find((item) => item.id === notificationId);
        const wasUnread = Boolean(target && !target.isRead);
        const updated = prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        );

        if (wasUnread) {
          markNotificationAsRead(notificationId);
          decrementUnreadNotifications();
        }

        return updated;
      });
    } catch (err) {
      setError('标记通知失败');
      console.error('Failed to mark notification as read:', err);
    }
  }, [getToken, markNotificationAsRead, decrementUnreadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }

      await fetchJson('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ all: true }),
      });

      notifications.filter((item) => !item.isRead).forEach((item) => {
        markNotificationAsRead(item.id);
      });

      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      setError('全部已读失败');
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [notifications, getToken, markNotificationAsRead, setUnreadNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }

      await fetchJson(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => {
        const target = prev.find((item) => item.id === notificationId);
        const wasUnread = Boolean(target && !target.isRead);
        const updated = prev.filter((item) => item.id !== notificationId);

        if (wasUnread) {
          decrementUnreadNotifications();
        }

        return updated;
      });
    } catch (err) {
      setError('删除通知失败');
      console.error('Failed to delete notification:', err);
    }
  }, [getToken, decrementUnreadNotifications]);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
}
