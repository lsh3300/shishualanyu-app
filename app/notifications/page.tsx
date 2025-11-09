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

// 模拟通知数据
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

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { 
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    unreadCount
  } = useNotifications(mockNotifications);

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