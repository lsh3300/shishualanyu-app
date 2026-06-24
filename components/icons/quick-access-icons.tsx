"use client"

import { cn } from "@/lib/utils"

interface QuickIconProps {
  size?: number
  className?: string
}

// 传统工艺图标 - 染缸与布料
export function CraftIcon({ size = 28, className }: QuickIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="craftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#2d5a7f" />
        </linearGradient>
        <linearGradient id="craftWater" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a90a4" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
      </defs>
      
      {/* 染缸 */}
      <path
        d="M6 12 L6 24 Q6 28, 16 28 Q26 28, 26 24 L26 12"
        fill="url(#craftGradient)"
        stroke="#1e3a5f"
        strokeWidth="1.5"
      />
      
      {/* 染缸口 */}
      <ellipse cx="16" cy="12" rx="10" ry="3" fill="#2d5a7f" stroke="#1e3a5f" strokeWidth="1.5" />
      
      {/* 水面 */}
      <ellipse cx="16" cy="14" rx="8" ry="2" fill="url(#craftWater)" opacity="0.8" />
      
      {/* 水波纹 */}
      <path d="M10 16 Q13 15, 16 16 T22 16" stroke="#87ceeb" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M11 18 Q14 17, 17 18 T21 18" stroke="#87ceeb" strokeWidth="0.8" fill="none" opacity="0.4" />
      
      {/* 布料 */}
      <path
        d="M12 4 L12 10 Q12 12, 14 12 L18 12 Q20 12, 20 10 L20 4"
        fill="none"
        stroke="#4a90a4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M13 5 L13 8" stroke="#87ceeb" strokeWidth="1" opacity="0.6" />
      <path d="M19 5 L19 8" stroke="#87ceeb" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

// 材料包图标 - 扎染材料
export function MaterialIcon({ size = 28, className }: QuickIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="materialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="fabricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#2d5a7f" />
        </linearGradient>
      </defs>
      
      {/* 包装盒 */}
      <rect x="4" y="10" width="24" height="18" rx="3" fill="url(#materialGradient)" />
      <rect x="4" y="10" width="24" height="6" rx="2" fill="#fbbf24" opacity="0.3" />
      
      {/* 盒盖 */}
      <path d="M3 10 L16 4 L29 10" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* 布料卷 */}
      <ellipse cx="12" cy="20" rx="4" ry="5" fill="url(#fabricGradient)" />
      <ellipse cx="12" cy="20" rx="2" ry="3" fill="#4a90a4" opacity="0.6" />
      
      {/* 扎染图案 */}
      <circle cx="20" cy="18" r="3" fill="#1e3a5f" />
      <circle cx="20" cy="18" r="1.5" fill="#87ceeb" opacity="0.6" />
      <circle cx="22" cy="22" r="2" fill="#2d5a7f" />
      <circle cx="22" cy="22" r="1" fill="#87ceeb" opacity="0.4" />
      
      {/* 装饰线 */}
      <path d="M6 14 L26 14" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// 定制工坊图标 - 工具与布料
export function WorkshopIcon({ size = 28, className }: QuickIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="workshopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      
      {/* 工作台 */}
      <rect x="4" y="20" width="24" height="8" rx="2" fill="#8b5cf6" opacity="0.2" />
      <rect x="4" y="20" width="24" height="3" rx="1" fill="#7c3aed" />
      
      {/* 剪刀 */}
      <path
        d="M8 8 L14 16 M8 16 L14 8"
        stroke="#1e3a5f"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="2" fill="#4a90a4" />
      <circle cx="8" cy="16" r="2" fill="#4a90a4" />
      
      {/* 布料 */}
      <path
        d="M18 6 L28 6 L28 18 L18 18 Z"
        fill="url(#workshopGradient)"
        stroke="#047857"
        strokeWidth="1"
      />
      <path d="M20 8 L26 8" stroke="#87ceeb" strokeWidth="1" opacity="0.5" />
      <path d="M20 11 L26 11" stroke="#87ceeb" strokeWidth="1" opacity="0.4" />
      <path d="M20 14 L24 14" stroke="#87ceeb" strokeWidth="1" opacity="0.3" />
      
      {/* 扎结 */}
      <circle cx="23" cy="12" r="2" fill="#fbbf24" opacity="0.8" />
    </svg>
  )
}

// AI创作图标 - 智能与蓝染结合
export function AICreateIcon({ size = 28, className }: QuickIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      
      {/* 大脑/芯片形状 */}
      <rect x="8" y="8" width="16" height="16" rx="4" fill="url(#aiGradient)" />
      
      {/* 电路线 */}
      <path d="M4 16 L8 16" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 16 L28 16" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 4 L16 8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 24 L16 28" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      
      {/* 内部图案 - 蓝染水滴 */}
      <path
        d="M16 11 C16 11, 12 15, 12 17 C12 19.2 13.8 21 16 21 C18.2 21 20 19.2 20 17 C20 15, 16 11, 16 11 Z"
        fill="#87ceeb"
      />
      <ellipse cx="14.5" cy="16" rx="1" ry="1.5" fill="white" opacity="0.5" />
      
      {/* 星星装饰 */}
      <path
        d="M6 6 L7 8 L6 10 L8 9 L10 10 L9 8 L10 6 L8 7 Z"
        fill="url(#sparkGradient)"
      />
      <path
        d="M24 22 L25 24 L24 26 L26 25 L28 26 L27 24 L28 22 L26 23 Z"
        fill="url(#sparkGradient)"
        opacity="0.7"
      />
    </svg>
  )
}

// 导出所有快捷入口图标
export const QuickAccessIcons = {
  Craft: CraftIcon,
  Material: MaterialIcon,
  Workshop: WorkshopIcon,
  AICreate: AICreateIcon,
}
