import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <Skeleton className="h-10 w-40 mb-6" />
        
        {/* 搜索栏 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-10 pl-10 rounded-md" />
        </div>
        
        {/* 选项卡 */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="flex-1">全部</TabsTrigger>
            <TabsTrigger value="system" className="flex-1">系统</TabsTrigger>
            <TabsTrigger value="course" className="flex-1">课程</TabsTrigger>
            <TabsTrigger value="order" className="flex-1">订单</TabsTrigger>
            <TabsTrigger value="community" className="flex-1">社区</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 消息列表骨架 */}
              <div className="md:col-span-1 border border-border rounded-lg overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-end mt-2">
                      <Skeleton className="h-3 w-16" />
                    </div>
                    {i < 5 && <div className="border-t border-border mt-3" />}
                  </div>
                ))}
              </div>
              
              {/* 消息详情骨架 */}
              <div className="md:col-span-2 border border-border rounded-lg overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="border-t border-border my-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-8">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}