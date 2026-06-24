"use client"

import { cn } from "@/lib/utils"

interface NavIconProps {
  active?: boolean
  size?: number
  className?: string
}

// 首页图标 - 蓝染布纹房屋
export function HomeIcon({ active = false, size = 24, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "#6b7280"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "#9ca3af"} />
        </linearGradient>
        <pattern id="homePattern" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0 2 L4 2" stroke={active ? "#4a90a4" : "#d1d5db"} strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      
      {/* 房屋主体 */}
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        fill={active ? "url(#homeGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 布纹装饰 */}
      {active && (
        <>
          <path d="M6 14 L18 14" stroke="#4a90a4" strokeWidth="1" opacity="0.6" />
          <path d="M6 17 L18 17" stroke="#4a90a4" strokeWidth="1" opacity="0.4" />
        </>
      )}
      
      {/* 门 */}
      <path
        d="M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21"
        fill={active ? "#87ceeb" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// 教学图标 - 书卷与染缸
export function TeachingIcon({ active = false, size = 24, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="teachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "#6b7280"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "#9ca3af"} />
        </linearGradient>
      </defs>
      
      {/* 书本 */}
      <path
        d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z"
        fill={active ? "url(#teachGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 书页装饰线 */}
      {active && (
        <>
          <path d="M8 6 L16 6" stroke="#87ceeb" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 9 L14 9" stroke="#87ceeb" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M8 12 L12 12" stroke="#87ceeb" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </>
      )}
      
      {/* 水滴装饰 - 象征蓝染 */}
      {active && (
        <circle cx="17" cy="7" r="2" fill="#4a90a4" opacity="0.8" />
      )}
    </svg>
  )
}

// 游戏图标 - 蓝染坊
export function GameIcon({ active = false, size = 24, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="gameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="gameVatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f1f33" />
        </linearGradient>
      </defs>
      
      {/* 染坊屋顶 */}
      <path
        d="M2 9L12 3L22 9"
        stroke={active ? "#d97706" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 染坊主体 */}
      <path
        d="M4 9V20H20V9"
        fill={active ? "url(#gameGradient)" : "none"}
        stroke={active ? "#d97706" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 染缸 */}
      <ellipse
        cx="12"
        cy="16"
        rx="4"
        ry="2.5"
        fill={active ? "url(#gameVatGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="1.5"
      />
      
      {/* 染缸水面波纹 */}
      {active && (
        <>
          <path d="M9 15.5 Q10.5 15, 12 15.5 T15 15.5" stroke="#4a90a4" strokeWidth="1" fill="none" />
        </>
      )}
      
      {/* 烟囱 */}
      <rect
        x="16"
        y="5"
        width="2"
        height="4"
        fill={active ? "#8b5cf6" : "none"}
        stroke={active ? "#7c3aed" : "currentColor"}
        strokeWidth="1"
      />
    </svg>
  )
}

// 文创图标 - 蓝染布袋
export function StoreIcon({ active = false, size = 24, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="storeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "#6b7280"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "#9ca3af"} />
        </linearGradient>
        <pattern id="tiePattern" patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="1" fill={active ? "#87ceeb" : "#d1d5db"} opacity="0.6" />
        </pattern>
      </defs>
      
      {/* 购物袋主体 */}
      <path
        d="M6 6H18L20 21H4L6 6Z"
        fill={active ? "url(#storeGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 扎染图案装饰 */}
      {active && (
        <>
          <circle cx="9" cy="13" r="1.5" fill="#87ceeb" opacity="0.8" />
          <circle cx="15" cy="13" r="1.5" fill="#87ceeb" opacity="0.8" />
          <circle cx="12" cy="16" r="1.5" fill="#4a90a4" opacity="0.6" />
        </>
      )}
      
      {/* 提手 */}
      <path
        d="M9 6V4C9 2.89543 9.89543 2 11 2H13C14.1046 2 15 2.89543 15 4V6"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// 我的图标 - 匠人剪影
export function ProfileIcon({ active = false, size = 24, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "#6b7280"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "#9ca3af"} />
        </linearGradient>
      </defs>
      
      {/* 头部 */}
      <circle
        cx="12"
        cy="7"
        r="4"
        fill={active ? "url(#profileGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      
      {/* 身体 - 穿着蓝染服饰 */}
      <path
        d="M5 21V19C5 16.2386 7.23858 14 10 14H14C16.7614 14 19 16.2386 19 19V21"
        fill={active ? "url(#profileGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 蓝染服饰装饰 */}
      {active && (
        <>
          <path d="M9 17 L15 17" stroke="#87ceeb" strokeWidth="1" opacity="0.6" />
          <path d="M10 19 L14 19" stroke="#87ceeb" strokeWidth="1" opacity="0.4" />
        </>
      )}
    </svg>
  )
}

// 导出所有图标
export const NavIcons = {
  Home: HomeIcon,
  Teaching: TeachingIcon,
  Game: GameIcon,
  Store: StoreIcon,
  Profile: ProfileIcon,
}
