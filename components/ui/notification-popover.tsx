'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, X, Clock, MessageCircle, ShoppingBag, Heart, Star, Award, Calendar } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useGlobalState } from "@/hooks/use-global-state";

interface NotificationItem {
  id: string;
  type: 'system' | 'message' | 'order' | 'like' | 'course' | 'achievement';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationPopoverProps {
  className?: string;
}

export function NotificationPopover({ className }: NotificationPopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { 
    unreadNotifications, 
    setUnreadNotifications, 
    decrementUnreadNotifications, 
    resetUnreadNotifications 
  } = useGlobalState();
  
  // 确保在客户端渲染后才初始化
  useEffect(() => {
    setMounted(true);
    
    // 初始化为空数组，等待API实现
    const notifications: NotificationItem[] = [];
    
    setNotifications(notifications);
    
    // 初始化时同步未读通知数量到全局状态
    const localUnreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotifications(localUnreadCount);
  }, [setUnreadNotifications]);

  // 使用全局状态中的未读通知数量
  const unreadCount = unreadNotifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    // 更新全局状态中的未读通知数
    decrementUnreadNotifications();
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    // 重置全局状态中的未读通知数
    resetUnreadNotifications();
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'system':
        return <Bell className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'course':
        return <Calendar className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-green-100 text-green-600';
      case 'order':
        return 'bg-purple-100 text-purple-600';
      case 'like':
        return 'bg-red-100 text-red-600';
      case 'course':
        return 'bg-orange-100 text-orange-600';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!mounted) {
    // 服务端渲染时的占位
    return (
      <div className="relative group cursor-pointer">
        <div className="relative h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group cursor-pointer">
          <div className="relative h-8 w-8 rounded-full bg-muted transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/20 flex items-center justify-center">
            <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn("w-96 p-0 border-0 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200", className || '')}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">通知中心</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-primary hover:bg-primary/10"
              onClick={markAllAsRead}
            >
              全部已读
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">暂无通知</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  {!notification.read && (
                    <div className="absolute top-4 left-2 h-2 w-2 bg-primary rounded-full"></div>
                  )}
                  <div className="flex gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(notification.timestamp, { 
                            addSuffix: true, 
                            locale: zhCN 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <Link href="/notifications" className="block">
            <Button variant="ghost" className="w-full justify-center text-sm hover:bg-primary/10 hover:text-primary transition-all">
              查看全部通知
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}