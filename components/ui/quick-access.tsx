"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { CraftIcon, MaterialIcon, WorkshopIcon, AICreateIcon } from "@/components/icons/quick-access-icons"

interface QuickAccessItem {
  href: string
  icon: LucideIcon
  label: string
  color?: string
}

interface QuickAccessProps {
  items: QuickAccessItem[]
}

// 根据 href 获取对应的蓝染风格图标
const getCustomIcon = (href: string) => {
  if (href.includes('teaching')) return CraftIcon
  if (href.includes('materials')) return MaterialIcon
  if (href.includes('custom')) return WorkshopIcon
  if (href.includes('ai-create')) return AICreateIcon
  return null
}

// 根据 href 获取背景渐变色
const getGradientBg = (href: string) => {
  if (href.includes('teaching')) return 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a7f]'
  if (href.includes('materials')) return 'bg-gradient-to-br from-amber-500 to-amber-600'
  if (href.includes('custom')) return 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  if (href.includes('ai-create')) return 'bg-gradient-to-br from-indigo-500 to-purple-600'
  return 'bg-gradient-to-br from-primary to-primary/80'
}

export function QuickAccess({ items }: QuickAccessProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 max-w-2xl mx-auto">
      {items.map((item) => {
        const CustomIcon = getCustomIcon(item.href)
        const FallbackIcon = item.icon
        const gradientBg = getGradientBg(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${gradientBg} shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
              {CustomIcon ? (
                <CustomIcon size={22} className="sm:w-7 sm:h-7 transition-transform duration-300" />
              ) : (
                <FallbackIcon className="h-5 w-5 sm:h-7 sm:w-7 text-white transition-transform duration-300" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-center text-foreground/80 transition-colors duration-200 group-hover:text-primary leading-tight">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
