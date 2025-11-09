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
      
      // 暂时返回空数组，等待API实现
      const messages: Message[] = [];
      
      // 应用全局已读状态到消息列表
      const updatedMessages = messages.map(msg => ({
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
  const { unreadMessages } = useGlobalState();
  return { unreadCount: unreadMessages };
};