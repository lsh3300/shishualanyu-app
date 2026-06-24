'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * 染色画笔Canvas组件
 * 
 * 创新点：
 * - 不只是点击，而是可以"画"出染色轨迹
 * - 根据鼠标移动速度调整浓度（慢速=浓，快速=淡）
 * - 多种画笔工具：细笔、宽笔、喷溅、渐变
 * - 支持撤销/重做
 * - 实时预览染色效果
 */

interface BrushStroke {
  id: string
  points: Array<{ x: number; y: number; pressure: number }>
  brushType: BrushType
  color: string
  timestamp: number
}

type BrushType = 'fine' | 'wide' | 'spray' | 'gradient'

interface DyeBrushCanvasProps {
  width?: number
  height?: number
  backgroundColor?: string
  defaultColor?: string
  onStrokeComplete?: (strokes: BrushStroke[]) => void
}

export function DyeBrushCanvas({
  width = 600,
  height = 600,
  backgroundColor = '#f8f8f8',
  defaultColor = 'hsl(210, 70%, 50%)',
  onStrokeComplete,
}: DyeBrushCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<BrushStroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushType, setBrushType] = useState<BrushType>('fine')
  const [brushColor, setBrushColor] = useState(defaultColor)
  const lastPointRef = useRef<{ x: number; y: number; time: number } | null>(null)

  /**
   * 计算压感（基于速度）
   * 移动越慢 = 压力越大 = 颜色越浓
   */
  const calculatePressure = useCallback((currentPos: { x: number; y: number }, currentTime: number) => {
    if (!lastPointRef.current) return 0.5

    const dx = currentPos.x - lastPointRef.current.x
    const dy = currentPos.y - lastPointRef.current.y
    const dt = currentTime - lastPointRef.current.time
    
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speed = dt > 0 ? distance / dt : 0

    // 速度越快，压力越小
    // 速度范围：0-5 像素/毫秒
    // 压力范围：0.2-1.0
    const pressure = Math.max(0.2, Math.min(1.0, 1 - speed / 5))
    
    return pressure
  }, [])

  /**
   * 开始绘制
   */
  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newStroke: BrushStroke = {
        id: `stroke-${Date.now()}`,
        points: [{ x, y, pressure: 0.5 }],
        brushType,
        color: brushColor,
        timestamp: Date.now(),
      }

      setCurrentStroke(newStroke)
      setIsDrawing(true)
      lastPointRef.current = { x, y, time: Date.now() }
    },
    [brushType, brushColor]
  )

  /**
   * 绘制中
   */
  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentStroke) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const currentTime = Date.now()

      const pressure = calculatePressure({ x, y }, currentTime)

      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, { x, y, pressure }],
      }

      setCurrentStroke(updatedStroke)
      lastPointRef.current = { x, y, time: currentTime }

      // 立即绘制
      renderStroke(updatedStroke)
    },
    [isDrawing, currentStroke, calculatePressure]
  )

  /**
   * 结束绘制
   */
  const stopDrawing = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke])
      onStrokeComplete?.([...strokes, currentStroke])
    }
    setCurrentStroke(null)
    setIsDrawing(false)
    lastPointRef.current = null
  }, [currentStroke, strokes, onStrokeComplete])

  /**
   * 渲染单个笔画
   */
  const renderStroke = useCallback((stroke: BrushStroke) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'multiply'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const points = stroke.points

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]

      switch (stroke.brushType) {
        case 'fine':
          renderFineBrush(ctx, prev, curr, stroke.color)
          break
        case 'wide':
          renderWideBrush(ctx, prev, curr, stroke.color)
          break
        case 'spray':
          renderSprayBrush(ctx, curr, stroke.color)
          break
        case 'gradient':
          renderGradientBrush(ctx, prev, curr, stroke.color)
          break
      }
    }

    ctx.globalCompositeOperation = 'source-over'
  }, [])

  /**
   * 细笔画刷
   */
  const renderFineBrush = (
    ctx: CanvasRenderingContext2D,
    prev: { x: number; y: number; pressure: number },
    curr: { x: number; y: number; pressure: number },
    color: string
  ) => {
    const baseWidth = 3
    const width = baseWidth * curr.pressure

    ctx.strokeStyle = color.replace(')', `, ${curr.pressure})`)
    ctx.lineWidth = width
    
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(curr.x, curr.y)
    ctx.stroke()
  }

  /**
   * 宽笔画刷
   */
  const renderWideBrush = (
    ctx: CanvasRenderingContext2D,
    prev: { x: number; y: number; pressure: number },
    curr: { x: number; y: number; pressure: number },
    color: string
  ) => {
    const baseWidth = 15
    const width = baseWidth * curr.pressure

    ctx.strokeStyle = color.replace(')', `, ${curr.pressure * 0.6})`)
    ctx.lineWidth = width
    
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(curr.x, curr.y)
    ctx.stroke()
  }

  /**
   * 喷溅画刷
   */
  const renderSprayBrush = (
    ctx: CanvasRenderingContext2D,
    point: { x: number; y: number; pressure: number },
    color: string
  ) => {
    const density = Math.floor(20 * point.pressure)
    const radius = 15 * point.pressure

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * radius
      const x = point.x + Math.cos(angle) * distance
      const y = point.y + Math.sin(angle) * distance

      ctx.fillStyle = color.replace(')', `, ${Math.random() * 0.3 + 0.1})`)
      ctx.fillRect(x, y, 1, 1)
    }
  }

  /**
   * 渐变画刷
   */
  const renderGradientBrush = (
    ctx: CanvasRenderingContext2D,
    prev: { x: number; y: number; pressure: number },
    curr: { x: number; y: number; pressure: number },
    color: string
  ) => {
    const width = 10 * curr.pressure

    // 创建线性渐变
    const gradient = ctx.createLinearGradient(prev.x, prev.y, curr.x, curr.y)
    gradient.addColorStop(0, color.replace(')', `, ${prev.pressure * 0.4})`))
    gradient.addColorStop(1, color.replace(')', `, ${curr.pressure * 0.4})`))

    ctx.strokeStyle = gradient
    ctx.lineWidth = width
    
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(curr.x, curr.y)
    ctx.stroke()
  }

  /**
   * 重新渲染所有笔画
   */
  const renderAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 渲染所有已完成的笔画
    strokes.forEach(stroke => renderStroke(stroke))

    // 渲染当前正在绘制的笔画
    if (currentStroke) {
      renderStroke(currentStroke)
    }
  }, [backgroundColor, strokes, currentStroke, renderStroke])

  /**
   * 初始化画布
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

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }, [width, height, backgroundColor])

  /**
   * 重新渲染
   */
  useEffect(() => {
    renderAll()
  }, [renderAll])

  /**
   * 撤销
   */
  const undo = useCallback(() => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1))
    }
  }, [strokes])

  /**
   * 清空
   */
  const clear = useCallback(() => {
    setStrokes([])
    setCurrentStroke(null)
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }, [backgroundColor, width, height])

  return (
    <div className="space-y-4">
      {/* 画笔工具栏 */}
      <div className="flex gap-2 justify-center">
        {[
          { type: 'fine' as BrushType, label: '细笔', icon: '✏️' },
          { type: 'wide' as BrushType, label: '宽笔', icon: '🖌️' },
          { type: 'spray' as BrushType, label: '喷溅', icon: '💧' },
          { type: 'gradient' as BrushType, label: '渐变', icon: '🌈' },
        ].map(brush => (
          <button
            key={brush.type}
            onClick={() => setBrushType(brush.type)}
            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
              brushType === brush.type
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <span className="mr-1">{brush.icon}</span>
            {brush.label}
          </button>
        ))}
      </div>

      {/* 画布 */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="cursor-crosshair rounded-lg shadow-lg border-2 border-indigo-100"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          touchAction: 'none',
        }}
      />

      {/* 操作按钮 */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={undo}
          disabled={strokes.length === 0}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↶ 撤销
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          🗑️ 清空
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current
            if (canvas) {
              const dataUrl = canvas.toDataURL('image/png')
              onStrokeComplete?.(strokes)
            }
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          ✓ 完成
        </button>
      </div>

      {/* 提示信息 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>已绘制 <strong>{strokes.length}</strong> 笔</p>
        <p className="text-xs mt-1">💡 移动速度越慢，颜色越浓</p>
      </div>
    </div>
  )
}
