'use client'

import { LightBeam } from '@/components/game/effects/LightBeam'
import { FloatingParticle } from '@/components/game/effects/FloatingParticle'

/**
 * 晨曦漂流河背景 - "破晓之诗"
 * 
 * 设计理念：
 * - 太阳从地平线缓缓升起
 * - 晨雾弥漫，光束穿透
 * - 鸟儿剪影飞过
 * - 整体营造希望与清新的氛围
 * 
 * 参考艺术：
 * - 新海诚《你的名字》晨曦场景
 * - 中国水墨画的留白与晕染
 * 
 * v2.0 优化：
 * - 用流动光束替代静态放射线
 * - 用飘动粒子替代固定露珠
 */

interface DawnRiverBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function DawnRiverBackground({
  speed = 'slow',
  intensity = 0.5,
}: DawnRiverBackgroundProps) {
  const animationDuration = speed === 'slow' ? 30 : speed === 'medium' ? 20 : 10

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 天空渐变 - 从深紫到玫瑰金到淡黄 */}
        <linearGradient id="dawn-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(280, 40%, 20%)" />
          <stop offset="30%" stopColor="hsl(320, 60%, 35%)" />
          <stop offset="60%" stopColor="hsl(340, 80%, 65%)" />
          <stop offset="85%" stopColor="hsl(20, 90%, 75%)" />
          <stop offset="100%" stopColor="hsl(40, 90%, 80%)" />
        </linearGradient>

        {/* 太阳光晕渐变 */}
        <radialGradient id="sun-glow">
          <stop offset="0%" stopColor="hsl(40, 100%, 70%)" stopOpacity="0.9" />
          <stop offset="30%" stopColor="hsl(30, 100%, 60%)" stopOpacity="0.6" />
          <stop offset="60%" stopColor="hsl(20, 90%, 50%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(340, 70%, 50%)" stopOpacity="0" />
        </radialGradient>

        {/* 太阳本体渐变 */}
        <radialGradient id="sun-body">
          <stop offset="0%" stopColor="hsl(50, 100%, 85%)" />
          <stop offset="50%" stopColor="hsl(40, 100%, 75%)" />
          <stop offset="100%" stopColor="hsl(30, 100%, 65%)" />
        </radialGradient>

        {/* 水面渐变 */}
        <linearGradient id="dawn-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(340, 30%, 55%)" stopOpacity="0.4" />
          <stop offset="50%" stopColor="hsl(30, 40%, 60%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(40, 50%, 70%)" stopOpacity="0.05" />
        </linearGradient>

        {/* 晨雾模糊滤镜 */}
        <filter id="dawn-mist" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.6" />
          </feComponentTransfer>
        </filter>

        {/* 水纹扭曲滤镜 */}
        <filter id="dawn-water-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.010"
            numOctaves="3"
          >
            <animate
              attributeName="baseFrequency"
              values="0.006 0.010; 0.008 0.012; 0.006 0.010"
              dur={`${animationDuration * 2}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={intensity * 6} />
        </filter>

        {/* 露珠光晕 */}
        <filter id="dew-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 鸟儿飞行路径 */}
        <path
          id="bird-path-1"
          d="M -100,300 Q 480,250 960,280 T 2020,300"
          fill="none"
        />
        <path
          id="bird-path-2"
          d="M -100,400 Q 640,350 1280,380 T 2020,400"
          fill="none"
        />
      </defs>

      {/* 天空底色 */}
      <rect width="100%" height="100%" fill="url(#dawn-sky)" />

      {/* 太阳光晕（大范围） */}
      <circle cx="1600" cy="650" r="400" fill="url(#sun-glow)" opacity="0.7">
        <animate
          attributeName="cy"
          values="750; 650; 750"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="350; 400; 350"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* 太阳本体 */}
      <circle cx="1600" cy="650" r="80" fill="url(#sun-body)">
        <animate
          attributeName="cy"
          values="750; 650; 750"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* 太阳边缘光晕 */}
      <circle cx="1600" cy="650" r="85" fill="none" stroke="hsl(50, 100%, 90%)" strokeWidth="3" opacity="0.6">
        <animate
          attributeName="cy"
          values="750; 650; 750"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* 晨光光束（8条稀疏的流动光束）*/}
      {Array.from({ length: 8 }).map((_, i) => {
        // 随机分布在天空区域
        const x = 200 + (i * 220) + (Math.random() - 0.5) * 100
        const startY = -80 - Math.random() * 50
        const endY = 400 + Math.random() * 300
        const duration = 8 + Math.random() * 6 // 8-14秒
        const delay = i * 1.8 + Math.random() * 2
        
        return (
          <LightBeam
            key={i}
            startX={x}
            startY={startY}
            endY={endY}
            color={`hsla(50, 100%, ${80 + Math.random() * 10}%, 1)`}
            width={1.5 + Math.random() * 1}
            length={40 + Math.random() * 30}
            duration={duration}
            delay={delay}
            driftAmount={60 + Math.random() * 40}
            maxOpacity={0.4 + Math.random() * 0.2}
            blur={1.5}
          />
        )
      })}

      {/* 晨雾层（第一层 - 最远） */}
      <g filter="url(#dawn-mist)" opacity="0.4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={i}
            cx={i * 400}
            cy={550 + i * 30}
            rx={300 + i * 50}
            ry={60 + i * 15}
            fill="hsl(340, 30%, 75%)"
          >
            <animate
              attributeName="cx"
              values={`${i * 400}; ${i * 400 + 100}; ${i * 400}`}
              dur={`${40 + i * 5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6; 0.3; 0.6"
              dur={`${20 + i * 3}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}
      </g>

      {/* 晨雾层（第二层 - 近景） */}
      <g filter="url(#dawn-mist)" opacity="0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ellipse
            key={i}
            cx={200 + i * 500}
            cy={650 + i * 20}
            rx={250 + i * 40}
            ry={50 + i * 10}
            fill="hsl(20, 40%, 80%)"
          >
            <animate
              attributeName="cx"
              values={`${200 + i * 500}; ${300 + i * 500}; ${200 + i * 500}`}
              dur={`${35 + i * 4}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}
      </g>

      {/* 水面波浪（第一层 - 远景） */}
      <g filter="url(#dawn-water-turbulence)" opacity="0.6">
        <path
          d="M 0,500 Q 480,450 960,500 T 1920,500 T 2880,500"
          stroke="url(#dawn-water)"
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

      {/* 水面波浪（第二层 - 中景） */}
      <path
        d="M 0,600 Q 640,550 1280,600 T 2560,600"
        stroke="url(#dawn-water)"
        strokeWidth="100"
        fill="none"
        opacity="0.4"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -1280,0; 0,0"
          dur={`${animationDuration * 0.7}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* 水面反射（太阳在水中的倒影） */}
      <ellipse
        cx="1600"
        cy="850"
        rx="60"
        ry="120"
        fill="url(#sun-glow)"
        opacity="0.3"
      >
        <animate
          attributeName="cy"
          values="950; 850; 950"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.2; 0.3; 0.2"
          dur={`${animationDuration * 0.5}s`}
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 水面涟漪（金色） */}
      <g opacity="0.3">
        {Array.from({ length: 20 }).map((_, i) => {
          const cx = 1400 + (i % 5) * 80
          const cy = 750 + Math.floor(i / 5) * 60
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={15}
              ry={3}
              fill="hsl(40, 80%, 70%)"
            >
              <animate
                attributeName="opacity"
                values="0; 0.5; 0"
                dur={`${3 + (i % 4)}s`}
                begin={`${(i % 5) * 0.6}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          )
        })}
      </g>

      {/* 水汽粒子（15个稀疏的漂浮粒子）*/}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 100 + Math.random() * 1720
        const startY = 700 + Math.random() * 300
        const size = 1.5 + Math.random() * 2
        const duration = 10 + Math.random() * 8 // 10-18秒
        const delay = i * 1.2 + Math.random() * 3
        
        return (
          <FloatingParticle
            key={i}
            x={x}
            startY={startY}
            size={size}
            color={`hsla(50, 100%, ${90 + Math.random() * 10}%, 1)`}
            type="rise"
            duration={duration}
            delay={delay}
            driftX={40 + Math.random() * 40}
            moveY={200 + Math.random() * 150}
            maxOpacity={0.5 + Math.random() * 0.3}
          />
        )
      })}

      {/* 鸟儿剪影（第一组） */}
      <g>
        {Array.from({ length: 3 }).map((_, i) => (
          <g key={i} opacity="0.4">
            {/* 鸟的简化形状（V字） */}
            <path
              d="M 0,0 L -8,-4 M 0,0 L 8,-4"
              stroke="hsl(280, 30%, 25%)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            >
              <animateMotion
                dur={`${25 + i * 3}s`}
                begin={`${i * 5}s`}
                repeatCount="indefinite"
              >
                <mpath href="#bird-path-1" />
              </animateMotion>
              {/* 翅膀扇动 */}
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0; 15; -15; 0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
      </g>

      {/* 鸟儿剪影（第二组 - 更高更慢） */}
      <g>
        {Array.from({ length: 2 }).map((_, i) => (
          <g key={i} opacity="0.3">
            <path
              d="M 0,0 L -10,-5 M 0,0 L 10,-5"
              stroke="hsl(280, 30%, 25%)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            >
              <animateMotion
                dur={`${30 + i * 4}s`}
                begin={`${i * 7}s`}
                repeatCount="indefinite"
              >
                <mpath href="#bird-path-2" />
              </animateMotion>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0; 12; -12; 0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
      </g>

      {/* 底部渐变遮罩 */}
      <rect
        y="850"
        width="100%"
        height="230"
        fill="url(#dawn-sky)"
        opacity="0.2"
      />
    </svg>
  )
}
