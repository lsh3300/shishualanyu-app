'use client'

import { FloatingParticle } from '@/components/game/effects/FloatingParticle'

/**
 * 夜晚漂流河背景 - "星辰之梦"
 * 
 * 设计理念：
 * - 星河璀璨，月色如水
 * - 萤火虫飞舞
 * - 宁静梦幻的氛围
 * 
 * 参考艺术：
 * - 梵高《星空》
 * - 吉卜力《萤火虫之墓》
 * - 游戏《Sky光遇》星空设计
 * 
 * v2.0 优化：
 * - 减少小星星数量，更稀疏自然
 * - 优化萤火虫飞行效果
 */

interface NightRiverBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function NightRiverBackground({
  speed = 'slow',
  intensity = 0.5,
}: NightRiverBackgroundProps) {
  const animationDuration = speed === 'slow' ? 30 : speed === 'medium' ? 20 : 10

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 夜空渐变 */}
        <linearGradient id="night-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(240, 80%, 8%)" />
          <stop offset="50%" stopColor="hsl(230, 60%, 15%)" />
          <stop offset="100%" stopColor="hsl(220, 40%, 20%)" />
        </linearGradient>

        {/* 月亮渐变 */}
        <radialGradient id="moon-glow">
          <stop offset="0%" stopColor="hsl(50, 30%, 95%)" />
          <stop offset="70%" stopColor="hsl(50, 25%, 88%)" />
          <stop offset="100%" stopColor="hsl(50, 20%, 80%)" />
        </radialGradient>

        {/* 月光光晕 */}
        <radialGradient id="moon-halo">
          <stop offset="0%" stopColor="hsl(200, 60%, 80%)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="hsl(210, 50%, 70%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(220, 40%, 60%)" stopOpacity="0" />
        </radialGradient>

        {/* 银河图案 */}
        <radialGradient id="milky-way">
          <stop offset="0%" stopColor="hsl(220, 40%, 40%)" stopOpacity="0.4" />
          <stop offset="50%" stopColor="hsl(230, 35%, 30%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(240, 30%, 20%)" stopOpacity="0" />
        </radialGradient>

        {/* 水面夜色渐变 */}
        <linearGradient id="night-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(220, 50%, 25%)" stopOpacity="0.4" />
          <stop offset="50%" stopColor="hsl(225, 45%, 20%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(230, 40%, 18%)" stopOpacity="0.05" />
        </linearGradient>

        {/* 星星十字光芒 */}
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 萤火虫光晕 */}
        <filter id="firefly-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 夜雾 */}
        <filter id="night-mist">
          <feGaussianBlur stdDeviation="10" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
        </filter>

        {/* 水纹扭曲 */}
        <filter id="night-water-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.008"
            numOctaves="3"
          >
            <animate
              attributeName="baseFrequency"
              values="0.005 0.008; 0.006 0.009; 0.005 0.008"
              dur={`${animationDuration * 2}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={intensity * 5} />
        </filter>

        {/* 流星路径 */}
        <linearGradient id="meteor-trail">
          <stop offset="0%" stopColor="hsl(50, 100%, 90%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(50, 100%, 85%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(50, 100%, 80%)" stopOpacity="1" />
        </linearGradient>

        {/* 萤火虫飞行路径 */}
        <path
          id="firefly-path-1"
          d="M 200,800 Q 400,700 600,750 T 1000,800 T 1400,750 T 1800,800"
          fill="none"
        />
        <path
          id="firefly-path-2"
          d="M 100,900 Q 500,850 900,880 T 1700,900"
          fill="none"
        />
        <path
          id="firefly-path-3"
          d="M 300,850 Q 700,800 1100,830 T 1900,850"
          fill="none"
        />
      </defs>

      {/* 夜空底色 */}
      <rect width="100%" height="100%" fill="url(#night-sky)" />

      {/* 银河（斜跨天空） */}
      <ellipse
        cx="960"
        cy="300"
        rx="800"
        ry="400"
        fill="url(#milky-way)"
        transform="rotate(-30 960 300)"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-30 960 300; -25 960 300; -30 960 300"
          dur="180s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 银河微光点 */}
      <g opacity="0.3">
        {Array.from({ length: 200 }).map((_, i) => {
          const x = 300 + (i * 13) % 1400
          const y = 100 + (i * 29) % 500
          const r = 0.5 + Math.random() * 0.8
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="hsl(220, 40%, 85%)"
            >
              <animate
                attributeName="opacity"
                values="0.1; 0.5; 0.1"
                dur={`${3 + (i % 5)}s`}
                begin={`${(i % 10) * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>

      {/* 月亮 */}
      <g transform="translate(1600, 200)">
        {/* 月光光晕（大范围） */}
        <circle cx="0" cy="0" r="200" fill="url(#moon-halo)">
          <animate
            attributeName="r"
            values="190; 200; 190"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 月亮本体 */}
        <circle cx="0" cy="0" r="70" fill="url(#moon-glow)" />

        {/* 月球环形山纹理 */}
        <g opacity="0.15">
          <circle cx="-15" cy="-20" r="12" fill="hsl(50, 20%, 70%)" />
          <circle cx="20" cy="-10" r="8" fill="hsl(50, 20%, 70%)" />
          <circle cx="-10" cy="15" r="10" fill="hsl(50, 20%, 70%)" />
          <circle cx="15" cy="20" r="7" fill="hsl(50, 20%, 70%)" />
        </g>

        {/* 月亮边缘光 */}
        <circle
          cx="0"
          cy="0"
          r="71"
          fill="none"
          stroke="hsl(50, 30%, 98%)"
          strokeWidth="1"
          opacity="0.6"
        />
      </g>

      {/* 月光在水面的反射路径 */}
      <ellipse
        cx="1600"
        cy="850"
        rx="50"
        ry="180"
        fill="url(#moon-halo)"
        opacity="0.2"
      >
        <animate
          attributeName="opacity"
          values="0.15; 0.2; 0.15"
          dur="6s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 大星星（亮度高，有十字光芒） */}
      <g filter="url(#star-glow)">
        {Array.from({ length: 15 }).map((_, i) => {
          const x = 100 + (i * 127) % 1720
          const y = 50 + (i * 73) % 550
          const size = 2 + (i % 3)
          return (
            <g key={i}>
              {/* 星星本体 */}
              <circle cx={x} cy={y} r={size} fill="hsl(50, 100%, 95%)">
                <animate
                  attributeName="opacity"
                  values="0.7; 1; 0.7"
                  dur={`${3 + (i % 4)}s`}
                  begin={`${i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* 十字光芒 */}
              <path
                d={`M ${x},${y - size - 3} L ${x},${y + size + 3} M ${x - size - 3},${y} L ${x + size + 3},${y}`}
                stroke="hsl(50, 100%, 95%)"
                strokeWidth="0.5"
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  values="0.5; 0.8; 0.5"
                  dur={`${3 + (i % 4)}s`}
                  begin={`${i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )
        })}
      </g>

      {/* 小星星（稀疏分布，自然闪烁） */}
      <g>
        {Array.from({ length: 50 }).map((_, i) => {
          const x = (i * 137 + Math.random() * 50) % 1920
          const y = (i * 89 + Math.random() * 30) % 600
          const r = 0.8 + Math.random() * 1.5
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="hsl(50, 80%, 90%)"
            >
              <animate
                attributeName="opacity"
                values="0.2; 0.8; 0.2"
                dur={`${2 + Math.random() * 3}s`}
                begin={`${Math.random() * 3}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>

      {/* 流星（偶尔出现，斜向划过）*/}
      <g>
        {Array.from({ length: 3 }).map((_, i) => {
          // 从右上到左下的斜向轨迹（更自然）
          const startX = 1400 + i * 200
          const startY = 50 + i * 100
          const trailLength = 120 + i * 20  // 更长的拖尾
          // 60度角斜向下（cos60=0.5, sin60=0.87）
          const endX = startX - trailLength * 0.87
          const endY = startY + trailLength * 0.5
          
          return (
            <g key={i} opacity="0">
              {/* 流星拖尾（渐变尾巴）*/}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="url(#meteor-trail)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* 流星头部（亮点）*/}
              <circle cx={endX} cy={endY} r="2.5" fill="hsl(50, 100%, 95%)">
                <animate
                  attributeName="r"
                  values="2.5; 3; 2.5"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* 出现动画 - 快速划过 */}
              <animate
                attributeName="opacity"
                values="0; 1; 1; 0"
                dur="1s"
                begin={`${8 + i * 12}s`}
                repeatCount="indefinite"
              />
              {/* 移动动画 - 斜向60度 */}
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -350,200"
                dur="1s"
                begin={`${8 + i * 12}s`}
                repeatCount="indefinite"
              />
            </g>
          )
        })}
      </g>

      {/* 夜雾 */}
      <g filter="url(#night-mist)" opacity="0.2">
        {Array.from({ length: 3 }).map((_, i) => (
          <ellipse
            key={i}
            cx={300 + i * 600}
            cy={600 + i * 40}
            rx={400}
            ry={80}
            fill="hsl(230, 40%, 30%)"
          >
            <animate
              attributeName="cx"
              values={`${300 + i * 600}; ${400 + i * 600}; ${300 + i * 600}`}
              dur={`${50 + i * 10}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}
      </g>

      {/* 水面波浪 */}
      <g filter="url(#night-water-turbulence)" opacity="0.5">
        <path
          d="M 0,650 Q 480,600 960,650 T 1920,650 T 2880,650"
          stroke="url(#night-water)"
          strokeWidth="120"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -960,0; 0,0"
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* 水面波浪（第二层） */}
      <path
        d="M 0,750 Q 640,700 1280,750 T 2560,750"
        stroke="url(#night-water)"
        strokeWidth="100"
        fill="none"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -1280,0; 0,0"
          dur={`${animationDuration * 0.7}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* 水面银白波光（月光反射） */}
      <g opacity="0.25">
        {Array.from({ length: 20 }).map((_, i) => {
          const cx = 1400 + (i % 6) * 60
          const cy = 750 + Math.floor(i / 6) * 50
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={12}
              ry={3}
              fill="hsl(200, 50%, 85%)"
            >
              <animate
                attributeName="opacity"
                values="0; 0.6; 0"
                dur={`${3 + (i % 4)}s`}
                begin={`${(i % 6) * 0.5}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          )
        })}
      </g>

      {/* 萤火虫（第一组） */}
      <g filter="url(#firefly-glow)">
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} r="3" fill="hsl(80, 100%, 70%)">
            <animateMotion
              dur={`${15 + i * 2}s`}
              begin={`${i * 1.5}s`}
              repeatCount="indefinite"
            >
              <mpath href="#firefly-path-1" />
            </animateMotion>
            {/* 闪烁 */}
            <animate
              attributeName="opacity"
              values="0.2; 1; 0.2"
              dur={`${1.5 + (i % 3) * 0.5}s`}
              repeatCount="indefinite"
            />
            {/* 大小变化（模拟飞近飞远） */}
            <animate
              attributeName="r"
              values="2; 3; 2"
              dur={`${15 + i * 2}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* 萤火虫（第二组） */}
      <g filter="url(#firefly-glow)">
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} r="2.5" fill="hsl(75, 100%, 65%)">
            <animateMotion
              dur={`${18 + i * 2}s`}
              begin={`${i * 2}s`}
              repeatCount="indefinite"
            >
              <mpath href="#firefly-path-2" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.3; 0.9; 0.3"
              dur={`${1.8 + (i % 4) * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* 萤火虫（第三组 - 更高） */}
      <g filter="url(#firefly-glow)">
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} r="2" fill="hsl(85, 100%, 75%)">
            <animateMotion
              dur={`${20 + i * 2.5}s`}
              begin={`${i * 2.5}s`}
              repeatCount="indefinite"
            >
              <mpath href="#firefly-path-3" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.1; 0.8; 0.1"
              dur={`${2 + (i % 3) * 0.6}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* 底部渐变遮罩 */}
      <rect
        y="900"
        width="100%"
        height="180"
        fill="url(#night-sky)"
        opacity="0.4"
      />
    </svg>
  )
}
