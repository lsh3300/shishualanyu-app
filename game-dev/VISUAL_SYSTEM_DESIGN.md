# 蓝染·漂流记 - 视觉系统设计规范
## Indigo Drift - Visual System Design Specification

> **设计哲学**: "水之无形，染之有色，意之深远"

---

## 目录

1. [设计语言核心](#设计语言核心)
2. [SVG组件库详细设计](#svg组件库详细设计)
3. [动画系统设计](#动画系统设计)
4. [交互反馈设计](#交互反馈设计)
5. [响应式适配方案](#响应式适配方案)
6. [性能优化策略](#性能优化策略)

---

## 设计语言核心

### 视觉隐喻体系

```
水（流动性） ────────> 漂流河背景、连接线
布（质感）   ────────> 卡片纹理、边框
蓝（深浅）   ────────> 颜色系统、染色过程
空（留白）   ────────> 页面布局、呼吸感
印（标记）   ────────> 用户身份、作品签名
```

### 美学三原则

1. **克制** - 拒绝过度装饰，每个元素都有明确的功能性
2. **流动** - 所有静态元素都应该有微妙的动态感
3. **深度** - 通过图层叠加、光影变化营造空间感

---

## SVG组件库详细设计

### 1. 水波流动背景 (RiverWaveBackground)

#### 设计思路
传统做法是用静态的波浪图案，但我们要创造一种"活着的水"的感觉。通过多层波浪的不同速度叠加，产生复杂的流动感。

#### 技术实现

**文件**: `components/game/svg/RiverWaveBackground.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'

/**
 * 水波流动背景组件
 * 
 * 特点：
 * - 三层不同频率的波浪叠加
 * - 极慢速的动画（15-20秒一个循环）
 * - 使用SVG feTurbulence生成自然的水纹
 * - 根据时间动态调整颜色（模拟光线变化）
 */
export function RiverWaveBackground({
  speed = 'slow', // 'slow' | 'medium' | 'fast'
  timeOfDay = 'day', // 'dawn' | 'day' | 'dusk' | 'night'
  intensity = 0.5, // 0-1, 水波的强烈程度
}: {
  speed?: string
  timeOfDay?: string
  intensity?: number
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  // 根据时间计算颜色
  const getWaveColors = () => {
    switch (timeOfDay) {
      case 'dawn':
        return {
          base: '#f0e6d2', // 晨曦的暖色
          wave1: '#bfdce7',
          wave2: '#d4e8f0',
        }
      case 'dusk':
        return {
          base: '#ffd89b', // 黄昏的金色
          wave1: '#c8b69e',
          wave2: '#e8d4b8',
        }
      case 'night':
        return {
          base: '#0e2c45', // 夜晚的深蓝
          wave1: '#1f4e79',
          wave2: '#2a5a8a',
        }
      default: // day
        return {
          base: '#f0f4f6', // 日间的月白
          wave1: '#bfdce7',
          wave2: '#d4e8f0',
        }
    }
  }

  const colors = getWaveColors()
  const animationDuration = speed === 'slow' ? 20 : speed === 'medium' ? 10 : 5

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full -z-10"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        {/* 水纹噪点滤镜 */}
        <filter id="water-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="4"
            seed="2"
          >
            {/* 动画改变噪点 */}
            <animate
              attributeName="baseFrequency"
              values="0.008 0.012; 0.010 0.014; 0.008 0.012"
              dur={`${animationDuration * 2}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={intensity * 8} />
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        {/* 水波路径定义 */}
        <path
          id="wave-path-1"
          d="M 0,50 Q 150,30 300,50 T 600,50 T 900,50 T 1200,50 T 1500,50 T 1800,50 T 2100,50"
        />
        <path
          id="wave-path-2"
          d="M 0,60 Q 200,40 400,60 T 800,60 T 1200,60 T 1600,60 T 2000,60 T 2400,60"
        />
        <path
          id="wave-path-3"
          d="M 0,70 Q 250,50 500,70 T 1000,70 T 1500,70 T 2000,70 T 2500,70"
        />

        {/* 渐变定义 */}
        <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.wave1} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.wave1} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.wave2} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.wave2} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* 背景底色 */}
      <rect width="100%" height="100%" fill={colors.base} />

      {/* 第一层波浪（最慢）*/}
      <g filter="url(#water-turbulence)">
        <use href="#wave-path-1" stroke="url(#wave-gradient-1)" strokeWidth="80" fill="none">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -600,0; 0,0"
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
          />
        </use>
      </g>

      {/* 第二层波浪（中速）*/}
      <use href="#wave-path-2" stroke="url(#wave-gradient-2)" strokeWidth="60" fill="none">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -800,0; 0,0"
          dur={`${animationDuration * 0.7}s`}
          repeatCount="indefinite"
        />
      </use>

      {/* 第三层波浪（最快）*/}
      <use href="#wave-path-3" stroke={colors.wave1} strokeWidth="40" fill="none" opacity="0.1">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -1000,0; 0,0"
          dur={`${animationDuration * 0.5}s`}
          repeatCount="indefinite"
        />
      </use>

      {/* 远景的点状水纹（增加深度感）*/}
      <g opacity="0.15">
        {Array.from({ length: 30 }).map((_, i) => {
          const cx = (i * 100) % 1920
          const cy = 80 + (i * 23) % 400
          const r = 2 + (i % 3)
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill={colors.wave1}>
              <animate
                attributeName="opacity"
                values="0.1; 0.3; 0.1"
                dur={`${3 + (i % 4)}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>
    </svg>
  )
}
```

#### 使用方式

```typescript
// 在漂流河页面中
<RiverWaveBackground speed="slow" timeOfDay="day" intensity={0.5} />
```

---

### 2. 布料卡片组件 (ClothCard)

#### 设计思路
卡片不应该是简单的矩形，而应该模拟真实布料的质感：
- 边缘轻微不规则（像手工裁剪）
- 带有纸质纹理
- 悬停时有轻微的"飘动"效果
- 阴影柔和（像挂在竹竿上）

#### 技术实现

**文件**: `components/game/svg/ClothCard.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * 布料卡片组件
 * 
 * 特点：
 * - SVG生成的不规则边缘
 * - 纸质纹理滤镜
 * - 悬停时的飘动动画
 * - 可自定义染色深度（影响颜色）
 */
export function ClothCard({
  width = 300,
  height = 400,
  dyeDepth = 0.3, // 0-1
  children,
  onClick,
  isHovered = false,
}: {
  width?: number
  height?: number
  dyeDepth?: number
  children?: React.ReactNode
  onClick?: () => void
  isHovered?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [float, setFloat] = useState({ x: 0, y: 0, rotate: 0 })

  // 悬停时的飘动效果
  useEffect(() => {
    if (!isHovered) {
      setFloat({ x: 0, y: 0, rotate: 0 })
      return
    }

    // 模拟风吹的非线性运动
    const interval = setInterval(() => {
      setFloat({
        x: Math.sin(Date.now() / 1000) * 3,
        y: Math.cos(Date.now() / 1200) * 5,
        rotate: Math.sin(Date.now() / 1500) * 2,
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isHovered])

  // 根据染色深度计算颜色
  const getClothColor = () => {
    const hue = 210 // 蓝色色相
    const saturation = 30 + dyeDepth * 50 // 30-80%
    const lightness = 90 - dyeDepth * 40 // 90-50%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer"
      style={{ width, height }}
      animate={{
        x: float.x,
        y: float.y,
        rotate: float.rotate,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      onClick={onClick}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          {/* 纸质纹理滤镜 */}
          <filter id={`paper-texture-${width}-${height}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              seed="1"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.95
                      0 0 0 0 0.95
                      0 0 0 0 0.93
                      0 0 0 0.1 0"
            />
            <feBlend in="SourceGraphic" in2="colorNoise" mode="multiply" />
          </filter>

          {/* 不规则边缘遮罩 */}
          <mask id={`cloth-mask-${width}-${height}`}>
            <rect width={width} height={height} fill="white" />
            {/* 用多个小圆形在边缘制造不规则效果 */}
            {Array.from({ length: 20 }).map((_, i) => {
              const isTop = i < 5
              const isBottom = i >= 5 && i < 10
              const isLeft = i >= 10 && i < 15
              const isRight = i >= 15

              const cx = isLeft
                ? -2
                : isRight
                ? width + 2
                : (i % 5) * (width / 5)
              const cy = isTop
                ? -2
                : isBottom
                ? height + 2
                : ((i - 10) % 5) * (height / 5)

              return <circle key={i} cx={cx} cy={cy} r="4" fill="black" />
            })}
          </mask>

          {/* 柔和阴影 */}
          <filter id={`cloth-shadow-${width}-${height}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 阴影 */}
        <rect
          width={width}
          height={height}
          fill={getClothColor()}
          filter={`url(#cloth-shadow-${width}-${height})`}
        />

        {/* 主体 */}
        <rect
          width={width}
          height={height}
          fill={getClothColor()}
          mask={`url(#cloth-mask-${width}-${height})`}
          filter={`url(#paper-texture-${width}-${height})`}
        />

        {/* 边框装饰（细线条）*/}
        <rect
          x="8"
          y="8"
          width={width - 16}
          height={height - 16}
          fill="none"
          stroke="rgba(31, 78, 121, 0.2)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>

      {/* 内容区域 */}
      <div className="relative z-10 p-6 h-full flex flex-col">{children}</div>
    </motion.div>
  )
}
```

#### 使用示例

```typescript
<ClothCard
  width={320}
  height={400}
  dyeDepth={0.5}
  onClick={() => captureCloth(cloth.id)}
  isHovered={hoveredId === cloth.id}
>
  {/* 布料信息内容 */}
  <div className="flex-1">
    <h3>螺旋手帕</h3>
    <p>已漂流 3 天</p>
  </div>
</ClothCard>
```

---

### 3. 印章生成器 (SealGenerator)

#### 设计思路
中国传统印章有独特的美学：
- 边框：方形或圆形，边缘略有残缺（模拟石材）
- 内容：篆刻文字或图案，以阴刻为主
- 颜色：朱红色，带有渗墨效果
- 使用场景：用户落款、作品标识

我们要用算法生成独特的印章，每个用户都不同。

#### 技术实现

**文件**: `lib/game/svg/seal-generator.ts`

```typescript
/**
 * 印章生成器
 * 
 * 功能：
 * - 根据用户名生成独特的篆刻图案
 * - 支持方形/圆形印章
 * - 自动生成边缘的不规则效果（模拟刻痕）
 * - 渲染为SVG元素
 */

export type SealShape = 'square' | 'circle'
export type SealStyle = 'yin' | 'yang' // 阴刻（白字）/ 阳刻（红字）

export interface SealConfig {
  username: string
  shape: SealShape
  style: SealStyle
  size: number // 像素
  color?: string // 默认朱红色
}

export class SealGenerator {
  private config: SealConfig

  constructor(config: SealConfig) {
    this.config = {
      color: '#c83c3c',
      ...config,
    }
  }

  /**
   * 生成印章SVG字符串
   */
  generate(): string {
    const { username, shape, style, size, color } = this.config

    // 1. 生成边框路径（带不规则效果）
    const border = this.generateBorder(shape, size)

    // 2. 生成内容路径（简化的"篆刻"效果）
    const content = this.generateContent(username, shape, size, style)

    // 3. 组合SVG
    return `
      <svg 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 ${size} ${size}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- 渗墨效果滤镜 -->
          <filter id="ink-bleed">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="2" 
              numOctaves="3" 
              seed="${this.hashUsername(username)}"
            />
            <feDisplacementMap in="SourceGraphic" scale="2" />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          
          <!-- 纸张吸收效果 -->
          <filter id="paper-absorb">
            <feGaussianBlur stdDeviation="1.5" />
            <feColorMatrix 
              type="matrix" 
              values="1 0 0 0 0
                      0 0.3 0 0 0
                      0 0 0.3 0 0
                      0 0 0 0.9 0"
            />
          </filter>
        </defs>

        <!-- 背景（朱红色）-->
        <g filter="url(#ink-bleed)">
          ${border}
        </g>

        <!-- 内容（文字/图案）-->
        <g filter="url(#paper-absorb)">
          ${content}
        </g>
      </svg>
    `
  }

  /**
   * 生成边框路径
   */
  private generateBorder(shape: SealShape, size: number): string {
    const center = size / 2
    const radius = size * 0.45

    if (shape === 'circle') {
      // 圆形边框（带随机扰动）
      const points = this.generateIrregularCircle(center, center, radius, 36)
      const pathData = this.pointsToPath(points, true)
      return `<path d="${pathData}" fill="${this.config.color}" />`
    } else {
      // 方形边框（带圆角和扰动）
      const inset = size * 0.1
      const points = this.generateIrregularRect(
        inset,
        inset,
        size - inset * 2,
        size - inset * 2,
        24
      )
      const pathData = this.pointsToPath(points, true)
      return `<path d="${pathData}" fill="${this.config.color}" />`
    }
  }

  /**
   * 生成内容路径（简化版篆刻）
   */
  private generateContent(
    username: string,
    shape: SealShape,
    size: number,
    style: SealStyle
  ): string {
    const center = size / 2
    const contentSize = size * 0.6

    // 取用户名的前1-2个字符
    const chars = username.slice(0, 2)

    // 根据字符生成几何图案（简化版，实际可以更复杂）
    const pattern = this.generatePattern(chars, center, contentSize)

    const fillColor = style === 'yin' ? '#ffffff' : this.config.color
    const strokeColor = style === 'yin' ? 'none' : '#ffffff'

    return `
      <g fill="${fillColor}" stroke="${strokeColor}" stroke-width="2">
        ${pattern}
      </g>
    `
  }

  /**
   * 根据文字生成几何图案
   */
  private generatePattern(text: string, cx: number, size: number): string {
    const hash = this.hashUsername(text)
    const seed = hash % 5 // 5种基础图案

    const radius = size / 2

    switch (seed) {
      case 0: // 螺旋纹
        return this.generateSpiral(cx, cx, radius, 3)
      case 1: // 回纹
        return this.generateMaze(cx, cx, radius)
      case 2: // 云纹
        return this.generateCloud(cx, cx, radius)
      case 3: // 几何分割
        return this.generateGeometric(cx, cx, radius)
      default: // 圆环
        return this.generateRings(cx, cx, radius, 3)
    }
  }

  /**
   * 生成螺旋纹
   */
  private generateSpiral(cx: number, cy: number, radius: number, turns: number): string {
    const points: { x: number; y: number }[] = []
    const steps = 100

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * turns * Math.PI * 2
      const r = radius * t
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      })
    }

    return `<polyline points="${points.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke-width="3" />`
  }

  /**
   * 生成回纹（迷宫状）
   */
  private generateMaze(cx: number, cy: number, radius: number): string {
    const rects: string[] = []
    const cellSize = radius / 3

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 2 === 0) {
          const x = cx - radius + i * cellSize
          const y = cy - radius + j * cellSize
          rects.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" />`)
        }
      }
    }

    return rects.join('')
  }

  /**
   * 生成云纹
   */
  private generateCloud(cx: number, cy: number, radius: number): string {
    const circles: string[] = []
    const numCircles = 5

    for (let i = 0; i < numCircles; i++) {
      const angle = (i / numCircles) * Math.PI * 2
      const r = radius * 0.3
      const x = cx + Math.cos(angle) * (radius * 0.5)
      const y = cy + Math.sin(angle) * (radius * 0.5)
      circles.push(`<circle cx="${x}" cy="${y}" r="${r}" />`)
    }

    return circles.join('')
  }

  /**
   * 生成几何分割
   */
  private generateGeometric(cx: number, cy: number, radius: number): string {
    const lines: string[] = []

    // 十字分割
    lines.push(`<line x1="${cx - radius}" y1="${cy}" x2="${cx + radius}" y2="${cy}" stroke-width="3" />`)
    lines.push(`<line x1="${cx}" y1="${cy - radius}" x2="${cx}" y2="${cy + radius}" stroke-width="3" />`)

    // 对角线
    lines.push(`<line x1="${cx - radius * 0.7}" y1="${cy - radius * 0.7}" x2="${cx + radius * 0.7}" y2="${cy + radius * 0.7}" stroke-width="2" />`)
    lines.push(`<line x1="${cx + radius * 0.7}" y1="${cy - radius * 0.7}" x2="${cx - radius * 0.7}" y2="${cy + radius * 0.7}" stroke-width="2" />`)

    return lines.join('')
  }

  /**
   * 生成同心圆环
   */
  private generateRings(cx: number, cy: number, radius: number, count: number): string {
    const rings: string[] = []

    for (let i = 1; i <= count; i++) {
      const r = (radius / count) * i
      rings.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="2" />`)
    }

    return rings.join('')
  }

  /**
   * 生成不规则圆形（模拟手工刻制）
   */
  private generateIrregularCircle(
    cx: number,
    cy: number,
    radius: number,
    points: number
  ): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = []
    const seed = this.hashUsername(this.config.username)

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2
      // 添加随机扰动（基于用户名seed，确保每次生成一致）
      const noise = (this.pseudoRandom(seed + i) - 0.5) * radius * 0.1
      const r = radius + noise

      result.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      })
    }

    return result
  }

  /**
   * 生成不规则矩形
   */
  private generateIrregularRect(
    x: number,
    y: number,
    width: number,
    height: number,
    pointsPerSide: number
  ): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = []
    const seed = this.hashUsername(this.config.username)
    let index = 0

    // 上边
    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide
      const noise = (this.pseudoRandom(seed + index++) - 0.5) * 3
      result.push({ x: x + width * t, y: y + noise })
    }

    // 右边
    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide
      const noise = (this.pseudoRandom(seed + index++) - 0.5) * 3
      result.push({ x: x + width + noise, y: y + height * t })
    }

    // 下边
    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide
      const noise = (this.pseudoRandom(seed + index++) - 0.5) * 3
      result.push({ x: x + width - width * t, y: y + height + noise })
    }

    // 左边
    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide
      const noise = (this.pseudoRandom(seed + index++) - 0.5) * 3
      result.push({ x: x + noise, y: y + height - height * t })
    }

    return result
  }

  /**
   * 点数组转SVG路径
   */
  private pointsToPath(points: Array<{ x: number; y: number }>, close: boolean): string {
    if (points.length === 0) return ''

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      // 使用平滑曲线连接
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      const cpy = (prev.y + curr.y) / 2
      path += ` Q ${prev.x},${prev.y} ${cpx},${cpy}`
    }

    if (close) {
      path += ' Z'
    }

    return path
  }

  /**
   * 用户名哈希（用于生成一致的随机种子）
   */
  private hashUsername(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  /**
   * 伪随机数生成器（基于种子）
   */
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
}
```

#### 组件封装

**文件**: `components/game/svg/UserSeal.tsx`

```typescript
'use client'

import { useMemo } from 'react'
import { SealGenerator } from '@/lib/game/svg/seal-generator'

export function UserSeal({
  username,
  size = 60,
  shape = 'square',
  style = 'yin',
  className = '',
}: {
  username: string
  size?: number
  shape?: 'square' | 'circle'
  style?: 'yin' | 'yang'
  className?: string
}) {
  const sealSVG = useMemo(() => {
    const generator = new SealGenerator({
      username,
      size,
      shape,
      style,
    })
    return generator.generate()
  }, [username, size, shape, style])

  return (
    <div
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: sealSVG }}
    />
  )
}
```

#### 使用示例

```typescript
// 在布料卡片上显示创建者的印章
<UserSeal 
  username="小明" 
  size={50} 
  shape="circle" 
  style="yin"
  className="absolute bottom-4 right-4"
/>
```

---

### 4. 染料扩散动画 (DyeDiffusion)

#### 设计思路
当用户点击"染色"按钮时，应该有一个从点击位置向外扩散的蓝色波纹效果，模拟染料在水中晕开的过程。

#### 技术实现

**文件**: `components/game/svg/DyeDiffusion.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DiffusionRipple {
  id: string
  x: number
  y: number
  color: string
  timestamp: number
}

/**
 * 染料扩散动画组件
 * 
 * 特点：
 * - 从点击位置向外扩散多层波纹
 * - 使用SVG实现平滑的圆形扩散
 * - 自动管理波纹的生命周期
 * - 可自定义颜色和扩散速度
 */
export function DyeDiffusion({
  onTrigger,
}: {
  onTrigger?: (callback: (x: number, y: number, color: string) => void) => void
}) {
  const [ripples, setRipples] = useState<DiffusionRipple[]>([])

  useEffect(() => {
    if (onTrigger) {
      onTrigger((x, y, color) => {
        const id = `${Date.now()}-${Math.random()}`
        setRipples(prev => [...prev, { id, x, y, color, timestamp: Date.now() }])

        // 2秒后自动移除
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id))
        }, 2000)
      })
    }
  }, [onTrigger])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 扩散滤镜（模拟染料在水中的效果）*/}
        <filter id="dye-diffusion-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0">
            <animate
              attributeName="stdDeviation"
              values="0; 15; 20"
              dur="2s"
              fill="freeze"
            />
          </feGaussianBlur>
          <feColorMatrix type="saturate" values="1.5" />
        </filter>
      </defs>

      <AnimatePresence>
        {ripples.map(ripple => (
          <g key={ripple.id}>
            {/* 主波纹 */}
            <motion.circle
              cx={ripple.x}
              cy={ripple.y}
              r={10}
              fill={ripple.color}
              filter="url(#dye-diffusion-filter)"
              initial={{ r: 0, opacity: 1 }}
              animate={{ r: 150, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
              }}
            />

            {/* 第二层波纹（稍慢）*/}
            <motion.circle
              cx={ripple.x}
              cy={ripple.y}
              r={10}
              fill="none"
              stroke={ripple.color}
              strokeWidth="2"
              initial={{ r: 0, opacity: 0.8 }}
              animate={{ r: 120, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />

            {/* 第三层波纹（最慢）*/}
            <motion.circle
              cx={ripple.x}
              cy={ripple.y}
              r={10}
              fill="none"
              stroke={ripple.color}
              strokeWidth="1"
              initial={{ r: 0, opacity: 0.6 }}
              animate={{ r: 90, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.6,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          </g>
        ))}
      </AnimatePresence>
    </svg>
  )
}
```

#### 使用示例

```typescript
'use client'

import { useRef } from 'react'
import { DyeDiffusion } from '@/components/game/svg/DyeDiffusion'

export function WorkshopPage() {
  const triggerDiffusionRef = useRef<(x: number, y: number, color: string) => void>()

  const handleDyeClick = (event: React.MouseEvent) => {
    if (triggerDiffusionRef.current) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      triggerDiffusionRef.current(x, y, '#1f4e79') // 靛蓝色
    }
  }

  return (
    <div className="relative">
      <button onClick={handleDyeClick}>染色</button>
      
      <DyeDiffusion
        onTrigger={callback => {
          triggerDiffusionRef.current = callback
        }}
      />
    </div>
  )
}
```

---

## 动画系统设计

### 动画分类与设计原则

```
环境动画（极慢）────> 水波流动、光影变化
    │
    ├── 目的：营造氛围，几乎察觉不到
    └── 时长：15-30秒

装饰动画（慢速）────> 布料飘动、粒子漂浮
    │
    ├── 目的：增加生命力，轻微动态
    └── 时长：3-5秒

交互动画（中速）────> 按钮反馈、卡片翻转
    │
    ├── 目的：即时反馈，引导操作
    └── 时长：200-400ms

过程动画（慢速）────> 染色扩散、颜色过渡
    │
    ├── 目的：展现过程，教育性
    └── 时长：800-1500ms
```

### 关键动画实现

#### 1. 布料飘动动画

**使用SVG path morphing + CSS animation**

```css
/* components/game/svg/styles/cloth-float.css */

@keyframes cloth-float {
  0% {
    d: path("M 0,0 Q 50,5 100,0 T 200,0");
  }
  33% {
    d: path("M 0,0 Q 50,-3 100,0 T 200,0");
  }
  66% {
    d: path("M 0,0 Q 50,8 100,0 T 200,0");
  }
  100% {
    d: path("M 0,0 Q 50,5 100,0 T 200,0");
  }
}

.cloth-edge {
  animation: cloth-float 4s ease-in-out infinite;
}
```

#### 2. 水滴涟漪触发

**组件**: `components/game/svg/RippleOnClick.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function RippleOnClick({ children }: { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { id, x, y }])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 1000)
  }

  return (
    <div className="relative" onClick={handleClick}>
      {children}
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.circle
              key={ripple.id}
              cx={ripple.x}
              cy={ripple.y}
              r={0}
              fill="none"
              stroke="rgba(31, 78, 121, 0.5)"
              strokeWidth="2"
              initial={{ r: 0, opacity: 1 }}
              animate={{ r: 100, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}
```

---

## 交互反馈设计

### 触觉反馈矩阵

| 交互类型 | 视觉反馈 | 动画 | 音效（可选）|
|---------|---------|------|-----------|
| 按钮点击 | 印章按下效果 | 150ms press + 涟漪 | 轻微"啪"声 |
| 卡片滑动 | 水波推开 | 跟随手势 | 水流声 |
| 染色操作 | 扩散动画 | 1200ms | 水滴声 |
| 完成布料 | 粒子爆发 | 2000ms | 铃声 |

### 手势交互设计

#### 滑动卡片交互

**使用 @use-gesture/react**

```typescript
'use client'

import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

export function SwipeableClothCard({ cloth, onSwipeLeft, onSwipeRight }: any) {
  const [{ x, rotate }, api] = useSpring(() => ({ x: 0, rotate: 0 }))

  const bind = useDrag(
    ({ offset: [ox], direction: [xDir], velocity: [vx], down }) => {
      const trigger = Math.abs(ox) > 150 // 滑动超过150px触发

      if (!down && trigger) {
        // 触发动作
        if (xDir > 0) {
          onSwipeRight(cloth)
        } else {
          onSwipeLeft(cloth)
        }
        // 卡片飞出
        api.start({ x: xDir * 1000, rotate: xDir * 45 })
      } else {
        // 跟随手势或回弹
        api.start({
          x: down ? ox : 0,
          rotate: down ? ox / 10 : 0,
          immediate: down,
        })
      }
    },
    {
      from: () => [x.get(), 0],
      filterTaps: true,
      bounds: { left: -300, right: 300 },
      rubberband: true,
    }
  )

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotate,
        touchAction: 'none',
      }}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
    >
      {/* 卡片内容 */}
    </animated.div>
  )
}
```

---

## 性能优化策略

### SVG 优化

1. **减少路径点数量**
```typescript
// 优化前：100个点
const points = Array.from({ length: 100 }, ...)

// 优化后：30个点（够用）
const points = Array.from({ length: 30 }, ...)
```

2. **复用 defs 定义**
```xml
<!-- 定义一次，多次使用 -->
<defs>
  <filter id="global-paper-texture">...</filter>
</defs>

<rect filter="url(#global-paper-texture)" />
<rect filter="url(#global-paper-texture)" />
```

3. **使用 CSS transform代替SVG transform**
```css
/* 优先使用 CSS（GPU加速）*/
.animated-element {
  transform: translateX(10px);
  will-change: transform;
}

/* 避免频繁改变SVG属性 */
<circle cx={dynamicValue} /> /* ❌ */
```

### Canvas 优化

1. **离屏渲染**
```typescript
// 预渲染复杂图层到离屏Canvas
const offscreenCanvas = document.createElement('canvas')
const offscreenCtx = offscreenCanvas.getContext('2d')!

// 渲染一次
renderComplexLayer(offscreenCtx)

// 主Canvas只需drawImage
mainCtx.drawImage(offscreenCanvas, 0, 0)
```

2. **图层缓存**
```typescript
class LayerCache {
  private cache = new Map<string, HTMLCanvasElement>()

  get(layerId: string): HTMLCanvasElement | null {
    return this.cache.get(layerId) || null
  }

  set(layerId: string, canvas: HTMLCanvasElement) {
    this.cache.set(layerId, canvas)
  }

  clear() {
    this.cache.clear()
  }
}
```

### 动画性能

1. **使用 requestAnimationFrame**
```typescript
let rafId: number

function animate() {
  // 更新动画
  updateAnimation()
  
  rafId = requestAnimationFrame(animate)
}

// 组件卸载时取消
useEffect(() => {
  animate()
  return () => cancelAnimationFrame(rafId)
}, [])
```

2. **Intersection Observer 懒加载**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 进入视口，开始动画
          startAnimation()
        } else {
          // 离开视口，停止动画
          stopAnimation()
        }
      })
    },
    { threshold: 0.1 }
  )

  if (elementRef.current) {
    observer.observe(elementRef.current)
  }

  return () => observer.disconnect()
}, [])
```

---

## 响应式适配方案

### 断点定义

```css
:root {
  --mobile-max: 640px;
  --tablet-max: 1024px;
  --desktop-min: 1025px;
}
```

### SVG响应式策略

```typescript
export function ResponsiveSVG({ children }: { children: React.ReactNode }) {
  const [viewBox, setViewBox] = useState('0 0 1920 1080')

  useEffect(() => {
    const updateViewBox = () => {
      const width = window.innerWidth
      if (width < 640) {
        setViewBox('0 0 640 1136') // Mobile
      } else if (width < 1024) {
        setViewBox('0 0 1024 768') // Tablet
      } else {
        setViewBox('0 0 1920 1080') // Desktop
      }
    }

    updateViewBox()
    window.addEventListener('resize', updateViewBox)
    return () => window.removeEventListener('resize', updateViewBox)
  }, [])

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
      {children}
    </svg>
  )
}
```

---

## 总结与后续计划

### 已完成设计

- ✅ 水波流动背景组件
- ✅ 布料卡片组件（含不规则边缘）
- ✅ 印章生成器（算法生成独特图案）
- ✅ 染料扩散动画
- ✅ 完整的颜色系统
- ✅ 动画设计原则
- ✅ 性能优化策略

### 待实现组件

1. **族谱连接线** (LineageChain)
   - SVG path with 书法笔触效果
   - Marker端点装饰

2. **粒子系统** (ParticleSystem)
   - 完成布料时的庆祝效果
   - 染色过程的气泡

3. **光影变化系统** (DynamicLighting)
   - 根据本地时间自动切换氛围

4. **纸质纹理生成器** (TextureGenerator)
   - 宣纸、棉布、丝绸不同纹理

### 下一步行动

1. **创建组件库目录**
```bash
mkdir -p components/game/svg
mkdir -p lib/game/svg
mkdir -p hooks/game
```

2. **实现第一个示例**
   - 先实现"水波背景"组件
   - 在一个测试页面中展示
   - 验证性能和效果

3. **搭建Storybook**
   - 为每个SVG组件创建Story
   - 方便调试和展示

---

**文档版本**: v1.0  
**创建日期**: 2025-01-29  
**状态**: 📐 设计完成，待实现  
**预计实现时间**: 2-3周

