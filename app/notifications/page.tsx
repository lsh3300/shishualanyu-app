'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useGlobalState } from '@/hooks/use-global-state';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType, Notification } from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { 
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    unreadCount
  } = useNotifications();

  // 筛选通知
  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    notification.description.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'activity': return 'bg-primary/10 text-primary';
      case 'reminder': return 'bg-secondary/10 text-secondary';
      case 'promotion': return 'bg-accent/10 text-accent';
      case 'alert': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'activity': return '活动';
      case 'reminder': return '提醒';
      case 'promotion': return '优惠';
      case 'alert': return '提醒';
      default: return '通知';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push('/')}
        >
          ← 返回首页
        </Button>
        
        {/* 页面标题和操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">通知中心</h1>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={markAllAsRead}
              className="bg-primary hover:bg-primary/90"
            >
              全部标为已读
            </Button>
          )}
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索通知..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 通知列表 */}
        <div className="border border-border rounded-lg overflow-hidden">
          <ScrollArea className="h-[calc(100vh-240px)]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-muted/50 flex items-start justify-between',
                      !notification.isRead && 'bg-background border-l-2 border-primary'
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        router.push(notification.actionUrl);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn('text-sm font-medium', !notification.isRead && 'font-semibold')}>
                          {notification.title}
                        </h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.timestamp), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 ml-2 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                <p>暂无通知</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}