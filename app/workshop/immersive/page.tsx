'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { DyeWorkshopScene } from '@/components/game/environment/DyeWorkshopScene'
import { FloatingClothCanvas } from '@/components/game/canvas/FloatingClothCanvas'
import { DyeVat } from '@/components/game/interactive/DyeVat'
import { Button } from '@/components/ui/button'

/**
 * 沉浸式染坊 - 突破性游戏体验
 * 
 * 设计理念：
 * - 不是"使用软件"，而是"置身染坊"
 * - 每个交互都有仪式感
 * - 视觉、听觉、触觉的多感官体验
 * 
 * 核心创新：
 * 1. 3D悬浮布料（不再是平面）
 * 2. 真实染缸交互（不再是按钮）
 * 3. 染坊场景环境（不再是空白）
 * 4. 时间与等待的美学（不再是即时完成）
 */

export default function ImmersiveWorkshopPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasInitialized, setCanvasInitialized] = useState(false)
  
  const [selectedColor, setSelectedColor] = useState<typeof dyeColors[0]>(dyeColors[2])
  const [dyePoints, setDyePoints] = useState<Array<{
    x: number
    y: number
    color: string
    timestamp: number
  }>>([])

  /**
   * 初始化染色canvas（考虑DPR）
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasInitialized) return

    const dpr = window.devicePixelRatio || 1
    const size = 500
    canvas.width = size * dpr
    canvas.height = size * dpr
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      // 清除画布，确保透明
      ctx.clearRect(0, 0, size, size)
      setCanvasInitialized(true)
    }
  }, [canvasInitialized])

  /**
   * 处理染色点击
   */
  const handleDyeClick = useCallback((x: number, y: number, color: string) => {
    // 添加新的染色点
    const newPoint = {
      x,
      y,
      color,
      timestamp: Date.now(),
    }
    setDyePoints(prev => [...prev, newPoint])

    // 在Canvas上绘制扩散效果
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 创建扩散动画
    animateDyeDiffusion(ctx, x, y, color)
  }, [])

  /**
   * 染色扩散动画
   */
  const animateDyeDiffusion = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) => {
    let radius = 0
    const maxRadius = 60 + Math.random() * 30
    const startTime = Date.now()
    const duration = 1500 // 1.5秒的扩散动画

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 缓动函数
      const easeOutQuad = 1 - Math.pow(1 - progress, 3)
      radius = maxRadius * easeOutQuad

      // 绘制渐变
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
      if (hslMatch) {
        const [, h, s, l] = hslMatch
        const opacity = (0.3 + Math.random() * 0.2) * (1 - progress * 0.3)
        
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${Math.max(20, parseInt(l) - 20)}%, ${opacity})`)
        gradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${opacity * 0.7})`)
        gradient.addColorStop(0.8, `hsla(${h}, ${s}%, ${Math.min(80, parseInt(l) + 20)}%, ${opacity * 0.3})`)
        gradient.addColorStop(1, `hsla(${h}, ${s}%, ${Math.min(90, parseInt(l) + 30)}%, 0)`)
      }

      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = gradient
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      ctx.globalCompositeOperation = 'source-over'

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  return (
    <DyeWorkshopScene timeOfDay="afternoon">
      {/* 顶部导航 */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Link href="/workshop">
          <Button variant="ghost" size="sm" className="gap-2 backdrop-blur-md bg-white/80">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </Link>

        <motion.div
          className="backdrop-blur-md bg-white/80 px-6 py-3 rounded-full shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            沉浸式染坊
          </h1>
        </motion.div>

        <div className="w-10" /> {/* 占位保持对齐 */}
      </div>

      {/* 主工作区 */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] pt-20">
        {/* 悬浮布料 */}
        <FloatingClothCanvas
          width={500}
          height={500}
          currentColor={selectedColor.value}
          onDyeClick={handleDyeClick}
        >
          {/* 在FloatingClothCanvas内部创建透明覆盖层用于实际绘制 */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
            }}
          />
        </FloatingClothCanvas>

        {/* 染缸区域 */}
        <motion.div
          className="mt-16 relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* 木质托盘 */}
          <div
            className="absolute -inset-4 -bottom-2 rounded-2xl -z-10"
            style={{
              background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
              transform: 'perspective(800px) rotateX(5deg)',
            }}
          />

          {/* 染缸网格 */}
          <div className="flex gap-8 p-4">
            {dyeColors.map((color) => (
              <DyeVat
                key={color.name}
                color={color}
                selected={selectedColor.name === color.name}
                onSelect={() => setSelectedColor(color)}
                size="md"
              />
            ))}
          </div>

          {/* 托盘标签 */}
          <div className="text-center mt-8">
            <p className="text-sm font-medium text-amber-900">传统蓝染色谱</p>
            <p className="text-xs text-amber-800 opacity-60">Traditional Indigo Dye Palette</p>
          </div>
        </motion.div>

        {/* 染色计数器 */}
        <motion.div
          className="mt-8 backdrop-blur-md bg-white/70 px-6 py-3 rounded-full shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm">
            已染色 <span className="font-bold text-indigo-600">{dyePoints.length}</span> 次
          </p>
        </motion.div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <motion.p
          className="text-sm text-muted-foreground backdrop-blur-sm bg-white/50 px-4 py-2 rounded-full"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          💡 慢慢创作，感受染料渗透的过程
        </motion.p>
      </div>
    </DyeWorkshopScene>
  )
}

/**
 * 蓝染色谱数据
 */
const dyeColors = [
  {
    name: '月白',
    value: 'hsl(210, 30%, 88%)',
    hsl: [210, 30, 88] as [number, number, number],
    description: '最浅的蓝，如月光般温柔',
  },
  {
    name: '缥色',
    value: 'hsl(210, 50%, 75%)',
    hsl: [210, 50, 75] as [number, number, number],
    description: '淡雅浅蓝，清新如晨雾',
  },
  {
    name: '靛蓝',
    value: 'hsl(210, 70%, 50%)',
    hsl: [210, 70, 50] as [number, number, number],
    description: '标准深蓝，蓝染之魂',
  },
  {
    name: '胜色',
    value: 'hsl(210, 80%, 35%)',
    hsl: [210, 80, 35] as [number, number, number],
    description: '深邃浓蓝，沉稳大气',
  },
]
