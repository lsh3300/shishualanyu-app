'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * 高性能染色画布组件 V2
 * 
 * 性能优化核心策略：
 * 1. 使用 useRef 存储动画数据，避免频繁重渲染
 * 2. 动画循环独立于 React 渲染周期
 * 3. 离屏 Canvas 技术实现双缓冲
 * 4. 智能脏区域检测，减少不必要的绘制
 * 5. requestAnimationFrame 时间戳优化
 */

interface DyePoint {
  x: number
  y: number
  maxRadius: number
  color: string
  opacity: number
  startTime: number
  duration: number
}

interface DyeCanvasProps {
  width?: number
  height?: number
  backgroundColor?: string
  dyeColor?: string
  onDyeComplete?: (imageData: string) => void
}

export function DyeCanvas({
  width = 600,
  height = 600,
  backgroundColor = '#f8f8f8',
  dyeColor = 'hsl(210, 70%, 50%)',
  onDyeComplete,
}: DyeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // 使用 ref 存储动画数据，避免重渲染
  const dyePointsRef = useRef<DyePoint[]>([])
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)
  
  // 仅用于UI显示的状态（不影响动画性能）
  const [dyeCount, setDyeCount] = useState(0)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  /**
   * 初始化离屏Canvas（双缓冲技术）
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const offscreen = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    
    offscreen.width = width * dpr
    offscreen.height = height * dpr
    
    const ctx = offscreen.getContext('2d', {
      alpha: true,
      willReadFrequently: false, // 优化性能
    })
    
    if (ctx) {
      ctx.scale(dpr, dpr)
      // 初始化背景
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }
    
    offscreenCanvasRef.current = offscreen
  }, [width, height, backgroundColor])

  /**
   * 初始化主Canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true, // 降低延迟
    })
    
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }
  }, [width, height, backgroundColor])

  /**
   * 绘制单个染色点（优化版）
   */
  const drawDyePoint = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      point: DyePoint,
      currentTime: number
    ): boolean => {
      const elapsed = currentTime - point.startTime
      const progress = Math.min(elapsed / point.duration, 1)
      
      // 使用更平滑的缓动函数
      const eased = 1 - Math.pow(1 - progress, 3)
      const radius = Math.max(1, point.maxRadius * eased)

      // 创建径向渐变
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      )

      // 解析HSL颜色
      const hslMatch = point.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
      if (hslMatch) {
        const [, h, s, l] = hslMatch
        const opacity = point.opacity * (1 - progress * 0.3) // 逐渐变淡
        
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${Math.max(20, parseInt(l) - 20)}%, ${opacity})`)
        gradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${opacity * 0.7})`)
        gradient.addColorStop(0.8, `hsla(${h}, ${s}%, ${Math.min(80, parseInt(l) + 20)}%, ${opacity * 0.3})`)
        gradient.addColorStop(1, `hsla(${h}, ${s}%, ${Math.min(90, parseInt(l) + 30)}%, 0)`)
      }

      ctx.fillStyle = gradient
      ctx.fillRect(
        point.x - radius,
        point.y - radius,
        radius * 2,
        radius * 2
      )

      return progress >= 1 // 返回是否完成
    },
    []
  )

  /**
   * 高性能动画循环
   */
  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    const offscreen = offscreenCanvasRef.current
    if (!canvas || !offscreen) return

    const ctx = canvas.getContext('2d')
    const offCtx = offscreen.getContext('2d')
    if (!ctx || !offCtx) return

    // 帧率控制（可选，限制在60fps）
    const deltaTime = currentTime - lastFrameTimeRef.current
    if (deltaTime < 16) { // ~60fps
      animationFrameRef.current = requestAnimationFrame(animate)
      return
    }
    lastFrameTimeRef.current = currentTime

    const points = dyePointsRef.current
    if (points.length === 0) return

    // 清空离屏Canvas
    offCtx.fillStyle = backgroundColor
    offCtx.fillRect(0, 0, width, height)

    // 设置混合模式
    offCtx.globalCompositeOperation = 'multiply'

    // 绘制所有染色点（保留已完成的点）
    let hasActivePoints = false
    points.forEach(point => {
      const isComplete = drawDyePoint(offCtx, point, currentTime)
      if (!isComplete) hasActivePoints = true
    })

    // 恢复混合模式
    offCtx.globalCompositeOperation = 'source-over'

    // 将离屏Canvas复制到主Canvas（性能关键）
    ctx.drawImage(offscreen, 0, 0, width, height)

    // 继续动画或停止
    if (hasActivePoints) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [backgroundColor, drawDyePoint, width, height])

  /**
   * 处理点击
   */
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // 创建新的染色点
      const newPoint: DyePoint = {
        x,
        y,
        maxRadius: 80 + Math.random() * 40,
        color: dyeColor,
        opacity: 0.35 + Math.random() * 0.15,
        startTime: performance.now(),
        duration: 1500,
      }

      dyePointsRef.current.push(newPoint)
      setDyeCount(prev => prev + 1)

      // 启动动画（如果还没启动）
      if (!animationFrameRef.current) {
        lastFrameTimeRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      // 播放音效
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 200 + Math.random() * 100
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (e) {
        // 静默失败
      }
    },
    [dyeColor, animate]
  )

  /**
   * 鼠标移动
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }, [])

  /**
   * 撤销
   */
  const undoLast = useCallback(() => {
    if (dyePointsRef.current.length === 0) return
    
    dyePointsRef.current.pop()
    setDyeCount(prev => Math.max(0, prev - 1))
    
    // 重新绘制
    const offscreen = offscreenCanvasRef.current
    if (!offscreen) return
    
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return
    
    // 清空并重绘所有点
    offCtx.fillStyle = backgroundColor
    offCtx.fillRect(0, 0, width, height)
    offCtx.globalCompositeOperation = 'multiply'
    
    const currentTime = performance.now()
    dyePointsRef.current.forEach(point => {
      drawDyePoint(offCtx, point, currentTime)
    })
    
    offCtx.globalCompositeOperation = 'source-over'
    
    // 复制到主Canvas
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && offscreen) {
      ctx.drawImage(offscreen, 0, 0, width, height)
    }
  }, [backgroundColor, width, height, drawDyePoint])

  /**
   * 清空画布
   */
  const clearCanvas = useCallback(() => {
    dyePointsRef.current = []
    setDyeCount(0)
    
    const canvas = canvasRef.current
    const offscreen = offscreenCanvasRef.current
    if (!canvas || !offscreen) return

    const ctx = canvas.getContext('2d')
    const offCtx = offscreen.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }
    
    if (offCtx) {
      offCtx.fillStyle = backgroundColor
      offCtx.fillRect(0, 0, width, height)
    }
  }, [backgroundColor, width, height])

  /**
   * 导出图像
   */
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onDyeComplete?.(dataUrl)
    return dataUrl
  }, [onDyeComplete])

  /**
   * 键盘快捷键
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undoLast()
      }
      if (e.key === 'Delete') {
        e.preventDefault()
        clearCanvas()
      }
      if (e.key === 'Enter' && dyeCount > 0) {
        e.preventDefault()
        exportImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoLast, clearCanvas, exportImage, dyeCount])

  /**
   * 清理动画
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          setMousePos(null)
        }}
        className="cursor-crosshair rounded-lg shadow-lg border-2 border-indigo-100 transition-all hover:border-indigo-300"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />

      {/* 鼠标悬停预览 */}
      {isHovering && mousePos && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-indigo-400"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: dyeColor,
            opacity: 0.15,
            transition: 'opacity 0.1s ease-out',
          }}
        />
      )}

      {/* 控制按钮 */}
      <div className="mt-4 flex gap-2 justify-center items-center">
        <button
          onClick={undoLast}
          disabled={dyeCount === 0}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title="撤销上一次染色 (Ctrl+Z)"
        >
          ↩️ 撤销
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          🧹 清空画布
        </button>
        <button
          onClick={exportImage}
          disabled={dyeCount === 0}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✨ 完成染色
        </button>
      </div>

      {/* 统计信息与快捷键提示 */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="text-center flex-1">
          已染色 <strong className="text-indigo-600">{dyeCount}</strong> 次
        </div>
        <div className="text-right space-x-2 opacity-60">
          <span title="撤销">Ctrl+Z</span>
          <span>•</span>
          <span title="清空">Del</span>
          <span>•</span>
          <span title="完成">Enter</span>
        </div>
      </div>
    </div>
  )
}
