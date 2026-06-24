/**
 * 蓝染图案库
 * 简约几何风格的传统纹样
 */

export interface PatternDefinition {
  id: string
  name: string
  icon: string
  component: React.FC<PatternProps>
  description: string
}

export interface PatternProps {
  color?: string
  opacity?: number
  scale?: number
  rotation?: number
}

/**
 * 1. 圆形波纹 - 同心圆（真实蓝染效果）
 */
export function CircleWavePattern({ 
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        {/* 蓝染效果滤镜 */}
        <filter id="indigo-dye-effect" x="-50%" y="-50%" width="200%" height="200%">
          {/* 边缘模糊 - 模拟染料扩散 */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          
          {/* 噪点 - 模拟染料不均匀 */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="3"
            seed="1"
            result="noise"
          />
          
          {/* 位移映射 - 创建不规则边缘 */}
          <feDisplacementMap
            in="blur"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          
          {/* 颜色调整 - 降低饱和度 */}
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="0.7"
            result="desaturated"
          />
          
          {/* 叠加原图 */}
          <feBlend in="SourceGraphic" in2="desaturated" mode="multiply" />
        </filter>

        {/* 改进的径向渐变 - 模拟染料浓度 */}
        <radialGradient id="wave-gradient-realistic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="30%" stopColor={color} stopOpacity="0.75" />
          <stop offset="60%" stopColor={color} stopOpacity="0.4" />
          <stop offset="85%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* 同心圆波纹 - 使用渐变描边 */}
      <circle cx="100" cy="100" r="20" fill="none" stroke={color} strokeWidth="3" opacity="0.9" />
      <circle cx="100" cy="100" r="40" fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
      <circle cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
      
      {/* 中心填充 - 使用真实感渐变 */}
      <circle cx="100" cy="100" r="85" fill="url(#wave-gradient-realistic)" />
    </svg>
  )
}

/**
 * 2. 方形格纹 - 几何方格
 */
export function SquareGridPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity
      }}
    >
      <defs>
        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
        </pattern>
      </defs>
      
      {/* 网格背景 */}
      <rect width="200" height="200" fill="url(#grid)" />
      
      {/* 强调中心方块 */}
      <rect x="60" y="60" width="80" height="80" fill="none" stroke={color} strokeWidth="3" opacity="0.8" />
      <rect x="80" y="80" width="40" height="40" fill={color} opacity="0.6" />
    </svg>
  )
}

/**
 * 3. 花瓣图案 - 对称花朵
 */
export function FlowerPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity
      }}
    >
      <defs>
        <radialGradient id="petal-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      
      {/* 六个花瓣 */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + Math.cos(rad) * 40
        const y = 100 + Math.sin(rad) * 40
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="25"
            ry="35"
            fill="url(#petal-gradient)"
            transform={`rotate(${angle} ${x} ${y})`}
          />
        )
      })}
      
      {/* 中心圆 */}
      <circle cx="100" cy="100" r="20" fill={color} opacity="0.9" />
    </svg>
  )
}

/**
 * 4. 雪花图案
 */
export function SnowflakePattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      {/* 六个分支的雪花 */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="30" stroke={color} strokeWidth="3" opacity="0.8" />
          <line x1="100" y1="50" x2="85" y2="40" stroke={color} strokeWidth="2" opacity="0.6" />
          <line x1="100" y1="50" x2="115" y2="40" stroke={color} strokeWidth="2" opacity="0.6" />
          <line x1="100" y1="70" x2="85" y2="60" stroke={color} strokeWidth="2" opacity="0.6" />
          <line x1="100" y1="70" x2="115" y2="60" stroke={color} strokeWidth="2" opacity="0.6" />
        </g>
      ))}
      <circle cx="100" cy="100" r="12" fill={color} opacity="0.8" />
    </svg>
  )
}

/**
 * 5. 六角形图案
 */
export function HexagonPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * Math.PI / 180
    const x = 100 + 50 * Math.cos(angle)
    const y = 100 + 50 * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        <radialGradient id="hex-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <polygon points={points} fill="url(#hex-gradient)" stroke={color} strokeWidth="2" />
      <polygon points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" transform="scale(0.6) translate(66.67 66.67)" />
      <circle cx="100" cy="100" r="8" fill={color} opacity="0.9" />
    </svg>
  )
}

/**
 * 6. 螺旋图案
 */
export function SpiralPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  const spiralPath = Array.from({ length: 100 }, (_, i) => {
    const t = i / 10
    const r = t * 3
    const angle = t * Math.PI
    const x = 100 + r * Math.cos(angle)
    const y = 100 + r * Math.sin(angle)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <path d={spiralPath} fill="none" stroke={color} strokeWidth="3" opacity="0.7" />
      <path d={spiralPath} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" transform="rotate(180 100 100)" />
      <circle cx="100" cy="100" r="5" fill={color} opacity="0.9" />
    </svg>
  )
}

/**
 * 7. 星形图案
 */
export function StarPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * 36 - 90) * Math.PI / 180
    const r = i % 2 === 0 ? 60 : 25
    const x = 100 + r * Math.cos(angle)
    const y = 100 + r * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        <radialGradient id="star-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <polygon points={points} fill="url(#star-gradient)" stroke={color} strokeWidth="2" />
      <circle cx="100" cy="100" r="15" fill={color} opacity="0.8" />
    </svg>
  )
}

/**
 * 8. 菱形格纹
 */
export function DiamondPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        <pattern id="diamond-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="0" y="0" width="40" height="40" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#diamond-grid)" />
      <polygon points="100,40 140,100 100,160 60,100" fill="none" stroke={color} strokeWidth="3" opacity="0.7" />
      <polygon points="100,70 120,100 100,130 80,100" fill={color} opacity="0.5" />
    </svg>
  )
}

/**
 * 9. 波浪纹
 */
export function WavePattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M 20 ${80 + i * 10} Q 60 ${60 + i * 10}, 100 ${80 + i * 10} T 180 ${80 + i * 10}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={0.8 - i * 0.15}
        />
      ))}
    </svg>
  )
}

/**
 * 10. 曼陀罗图案
 */
export function MandalaPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      {/* 外圈 */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + Math.cos(rad) * 60
        const y = 100 + Math.sin(rad) * 60
        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            r="12"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.6"
          />
        )
      })}
      {/* 中圈 */}
      <circle cx="100" cy="100" r="40" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
      <circle cx="100" cy="100" r="30" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      {/* 中心 */}
      <circle cx="100" cy="100" r="15" fill={color} opacity="0.8" />
    </svg>
  )
}

/**
 * 11. 十字花纹
 */
export function CrossPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <rect x="85" y="30" width="30" height="140" fill={color} opacity="0.7" />
      <rect x="30" y="85" width="140" height="30" fill={color} opacity="0.7" />
      <circle cx="100" cy="100" r="25" fill={color} opacity="0.8" />
      {[45, 135, 225, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + Math.cos(rad) * 50
        const y = 100 + Math.sin(rad) * 50
        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            r="10"
            fill={color}
            opacity="0.6"
          />
        )
      })}
    </svg>
  )
}

/**
 * 12. 三角形图案
 */
export function TrianglePattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        <linearGradient id="tri-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <polygon points="100,30 170,150 30,150" fill="url(#tri-gradient)" stroke={color} strokeWidth="3" />
      <polygon points="100,70 140,130 60,130" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
      <circle cx="100" cy="110" r="12" fill={color} opacity="0.8" />
    </svg>
  )
}

/**
 * 13. 水滴图案
 */
export function DropletPattern({
  color = '#1E4D8B',
  opacity = 0.6,
  scale = 1,
  rotation = 0
}: PatternProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        filter: 'url(#indigo-dye-effect)'
      }}
    >
      <defs>
        <radialGradient id="drop-gradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <path
        d="M 100 30 Q 130 80, 130 110 A 30 30 0 1 1 70 110 Q 70 80, 100 30 Z"
        fill="url(#drop-gradient)"
        stroke={color}
        strokeWidth="2"
      />
      <ellipse cx="90" cy="70" rx="8" ry="12" fill="white" opacity="0.4" />
    </svg>
  )
}

/**
 * 图案库定义
 */
export const PATTERN_LIBRARY: PatternDefinition[] = [
  {
    id: 'circle-wave',
    name: '波纹',
    icon: '🌊',
    component: CircleWavePattern,
    description: '同心圆波纹，如水波荡漾'
  },
  {
    id: 'square-grid',
    name: '格纹',
    icon: '▦',
    component: SquareGridPattern,
    description: '几何方格，规整有序'
  },
  {
    id: 'flower',
    name: '花瓣',
    icon: '🌸',
    component: FlowerPattern,
    description: '对称花朵，优雅绽放'
  },
  {
    id: 'snowflake',
    name: '雪花',
    icon: '❄️',
    component: SnowflakePattern,
    description: '六角雪花，精致细腻'
  },
  {
    id: 'hexagon',
    name: '六角',
    icon: '⬡',
    component: HexagonPattern,
    description: '六边形纹，稳重大方'
  },
  {
    id: 'spiral',
    name: '螺旋',
    icon: '🌀',
    component: SpiralPattern,
    description: '螺旋纹路，动感十足'
  },
  {
    id: 'star',
    name: '星形',
    icon: '⭐',
    component: StarPattern,
    description: '五角星纹，明亮耀眼'
  },
  {
    id: 'diamond',
    name: '菱形',
    icon: '◇',
    component: DiamondPattern,
    description: '菱形格纹，交错有致'
  },
  {
    id: 'wave',
    name: '浪纹',
    icon: '〰️',
    component: WavePattern,
    description: '流动波浪，柔和自然'
  },
  {
    id: 'mandala',
    name: '曼陀罗',
    icon: '✿',
    component: MandalaPattern,
    description: '繁复花纹，庄严华丽'
  },
  {
    id: 'cross',
    name: '十字',
    icon: '✚',
    component: CrossPattern,
    description: '十字花纹，对称均衡'
  },
  {
    id: 'triangle',
    name: '三角',
    icon: '▲',
    component: TrianglePattern,
    description: '三角图案，稳固有力'
  },
  {
    id: 'droplet',
    name: '水滴',
    icon: '💧',
    component: DropletPattern,
    description: '水滴形状，灵动飘逸'
  }
]

/**
 * 根据ID获取图案
 */
export function getPatternById(id: string): PatternDefinition | undefined {
  return PATTERN_LIBRARY.find(p => p.id === id)
}
