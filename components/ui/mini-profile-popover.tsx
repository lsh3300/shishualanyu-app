'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Settings, BookOpen, ShoppingBag, Heart, LogOut, ChevronRight, Bell, Award, Clock, TrendingUp, Gift } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useGlobalState } from "@/hooks/use-global-state";

interface MiniProfilePopoverProps {
  className?: string;
}

export function MiniProfilePopover({ className }: MiniProfilePopoverProps) {
  const [mounted, setMounted] = useState(false);
  // 使用全局状态获取未读通知数量
  const { unreadNotifications } = useGlobalState();
  
  // 确保在客户端渲染后才初始化
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock user data (in a real app, this would come from context or API)
  const user = {
    name: "蓝染爱好者",
    avatar: "/placeholder-user.jpg",
    level: "中级染匠",
    levelProgress: 75,
    nextLevel: "高级染匠",
    stats: {
      coursesCompleted: 8,
      totalLearningHours: 42,
      productsPurchased: 15,
      badgesEarned: 3
    }
  };

  // Menu items for the mini profile
  const menuItems = [
    { href: "/profile", icon: User, label: "个人中心" },
    { href: "/profile/courses", icon: BookOpen, label: "我的课程", badge: `${user.stats.coursesCompleted}门` },
    { href: "/profile/orders", icon: ShoppingBag, label: "我的订单", badge: "待发货" },
    { href: "/profile/favorites", icon: Heart, label: "我的收藏" },
    { href: "/profile/settings", icon: Settings, label: "设置" },
  ];

  // Personalized recommendations
  const recommendations = [
    { id: 1, type: "course", title: "蓝染进阶技法", image: "/tie-dye-tutorial-hands-on.jpg" },
    { id: 2, type: "product", title: "高级染料套装", image: "/indigo-dyed-linen-tea-mat.jpg" }
  ];

  if (!mounted) {
    // 服务端渲染时的占位
    return (
      <div className="relative group cursor-pointer">
        <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-primary bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group cursor-pointer">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/80 transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/30 shadow-md">
            <img
              src={user.avatar}
              alt="用户头像"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* 上线状态指示器 */}
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500 shadow-sm"></div>
          </div>
          {unreadNotifications > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[10px] text-white font-medium rounded-full flex items-center justify-center shadow-sm animate-pulse">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn("w-80 p-0 border-0 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200", className || '')}
      >
        {/* User Profile Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{user.name}</h3>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Award className="h-3 w-3 mr-1" />
                  {user.level}
                </Badge>
              </div>
              
              {/* Level Progress */}
              <div className="mt-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>升级进度</span>
                  <span>{user.levelProgress}%</span>
                </div>
                <Progress value={user.levelProgress} className="h-1.5 bg-primary/10" />
                <p className="text-[10px] text-muted-foreground mt-0.5">距离 {user.nextLevel} 还需学习 3 小时</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-4 gap-1 p-3 border-b border-border bg-muted/30">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">{user.stats.coursesCompleted}</span>
            <span className="text-xs text-muted-foreground">课程</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">{user.stats.totalLearningHours}h</span>
            <span className="text-xs text-muted-foreground">学习时长</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">{user.stats.productsPurchased}</span>
            <span className="text-xs text-muted-foreground">购买</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">{user.stats.badgesEarned}</span>
            <span className="text-xs text-muted-foreground">徽章</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-border">
          <Link href="/messages" className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                  {unreadNotifications}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1 text-muted-foreground">通知</span>
          </Link>
          <Link href="/profile/courses" className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs mt-1 text-muted-foreground">课程</span>
          </Link>
          <Link href="/store" className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors">
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs mt-1 text-muted-foreground">文创</span>
          </Link>
          <Link href="/profile/achievements" className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs mt-1 text-muted-foreground">成就</span>
          </Link>
        </div>

        {/* Personalized Recommendations */}
        <div className="p-3 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-primary" />
              为你推荐
            </h4>
            <Link href="/recommendations" className="text-xs text-primary hover:underline">
              更多
            </Link>
          </div>
          <div className="flex gap-2">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                href={item.type === 'course' ? `/teaching/${item.id}` : `/store/${item.id}`}
                className="flex-1 relative h-24 rounded-lg overflow-hidden group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                  <span className="text-xs text-white font-medium line-clamp-1">{item.title}</span>
                </div>
                <Badge className="absolute top-1 left-1 bg-primary/80 text-white text-[10px]">
                  {item.type === 'course' ? '课程' : '商品'}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                {React.createElement(item.icon, { className: "h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" })}
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</span>
              </div>
              {item.badge ? (
                <Badge variant="secondary" className="text-[10px] py-0 h-5">
                  {item.badge}
                </Badge>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </Link>
          ))}
          
          {/* 额外菜单项 */}
          <Link
            href="/help"
            className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">帮助与反馈</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          
          <Link
            href="/history"
            className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">浏览历史</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* Footer Button */}
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-sm hover:bg-primary/10 hover:text-primary transition-all">
            <LogOut className="h-4 w-4 mr-2 text-muted-foreground" />
            退出登录
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}