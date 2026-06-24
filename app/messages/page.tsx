"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowLeft, Check, CheckCheck, Loader2, MessageSquare, Search, Trash2 } from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { MessageItem } from "@/components/ui/message-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessages, type Message, type MessageType } from "@/hooks/use-messages";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "全部" },
  { value: "system", label: "系统" },
  { value: "course", label: "课程" },
  { value: "order", label: "订单" },
  { value: "community", label: "社区" },
];

export default function MessagesPage() {
  const isMobile = useIsMobile();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
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

  const filteredMessages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesTab = activeTab === "all" || message.type === activeTab;
      const matchesSearch =
        !keyword ||
        message.title.toLowerCase().includes(keyword) ||
        message.content.toLowerCase().includes(keyword);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, messages, searchQuery]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedMessageId) ||
    messages.find((message) => message.id === selectedMessageId) ||
    null;

  const handleMessageClick = (message: Message) => {
    setSelectedMessageId(message.id);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleBackClick = () => {
    setSelectedMessageId(null);
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
  };

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case "system":
        return "系统";
      case "course":
        return "课程";
      case "order":
        return "订单";
      case "community":
        return "社区";
      case "comment":
        return "评论";
      case "follow":
        return "关注";
      default:
        return type;
    }
  };

  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case "system":
        return "bg-sky-50 text-sky-700 ring-sky-200";
      case "course":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "order":
        return "bg-violet-50 text-violet-700 ring-violet-200";
      case "community":
        return "bg-orange-50 text-orange-700 ring-orange-200";
      case "comment":
        return "bg-pink-50 text-pink-700 ring-pink-200";
      case "follow":
        return "bg-indigo-50 text-indigo-700 ring-indigo-200";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy.MM.dd HH:mm", { locale: zhCN });
    } catch {
      return timestamp;
    }
  };

  const listContent = loading ? (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-[#6d85a6]">正在加载消息</p>
    </div>
  ) : error ? (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-[#8aa0bf]" />
      <h3 className="text-lg font-semibold text-[#243d66]">消息加载失败</h3>
      <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">{error}</p>
      <Button className="mt-6 rounded-full px-6" onClick={() => refreshMessages()}>
        重新加载
      </Button>
    </div>
  ) : filteredMessages.length > 0 ? (
    <div>
      {filteredMessages.map((message, index) => (
        <div key={message.id}>
          <MessageItem
            message={message}
            isSelected={selectedMessage?.id === message.id}
            onClick={() => handleMessageClick(message)}
          />
          {index < filteredMessages.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  ) : (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-[#8aa0bf]" />
      <h3 className="text-lg font-semibold text-[#243d66]">
        {searchQuery ? "没有匹配结果" : "暂无消息"}
      </h3>
      <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">
        {searchQuery ? "换个关键词再试试。" : "订单、课程与系统消息后续都会汇总到这里。"}
      </p>
    </div>
  );

  const detailContent = selectedMessage ? (
    <Card className="overflow-hidden rounded-[28px] border border-white/75 bg-white/80 shadow-[0_16px_36px_rgba(61,92,140,0.08)] backdrop-blur-[16px]">
      <CardHeader className="border-b border-[#edf2f8] px-5 py-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={selectedMessage.avatar} alt={selectedMessage.userName} />
            <AvatarFallback>
              {selectedMessage.userName?.charAt(0) || getMessageTypeLabel(selectedMessage.type).charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate text-[18px] font-semibold text-[#264268]">
                  {selectedMessage.title}
                </CardTitle>
                <CardDescription className="mt-1 text-[12px] text-[#6f87aa]">
                  {selectedMessage.userName || "系统"} · {formatTime(selectedMessage.timestamp)}
                </CardDescription>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${getMessageTypeColor(selectedMessage.type)}`}>
                {getMessageTypeLabel(selectedMessage.type)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-5">
        <div className="whitespace-pre-wrap text-[14px] leading-7 text-[#334a68]">
          {selectedMessage.content || "暂无详细内容"}
        </div>

        {selectedMessage.relatedUrl ? (
          <div className="mt-5">
            <Button variant="outline" asChild className="rounded-full px-5">
              <Link href={selectedMessage.relatedUrl}>查看详情</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          {!selectedMessage.isRead ? (
            <Button variant="outline" className="rounded-full" onClick={() => markAsRead(selectedMessage.id)}>
              <Check className="mr-2 h-4 w-4" />
              标记已读
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => handleDelete(selectedMessage.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="flex h-[560px] items-center justify-center rounded-[28px] border border-white/75 bg-white/80 shadow-[0_16px_36px_rgba(61,92,140,0.08)] backdrop-blur-[16px]">
      <CardContent className="px-6 text-center">
        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-[#8aa0bf]" />
        <p className="text-sm text-[#6d85a6]">选择一条消息查看详情</p>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen page-background-home-echo px-4 pb-8 pt-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4">
            {selectedMessage ? (
              <Button variant="ghost" size="icon" onClick={handleBackClick} className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <BackButton href="/" label="返回首页" />
            )}
          </div>

          {!selectedMessage ? (
            <div className="overflow-hidden rounded-[28px] border border-white/75 bg-white/80 shadow-[0_16px_36px_rgba(61,92,140,0.08)] backdrop-blur-[16px]">
              <div className="border-b border-[#edf2f8] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1
                      className="text-[20px] font-semibold text-[#264268]"
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                    >
                      消息中心
                    </h1>
                    <p className="mt-1 text-[12px] text-[#6f87aa]">
                      未读 {unreadCount} 条，共 {messages.length} 条
                    </p>
                  </div>
                  {unreadCount > 0 ? (
                    <Button size="sm" className="rounded-full px-4" onClick={markAllAsRead}>
                      <CheckCheck className="mr-1 h-4 w-4" />
                      全部已读
                    </Button>
                  ) : null}
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a90b0]" />
                  <Input
                    placeholder="搜索消息内容"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-full border-[#dbe6f4] bg-white pl-10"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid h-auto grid-cols-5 rounded-full bg-[#f4f7fb] p-1">
                    {TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-full px-0 text-[12px] data-[state=active]:bg-white data-[state=active]:text-[#264268]"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="h-[calc(100vh-250px)]">{listContent}</ScrollArea>
            </div>
          ) : (
            detailContent
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background-home-echo px-4 pb-8 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <BackButton href="/" label="返回首页" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[28px] border border-white/75 bg-white/80 shadow-[0_16px_36px_rgba(61,92,140,0.08)] backdrop-blur-[16px]">
            <div className="border-b border-[#edf2f8] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1
                    className="text-[22px] font-semibold text-[#264268]"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    消息中心
                  </h1>
                  <p className="mt-1 text-[12px] text-[#6f87aa]">
                    未读 {unreadCount} 条，共 {messages.length} 条
                  </p>
                </div>
                {unreadCount > 0 ? (
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[12px]">
                    {unreadCount}
                  </Badge>
                ) : null}
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a90b0]" />
                <Input
                  placeholder="搜索消息内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full border-[#dbe6f4] bg-white pl-10"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid h-auto grid-cols-5 rounded-full bg-[#f4f7fb] p-1">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-full px-0 text-[12px] data-[state=active]:bg-white data-[state=active]:text-[#264268]"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {unreadCount > 0 ? (
                <Button variant="outline" className="mt-4 w-full rounded-full" onClick={markAllAsRead}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  全部标记已读
                </Button>
              ) : null}
            </div>

            <ScrollArea className="h-[calc(100vh-255px)]">{listContent}</ScrollArea>
          </div>

          <div className={cn("min-w-0", !selectedMessage && "hidden lg:block")}>{detailContent}</div>
        </div>
      </div>
    </div>
  );
}

