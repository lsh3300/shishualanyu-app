"use client"

import { cn } from "@/lib/utils"

interface SectionDividerProps {
  variant?: 'wave' | 'dots' | 'pattern'
  className?: string
}

/**
 * 蓝染风格栏目分隔组件
 * - wave: 水波纹样式
 * - dots: 扎染圆点样式
 * - pattern: 蓝染图案样式
 */
export function SectionDivider({ variant = 'pattern', className }: SectionDividerProps) {
  if (variant === 'wave') {
    return (
      <div className={cn("divider-wave my-6", className)} aria-hidden="true" />
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn("divider-dots my-6", className)} aria-hidden="true">
        {/* 扎染圆点 */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#1e3a5f]/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#4a90a4]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#87ceeb]/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#4a90a4]/40" />
          <span className="w-2 h-2 rounded-full bg-[#1e3a5f]/30" />
        </div>
      </div>
    )
  }

  // pattern 样式
  return (
    <div className={cn("divider-pattern my-6", className)} aria-hidden="true" />
  )
}
