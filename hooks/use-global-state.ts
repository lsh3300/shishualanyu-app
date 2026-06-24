'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

interface GlobalState {
  // 消息状态
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
  decrementUnreadMessages: () => void;
  resetUnreadMessages: () => void;
  
  // 已读消息ID列表
  readMessageIds: string[];
  markMessageAsRead: (id: string) => void;
  isMessageRead: (id: string) => boolean;
  
  // 通知相关状态
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
  decrementUnreadNotifications: () => void;
  resetUnreadNotifications: () => void;
  
  // 已读通知ID列表
  readNotificationIds: string[];
  markNotificationAsRead: (id: string) => void;
  isNotificationRead: (id: string) => boolean;
  
  // 收藏相关状态
  favorites: string[];
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorited: (id: string) => boolean;
  
  // Hydration 状态
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// 创建全局状态存储
const useGlobalStateStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      // 消息状态
      unreadMessages: 0,
      setUnreadMessages: (count) => set({ unreadMessages: count }),
      decrementUnreadMessages: () => set((state) => ({ 
        unreadMessages: Math.max(0, state.unreadMessages - 1) 
      })),
      resetUnreadMessages: () => set({ unreadMessages: 0 }),
      
      // 已读消息ID列表
      readMessageIds: [],
      markMessageAsRead: (id) => set((state) => ({
        readMessageIds: state.readMessageIds.includes(id) 
          ? state.readMessageIds 
          : [...state.readMessageIds, id]
      })),
      isMessageRead: (id) => get().readMessageIds.includes(id),
      
      // 通知状态
      unreadNotifications: 0,
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
      decrementUnreadNotifications: () => set((state) => ({ 
        unreadNotifications: Math.max(0, state.unreadNotifications - 1) 
      })),
      resetUnreadNotifications: () => set({ unreadNotifications: 0 }),
      
      // 已读通知ID列表
      readNotificationIds: [],
      markNotificationAsRead: (id) => set((state) => ({
        readNotificationIds: state.readNotificationIds.includes(id) 
          ? state.readNotificationIds 
          : [...state.readNotificationIds, id]
      })),
      isNotificationRead: (id) => get().readNotificationIds.includes(id),
      
      // 收藏状态
      favorites: [],
      addToFavorites: (id) => set((state) => ({
        favorites: state.favorites.includes(id) 
          ? state.favorites 
          : [...state.favorites, id]
      })),
      removeFromFavorites: (id) => set((state) => ({
        favorites: state.favorites.filter(itemId => itemId !== id)
      })),
      isFavorited: (id) => get().favorites.includes(id),
      
      // Hydration 状态
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'global-state',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// 导出一个安全的 hook，在 hydration 完成前返回默认值
export function useGlobalState() {
  const store = useGlobalStateStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // 在 hydration 完成前返回默认值，避免服务端/客户端不匹配
  if (!isHydrated) {
    return {
      ...store,
      unreadMessages: 0,
      unreadNotifications: 0,
      readMessageIds: [],
      readNotificationIds: [],
      favorites: [],
    };
  }
  
  return store;
}

// 也导出原始 store 供需要直接访问的场景使用
export { useGlobalStateStore };