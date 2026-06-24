"use client"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  showSubtitle?: boolean
  className?: string
  variant?: "default" | "white" | "dark"
}

// 尺寸配置
const sizeConfig = {
  sm: { icon: 32, text: "text-lg", subtitle: "text-[8px]" },
  md: { icon: 40, text: "text-xl", subtitle: "text-[10px]" },
  lg: { icon: 48, text: "text-2xl", subtitle: "text-xs" },
  xl: { icon: 64, text: "text-3xl", subtitle: "text-sm" },
}

// 蓝染水滴 Logo - 象征蓝染的精髓
export function BrandLogo({ 
  size = "md", 
  showText = true, 
  showSubtitle = true,
  className,
  variant = "default"
}: BrandLogoProps) {
  const config = sizeConfig[size]
  
  const textColor = variant === "white" 
    ? "text-white" 
    : variant === "dark" 
      ? "text-indigo-900" 
      : "text-primary"
  
  const subtitleColor = variant === "white"
    ? "text-white/70"
    : "text-muted-foreground"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Logo 图标 */}
      <div 
        className="relative flex-shrink-0"
        style={{ width: config.icon, height: config.icon }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* 背景圆角方形 - 象征布料 */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#2d4a6f" />
              <stop offset="100%" stopColor="#1a3050" />
            </linearGradient>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a7c9b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6b9db8" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5a8caa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7badc8" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="dropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="50%" stopColor="#4a90a4" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
            {/* 光泽效果 */}
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* 主背景 */}
          <rect 
            x="2" y="2" 
            width="44" height="44" 
            rx="12" 
            fill="url(#logoGradient)"
          />
          
          {/* 光泽层 */}
          <rect 
            x="2" y="2" 
            width="44" height="22" 
            rx="12" 
            fill="url(#shineGradient)"
          />
          
          {/* 波纹层 - 象征染缸中的水波 */}
          <path
            d="M6 32 Q12 28, 18 32 T30 32 T42 32"
            stroke="url(#waveGradient1)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M6 37 Q12 33, 18 37 T30 37 T42 37"
            stroke="url(#waveGradient2)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* 中心水滴 - 蓝染的精髓 */}
          <path
            d="M24 8 C24 8, 16 18, 16 24 C16 28.4 19.6 32 24 32 C28.4 32 32 28.4 32 24 C32 18, 24 8, 24 8 Z"
            fill="url(#dropGradient)"
          />
          
          {/* 水滴高光 */}
          <ellipse
            cx="21"
            cy="20"
            rx="3"
            ry="4"
            fill="white"
            fillOpacity="0.4"
          />
          
          {/* 水滴内的小波纹 */}
          <path
            d="M19 26 Q22 24, 25 26 T29 26"
            stroke="white"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />
        </svg>
      </div>
      
      {/* 文字部分 */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight leading-tight",
            config.text,
            textColor
          )}>
            世说蓝语
          </span>
          {showSubtitle && (
            <span className={cn(
              "leading-none -mt-0.5",
              config.subtitle,
              subtitleColor
            )}>
              传承千年·匠心之美
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 简化版 Logo - 用于 Favicon 等小尺寸场景
export function BrandLogoSimple({ 
  size = 32, 
  className 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="simpleLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#2d4a6f" />
        </linearGradient>
        <linearGradient id="simpleDropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="100%" stopColor="#4a90a4" />
        </linearGradient>
      </defs>
      
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#simpleLogoGradient)" />
      
      <path
        d="M24 10 C24 10, 14 22, 14 28 C14 33.5 18.5 38 24 38 C29.5 38 34 33.5 34 28 C34 22, 24 10, 24 10 Z"
        fill="url(#simpleDropGradient)"
      />
      
      <ellipse cx="20" cy="24" rx="3" ry="4" fill="white" fillOpacity="0.4" />
    </svg>
  )
}
