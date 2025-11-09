'use client';
import { useState, useEffect, useCallback } from 'react';
import { useGlobalState } from './use-global-state';

// 消息类型定义
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUnreadMessages, resetUnreadMessages, readMessageIds, markMessageAsRead, decrementUnreadMessages } = useGlobalState();

  // 计算未读消息数量
  const unreadCount = messages.filter(msg => !msg.isRead).length;
  
  // 同步未读消息数量到全局状态
  useEffect(() => {
    setUnreadMessages(unreadCount);
  }, [unreadCount, setUnreadMessages]);
  
  // 加载消息列表
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 在实际环境中，这里应该调用API
      // const response = await fetch('/api/messages');
      // const data = await response.json();
      
      // 模拟API调用
      const mockMessages: Message[] = [
        {
          id: '1',
          type: 'system',
          title: '系统通知',
          content: '欢迎加入世说蓝语平台！您的账号已成功激活，现在可以开始探索蓝染文化的奇妙世界。',
          isRead: false,
          timestamp: '2024-01-20T10:30:00',
        },
        {
          id: '2',
          type: 'course',
          title: '课程更新提醒',
          content: '您关注的「传统扎染基础入门」课程已更新新章节，快来学习吧！',
          isRead: false,
          timestamp: '2024-01-19T15:20:00',
          avatar: '/placeholder-user.jpg',
          userName: '张老师',
          relatedUrl: '/teaching/1',
        },
        {
          id: '3',
          type: 'order',
          title: '订单状态更新',
          content: '您的订单 #20240118001 已发货，预计3-5天送达。',
          isRead: true,
          timestamp: '2024-01-18T09:15:00',
          userName: '物流中心',
          relatedUrl: '/orders/20240118001',
        },
        {
          id: '4',
          type: 'community',
          title: '社区动态',
          content: '李师傅发布了新的蓝染作品，引发了社区热议。',
          isRead: true,
          timestamp: '2024-01-17T14:45:00',
          avatar: '/traditional-indigo-dyeing-master-craftsman.jpg',
          userName: '李师傅',
          relatedUrl: '/community/works/123',
        },
        {
          id: '5',
          type: 'comment',
          title: '新评论通知',
          content: '您的作品「蓝染山水」收到了新的评论："色彩运用非常出色，特别是渐变效果！"',
          isRead: false,
          timestamp: '2024-01-16T11:00:00',
          userName: '艺术爱好者',
          relatedUrl: '/community/works/456',
        },
        {
          id: '6',
          type: 'follow',
          title: '新关注者',
          content: '「蓝染爱好者」关注了您，快去看看他的作品吧！',
          isRead: false,
          timestamp: '2024-01-15T16:30:00',
          userName: '蓝染爱好者',
          relatedUrl: '/profile/789',
        },
      ];
      
      // 应用全局已读状态到消息列表
      const updatedMessages = mockMessages.map(msg => ({
        ...msg,
        isRead: msg.isRead || readMessageIds.includes(msg.id)
      }));
      
      setMessages(updatedMessages);
    } catch (err) {
      setError('加载消息失败');
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [readMessageIds]);

  // 初始化时加载消息
  useEffect(() => {
    if (initialData) {
      // 应用全局已读状态到消息列表
      const updatedMessages = initialData.map(msg => ({
        ...msg,
        isRead: msg.isRead || readMessageIds.includes(msg.id)
      }));
      
      setMessages(updatedMessages);
      setLoading(false);
    } else {
      loadMessages();
    }
    
    // 进入消息页面时，重置未读计数
    resetUnreadMessages();
  }, [initialData, loadMessages, resetUnreadMessages, readMessageIds]);


  // 标记单条消息为已读
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // 实际环境中调用API
      // await fetch('/api/messages', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ messageId }),
      // });
      
      // 本地状态更新
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // 同时更新全局状态中的已读消息ID列表
      markMessageAsRead(messageId);
    } catch (err) {
      setError('标记消息失败');
      console.error('Failed to mark message as read:', err);
    }
  }, [markMessageAsRead]);

  // 标记全部消息为已读
  const markAllAsRead = useCallback(async () => {
    try {
      // 实际环境中调用API
      // await fetch('/api/messages', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ all: true }),
      // });
      
      // 本地状态更新
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      
      // 更新全局已读消息ID列表
      messages.forEach(msg => {
        if (!msg.isRead) {
          markMessageAsRead(msg.id);
        }
      });
      
      // 重置全局未读消息计数
      setUnreadMessages(0);
    } catch (err) {
      setError('标记全部消息失败');
      console.error('Failed to mark all messages as read:', err);
    }
  }, [messages, markMessageAsRead, setUnreadMessages]);

  // 删除消息
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // 实际环境中调用API
      // await fetch(`/api/messages?id=${messageId}`, {
      //   method: 'DELETE',
      // });
      
      // 本地状态更新
      setMessages(prev => {
        const targetMessage = prev.find(msg => msg.id === messageId);
        const wasUnread = targetMessage && !targetMessage.isRead;
        
        const updated = prev.filter(msg => msg.id !== messageId);
        
        // 如果删除的是未读消息，减少全局未读计数
        if (wasUnread) {
          decrementUnreadMessages();
        }
        
        return updated;
      });
    } catch (err) {
      setError('删除消息失败');
      console.error('Failed to delete message:', err);
    }
  }, [decrementUnreadMessages]);

  // 刷新消息列表
  const refreshMessages = useCallback(() => {
    return loadMessages();
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

// 单独的未读消息计数钩子 - 简化版本
export const useUnreadCount = () => {
  const unreadCount = 3; // 直接返回固定值，避免使用hooks
  return { unreadCount };
};