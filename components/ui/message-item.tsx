import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/hooks/use-messages';

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
        locale: zhCN 
      });
    } catch (error) {
      return timestamp;
    }
  };

  const getTypeClass = (type: Message['type']) => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-800';
      case 'course':
        return 'bg-green-100 text-green-800';
      case 'order':
        return 'bg-orange-100 text-orange-800';
      case 'community':
        return 'bg-purple-100 text-purple-800';
      case 'comment':
        return 'bg-pink-100 text-pink-800';
      case 'follow':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Message['type']) => {
    switch (type) {
      case 'system': return '系统';
      case 'course': return '课程';
      case 'order': return '订单';
      case 'community': return '社区';
      case 'comment': return '评论';
      case 'follow': return '关注';
      default: return type;
    }
  };

  return (
    <div
      className={cn(
        'p-4 cursor-pointer transition-colors hover:bg-muted/50',
        isSelected && 'bg-muted',
        !message.isRead && 'bg-primary/5 border-l-2 border-primary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.avatar} alt={message.userName} />
          <AvatarFallback>
            {message.userName?.charAt(0) || getTypeLabel(message.type).charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn('text-sm font-medium truncate', !message.isRead && 'font-semibold')}>
              {message.title}
            </h3>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTypeClass(message.type)}`}>
              {getTypeLabel(message.type)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {!message.isRead && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}