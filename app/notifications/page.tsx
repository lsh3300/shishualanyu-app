'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Bell, Loader2, Search, Trash2 } from 'lucide-react';

import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications, type NotificationType } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

function getTypeColor(type: NotificationType) {
  switch (type) {
    case 'activity':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'promotion':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'alert':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    default:
      return 'bg-sky-50 text-sky-700 ring-sky-200';
  }
}

function getTypeLabel(type: NotificationType) {
  switch (type) {
    case 'activity':
      return '动态';
    case 'promotion':
      return '提醒';
    case 'alert':
      return '异常';
    default:
      return '通知';
  }
}

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    notifications,
    loading,
    error,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    unreadCount,
    refreshNotifications,
  } = useNotifications();

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) return true;
        return (
          notification.title.toLowerCase().includes(keyword) ||
          notification.description.toLowerCase().includes(keyword)
        );
      }),
    [notifications, searchQuery],
  );

  return (
    <div className="min-h-screen page-background-home-echo px-4 pb-8 pt-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <BackButton href="/" label="返回首页" />
        </div>

        <div className="rounded-[28px] border border-white/75 bg-white/78 shadow-[0_16px_36px_rgba(61,92,140,0.08)] backdrop-blur-[16px]">
          <div className="border-b border-[#edf2f8] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1
                  className="text-[20px] font-semibold text-[#264268]"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  通知中心
                </h1>
                <p className="mt-1 text-[12px] text-[#6f87aa]">
                  未读 {unreadCount} 条，共 {notifications.length} 条
                </p>
              </div>
              {unreadCount > 0 ? (
                <Button size="sm" className="rounded-full px-4" onClick={markAllAsRead}>
                  全部已读
                </Button>
              ) : null}
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a90b0]" />
              <Input
                placeholder="搜索通知内容"
                className="rounded-full border-[#dbe6f4] bg-white pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-220px)]">
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-[#6d85a6]">正在加载通知</p>
              </div>
            ) : error ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <Bell className="mb-4 h-12 w-12 text-[#8aa0bf]" />
                <h3 className="text-lg font-semibold text-[#243d66]">通知加载失败</h3>
                <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">{error}</p>
                <Button className="mt-6 rounded-full px-6" onClick={() => refreshNotifications()}>
                  重新加载
                </Button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f7fbff]',
                      !notification.isRead && 'bg-[#fbfdff]',
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full',
                        notification.isRead ? 'bg-transparent' : 'bg-[#4d7fba]',
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            'truncate text-[14px] text-[#29446e]',
                            notification.isRead ? 'font-medium' : 'font-semibold',
                          )}
                        >
                          {notification.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ring-1 ${getTypeColor(notification.type)}`}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6d85a6]">
                        {notification.description || '暂无详细说明'}
                      </p>
                      <p className="mt-2 text-[11px] text-[#8ca0bd]">
                        {format(new Date(notification.timestamp), 'yyyy.MM.dd HH:mm', { locale: zhCN })}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="mt-1 h-8 w-8 shrink-0 rounded-full text-[#8da0bb] hover:bg-rose-50 hover:text-rose-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </button>
                  {index < filteredNotifications.length - 1 ? <Separator /> : null}
                </div>
              ))
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <Bell className="mb-4 h-12 w-12 text-[#8aa0bf]" />
                <h3 className="text-lg font-semibold text-[#243d66]">
                  {searchQuery ? '没有匹配结果' : '暂无通知'}
                </h3>
                <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">
                  {searchQuery ? '换个关键词试试。' : '后续订单、课程、系统提醒都会汇总到这里。'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

