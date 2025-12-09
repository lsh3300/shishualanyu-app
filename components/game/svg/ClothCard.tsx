'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { IrregularShapeGenerator } from '@/lib/game/svg/irregular-shape-generator'

/**
 * 布料卡片组件
 * 
 * 设计理念：
 * - 模拟手工裁剪的布料质感
 * - 不规则的边缘（使用算法生成）
 * - SVG纸质纹理滤镜
 * - 悬停时的微妙飘动动画
 * - 根据染色深度动态调整颜色
 */

export interface ClothCardProps {
  /** 卡片宽度 */
  width?: number
  /** 卡片高度 */
  height?: number
  /** 染色深度 (0-1, 0=浅蓝, 1=深蓝) */
  dyeDepth?: number
  /** 卡片内容 */
  children?: React.ReactNode
  /** 点击事件 */
  onClick?: () => void
  /** 是否悬停 */
  isHovered?: boolean
  /** 唯一标识（用于生成不同的不规则边缘）*/
  seed?: string | number
  /** 不规则程度 (0-1) */
  irregularity?: number
  /** 自定义样式类名 */
  className?: string
}

export function ClothCard({
  width = 320,
  height = 420,
  dyeDepth = 0.3,
  children,
  onClick,
  isHovered = false,
  seed = 'default',
  irregularity = 0.6,
  className = '',
}: ClothCardProps) {
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0, rotate: 0 })

  // 生成唯一的ID（用于SVG元素的引用）
  const uniqueId = useMemo(() => {
    return `cloth-${typeof seed === 'string' ? seed : seed.toString()}-${Date.now()}`
  }, [seed])

  // 生成不规则边缘路径
  const irregularPath = useMemo(() => {
    const numericSeed =
      typeof seed === 'number' ? seed : IrregularShapeGenerator.stringToSeed(seed)

    const generator = new IrregularShapeGenerator({
      width,
      height,
      pointsPerSide: 12,
      irregularity,
      seed: numericSeed,
      cornerRadius: 12,
    })

    return generator.generateRectPath()
  }, [width, height, seed, irregularity])

  // 悬停时的飘动效果
  useEffect(() => {
    if (!isHovered) {
      setFloatOffset({ x: 0, y: 0, rotate: 0 })
      return
    }

    let animationFrame: number
    const startTime = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000

      // 使用正弦波模拟自然的飘动
      setFloatOffset({
        x: Math.sin(elapsed * 1.2) * 4,
        y: Math.cos(elapsed * 0.8) * 6 - 3, // 轻微向上
        rotate: Math.sin(elapsed * 0.9) * 1.5,
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isHovered])

  // 根据染色深度计算颜色
  const getClothColors = () => {
    const hue = 210 // 蓝色
    const baseSaturation = 25
    const baseLightness = 92

    return {
      // 主体颜色
      base: `hsl(${hue}, ${baseSaturation + dyeDepth * 40}%, ${baseLightness - dyeDepth * 35}%)`,
      // 阴影颜色
      shadow: `hsla(${hue}, ${baseSaturation + dyeDepth * 50}%, ${baseLightness - dyeDepth * 50}%, 0.3)`,
      // 高光颜色
      highlight: `hsla(${hue}, ${baseSaturation}%, ${baseLightness + 5}%, 0.4)`,
      // 边框颜色
      border: `hsla(${hue}, ${baseSaturation + dyeDepth * 30}%, ${baseLightness - dyeDepth * 40}%, 0.5)`,
    }
  }

  const colors = getClothColors()

  return (
    <motion.div
      className={`relative cursor-pointer select-none ${className}`}
      style={{
        width,
        height,
        perspective: '1000px',
      }}
      animate={{
        x: floatOffset.x,
        y: floatOffset.y,
        rotate: floatOffset.rotate,
      }}
      transition={{
        type: 'spring',
        stiffness: 50,
        damping: 15,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      onClick={onClick}
    >
      {/* SVG 布料背景与装饰 */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* 纸质纹理滤镜 */}
          <filter id={`paper-texture-${uniqueId}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              seed={typeof seed === 'number' ? seed : IrregularShapeGenerator.stringToSeed(seed)}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.95
                      0 0 0 0 0.95
                      0 0 0 0 0.93
                      0 0 0 0.08 0"
            />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>

          {/* 棉布纹理（更细腻的纹理）*/}
          <filter id={`cotton-texture-${uniqueId}`}>
            <feTurbulence
              type="turbulence"
              baseFrequency="1.5"
              numOctaves="3"
              seed={typeof seed === 'number' ? seed + 1 : IrregularShapeGenerator.stringToSeed(seed) + 1}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 0.98
                      0 0 0 0.05 0"
            />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>

          {/* 柔和阴影 */}
          <filter id={`cloth-shadow-${uniqueId}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="3" dy="6" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 边缘磨损效果 */}
          <filter id={`edge-wear-${uniqueId}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="2"
              numOctaves="2"
              seed={typeof seed === 'number' ? seed + 2 : IrregularShapeGenerator.stringToSeed(seed) + 2}
            />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>

          {/* 内部光晕（增加深度）*/}
          <radialGradient id={`inner-glow-${uniqueId}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="70%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* 阴影层 */}
        <path
          d={irregularPath}
          fill={colors.shadow}
          filter={`url(#cloth-shadow-${uniqueId})`}
          opacity="0.4"
        />

        {/* 主体布料 */}
        <path
          d={irregularPath}
          fill={colors.base}
          filter={`url(#paper-texture-${uniqueId})`}
        />

        {/* 棉布纹理叠加 */}
        <path
          d={irregularPath}
          fill={colors.base}
          filter={`url(#cotton-texture-${uniqueId})`}
          opacity="0.6"
        />

        {/* 内部光晕（增加立体感）*/}
        <path d={irregularPath} fill={`url(#inner-glow-${uniqueId})`} opacity="0.3" />

        {/* 装饰性边框（细线）*/}
        <path
          d={irregularPath}
          fill="none"
          stroke={colors.border}
          strokeWidth="1.5"
          strokeDasharray="4,4"
          opacity="0.4"
          filter={`url(#edge-wear-${uniqueId})`}
        />

        {/* 内边框装饰 */}
        <g transform="translate(12, 12)">
          <path
            d={new IrregularShapeGenerator({
              width: width - 24,
              height: height - 24,
              pointsPerSide: 10,
              irregularity: irregularity * 0.5,
              seed: typeof seed === 'number' ? seed + 100 : IrregularShapeGenerator.stringToSeed(seed) + 100,
              cornerRadius: 8,
            }).generateRectPath()}
            fill="none"
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="2,3"
            opacity="0.25"
          />
        </g>

        {/* 四角装饰（小圆点）*/}
        {[
          { cx: 20, cy: 20 },
          { cx: width - 20, cy: 20 },
          { cx: 20, cy: height - 20 },
          { cx: width - 20, cy: height - 20 },
        ].map((pos, i) => (
          <circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r="2.5"
            fill={colors.border}
            opacity="0.4"
          />
        ))}

        {/* 染色深度指示条（可选，位于底部）*/}
        {dyeDepth > 0.1 && (
          <g transform={`translate(${width / 2 - 50}, ${height - 25})`}>
            <rect
              width="100"
              height="3"
              rx="1.5"
              fill="rgba(0,0,0,0.1)"
            />
            <rect
              width={100 * dyeDepth}
              height="3"
              rx="1.5"
              fill={colors.border}
              opacity="0.6"
            />
          </g>
        )}
      </svg>

      {/* 内容区域 */}
      <div
        className="relative z-10 p-6 h-full flex flex-col"
        style={{
          clipPath: `path('${irregularPath}')`,
        }}
      >
        {children}
      </div>

      {/* 悬停时的边缘高光 */}
      {isHovered && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <filter id={`hover-glow-${uniqueId}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={irregularPath}
            fill="none"
            stroke={colors.highlight}
            strokeWidth="3"
            opacity="0.6"
            filter={`url(#hover-glow-${uniqueId})`}
          >
            <animate
              attributeName="stroke-width"
              values="3; 5; 3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      )}
    </motion.div>
  )
}
