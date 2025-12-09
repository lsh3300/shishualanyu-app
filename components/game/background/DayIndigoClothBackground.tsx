'use client'

/**
 * 日间漂流河背景 · Indigo Cloth Sky
 * 
 * 设计理念：
 * - 把天空想象成一整片被挂起的蓝染布幔
 * - 多条对角线的靛蓝布带横跨画面，形成强烈的视觉张力
 * - 布带上有手工扎染的光斑，呼应“蓝染·漂流记”的主题
 * - 整体构图偏上半部更丰富，下半部留白给内容区
 */

interface DayIndigoClothBackgroundProps {
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: number
}

export function DayIndigoClothBackground({
  speed = 'slow',
  intensity = 0.5,
}: DayIndigoClothBackgroundProps) {
  const animationDuration = speed === 'slow' ? 40 : speed === 'medium' ? 26 : 16

  const bands = [
    { y: 260, height: 220, gradientId: 'cloth-band-main', offset: 0 },
    { y: 520, height: 200, gradientId: 'cloth-band-secondary', offset: 90 },
    { y: 780, height: 190, gradientId: 'cloth-band-main', offset: 160 },
  ] as const

  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* 天空渐变：中心偏上略亮，四周更深的蔚蓝 */}
        <radialGradient id="day-indigo-sky" cx="50%" cy="18%" r="85%">
          <stop offset="0%" stopColor="hsl(200, 90%, 80%)" />
          <stop offset="30%" stopColor="hsl(204, 88%, 68%)" />
          <stop offset="65%" stopColor="hsl(208, 80%, 58%)" />
          <stop offset="100%" stopColor="hsl(214, 78%, 50%)" />
        </radialGradient>

        {/* 太阳轻微的背光晕染 */}
        <radialGradient id="day-indigo-sun-glow">
          <stop offset="0%" stopColor="hsl(52, 100%, 95%)" stopOpacity="0.6" />
          <stop offset="40%" stopColor="hsl(48, 100%, 88%)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(46, 100%, 78%)" stopOpacity="0" />
        </radialGradient>

        {/* 靛蓝布带主渐变 */}
        <linearGradient id="cloth-band-main" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(215, 80%, 34%)" />
          <stop offset="35%" stopColor="hsl(220, 85%, 30%)" />
          <stop offset="70%" stopColor="hsl(225, 88%, 26%)" />
          <stop offset="100%" stopColor="hsl(230, 90%, 24%)" />
        </linearGradient>

        {/* 靛蓝布带次级渐变（略浅一些）*/}
        <linearGradient id="cloth-band-secondary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(210, 75%, 40%)" />
          <stop offset="35%" stopColor="hsl(215, 80%, 36%)" />
          <stop offset="70%" stopColor="hsl(220, 82%, 32%)" />
          <stop offset="100%" stopColor="hsl(225, 85%, 30%)" />
        </linearGradient>

        {/* 布面上的扎染光斑（柔和的圆形高光）*/}
        <radialGradient id="cloth-tie-dye-spot">
          <stop offset="0%" stopColor="hsl(210, 100%, 98%)" stopOpacity="0.9" />
          <stop offset="40%" stopColor="hsl(210, 100%, 92%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(210, 90%, 70%)" stopOpacity="0" />
        </radialGradient>

        {/* 布料纹理：轻微的噪声和软光叠加 */}
        <filter id="cloth-noise" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 1.3"
            numOctaves="2"
            stitchTiles="noStitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.05  0 0 0 0 0.07  0 0 0 0 0.10  0 0 0 0.35 0"
            result="tintedNoise"
          />
          <feBlend in="SourceGraphic" in2="tintedNoise" mode="soft-light" />
        </filter>

        {/* 轻微的水面高光，用于下部过渡 */}
        <radialGradient id="day-bottom-haze" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="hsl(200, 80%, 92%)" stopOpacity="0.7" />
          <stop offset="40%" stopColor="hsl(205, 75%, 88%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(210, 70%, 80%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 天空底色 */}
      <rect width="100%" height="100%" fill="url(#day-indigo-sky)" />

      {/* 右上角的阳光晕染，压在布带后面 */}
      <g opacity="0.9">
        <circle cx="1700" cy="140" r="260" fill="url(#day-indigo-sun-glow)">
          <animate
            attributeName="r"
            values="240; 260; 240"
            dur={`${animationDuration * 0.6}s`}
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="1700" cy="140" r="46" fill="hsl(50, 100%, 96%)" opacity="0.9" />
      </g>

      {/* 对角线布带系统：整体旋转，让布带从左上到右下压过画面 */}
      <g transform="rotate(-18 960 540)">
        {bands.map((band, bandIndex) => (
          <g key={bandIndex}>
            {/* 底层布带矩形 */}
            <rect
              x={-420}
              y={band.y}
              width={2720}
              height={band.height}
              fill={`url(#${band.gradientId})`}
              filter="url(#cloth-noise)"
              opacity={0.96}
            >
              {/* 非常缓慢的亮度起伏 */}
              <animate
                attributeName="opacity"
                values="0.92; 0.98; 0.92"
                dur={`${animationDuration * 2 + bandIndex * 5}s`}
                repeatCount="indefinite"
              />
            </rect>

            {/* 扎染光斑：沿布带方向分布的高光圆形 */}
            {Array.from({ length: 9 }).map((_, i) => {
              const baseX = -260 + i * 320 + (bandIndex % 2 === 0 ? band.offset : band.offset * 0.6)
              const wave = (Math.sin((i + bandIndex) * 0.7) * band.height) / 6
              const cx = baseX
              const cy = band.y + band.height / 2 + wave
              const r = 42 + ((i + bandIndex * 3) % 3) * 10

              return (
                <circle
                  key={`${bandIndex}-${i}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="url(#cloth-tie-dye-spot)"
                  opacity={0.85}
                >
                  {/* 轻微的呼吸闪烁 */}
                  <animate
                    attributeName="opacity"
                    values="0.6; 0.9; 0.6"
                    dur={`${18 + bandIndex * 4 + i * 0.7}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values={`${r}; ${r * 1.1}; ${r}`}
                    dur={`${22 + bandIndex * 5 + i * 0.9}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )
            })}
          </g>
        ))}
      </g>

      {/* 下半部分的柔和水汽 / 雾气，用于与河面衔接并减少视觉干扰 */}
      <rect y={640} width="100%" height={440} fill="url(#day-bottom-haze)" opacity={0.9} />

      {/* 稍微点缀一些悬浮微尘，高度不超过中线，避免压住UI */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = 200 + (i * 160) % 1600
        const y = 220 + ((i * 97) % 260)
        const size = 1 + ((i * 37) % 8) / 10
        const duration = 18 + (i % 4) * 4

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={size}
            fill="hsla(210, 100%, 96%, 0.9)"
            opacity={0.0}
          >
            <animate
              attributeName="opacity"
              values="0; 0.7; 0"
              dur={`${duration}s`}
              begin={`${i * 1.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        )
      })}
    </svg>
  )
}
