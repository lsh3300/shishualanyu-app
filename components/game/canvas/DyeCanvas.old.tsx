'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * 染色画布组件
 * 
 * 设计理念：
 * - 模拟真实的染料扩散过程
 * - 点击产生从点击位置向外扩散的染色效果
 * - 支持多次点击叠加，产生复杂图案
 * - 使用径向渐变模拟染料的浓度变化
 * 
 * 技术实现：
 * - Canvas 2D API
 * - 径向渐变（radialGradient）
 * - 色彩混合模式（globalCompositeOperation）
 * - requestAnimationFrame 动画
 */

interface DyePoint {
  x: number
  y: number
  radius: number
  maxRadius: number
  color: string
  opacity: number
  timestamp: number
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
  dyeColor = 'hsl(210, 70%, 50%)', // 靛蓝色
  onDyeComplete,
}: DyeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dyePoints, setDyePoints] = useState<DyePoint[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const animationFrameRef = useRef<number>()
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [justClicked, setJustClicked] = useState(false)

  /**
   * 处理画布点击 - 添加新的染色点
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
        radius: 0,
        maxRadius: 80 + Math.random() * 40, // 随机最大半径
        color: dyeColor,
        opacity: 0.3 + Math.random() * 0.2, // 随机透明度
        timestamp: Date.now(),
      }

      setDyePoints(prev => [...prev, newPoint])
      setIsAnimating(true)
      
      // 暂时隐藏预览圆
      setJustClicked(true)
      setTimeout(() => setJustClicked(false), 200)
      
      // 播放染色音效
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 200 + Math.random() * 100
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (e) {
        // 静默失败
      }
    },
    [dyeColor]
  )

  /**
   * 绘制单个染色点（径向渐变扩散效果）
   */
  const drawDyePoint = useCallback(
    (ctx: CanvasRenderingContext2D, point: DyePoint) => {
      // 确保radius至少为1，避免渐变失效
      const radius = Math.max(1, point.radius)
      
      // 创建径向渐变（从中心向外，颜色从深到浅）
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
        
        // 中心：深色，高不透明度
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${Math.max(20, parseInt(l) - 20)}%, ${point.opacity})`)
        
        // 中间：标准色
        gradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${point.opacity * 0.7})`)
        
        // 边缘：浅色，渐变透明
        gradient.addColorStop(0.8, `hsla(${h}, ${s}%, ${Math.min(80, parseInt(l) + 20)}%, ${point.opacity * 0.3})`)
        gradient.addColorStop(1, `hsla(${h}, ${s}%, ${Math.min(90, parseInt(l) + 30)}%, 0)`)
      }

      ctx.fillStyle = gradient
      ctx.fillRect(
        point.x - radius,
        point.y - radius,
        radius * 2,
        radius * 2
      )
    },
    []
  )

  /**
   * 动画循环 - 扩散效果
   */
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布（保留背景色）- 使用逻辑像素而非物理像素
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // 设置混合模式为正片叠底（模拟染料叠加）
    ctx.globalCompositeOperation = 'multiply'

    let allComplete = true

    // 更新并绘制所有染色点
    setDyePoints(prev => {
      const updated = prev.map(point => {
        // 计算扩散进度
        const elapsed = Date.now() - point.timestamp
        const duration = 1500 // 扩散动画时长
        const progress = Math.min(elapsed / duration, 1)

        // 使用缓动函数（easeOutQuad）
        const eased = 1 - Math.pow(1 - progress, 3)

        const newRadius = point.maxRadius * eased

        // 绘制当前状态
        drawDyePoint(ctx, { ...point, radius: newRadius })

        if (progress < 1) {
          allComplete = false
        }

        return { ...point, radius: newRadius }
      })

      return updated
    })

    // 恢复混合模式
    ctx.globalCompositeOperation = 'source-over'

    // 继续动画或停止
    if (!allComplete) {
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
    }
  }, [backgroundColor, drawDyePoint, width, height])

  /**
   * 启动动画
   */
  useEffect(() => {
    if (isAnimating) {
      animate()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAnimating, animate])

  /**
   * 当染色点变化时重新绘制（用于撤销等操作）
   */
  useEffect(() => {
    if (dyePoints.length === 0) {
      // 如果清空了所有点，重置画布
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    } else if (!isAnimating) {
      // 如果不在动画中但有点，触发重绘
      setIsAnimating(true)
    }
  }, [dyePoints.length, backgroundColor, width, height, isAnimating])

  /**
   * 初始化画布
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置高DPI支持
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 绘制初始背景
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }, [width, height, backgroundColor])

  /**
   * 清空画布
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    setDyePoints([])
  }, [backgroundColor, width, height])

  /**
   * 撤销上一次染色
   */
  const undoLast = useCallback(() => {
    setDyePoints(prev => prev.slice(0, -1))
  }, [])

  /**
   * 鼠标移动 - 预览效果
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setMousePos({ x, y })
    },
    []
  )

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
   * 键盘快捷键支持
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undoLast()
      }
      // Delete: 清空
      if (e.key === 'Delete') {
        e.preventDefault()
        clearCanvas()
      }
      // Enter: 完成
      if (e.key === 'Enter' && dyePoints.length > 0) {
        e.preventDefault()
        exportImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoLast, clearCanvas, exportImage, dyePoints.length])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setMousePos(null) }}
        className="cursor-crosshair rounded-lg shadow-lg border-2 border-indigo-100 transition-all hover:border-indigo-300"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />

      {/* 鼠标悬停预览 */}
      {isHovering && mousePos && !justClicked && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-indigo-400"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: dyeColor,
            opacity: 0.2,
            transition: 'opacity 0.15s ease-out',
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* 移除提示，用户可以直接开始染色 */}

      {/* 控制按钮 */}
      <div className="mt-4 flex gap-2 justify-center items-center">
        <button
          onClick={undoLast}
          disabled={dyePoints.length === 0}
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
          disabled={dyePoints.length === 0}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✨ 完成染色
        </button>
      </div>

      {/* 统计信息与快捷键提示 */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="text-center flex-1">
          已染色 <strong className="text-indigo-600">{dyePoints.length}</strong> 次
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
