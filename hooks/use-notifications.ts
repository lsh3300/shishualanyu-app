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
      
      // 模拟API调用
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'activity',
          title: '李师傅回复了您的评论',
          description: '感谢您对蓝染艺术的热爱，期待您的更多作品分享！',
          isRead: false,
          timestamp: '2024-01-20T09:30:00',
          actionUrl: '/community/comment/123',
        },
        {
          id: '2',
          type: 'reminder',
          title: '课程即将开始',
          description: '您报名的「扎染进阶技法」课程将在30分钟后开始',
          isRead: false,
          timestamp: '2024-01-20T08:00:00',
          actionUrl: '/teaching/course/456',
        },
        {
          id: '3',
          type: 'promotion',
          title: '限时优惠',
          description: '蓝染材料包限时8折，仅限今明两天！',
          isRead: true,
          timestamp: '2024-01-19T14:20:00',
          actionUrl: '/store/promotions',
        },
        {
          id: '4',
          type: 'alert',
          title: '系统维护通知',
          description: '系统将于2024年1月21日凌晨2:00-4:00进行维护，期间部分功能可能暂时无法使用。',
          isRead: true,
          timestamp: '2024-01-18T10:15:00',
        },
        {
          id: '5',
          type: 'activity',
          title: '新粉丝关注',
          description: '用户「蓝染爱好者」关注了您',
          isRead: false,
          timestamp: '2024-01-17T16:45:00',
          actionUrl: '/profile/followers',
        },
      ];
      
      // 应用全局已读状态到通知列表
      const updatedNotifications = mockNotifications.map(notif => ({
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