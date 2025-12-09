"use client"

import { Home, BookOpen, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/teaching", icon: BookOpen, label: "教学" },
  { href: "/store", icon: ShoppingBag, label: "文创" },
  { href: "/profile", icon: User, label: "我的" },
]

export function BottomNav() {
  const pathname = usePathname()
  const isGameActive = pathname.startsWith("/game")

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="relative flex items-center justify-around py-2">
        {/* 首页 */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            pathname === "/" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">首页</span>
        </Link>

        {/* 教学 */}
        <Link
          href="/teaching"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            pathname === "/teaching" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">教学</span>
        </Link>

        {/* 游戏入口 - 特殊凸起按钮 */}
        <Link
          href="/game/shop"
          className={cn(
            "relative -top-6",
            "flex flex-col items-center justify-center",
            "w-16 h-16 rounded-2xl",
            "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600",
            "shadow-lg shadow-amber-500/40",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-xl hover:shadow-amber-500/60",
            "active:scale-95",
            "group",
            isGameActive && "ring-4 ring-amber-400/50 ring-offset-2"
          )}
        >
          {/* 背景动画 */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            {isGameActive && (
              <div className="absolute inset-0 animate-pulse bg-white/10" />
            )}
          </div>

          {/* 图标 - 商店 */}
          <div
            className={cn(
              "text-3xl relative z-10 transition-transform",
              "group-hover:rotate-12 group-hover:scale-110",
              isGameActive && "animate-bounce"
            )}
          >
            🏪
          </div>

          {/* 标签文字 */}
          <span className="text-[10px] font-bold text-white mt-1 relative z-10">游戏</span>

          {/* NEW 标签 */}
          <div className="absolute -top-1 -right-1 w-8 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-20">
            <span className="text-[8px] font-bold text-white">NEW</span>
          </div>

          {/* 底部光晕效果 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-amber-500/30 rounded-full blur-md" />
        </Link>

        {/* 文创 */}
        <Link
          href="/store"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            pathname === "/store" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ShoppingBag className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">文创</span>
        </Link>

        {/* 我的 */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            pathname === "/profile" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">我的</span>
        </Link>
      </div>
    </nav>
  )
}
