'use client';
import { useState, useEffect, useCallback } from 'react';
import { useGlobalState } from './use-global-state';

// 通知类型定义
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUnreadNotifications, resetUnreadNotifications, readNotificationIds, markNotificationAsRead, decrementUnreadNotifications } = useGlobalState();

  // 计算未读通知数量
  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  
  // 同步未读通知数量到全局状态
  useEffect(() => {
    setUnreadNotifications(unreadCount);
  }, [unreadCount, setUnreadNotifications]);
  
  // 加载通知列表
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 在实际环境中，这里应该调用API
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      
      // 暂时返回空数组，等待API实现
      const notifications: Notification[] = [];
      
      // 应用全局已读状态到通知列表
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        isRead: notif.isRead || readNotificationIds.includes(notif.id)
      }));
      
      setNotifications(updatedNotifications);
    } catch (err) {
      setError('加载通知失败');
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始化时加载通知
  useEffect(() => {
    if (initialData) {
      // 应用全局已读状态到通知列表
      const updatedNotifications = initialData.map(notif => ({
        ...notif,
        isRead: notif.isRead || readNotificationIds.includes(notif.id)
      }));
      
      setNotifications(updatedNotifications);
      setLoading(false);
    } else {
      loadNotifications();
    }
    
    // 进入通知页面时，重置未读计数
    resetUnreadNotifications();
  }, [initialData, loadNotifications, resetUnreadNotifications, readNotificationIds]);

  // 标记单条通知为已读
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // 实际环境中调用API
      // await fetch('/api/notifications', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notificationId }),
      // });
      
      // 本地状态更新
      setNotifications(prev => {
        const targetNotification = prev.find(n => n.id === notificationId);
        const wasUnread = targetNotification && !targetNotification.isRead;
        
        const updated = prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        
        // 更新全局状态
        if (wasUnread) {
          markNotificationAsRead(notificationId);
          setUnreadNotifications(prev => Math.max(0, prev - 1));
        }
        
        return updated;
      });
    } catch (err) {
      setError('标记通知失败');
      console.error('Failed to mark notification as read:', err);
    }
  }, [markNotificationAsRead, setUnreadNotifications]);

  // 标记全部通知为已读
  const markAllAsRead = useCallback(async () => {
    try {
      // 实际环境中调用API
      // await fetch('/api/notifications', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ all: true }),
      // });
      
      // 获取所有未读通知的ID
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // 在全局状态中标记所有通知为已读
      unreadNotifications.forEach(notif => {
        markNotificationAsRead(notif.id);
      });
      
      // 本地状态更新
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      
      // 重置未读数量
      setUnreadNotifications(0);
    } catch (err) {
      setError('标记全部通知失败');
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [notifications, markNotificationAsRead, setUnreadNotifications]);

  // 删除通知
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // 实际环境中调用API
      // await fetch(`/api/notifications?id=${notificationId}`, {
      //   method: 'DELETE',
      // });
      
      // 本地状态更新
      setNotifications(prev => {
        const targetNotification = prev.find(n => n.id === notificationId);
        const wasUnread = targetNotification && !targetNotification.isRead;
        
        const updated = prev.filter(notif => notif.id !== notificationId);
        
        // 如果删除的是未读通知，减少全局未读计数
        if (wasUnread) {
          decrementUnreadNotifications();
        }
        
        return updated;
      });
    } catch (err) {
      setError('删除通知失败');
      console.error('Failed to delete notification:', err);
    }
  }, [decrementUnreadNotifications]);

  // 刷新通知列表
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