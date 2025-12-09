'use client'

import { LightBeam } from '@/components/game/effects/LightBeam'
import { FloatingParticle } from '@/components/game/effects/FloatingParticle'

/**
 * 黄昏漂流河背景 - "余晖之韵"
 * 
 * 设计理念：
 * - 落日熔金，暮云合璧
 * - 远山剪影，归鸟翩翩
 * - 云朵被染成金边
 * - 整体营造温暖与诗意的氛围
 * 
 * 参考艺术：
 * - 新海诚的标志性黄昏场景
 * - "落霞与孤鹜齐飞"的意境
 * - 泰纳的风景画用色
 * 
 * v2.0 优化：
 * - 用稀疏飘动光束替代规则放射线
 * - 增加空气粒子营造氛围
 */

interface DuskRiverBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function DuskRiverBackground({
  speed = 'slow',
  intensity = 0.5,
}: DuskRiverBackgroundProps) {
  const animationDuration = speed === 'slow' ? 30 : speed === 'medium' ? 20 : 10

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 黄昏天空渐变（7层丰富色彩） */}
        <linearGradient id="dusk-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(250, 50%, 25%)" />
          <stop offset="20%" stopColor="hsl(280, 45%, 30%)" />
          <stop offset="35%" stopColor="hsl(340, 70%, 50%)" />
          <stop offset="50%" stopColor="hsl(20, 100%, 60%)" />
          <stop offset="70%" stopColor="hsl(35, 100%, 65%)" />
          <stop offset="85%" stopColor="hsl(40, 100%, 70%)" />
          <stop offset="100%" stopColor="hsl(50, 80%, 80%)" />
        </linearGradient>

        {/* 夕阳光晕（多层） */}
        <radialGradient id="sunset-glow-outer">
          <stop offset="0%" stopColor="hsl(20, 100%, 65%)" stopOpacity="0.7" />
          <stop offset="40%" stopColor="hsl(30, 100%, 60%)" stopOpacity="0.4" />
          <stop offset="70%" stopColor="hsl(340, 80%, 50%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(280, 60%, 40%)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="sunset-glow-inner">
          <stop offset="0%" stopColor="hsl(40, 100%, 75%)" />
          <stop offset="50%" stopColor="hsl(30, 100%, 65%)" />
          <stop offset="100%" stopColor="hsl(20, 100%, 55%)" />
        </radialGradient>

        {/* 云朵金边渐变 */}
        <linearGradient id="cloud-golden" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 100%, 75%)" />
          <stop offset="50%" stopColor="hsl(35, 100%, 65%)" />
          <stop offset="100%" stopColor="hsl(25, 95%, 55%)" />
        </linearGradient>

        {/* 云朵剪影（中心深色） */}
        <radialGradient id="cloud-silhouette">
          <stop offset="0%" stopColor="hsl(280, 30%, 25%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(280, 30%, 25%)" stopOpacity="0.6" />
        </radialGradient>

        {/* 水面黄昏渐变 */}
        <linearGradient id="dusk-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(30, 70%, 50%)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(35, 75%, 55%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(40, 80%, 60%)" stopOpacity="0.2" />
        </linearGradient>

        {/* 远山剪影渐变 */}
        <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(280, 20%, 15%)" />
          <stop offset="100%" stopColor="hsl(280, 20%, 20%)" stopOpacity="0.8" />
        </linearGradient>

        {/* 水纹扭曲 */}
        <filter id="dusk-water-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.012"
            numOctaves="3"
          >
            <animate
              attributeName="baseFrequency"
              values="0.007 0.012; 0.009 0.014; 0.007 0.012"
              dur={`${animationDuration * 2}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={intensity * 8} />
        </filter>

        {/* 金边光晕滤镜 */}
        <filter id="golden-edge">
          <feGaussianBlur stdDeviation="3" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
        </filter>

        {/* 归鸟飞行路径 */}
        <path
          id="bird-path-dusk-1"
          d="M -100,250 Q 640,220 1280,240 T 2060,250"
          fill="none"
        />
        <path
          id="bird-path-dusk-2"
          d="M -100,180 Q 480,160 960,175 T 2020,180"
          fill="none"
        />
        <path
          id="bird-path-dusk-3"
          d="M -100,320 Q 800,300 1600,310 T 2100,320"
          fill="none"
        />
      </defs>

      {/* 天空 */}
      <rect width="100%" height="100%" fill="url(#dusk-sky)" />

      {/* 夕阳外层光晕（超大范围） */}
      <circle cx="1500" cy="600" r="500" fill="url(#sunset-glow-outer)" opacity="0.9">
        <animate
          attributeName="r"
          values="480; 500; 480"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 夕阳中层光晕 */}
      <circle cx="1500" cy="600" r="250" fill="url(#sunset-glow-outer)" opacity="0.8" />

      {/* 夕阳本体（巨大） */}
      <circle cx="1500" cy="600" r="120" fill="url(#sunset-glow-inner)">
        <animate
          attributeName="r"
          values="115; 120; 115"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 夕阳边缘模糊（大气折射感） */}
      <circle
        cx="1500"
        cy="600"
        r="125"
        fill="none"
        stroke="hsl(45, 100%, 80%)"
        strokeWidth="6"
        opacity="0.5"
      />

      {/* 金色光束穿透云层（10条稀疏飘动）*/}
      {Array.from({ length: 10 }).map((_, i) => {
        // 从夕阳位置向下扩散
        const x = 1400 + (i * 100) + (Math.random() - 0.5) * 120
        const startY = 450 + Math.random() * 100
        const endY = 900 + Math.random() * 150
        const duration = 12 + Math.random() * 8 // 12-20秒
        const delay = i * 2 + Math.random() * 3
        
        return (
          <LightBeam
            key={i}
            startX={x}
            startY={startY}
            endY={endY}
            color={`hsla(${35 + Math.random() * 10}, 100%, ${70 + Math.random() * 10}%, 1)`}
            width={2 + Math.random() * 1.5}
            length={50 + Math.random() * 40}
            duration={duration}
            delay={delay}
            driftAmount={40 + Math.random() * 40}
            maxOpacity={0.3 + Math.random() * 0.2}
            blur={2}
          />
        )
      })}
      
      {/* 黄昏浮尘粒子（8个稀疏飘动）*/}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 300 + Math.random() * 1320
        const startY = 400 + Math.random() * 400
        const size = 1.5 + Math.random() * 2
        const duration = 15 + Math.random() * 10 // 15-25秒
        const delay = i * 2.5 + Math.random() * 4
        
        return (
          <FloatingParticle
            key={i}
            x={x}
            startY={startY}
            size={size}
            color={`hsla(${40 + Math.random() * 10}, 100%, ${75 + Math.random() * 10}%, 1)`}
            type="float"
            duration={duration}
            delay={delay}
            driftX={60 + Math.random() * 40}
            moveY={80 + Math.random() * 60}
            maxOpacity={0.4 + Math.random() * 0.3}
          />
        )
      })}

      {/* 远山剪影（第一层 - 最远） */}
      <path
        d="M 0,550 Q 300,480 600,520 Q 900,560 1200,500 Q 1500,440 1920,500 L 1920,1080 L 0,1080 Z"
        fill="url(#mountain-gradient)"
        opacity="0.3"
      />

      {/* 远山剪影（第二层） */}
      <path
        d="M 0,600 Q 400,530 800,580 Q 1200,630 1600,560 Q 1800,520 1920,560 L 1920,1080 L 0,1080 Z"
        fill="url(#mountain-gradient)"
        opacity="0.5"
      />

      {/* 远山剪影（第三层 - 最近） */}
      <path
        d="M 0,650 Q 500,580 1000,640 Q 1400,700 1920,640 L 1920,1080 L 0,1080 Z"
        fill="hsl(280, 20%, 15%)"
        opacity="0.7"
      />

      {/* 云朵（金边效果） - 云1 */}
      <g>
        {/* 金边 */}
        <ellipse cx="400" cy="220" rx="160" ry="75" fill="url(#cloud-golden)" opacity="0.9" filter="url(#golden-edge)" />
        {/* 中心剪影 */}
        <ellipse cx="400" cy="225" rx="140" ry="65" fill="url(#cloud-silhouette)" />
        <animateTransform
          attributeType="XML"
          attributeName="transform"
          type="translate"
          values="0,0; 50,0; 0,0"
          dur="70s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 2 - 更大更复杂 */}
      <g>
        <ellipse cx="900" cy="180" rx="200" ry="90" fill="url(#cloud-golden)" opacity="0.95" filter="url(#golden-edge)" />
        <ellipse cx="850" cy="185" rx="150" ry="70" fill="url(#cloud-silhouette)" />
        <ellipse cx="950" cy="185" rx="140" ry="65" fill="url(#cloud-silhouette)" />
        <animateTransform
          attributeType="XML"
          attributeName="transform"
          type="translate"
          values="0,0; 40,0; 0,0"
          dur="80s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 3 - 靠近太阳（最亮） */}
      <g>
        <ellipse cx="1300" cy="300" rx="180" ry="85" fill="url(#cloud-golden)" opacity="1" filter="url(#golden-edge)" />
        <ellipse cx="1300" cy="305" rx="160" ry="70" fill="url(#cloud-silhouette)" opacity="0.7" />
        <animateTransform
          attributeType="XML"
          attributeName="transform"
          type="translate"
          values="0,0; 30,0; 0,0"
          dur="75s"
          repeatCount="indefinite"
        />
      </g>

      {/* 云朵 4 - 上方 */}
      <g>
        <ellipse cx="650" cy="120" rx="140" ry="65" fill="url(#cloud-golden)" opacity="0.85" filter="url(#golden-edge)" />
        <ellipse cx="650" cy="125" rx="120" ry="55" fill="url(#cloud-silhouette)" />
        <animateTransform
          attributeType="XML"
          attributeName="transform"
          type="translate"
          values="0,0; 45,0; 0,0"
          dur="85s"
          repeatCount="indefinite"
        />
      </g>

      {/* 水面波浪（金色） */}
      <g filter="url(#dusk-water-turbulence)" opacity="0.7">
        <path
          d="M 0,650 Q 480,600 960,650 T 1920,650 T 2880,650"
          stroke="url(#dusk-water)"
          strokeWidth="150"
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
        stroke="url(#dusk-water)"
        strokeWidth="130"
        fill="none"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -1280,0; 0,0"
          dur={`${animationDuration * 0.7}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* 水面夕阳倒影 */}
      <ellipse
        cx="1500"
        cy="850"
        rx="100"
        ry="250"
        fill="url(#sunset-glow-inner)"
        opacity="0.4"
      >
        <animate
          attributeName="opacity"
          values="0.3; 0.4; 0.3"
          dur="5s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 水面金色波光 */}
      <g opacity="0.5">
        {Array.from({ length: 30 }).map((_, i) => {
          const cx = 1200 + (i % 7) * 80
          const cy = 750 + Math.floor(i / 7) * 60
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={20 + (i % 5) * 3}
              ry={4}
              fill="hsl(40, 100%, 75%)"
            >
              <animate
                attributeName="opacity"
                values="0; 0.8; 0"
                dur={`${2 + (i % 4) * 0.5}s`}
                begin={`${(i % 6) * 0.4}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          )
        })}
      </g>

      {/* 归鸟群（第一组 - V字队形） */}
      <g opacity="0.6">
        {/* 领头鸟 */}
        <path
          d="M 0,0 L -12,-6 M 0,0 L 12,-6"
          stroke="hsl(280, 20%, 10%)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          <animateMotion dur="35s" repeatCount="indefinite">
            <mpath href="#bird-path-dusk-1" />
          </animateMotion>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0; 20; -20; 0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* 左侧鸟群 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <path
            key={`left-${i}`}
            d="M 0,0 L -10,-5 M 0,0 L 10,-5"
            stroke="hsl(280, 20%, 10%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          >
            <animateMotion dur="35s" begin={`${0.5 + i * 0.3}s`} repeatCount="indefinite">
              <mpath href="#bird-path-dusk-1" />
            </animateMotion>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; ${-30 - i * 15},${15 + i * 10}; 0,0`}
              dur="35s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0; 15; -15; 0"
              dur="2.2s"
              additive="sum"
              repeatCount="indefinite"
            />
          </path>
        ))}

        {/* 右侧鸟群 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <path
            key={`right-${i}`}
            d="M 0,0 L -10,-5 M 0,0 L 10,-5"
            stroke="hsl(280, 20%, 10%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          >
            <animateMotion dur="35s" begin={`${0.5 + i * 0.3}s`} repeatCount="indefinite">
              <mpath href="#bird-path-dusk-1" />
            </animateMotion>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; ${30 + i * 15},${15 + i * 10}; 0,0`}
              dur="35s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0; 15; -15; 0"
              dur="2.1s"
              additive="sum"
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>

      {/* 归鸟群（第二组 - 散开） */}
      <g opacity="0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <path
            key={i}
            d="M 0,0 L -9,-4.5 M 0,0 L 9,-4.5"
            stroke="hsl(280, 20%, 10%)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          >
            <animateMotion dur={`${40 + i * 3}s`} begin={`${i * 5}s`} repeatCount="indefinite">
              <mpath href="#bird-path-dusk-2" />
            </animateMotion>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0; 12; -12; 0"
              dur="2.3s"
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>

      {/* 孤鸟（单飞） */}
      <path
        d="M 0,0 L -11,-5.5 M 0,0 L 11,-5.5"
        stroke="hsl(280, 20%, 10%)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      >
        <animateMotion dur="45s" repeatCount="indefinite">
          <mpath href="#bird-path-dusk-3" />
        </animateMotion>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0; 18; -18; 0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* 底部渐变遮罩 */}
      <rect
        y="900"
        width="100%"
        height="180"
        fill="url(#dusk-sky)"
        opacity="0.3"
      />
    </svg>
  )
}
