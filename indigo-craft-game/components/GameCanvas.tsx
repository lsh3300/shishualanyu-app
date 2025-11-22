"use client"

import { useRef, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface GameCanvasProps {
  width?: number
  height?: number
  fabricType: 'cotton' | 'linen' | 'silk'
  currentTool: string | null
  onAction?: (action: any) => void
}

export function GameCanvas({
  width = 400,
  height = 400,
  fabricType,
  currentTool,
  onAction
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tiePoints, setTiePoints] = useState<{ x: number; y: number }[]>([])
  const [foldLines, setFoldLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([])

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布背景（白色布料）
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // 绘制布料纹理
    drawFabricTexture(ctx, width, height, fabricType)

    // 绘制已有的捆扎点
    tiePoints.forEach(point => {
      drawTiePoint(ctx, point.x, point.y)
    })

    // 绘制折叠线
    foldLines.forEach(line => {
      drawFoldLine(ctx, line.x1, line.y1, line.x2, line.y2)
    })
  }, [width, height, fabricType, tiePoints, foldLines])

  // 绘制布料纹理
  const drawFabricTexture = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    type: string
  ) => {
    ctx.save()
    
    // 根据布料类型绘制不同纹理
    if (type === 'cotton') {
      // 棉布：细密的交织纹理
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < w; i += 4) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, h)
        ctx.stroke()
      }
      for (let j = 0; j < h; j += 4) {
        ctx.beginPath()
        ctx.moveTo(0, j)
        ctx.lineTo(w, j)
        ctx.stroke()
      }
    } else if (type === 'linen') {
      // 麻布：粗糙的纹理
      ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)'
      ctx.lineWidth = 1
      for (let i = 0; i < w; i += 6) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, h)
        ctx.stroke()
      }
    } else if (type === 'silk') {
      // 丝绸：光滑的质感
      const gradient = ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      gradient.addColorStop(0.5, 'rgba(240, 240, 240, 0.95)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }
    
    ctx.restore()
  }

  // 绘制捆扎点
  const drawTiePoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    
    // 外圈（橡皮筋效果）
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 内圈（捆扎中心）
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)'
    ctx.fill()
    
    // 中心点
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#654321'
    ctx.fill()
    
    ctx.restore()
  }

  // 绘制折叠线
  const drawFoldLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.restore()
  }

  // 鼠标/触摸事件处理
  const getCanvasPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool) return
    
    const pos = getCanvasPosition(e)
    setIsDrawing(true)

    if (currentTool === 'rubber-band') {
      // 添加捆扎点
      setTiePoints(prev => [...prev, pos])
      onAction?.({
        type: 'tie',
        timestamp: Date.now(),
        data: { point: pos },
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentTool) return
    
    const pos = getCanvasPosition(e)

    if (currentTool === 'fold-spiral') {
      // 螺旋折叠预览
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      // 绘制螺旋引导线
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      drawFabricTexture(ctx, width, height, fabricType)
      
      // 绘制从中心到鼠标的螺旋
      const centerX = width / 2
      const centerY = height / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      
      const angle = Math.atan2(pos.y - centerY, pos.x - centerX)
      const radius = Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2)
      
      for (let i = 0; i <= radius; i += 5) {
        const spiralAngle = angle + (i / radius) * Math.PI * 4
        const x = centerX + Math.cos(spiralAngle) * i
        const y = centerY + Math.sin(spiralAngle) * i
        ctx.lineTo(x, y)
      }
      
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="relative">
          {/* 工具提示 */}
          {currentTool && (
            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full z-10">
              {currentTool === 'rubber-band' && '点击添加捆扎点'}
              {currentTool === 'fold-spiral' && '从中心拖动创建螺旋'}
              {currentTool === 'dye-blue' && '点击浸染区域'}
            </div>
          )}

          {/* Canvas 画布 */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border border-gray-300 rounded-lg cursor-crosshair mx-auto block shadow-sm"
            style={{
              maxWidth: '100%',
              height: 'auto',
              touchAction: 'none',
            }}
          />

          {/* 操作统计 */}
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>捆扎点: {tiePoints.length}</span>
            <span>折叠线: {foldLines.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
