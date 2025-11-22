"use client"

import { Home, BookOpen, ShoppingBag, User, Droplet } from "lucide-react"
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
  const isGameActive = pathname.startsWith("/indigo-game")

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="relative flex items-center justify-around py-2">
        {/* 左侧导航项 */}
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

        {/* 中央游戏按钮 - 占位空间 */}
        <div className="w-16" />

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

        {/* 中央凸起的游戏按钮 */}
        <Link
          href="/indigo-game"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-6",
            "flex items-center justify-center",
            "w-16 h-16 rounded-full",
            "bg-gradient-to-br from-indigo-500 to-blue-600",
            "shadow-lg shadow-indigo-500/50",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/60",
            "active:scale-95",
            isGameActive && "ring-4 ring-indigo-300 ring-offset-2"
          )}
        >
          <Droplet className={cn(
            "h-7 w-7 text-white",
            isGameActive && "animate-pulse"
          )} />
        </Link>
      </div>
    </nav>
  )
}
