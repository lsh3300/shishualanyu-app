"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  size?: number
  className?: string
  active?: boolean
}

// 搜索图标 - 放大镜带蓝染纹理
export function SearchIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "currentColor"} />
          <stop offset="100%" stopColor={active ? "#4a90a4" : "currentColor"} />
        </linearGradient>
      </defs>
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke={active ? "url(#searchGradient)" : "currentColor"}
        strokeWidth="2"
        fill="none"
      />
      {active && (
        <>
          <path d="M8 10 L14 10" stroke="#87ceeb" strokeWidth="1" opacity="0.5" />
          <path d="M8 12 L12 12" stroke="#87ceeb" strokeWidth="1" opacity="0.3" />
        </>
      )}
      <path
        d="M21 21L16.5 16.5"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 消息图标 - 信封带蓝染封蜡
export function MessageIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="msgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "currentColor"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "currentColor"} />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        fill={active ? "url(#msgGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <path
        d="M2 6L12 13L22 6"
        stroke={active ? "#87ceeb" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {active && (
        <circle cx="18" cy="8" r="3" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
      )}
    </svg>
  )
}

// 通知图标 - 铃铛带蓝染流苏
export function NotificationIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "currentColor"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "currentColor"} />
        </linearGradient>
      </defs>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        fill={active ? "url(#bellGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        <>
          <circle cx="12" cy="6" r="1.5" fill="#87ceeb" />
          <path d="M10 18 L10 20" stroke="#4a90a4" strokeWidth="1" opacity="0.6" />
          <path d="M14 18 L14 20" stroke="#4a90a4" strokeWidth="1" opacity="0.6" />
        </>
      )}
    </svg>
  )
}

// 收藏图标 - 心形带扎结装饰
export function FavoriteIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={active ? "url(#heartGradient)" : "none"}
        stroke={active ? "#dc2626" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        <>
          <circle cx="9" cy="9" r="1" fill="white" opacity="0.6" />
          <path d="M12 8 L12 6" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 7 L14 7" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// 购物车图标 - 竹篮样式
export function CartIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="cartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "currentColor"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "currentColor"} />
        </linearGradient>
      </defs>
      {/* 篮子主体 */}
      <path
        d="M6 6H21L19 16H8L6 6Z"
        fill={active ? "url(#cartGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 提手 */}
      <path
        d="M6 6L4 2"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 轮子 */}
      <circle
        cx="10"
        cy="20"
        r="1.5"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <circle
        cx="17"
        cy="20"
        r="1.5"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      {/* 蓝染装饰 */}
      {active && (
        <>
          <path d="M9 10 L18 10" stroke="#87ceeb" strokeWidth="1" opacity="0.5" />
          <path d="M9 13 L17 13" stroke="#87ceeb" strokeWidth="1" opacity="0.3" />
        </>
      )}
    </svg>
  )
}

// 设置图标 - 染缸齿轮
export function SettingsIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#1e3a5f" : "currentColor"} />
          <stop offset="100%" stopColor={active ? "#2d5a7f" : "currentColor"} />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="3"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        fill={active ? "url(#settingsGradient)" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// 分享图标
export function ShareIcon({ size = 24, className, active = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      style={{ width: size, height: size }}
    >
      <circle
        cx="18"
        cy="5"
        r="3"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <circle
        cx="6"
        cy="12"
        r="3"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <circle
        cx="18"
        cy="19"
        r="3"
        fill={active ? "#4a90a4" : "none"}
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <path
        d="M8.59 13.51L15.42 17.49"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
      <path
        d="M15.41 6.51L8.59 10.49"
        stroke={active ? "#1e3a5f" : "currentColor"}
        strokeWidth="2"
      />
    </svg>
  )
}

// 导出所有功能图标
export const FeatureIcons = {
  Search: SearchIcon,
  Message: MessageIcon,
  Notification: NotificationIcon,
  Favorite: FavoriteIcon,
  Cart: CartIcon,
  Settings: SettingsIcon,
  Share: ShareIcon,
}
