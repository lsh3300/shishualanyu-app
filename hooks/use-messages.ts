'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { fetchJson, HttpError } from '@/lib/fetch-json';
import { useGlobalState } from './use-global-state';

export type MessageType = 'system' | 'course' | 'order' | 'community' | 'comment' | 'follow';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  isRead: boolean;
  timestamp: string;
  avatar?: string;
  userName?: string;
  relatedUrl?: string;
}

interface UseMessagesReturn {
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useMessages(initialData?: Message[]): UseMessagesReturn {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    setUnreadMessages,
    resetUnreadMessages,
    readMessageIds,
    markMessageAsRead,
    decrementUnreadMessages,
  } = useGlobalState();

  const unreadCount = messages.filter((message) => !message.isRead).length;

  useEffect(() => {
    setUnreadMessages(unreadCount);
  }, [unreadCount, setUnreadMessages]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setMessages([]);
        return;
      }

      const token = await getToken();
      if (!token) {
        throw new HttpError('Unauthorized', 401);
      }

      const data = await fetchJson<{ messages: Message[] }>('/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      });

      const updatedMessages = (data.messages || []).map((message) => ({
        ...message,
        isRead: message.isRead || readMessageIds.includes(message.id),
      }));

      setMessages(updatedMessages);
    } catch (err) {
      setError('加载消息失败');
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user, getToken, readMessageIds]);

  useEffect(() => {
    if (initialData) {
      const updatedMessages = initialData.map((message) => ({
        ...message,
        isRead: message.isRead || readMessageIds.includes(message.id),
      }));

      setMessages(updatedMessages);
      setLoading(false);
    } else {
      loadMessages();
    }

    resetUnreadMessages();
  }, [initialData, loadMessages, resetUnreadMessages, readMessageIds]);

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const token = await getToken();
        if (!token) {
          throw new HttpError('Unauthorized', 401);
        }

        await fetchJson('/api/messages', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId }),
        });

        setMessages((prev) => {
          const target = prev.find((item) => item.id === messageId);
          const wasUnread = Boolean(target && !target.isRead);
          const updated = prev.map((item) => (item.id === messageId ? { ...item, isRead: true } : item));

          if (wasUnread) {
            markMessageAsRead(messageId);
            decrementUnreadMessages();
          }

          return updated;
        });
      } catch (err) {
        setError('标记消息失败');
        console.error('Failed to mark message as read:', err);
      }
    },
    [decrementUnreadMessages, getToken, markMessageAsRead],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new HttpError('Unauthorized', 401);
      }

      await fetchJson('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ all: true }),
      });

      messages
        .filter((item) => !item.isRead)
        .forEach((item) => {
          markMessageAsRead(item.id);
        });

      setMessages((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadMessages(0);
    } catch (err) {
      setError('全部已读失败');
      console.error('Failed to mark all messages as read:', err);
    }
  }, [getToken, markMessageAsRead, messages, setUnreadMessages]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const token = await getToken();
        if (!token) {
          throw new HttpError('Unauthorized', 401);
        }

        await fetchJson(`/api/messages?id=${messageId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages((prev) => {
          const target = prev.find((item) => item.id === messageId);
          const wasUnread = Boolean(target && !target.isRead);
          const updated = prev.filter((item) => item.id !== messageId);

          if (wasUnread) {
            decrementUnreadMessages();
          }

          return updated;
        });
      } catch (err) {
        setError('删除消息失败');
        console.error('Failed to delete message:', err);
      }
    },
    [decrementUnreadMessages, getToken],
  );

  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  return {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    refreshMessages,
  };
}

export const useUnreadCount = () => {
  const { unreadMessages } = useGlobalState();
  return { unreadCount: unreadMessages };
};
