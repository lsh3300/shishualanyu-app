import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <Skeleton className="h-10 w-40 mb-6" />
        
        {/* 搜索栏 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-10 pl-10 rounded-md" />
        </div>
        
        {/* 通知列表骨架 */}
        <div className="border border-border rounded-lg overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-32" />
              {i < 5 && <div className="border-t border-border mt-3" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}