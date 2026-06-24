import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/hooks/use-messages';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
}

export function MessageItem({ message, isSelected, onClick }: MessageItemProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return timestamp;
    }
  };

  const getTypeClass = (type: Message['type']) => {
    switch (type) {
      case 'system':
        return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'course':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'order':
        return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'community':
        return 'bg-orange-50 text-orange-700 ring-orange-200';
      case 'comment':
        return 'bg-pink-50 text-pink-700 ring-pink-200';
      case 'follow':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-200';
    }
  };

  const getTypeLabel = (type: Message['type']) => {
    switch (type) {
      case 'system':
        return '系统';
      case 'course':
        return '课程';
      case 'order':
        return '订单';
      case 'community':
        return '社区';
      case 'comment':
        return '评论';
      case 'follow':
        return '关注';
      default:
        return type;
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f7fbff]',
        isSelected && 'bg-[#f5f9fe]',
        !message.isRead && 'bg-[#fbfdff]',
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full',
          message.isRead ? 'bg-transparent' : 'bg-[#4d7fba]',
        )}
      />

      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={message.avatar} alt={message.userName} />
        <AvatarFallback>
          {message.userName?.charAt(0) || getTypeLabel(message.type).charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'truncate text-[14px] text-[#29446e]',
              message.isRead ? 'font-medium' : 'font-semibold',
            )}
          >
            {message.title}
          </h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] ring-1 ${getTypeClass(message.type)}`}>
            {getTypeLabel(message.type)}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6d85a6]">{message.content}</p>
        <p className="mt-2 text-[11px] text-[#8ca0bd]">{formatTime(message.timestamp)}</p>
      </div>
    </button>
  );
}
