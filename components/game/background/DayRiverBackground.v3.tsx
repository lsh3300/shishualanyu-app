'use client'

import { FloatingParticle } from '@/components/game/effects/FloatingParticle'

/**
 * 日间漂流河背景 v3.0 - "晴空物语"
 * 
 * 设计理念重构：
 * - 吉卜力风格的蓬松立体云朵
 * - 清透明亮的天空渐变
 * - 轻盈细腻的水波
 * - 空气透视感的层次
 * 
 * 技术突破：
 * - 云朵：15-20个圆形组合（大→小，暗→亮）
 * - 阴影：多层filter叠加营造真实厚度
 * - 水面：细线条 + 半透明营造轻盈感
 * - 动画：各元素独立速度，避免同步
 * 
 * 参考：
 * - 宫崎骏《千与千寻》天空场景
 * - 新海诚《天气之子》云层设计
 * - 真实夏日天空的观察
 */

interface DayRiverBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function DayRiverBackgroundV3({
  speed = 'slow',
  intensity = 0.5,
}: DayRiverBackgroundProps) {
  const animationDuration = speed === 'slow' ? 40 : speed === 'medium' ? 25 : 15

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 天空渐变 - 更明亮清爽 */}
        <radialGradient id="day-sky-v3" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="hsl(200, 100%, 75%)" />
          <stop offset="30%" stopColor="hsl(205, 90%, 65%)" />
          <stop offset="60%" stopColor="hsl(210, 80%, 58%)" />
          <stop offset="100%" stopColor="hsl(215, 75%, 52%)" />
        </radialGradient>

        {/* 云朵核心阴影 */}
        <radialGradient id="cloud-shadow-core">
          <stop offset="0%" stopColor="hsl(210, 25%, 75%)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(210, 20%, 80%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(210, 15%, 85%)" stopOpacity="0" />
        </radialGradient>

        {/* 云朵中层 */}
        <radialGradient id="cloud-mid">
          <stop offset="0%" stopColor="hsl(0, 0%, 98%)" />
          <stop offset="70%" stopColor="hsl(210, 20%, 92%)" />
          <stop offset="100%" stopColor="hsl(210, 25%, 88%)" stopOpacity="0.8" />
        </radialGradient>

        {/* 云朵高光 */}
        <radialGradient id="cloud-highlight">
          <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
          <stop offset="60%" stopColor="hsl(210, 30%, 98%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(210, 25%, 95%)" stopOpacity="0" />
        </radialGradient>

        {/* 太阳光晕（更柔和） */}
        <radialGradient id="sun-glow-v3">
          <stop offset="0%" stopColor="hsl(50, 100%, 95%)" stopOpacity="0.4" />
          <stop offset="30%" stopColor="hsl(48, 100%, 85%)" stopOpacity="0.2" />
          <stop offset="60%" stopColor="hsl(45, 95%, 75%)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(40, 90%, 65%)" stopOpacity="0" />
        </radialGradient>

        {/* 水面波纹渐变 */}
        <linearGradient id="water-ripple" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 50%, 70%)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="hsl(205, 45%, 75%)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(210, 40%, 80%)" stopOpacity="0" />
        </linearGradient>

        {/* 云朵柔和阴影滤镜 */}
        <filter id="cloud-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="1" dy="4" result="offsetblur" />
          <feFlood floodColor="hsl(210, 30%, 60%)" floodOpacity="0.15" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 水面扭曲滤镜（轻微）*/}
        <filter id="water-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.008"
            numOctaves="2"
          >
            <animate
              attributeName="baseFrequency"
              values="0.005 0.008; 0.006 0.010; 0.005 0.008"
              dur={`${animationDuration * 3}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={intensity * 5} />
        </filter>
      </defs>

      {/* 天空背景 */}
      <rect width="100%" height="100%" fill="url(#day-sky-v3)" />

      {/* 太阳（柔和光晕）*/}
      <circle cx="1700" cy="180" r="250" fill="url(#sun-glow-v3)" opacity="0.8">
        <animate
          attributeName="r"
          values="240; 250; 240"
          dur="12s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="1700" cy="180" r="50" fill="hsl(50, 100%, 95%)" opacity="0.6" />

      {/* 云朵 1 - 左上大云（蓬松立体）*/}
      <g filter="url(#cloud-soft-shadow)">
        {/* 底层阴影 - 最大最暗 */}
        <ellipse cx="280" cy="180" rx="140" ry="65" fill="url(#cloud-shadow-core)" opacity="0.5" />
        <ellipse cx="320" cy="185" rx="130" ry="60" fill="url(#cloud-shadow-core)" opacity="0.4" />
        
        {/* 中层主体 - 多个圆形组合 */}
        <circle cx="250" cy="170" r="70" fill="url(#cloud-mid)" />
        <circle cx="300" cy="165" r="85" fill="url(#cloud-mid)" />
        <circle cx="350" cy="170" r="75" fill="url(#cloud-mid)" />
        <circle cx="280" cy="155" r="60" fill="url(#cloud-mid)" />
        <circle cx="320" cy="150" r="65" fill="url(#cloud-mid)" />
        
        {/* 顶层高光 - 小圆营造蓬松感 */}
        <circle cx="270" cy="145" r="45" fill="url(#cloud-highlight)" />
        <circle cx="310" cy="140" r="50" fill="url(#cloud-highlight)" />
        <circle cx="340" cy="145" r="40" fill="url(#cloud-highlight)" />
        <circle cx="290" cy="135" r="35" fill="hsl(0, 0%, 100%)" opacity="0.9" />
        <circle cx="320" cy="130" r="38" fill="hsl(0, 0%, 100%)" opacity="0.95" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 120,0; 0,0"
          dur="80s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 2 - 中上中云 */}
      <g filter="url(#cloud-soft-shadow)">
        <ellipse cx="700" cy="220" rx="120" ry="55" fill="url(#cloud-shadow-core)" opacity="0.45" />
        
        <circle cx="680" cy="215" r="65" fill="url(#cloud-mid)" />
        <circle cx="720" cy="210" r="75" fill="url(#cloud-mid)" />
        <circle cx="760" cy="215" r="60" fill="url(#cloud-mid)" />
        <circle cx="710" cy="200" r="55" fill="url(#cloud-mid)" />
        
        <circle cx="695" cy="190" r="42" fill="url(#cloud-highlight)" />
        <circle cx="725" cy="185" r="48" fill="url(#cloud-highlight)" />
        <circle cx="740" cy="192" r="38" fill="hsl(0, 0%, 100%)" opacity="0.92" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 100,0; 0,0"
          dur="70s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 3 - 右中小云 */}
      <g filter="url(#cloud-soft-shadow)">
        <ellipse cx="1450" cy="260" rx="90" ry="45" fill="url(#cloud-shadow-core)" opacity="0.4" />
        
        <circle cx="1430" cy="255" r="50" fill="url(#cloud-mid)" />
        <circle cx="1465" cy="252" r="58" fill="url(#cloud-mid)" />
        <circle cx="1495" cy="256" r="48" fill="url(#cloud-mid)" />
        
        <circle cx="1450" cy="242" r="38" fill="url(#cloud-highlight)" />
        <circle cx="1475" cy="238" r="40" fill="hsl(0, 0%, 100%)" opacity="0.9" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 70,0; 0,0"
          dur="65s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 4 - 左中远景小云（更淡更远）*/}
      <g filter="url(#cloud-soft-shadow)" opacity="0.7">
        <ellipse cx="450" cy="340" rx="80" ry="40" fill="url(#cloud-shadow-core)" opacity="0.3" />
        
        <circle cx="435" cy="335" r="45" fill="url(#cloud-mid)" />
        <circle cx="465" cy="333" r="50" fill="url(#cloud-mid)" />
        <circle cx="490" cy="336" r="42" fill="url(#cloud-mid)" />
        
        <circle cx="455" cy="325" r="35" fill="url(#cloud-highlight)" />
        <circle cx="475" cy="322" r="32" fill="hsl(0, 0%, 100%)" opacity="0.85" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 90,0; 0,0"
          dur="75s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 5 - 右上远景小云 */}
      <g filter="url(#cloud-soft-shadow)" opacity="0.65">
        <circle cx="1580" cy="150" r="35" fill="url(#cloud-mid)" />
        <circle cx="1605" cy="148" r="38" fill="url(#cloud-mid)" />
        <circle cx="1592" cy="138" r="28" fill="hsl(0, 0%, 100%)" opacity="0.8" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 60,0; 0,0"
          dur="55s"
          repeatCount="indefinite"
        />
      </g>

      {/* 水面波纹（细腻轻盈）*/}
      <g filter="url(#water-distort)">
        {/* 第一层 - 最远最淡 */}
        <path
          d="M 0,520 Q 320,505 640,520 T 1280,520 T 1920,520 T 2560,520"
          stroke="url(#water-ripple)"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -640,0; 0,0"
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
          />
        </path>

        {/* 第二层 */}
        <path
          d="M 0,580 Q 400,565 800,580 T 1600,580 T 2400,580"
          stroke="url(#water-ripple)"
          strokeWidth="3"
          fill="none"
          opacity="0.3"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -800,0; 0,0"
            dur={`${animationDuration * 0.75}s`}
            repeatCount="indefinite"
          />
        </path>

        {/* 第三层 - 近景 */}
        <path
          d="M 0,660 Q 480,645 960,660 T 1920,660 T 2880,660"
          stroke="url(#water-ripple)"
          strokeWidth="4"
          fill="none"
          opacity="0.25"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -960,0; 0,0"
            dur={`${animationDuration * 0.6}s`}
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* 空气中的微光粒子（模拟阳光照射的尘埃）*/}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 300 + Math.random() * 1320
        const startY = 200 + Math.random() * 400
        const size = 1 + Math.random() * 1.5
        const duration = 20 + Math.random() * 15
        const delay = i * 5 + Math.random() * 5
        
        return (
          <FloatingParticle
            key={i}
            x={x}
            startY={startY}
            size={size}
            color={`hsla(50, 100%, 95%, 1)`}
            type="float"
            duration={duration}
            delay={delay}
            driftX={80 + Math.random() * 60}
            moveY={50 + Math.random() * 40}
            maxOpacity={0.25 + Math.random() * 0.2}
          />
        )
      })}

      {/* 水面太阳倒影（柔和）*/}
      <ellipse
        cx="1700"
        cy="750"
        rx="60"
        ry="180"
        fill="url(#sun-glow-v3)"
        opacity="0.15"
      >
        <animate
          attributeName="opacity"
          values="0.1; 0.15; 0.1"
          dur="5s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 底部渐变融合 */}
      <rect
        y="850"
        width="100%"
        height="230"
        fill="url(#day-sky-v3)"
        opacity="0.1"
      />
    </svg>
  )
}
