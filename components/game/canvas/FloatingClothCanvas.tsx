'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * 3D悬浮布料Canvas - 突破性视觉设计
 * 
 * 设计理念：
 * - 不再是"白色画板"，而是"悬浮在染坊中的真实布料"
 * - 3D透视 + 微妙阴影 + 边缘光晕
 * - 呼吸般的浮动动画
 * - 光影随时间变化
 * 
 * 灵感来源：
 * - Monument Valley的立体空间感
 * - 真实染坊中晾晒布料的场景
 */

interface FloatingClothCanvasProps {
  width?: number
  height?: number
  onDyeClick?: (x: number, y: number, color: string) => void
  currentColor?: string
  children?: React.ReactNode
}

export function FloatingClothCanvas({
  width = 500,
  height = 500,
  onDyeClick,
  currentColor = 'hsl(210, 70%, 50%)',
  children,
}: FloatingClothCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [lightAngle, setLightAngle] = useState(0)

  /**
   * 光影动画 - 模拟阳光穿过窗户的变化
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setLightAngle(prev => (prev + 0.5) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  /**
   * 初始化画布 - 添加布料纹理
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 绘制细腻的布料纹理
    drawFabricTexture(ctx, width, height)
  }, [width, height])

  /**
   * 绘制布料纹理 - 细腻的经纬线交织
   */
  const drawFabricTexture = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    // 底色：自然棉布色
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#fdfcfb')
    gradient.addColorStop(0.5, '#f8f7f5')
    gradient.addColorStop(1, '#fdfcfb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // 绘制经线（垂直）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.015)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < w; i += 2) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, h)
      ctx.stroke()
    }

    // 绘制纬线（水平）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.012)'
    for (let i = 0; i < h; i += 2) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(w, i)
      ctx.stroke()
    }

    // 添加随机的纤维纹理
    ctx.fillStyle = 'rgba(0, 0, 0, 0.003)'
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const size = Math.random() * 2
      ctx.fillRect(x, y, size, size)
    }

    // 边缘磨损效果
    const edgeGradient = ctx.createLinearGradient(0, 0, w, 0)
    edgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    edgeGradient.addColorStop(0.05, 'rgba(255, 255, 255, 0)')
    edgeGradient.addColorStop(0.95, 'rgba(255, 255, 255, 0)')
    edgeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)')
    ctx.fillStyle = edgeGradient
    ctx.fillRect(0, 0, w, h)
  }

  /**
   * 处理染色点击
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      // 正确计算考虑缩放的坐标
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (event.clientX - rect.left) * scaleX
      const y = (event.clientY - rect.top) * scaleY

      // 立即触发点染（不需要等待初始化）
      onDyeClick?.(x, y, currentColor)
    },
    [onDyeClick, currentColor]
  )

  /**
   * 动态光影样式
   */
  const getLightStyle = () => {
    const x = 50 + Math.cos((lightAngle * Math.PI) / 180) * 10
    const y = 50 + Math.sin((lightAngle * Math.PI) / 180) * 10
    
    return {
      background: `radial-gradient(
        ellipse at ${x}% ${y}%,
        rgba(255, 248, 220, 0.3) 0%,
        rgba(255, 248, 220, 0) 50%
      )`,
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 3D布料容器 */}
      <motion.div
        className="relative"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{
          rotateX: isHovering ? 0 : 5,
          rotateY: isHovering ? 0 : -5,
          y: isHovering ? -8 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 布料阴影（投射在桌面上）*/}
        <div
          className="absolute inset-0 blur-2xl opacity-30 -z-10"
          style={{
            transform: 'translateZ(-50px) scale(0.95)',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          }}
        />

        {/* 主画布容器 */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.8),
              inset 0 0 100px rgba(255, 248, 220, 0.1)
            `,
          }}
        >
          {/* 动态光影层 */}
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-all duration-1000"
            style={getLightStyle()}
          />

          {/* 边缘光晕 */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.5)',
            }}
          />

          {/* 主画布 */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleClick}
            className="relative z-0 cursor-crosshair"
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
          />

          {/* 叠加内容（染色效果）*/}
          {children}

          {/* 悬停时的高光 */}
          {isHovering && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `radial-gradient(
                  circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                  rgba(255, 255, 255, 0.2) 0%,
                  transparent 30%
                )`,
              }}
            />
          )}
        </div>

        {/* 布料顶部边缘的反光 */}
        <div
          className="absolute -top-1 left-0 right-0 h-2 rounded-full blur-sm"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
            transform: 'translateZ(1px)',
          }}
        />

        {/* 四角的固定夹 */}
        {[
          { top: -8, left: -8 },
          { top: -8, right: -8 },
          { bottom: -8, left: -8 },
          { bottom: -8, right: -8 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg"
            style={{
              ...pos,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
            }}
            animate={{
              scale: isHovering ? 1.1 : 1,
            }}
          />
        ))}
      </motion.div>

      {/* 呼吸动画的光环 */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse, rgba(210,220,255,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
