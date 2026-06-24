"use client"

import Link from "next/link"
import { ChevronRight, Palette, Gift, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionTheme = 'teaching' | 'product' | 'culture'

interface ThemedSectionHeaderProps {
  title: string
  subtitle?: string
  theme: SectionTheme
  href?: string
  className?: string
}

// 主题配置
const themeConfig: Record<SectionTheme, {
  icon: typeof Palette
  iconBg: string
  iconColor: string
  accentColor: string
  subtitle: string
}> = {
  teaching: {
    icon: Palette,
    iconBg: 'bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4]',
    iconColor: 'text-white',
    accentColor: 'from-[#1e3a5f] via-[#4a90a4] to-[#87ceeb]',
    subtitle: '跟随大师，传承千年蓝染技艺'
  },
  product: {
    icon: Gift,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    iconColor: 'text-white',
    accentColor: 'from-amber-500 via-orange-400 to-yellow-400',
    subtitle: '每一件都是蓝染艺术的结晶'
  },
  culture: {
    icon: BookOpen,
    iconBg: 'bg-gradient-to-br from-[#4a90a4] to-[#87ceeb]',
    iconColor: 'text-white',
    accentColor: 'from-[#4a90a4] via-[#87ceeb] to-[#b0e0e6]',
    subtitle: '探索蓝染背后的文化故事'
  }
}

/**
 * 主题化栏目标题组件
 * 为不同栏目提供独特的视觉识别
 */
export function ThemedSectionHeader({ 
  title, 
  subtitle, 
  theme, 
  href, 
  className 
}: ThemedSectionHeaderProps) {
  const config = themeConfig[theme]
  const Icon = config.icon
  const displaySubtitle = subtitle || config.subtitle

  return (
    <div className={cn("mb-3 sm:mb-5", className)}>
      {/* 主标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 主题图标 */}
          <div className={cn(
            "p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg",
            config.iconBg
          )}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", config.iconColor)} />
          </div>
          
          {/* 标题文字 */}
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-1.5 sm:gap-2">
              {title}
              {/* 装饰点 */}
              <span className={cn(
                "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r",
                config.accentColor
              )} />
            </h2>
          </div>
        </div>

        {/* 查看全部链接 */}
        {href && (
          <Link
            href={href}
            className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all duration-200 group px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-primary/5"
          >
            <span>查看全部</span>
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* 副标题 - 手机端隐藏 */}
      <div className="hidden sm:flex mt-1.5 ml-10 sm:ml-12 items-center gap-2">
        {/* 装饰线 */}
        <div className={cn(
          "h-px w-6 sm:w-8 bg-gradient-to-r opacity-50",
          config.accentColor
        )} />
        <p className="text-[10px] sm:text-xs text-muted-foreground/80">{displaySubtitle}</p>
        <div className={cn(
          "h-px w-6 sm:w-8 bg-gradient-to-l opacity-50",
          config.accentColor
        )} />
      </div>
    </div>
  )
}
