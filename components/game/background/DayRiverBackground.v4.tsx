'use client'

import { FloatingParticle } from '@/components/game/effects/FloatingParticle'

/**
 * 日间漂流河背景 v4.0 - "晴空之舞"
 * 
 * 设计理念：
 * - 夏日正午，蓝天如洗
 * - 蜻蜓点水，微风拂柳
 * - 蓬松立体的云朵漂浮
 * - 远处的地平线朦胧
 * 
 * 与其他时段统一的设计语言：
 * - 多层渐变天空
 * - 主体天体（太阳）
 * - 景观剪影（地平线）
 * - 生命元素（蜻蜓）
 * - 粒子系统（微尘、光斑）
 * - 水面效果（波纹、倒影）
 * 
 * 参考：
 * - 新海诚夏日场景的明亮清爽
 * - 真实夏日天空的深邃蓝色
 * - 日本动画中的蜻蜓意象
 */

interface DayRiverBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function DayRiverBackground({
  speed = 'slow',
  intensity = 0.5,
}: DayRiverBackgroundProps) {
  const animationDuration = speed === 'slow' ? 35 : speed === 'medium' ? 22 : 14

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 天空渐变 - 5层径向渐变，深邃的夏日蓝 */}
        <radialGradient id="day-summer-sky" cx="50%" cy="20%" r="85%">
          <stop offset="0%" stopColor="hsl(200, 95%, 75%)" />
          <stop offset="25%" stopColor="hsl(205, 90%, 65%)" />
          <stop offset="55%" stopColor="hsl(210, 85%, 56%)" />
          <stop offset="85%" stopColor="hsl(215, 80%, 50%)" />
          <stop offset="100%" stopColor="hsl(220, 75%, 45%)" />
        </radialGradient>

        {/* 太阳外层光晕 */}
        <radialGradient id="day-sun-outer-glow">
          <stop offset="0%" stopColor="hsl(48, 100%, 82%)" stopOpacity="0.5" />
          <stop offset="40%" stopColor="hsl(50, 100%, 78%)" stopOpacity="0.3" />
          <stop offset="75%" stopColor="hsl(52, 100%, 75%)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="hsl(54, 100%, 70%)" stopOpacity="0" />
        </radialGradient>

        {/* 太阳中层光晕 */}
        <radialGradient id="day-sun-mid-glow">
          <stop offset="0%" stopColor="hsl(50, 100%, 90%)" stopOpacity="0.8" />
          <stop offset="60%" stopColor="hsl(50, 100%, 85%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(50, 100%, 80%)" stopOpacity="0" />
        </radialGradient>

        {/* 太阳核心 */}
        <radialGradient id="day-sun-core">
          <stop offset="0%" stopColor="hsl(50, 100%, 98%)" />
          <stop offset="70%" stopColor="hsl(50, 100%, 95%)" />
          <stop offset="100%" stopColor="hsl(50, 100%, 92%)" />
        </radialGradient>

        {/* 云朵阴影核心（加深对比）*/}
        <radialGradient id="day-cloud-shadow-core">
          <stop offset="0%" stopColor="hsl(210, 38%, 60%)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(210, 30%, 68%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(210, 22%, 75%)" stopOpacity="0" />
        </radialGradient>

        {/* 云朵主体 */}
        <radialGradient id="day-cloud-mid">
          <stop offset="0%" stopColor="hsl(0, 0%, 99%)" />
          <stop offset="55%" stopColor="hsl(210, 15%, 95%)" />
          <stop offset="85%" stopColor="hsl(210, 22%, 88%)" />
          <stop offset="100%" stopColor="hsl(210, 28%, 84%)" stopOpacity="0.9" />
        </radialGradient>

        {/* 云朵高光 */}
        <radialGradient id="day-cloud-highlight">
          <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
          <stop offset="55%" stopColor="hsl(210, 25%, 98%)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(210, 20%, 96%)" stopOpacity="0" />
        </radialGradient>

        {/* 云朵强化阴影滤镜 */}
        <filter id="day-cloud-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
          <feOffset dx="3" dy="8" result="offsetblur" />
          <feFlood floodColor="hsl(210, 42%, 52%)" floodOpacity="0.32" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 地平线远山渐变 */}
        <linearGradient id="day-horizon-far" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 30%, 70%)" />
          <stop offset="100%" stopColor="hsl(210, 25%, 75%)" stopOpacity="0.6" />
        </linearGradient>

        {/* 地平线近景植被 */}
        <linearGradient id="day-horizon-near" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(140, 35%, 48%)" />
          <stop offset="100%" stopColor="hsl(145, 40%, 52%)" stopOpacity="0.7" />
        </linearGradient>

        {/* 水面波纹渐变 */}
        <linearGradient id="day-water-ripple" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(205, 60%, 65%)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(210, 55%, 70%)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(215, 50%, 75%)" stopOpacity="0" />
        </linearGradient>

        {/* 水面扭曲滤镜 */}
        <filter id="day-water-distort">
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
          <feDisplacementMap in="SourceGraphic" scale={intensity * 6} />
        </filter>

        {/* 阳光光斑渐变（模拟穿过树叶的光）*/}
        <radialGradient id="day-sunlight-spot">
          <stop offset="0%" stopColor="hsl(52, 100%, 92%)" stopOpacity="0.7" />
          <stop offset="50%" stopColor="hsl(50, 100%, 88%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(48, 100%, 84%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 天空背景 */}
      <rect width="100%" height="100%" fill="url(#day-summer-sky)" />

      {/* 太阳系统 - 三层光晕 + 核心 */}
      <g>
        {/* 外层大光晕 */}
        <circle cx="1650" cy="200" r="300" fill="url(#day-sun-outer-glow)">
          <animate
            attributeName="r"
            values="280; 300; 280"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 中层光晕 */}
        <circle cx="1650" cy="200" r="120" fill="url(#day-sun-mid-glow)">
          <animate
            attributeName="r"
            values="110; 120; 110"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 太阳核心 */}
        <circle cx="1650" cy="200" r="55" fill="url(#day-sun-core)">
          <animate
            attributeName="r"
            values="52; 55; 52"
            dur="10s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* 云朵系统 - 4朵蓬松立体云 */}
      
      {/* 云朵 1 - 左上大云 */}
      <g filter="url(#day-cloud-shadow)">
        {/* 底层阴影 */}
        <ellipse cx="300" cy="195" rx="150" ry="70" fill="url(#day-cloud-shadow-core)" opacity="0.55" />
        <ellipse cx="340" cy="200" rx="140" ry="65" fill="url(#day-cloud-shadow-core)" opacity="0.45" />
        
        {/* 中层主体 */}
        <circle cx="260" cy="185" r="75" fill="url(#day-cloud-mid)" />
        <circle cx="315" cy="180" r="90" fill="url(#day-cloud-mid)" />
        <circle cx="370" cy="185" r="80" fill="url(#day-cloud-mid)" />
        <circle cx="295" cy="168" r="65" fill="url(#day-cloud-mid)" />
        <circle cx="340" cy="163" r="70" fill="url(#day-cloud-mid)" />
        
        {/* 顶层高光 */}
        <circle cx="280" cy="155" r="48" fill="url(#day-cloud-highlight)" />
        <circle cx="325" cy="150" r="55" fill="url(#day-cloud-highlight)" />
        <circle cx="360" cy="155" r="45" fill="url(#day-cloud-highlight)" />
        <circle cx="305" cy="143" r="38" fill="hsl(0, 0%, 100%)" opacity="0.92" />
        <circle cx="340" cy="138" r="42" fill="hsl(0, 0%, 100%)" opacity="0.96" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 130,0; 0,0"
          dur="90s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 2 - 中上中云 */}
      <g filter="url(#day-cloud-shadow)">
        <ellipse cx="740" cy="235" rx="130" ry="60" fill="url(#day-cloud-shadow-core)" opacity="0.5" />
        
        <circle cx="710" cy="228" r="70" fill="url(#day-cloud-mid)" />
        <circle cx="755" cy="223" r="82" fill="url(#day-cloud-mid)" />
        <circle cx="800" cy="228" r="65" fill="url(#day-cloud-mid)" />
        <circle cx="735" cy="213" r="60" fill="url(#day-cloud-mid)" />
        
        <circle cx="720" cy="202" r="46" fill="url(#day-cloud-highlight)" />
        <circle cx="755" cy="197" r="52" fill="url(#day-cloud-highlight)" />
        <circle cx="780" cy="203" r="42" fill="hsl(0, 0%, 100%)" opacity="0.93" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 110,0; 0,0"
          dur="78s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 3 - 右中小云 */}
      <g filter="url(#day-cloud-shadow)">
        <ellipse cx="1480" cy="275" rx="100" ry="50" fill="url(#day-cloud-shadow-core)" opacity="0.45" />
        
        <circle cx="1455" cy="268" r="55" fill="url(#day-cloud-mid)" />
        <circle cx="1495" cy="265" r="65" fill="url(#day-cloud-mid)" />
        <circle cx="1530" cy="269" r="52" fill="url(#day-cloud-mid)" />
        
        <circle cx="1475" cy="254" r="42" fill="url(#day-cloud-highlight)" />
        <circle cx="1505" cy="250" r="45" fill="hsl(0, 0%, 100%)" opacity="0.9" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 80,0; 0,0"
          dur="72s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 4 - 左中远景小云（更淡更远）*/}
      <g filter="url(#day-cloud-shadow)" opacity="0.75">
        <ellipse cx="480" cy="360" rx="90" ry="45" fill="url(#day-cloud-shadow-core)" opacity="0.35" />
        
        <circle cx="460" cy="352" r="50" fill="url(#day-cloud-mid)" />
        <circle cx="495" cy="350" r="58" fill="url(#day-cloud-mid)" />
        <circle cx="525" cy="353" r="47" fill="url(#day-cloud-mid)" />
        
        <circle cx="480" cy="340" r="38" fill="url(#day-cloud-highlight)" />
        <circle cx="505" cy="337" r="35" fill="hsl(0, 0%, 100%)" opacity="0.87" />
        
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 100,0; 0,0"
          dur="85s"
          repeatCount="indefinite"
        />
      </g>
      
      {/* 地平线景观 - 2层深度 */}
      
      {/* 最远层 - 朦胧的山丘轮廓 */}
      <path
        d="M 0,600 Q 480,555 960,580 T 1920,570 L 1920,1080 L 0,1080 Z"
        fill="url(#day-horizon-far)"
        opacity="0.32"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -30,0; 0,0"
          dur="120s"
          repeatCount="indefinite"
        />
      </path>

      {/* 近景 - 植被剪影 */}
      <path
        d="M 0,700 Q 640,675 1280,695 T 2560,685 L 2560,1080 L 0,1080 Z"
        fill="url(#day-horizon-near)"
        opacity="0.48"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -50,0; 0,0"
          dur="95s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* 蜻蜓动画 - 3只蜻蜓飞舞 */}
      {[
        { pathId: 'dragonfly-path-1', startDelay: '0s', duration: '28s', yOffset: 420 },
        { pathId: 'dragonfly-path-2', startDelay: '9s', duration: '32s', yOffset: 460 },
        { pathId: 'dragonfly-path-3', startDelay: '18s', duration: '26s', yOffset: 500 },
      ].map((config, i) => (
        <g key={`dragonfly-${i}`} opacity="0">
          {/* 蜻蜓身体（细长）*/}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-18"
            stroke="hsl(180, 58%, 38%)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          
          {/* 翅膀（4片半透明）*/}
          {/* 左上翅 */}
          <ellipse
            cx="-6"
            cy="-8"
            rx="9"
            ry="4"
            fill="hsl(200, 55%, 82%)"
            opacity="0.6"
          >
            <animate
              attributeName="ry"
              values="4; 5; 4"
              dur="0.15s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* 右上翅 */}
          <ellipse
            cx="6"
            cy="-8"
            rx="9"
            ry="4"
            fill="hsl(200, 55%, 82%)"
            opacity="0.6"
          >
            <animate
              attributeName="ry"
              values="4; 5; 4"
              dur="0.15s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* 左下翅 */}
          <ellipse
            cx="-5"
            cy="-3"
            rx="7"
            ry="3.5"
            fill="hsl(200, 55%, 85%)"
            opacity="0.55"
          >
            <animate
              attributeName="ry"
              values="3.5; 4.5; 3.5"
              dur="0.15s"
              begin="0.075s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* 右下翅 */}
          <ellipse
            cx="5"
            cy="-3"
            rx="7"
            ry="3.5"
            fill="hsl(200, 55%, 85%)"
            opacity="0.55"
          >
            <animate
              attributeName="ry"
              values="3.5; 4.5; 3.5"
              dur="0.15s"
              begin="0.075s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* 飞行路径动画 */}
          <animateMotion
            dur={config.duration}
            begin={config.startDelay}
            repeatCount="indefinite"
          >
            <mpath href={`#${config.pathId}`} />
          </animateMotion>

          {/* 出现/消失动画 */}
          <animate
            attributeName="opacity"
            values="0; 0.8; 0.8; 0"
            keyTimes="0; 0.1; 0.85; 1"
            dur={config.duration}
            begin={config.startDelay}
            repeatCount="indefinite"
          />
        </g>
      ))}

      {/* 蜻蜓飞行路径（SVG path 定义）*/}
      <defs>
        {/* 路径1 - 从左到右，波浪形 */}
        <path
          id="dragonfly-path-1"
          d="M 150,420 Q 480,390 720,430 T 1280,410 T 1720,440"
          fill="none"
        />
        
        {/* 路径2 - 从右到左，较高 */}
        <path
          id="dragonfly-path-2"
          d="M 1800,460 Q 1400,435 1040,465 T 480,450 T 120,475"
          fill="none"
        />
        
        {/* 路径3 - 从左到右，中间有上升 */}
        <path
          id="dragonfly-path-3"
          d="M 200,500 Q 600,470 960,485 T 1400,465 T 1750,490"
          fill="none"
        />
      </defs>

      {/* 水面波纹（细腻）*/}
      <g filter="url(#day-water-distort)">
        {/* 第一层 - 最远 */}
        <path
          d="M 0,540 Q 320,525 640,540 T 1280,540 T 1920,540 T 2560,540"
          stroke="url(#day-water-ripple)"
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
          d="M 0,600 Q 400,585 800,600 T 1600,600 T 2400,600"
          stroke="url(#day-water-ripple)"
          strokeWidth="3"
          fill="none"
          opacity="0.3"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -800,0; 0,0"
            dur={`${animationDuration * 0.7}s`}
            repeatCount="indefinite"
          />
        </path>

        {/* 第三层 - 近景 */}
        <path
          d="M 0,680 Q 480,665 960,680 T 1920,680 T 2880,680"
          stroke="url(#day-water-ripple)"
          strokeWidth="4"
          fill="none"
          opacity="0.25"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -960,0; 0,0"
            dur={`${animationDuration * 0.55}s`}
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* 太阳在水面的倒影 */}
      <ellipse
        cx="1650"
        cy="780"
        rx="70"
        ry="200"
        fill="url(#day-sun-mid-glow)"
        opacity="0.18"
      >
        <animate
          attributeName="opacity"
          values="0.14; 0.18; 0.14"
          dur="6s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 空气微尘粒子 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 250 + Math.random() * 1420
        const startY = 180 + Math.random() * 350
        const size = 1 + Math.random() * 1.8
        const duration = 20 + Math.random() * 15
        const delay = i * 4 + Math.random() * 5
        
        return (
          <FloatingParticle
            key={`dust-${i}`}
            x={x}
            startY={startY}
            size={size}
            color={`hsla(210, 80%, 92%, 1)`}
            type="float"
            duration={duration}
            delay={delay}
            driftX={60 + Math.random() * 50}
            moveY={40 + Math.random() * 35}
            maxOpacity={0.3 + Math.random() * 0.25}
          />
        )
      })}

      {/* 阳光光斑（模拟穿过树叶的光）*/}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 180 + (i * 280) % 1560
        const y = 250 + ((i * 137) % 220)
        const r = 25 + ((i * 47) % 20)
        const duration = 18 + (i % 3) * 6

        return (
          <circle
            key={`spot-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill="url(#day-sunlight-spot)"
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0; 0.5; 0"
              dur={`${duration}s`}
              begin={`${i * 2.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${x}; ${x + 15}; ${x}`}
              dur={`${duration * 1.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        )
      })}
    </svg>
  )
}
