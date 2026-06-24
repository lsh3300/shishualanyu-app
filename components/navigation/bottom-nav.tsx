"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BookOpen, Gamepad2, ShoppingBag, User } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/teaching", icon: BookOpen, label: "教学" },
  { href: "/game/shop", icon: Gamepad2, label: "游戏", isCenter: true },
  { href: "/store", icon: ShoppingBag, label: "文创" },
  { href: "/profile", icon: User, label: "我的" },
]

export function BottomNav() {
  const pathname = usePathname()

  const [portalEl, setPortalEl] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null
    return document.getElementById("mobile-bottom-nav-root")
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    setPortalEl(document.getElementById("mobile-bottom-nav-root"))
  }, [])

  const inPhoneSimulator = Boolean(portalEl)

  const navClassName = useMemo(() => {
    const base = "bottom-nav pointer-events-auto z-50 overflow-hidden px-4 pt-2"
    if (inPhoneSimulator) {
      return cn(
        base,
        "w-full rounded-t-[28px] border-t border-white/32 shadow-[0_-10px_24px_rgba(26,35,126,0.10)]"
      )
    }
    return cn(
      base,
      "fixed bottom-0 left-0 right-0 rounded-t-[24px] border-t border-white/28 shadow-[0_-8px_22px_rgba(26,35,126,0.10)]"
    )
  }, [inPhoneSimulator])

  const navStyle = useMemo<React.CSSProperties>(() => {
    if (inPhoneSimulator) return { paddingBottom: "0.25rem" }
    return { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)" }
  }, [inPhoneSimulator])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/game/shop") return pathname.startsWith("/game")
    return pathname.startsWith(href)
  }

  const nav = (
    <nav className={navClassName} style={navStyle} data-testid="bottom-nav">
      <div className="flex justify-between items-center relative h-12" data-testid="bottom-nav-items">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          // 中间的游戏按钮 - 特殊样式，稍微大一点但不突出导航栏
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-3"
                data-testid="bottom-nav-game"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-full border border-[#d3e3fb] bg-[linear-gradient(180deg,#f7fbff_0%,#dcecff_100%)] text-[#2b5c9e]",
                    "flex items-center justify-center",
                    "shadow-[0_8px_18px_rgba(53,95,146,0.18)]",
                    "hover:scale-105 active:scale-95 transition-all",
                    active && "ring-2 ring-[#7fa6da]/55 bg-[linear-gradient(180deg,#eef6ff_0%,#cfe3ff_100%)] text-[#214b86]"
                  )}
                >
                  <Icon className="h-[20px] w-[20px] stroke-[2]" />
                </div>
              </Link>
            )
          }

          // 普通导航项
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-all",
                active ? "text-[#24497f]" : "text-[#4f6f9f]"
              )}
              data-testid={`bottom-nav-${item.label}`}
            >
              <Icon
                className={cn(
                  "w-[22px] h-[22px]",
                  active && "fill-current"
                )}
              />
              <span className="text-[10px] font-semibold tracking-[0.01em]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )

  if (portalEl) return createPortal(nav, portalEl)
  return nav
}
