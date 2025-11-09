"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessages } from '@/hooks/use-messages';
import { useGlobalState } from '@/hooks/use-global-state';
import { MessageItem } from "@/components/ui/message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Check, CheckCheck, Trash2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

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

export default function MessagesPage() {
  const isMobile = useIsMobile();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    refreshMessages,
  } = useMessages();

  // 根据标签和搜索条件过滤消息
  const filteredMessages = messages.filter(message => {
    const matchesTab = activeTab === "all" || message.type === activeTab;
    const matchesSearch = searchQuery === "" || 
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // 处理消息点击
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  // 处理返回按钮点击
  const handleBackClick = () => {
    setSelectedMessage(null);
  };

  // 获取消息类型标签
  const getMessageTypeLabel = (type: MessageType) => {
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

  // 获取消息类型颜色
  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-green-100 text-green-800';
      case 'order': return 'bg-purple-100 text-purple-800';
      case 'community': return 'bg-orange-100 text-orange-800';
      case 'comment': return 'bg-pink-100 text-pink-800';
      case 'follow': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化时间
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

  // 移动端视图
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center p-4">
            {selectedMessage ? (
              <Button variant="ghost" size="icon" onClick={handleBackClick}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <h1 className="ml-2 text-lg font-semibold">
              {selectedMessage ? "消息详情" : "消息中心"}
            </h1>
            {!selectedMessage && unreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* 消息列表视图 */}
        {!selectedMessage && (
          <div className="p-4">
            {/* 搜索栏 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索消息"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all" className="text-xs">
                  全部
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs">
                  系统
                </TabsTrigger>
                <TabsTrigger value="course" className="text-xs">
                  课程
                </TabsTrigger>
                <TabsTrigger value="order" className="text-xs">
                  订单
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs">
                  社区
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 全部标记已读按钮 */}
            {unreadCount > 0 && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  全部已读
                </Button>
              </div>
            )}

            {/* 消息列表 */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={refreshMessages}>
                    重试
                  </Button>
                </CardContent>
              </Card>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "没有找到匹配的消息" : "暂无消息"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer transition-colors ${
                      !message.isRead ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.avatar} alt={message.userName} />
                          <AvatarFallback>
                            {message.userName?.charAt(0) || getMessageTypeLabel(message.type).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-sm font-medium truncate ${
                              !message.isRead ? "font-semibold" : ""
                            }`}>
                              {message.title}
                            </h3>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${getMessageTypeColor(message.type)}`}>
                              {getMessageTypeLabel(message.type)}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 消息详情视图 */}
        {selectedMessage && (
          <div className="p-4">
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMessage.avatar} alt={selectedMessage.userName} />
                    <AvatarFallback>
                      {selectedMessage.userName?.charAt(0) || getMessageTypeLabel(selectedMessage.type).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedMessage.title}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${getMessageTypeColor(selectedMessage.type)}`}>
                        {getMessageTypeLabel(selectedMessage.type)}
                      </span>
                    </div>
                    <CardDescription>
                      {formatTime(selectedMessage.timestamp)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                
                {selectedMessage.relatedUrl && (
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href={selectedMessage.relatedUrl}>
                        查看详情
                      </Link>
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end mt-6 space-x-2">
                  {!selectedMessage.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedMessage.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      标记已读
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      deleteMessage(selectedMessage.id);
                      handleBackClick();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // 桌面端视图
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">消息中心</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-3">
                {unreadCount} 条未读
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              全部标记已读
            </Button>
          )}
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索消息"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="system">系统</TabsTrigger>
            <TabsTrigger value="course">课程</TabsTrigger>
            <TabsTrigger value="order">订单</TabsTrigger>
            <TabsTrigger value="community">社区</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 消息列表和详情 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 消息列表 */}
          <div className="md:col-span-1">
            <Card>
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        {i < 5 && <div className="border-t mx-4"></div>}
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={refreshMessages}>
                      重试
                    </Button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? "没有找到匹配的消息" : "暂无消息"}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredMessages.map((message, index) => (
                      <div key={message.id}>
                        <MessageItem
                          message={message}
                          isSelected={selectedMessage?.id === message.id}
                          onClick={() => handleMessageClick(message)}
                        />
                        {index < filteredMessages.length - 1 && (
                          <div className="border-t mx-4"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 消息详情 */}
          <div className="md:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedMessage.avatar} alt={selectedMessage.userName} />
                      <AvatarFallback>
                        {selectedMessage.userName?.charAt(0) || getMessageTypeLabel(selectedMessage.type).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{selectedMessage.title}</CardTitle>
                        <span className={`text-sm px-2 py-1 rounded-full ${getMessageTypeColor(selectedMessage.type)}`}>
                          {getMessageTypeLabel(selectedMessage.type)}
                        </span>
                      </div>
                      <CardDescription className="mt-1">
                        {formatTime(selectedMessage.timestamp)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMessage.content}
                  </div>
                  
                  {selectedMessage.relatedUrl && (
                    <div className="mt-6">
                      <Button variant="outline" asChild>
                        <Link href={selectedMessage.relatedUrl}>
                          查看详情
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-8 space-x-2">
                    {!selectedMessage.isRead && (
                      <Button
                        variant="outline"
                        onClick={() => markAsRead(selectedMessage.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        标记已读
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        deleteMessage(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <p className="text-muted-foreground">选择一条消息查看详情</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}