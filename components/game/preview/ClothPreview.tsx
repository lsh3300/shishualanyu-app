'use client'

import { useRef, useEffect } from 'react'
import type { ClothLayer } from '@/types/game.types'
import { getPatternById } from '../patterns/PatternLibrary'

interface ClothPreviewProps {
  layers: ClothLayer[]
  width?: number
  height?: number
  className?: string
  showFrame?: boolean
}

/**
 * 作品预览组件 - 只读版本
 * 用于在背包、商店、详情页等地方展示作品
 * 
 * 特点：
 * - 纯展示，无交互
 * - 高性能（使用Canvas一次性渲染）
 * - 支持缓存
 * - 响应式大小
 */
export function ClothPreview({
  layers,
  width = 300,
  height = 300,
  className = '',
  showFrame = false
}: ClothPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas实际分辨率（2x for retina）
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制布料底色（米白色）
    ctx.fillStyle = '#F5F1E8'
    ctx.fillRect(0, 0, width, height)

    // 添加布料纹理感
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
    for (let i = 0; i < width; i += 2) {
      for (let j = 0; j < height; j += 2) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }

    // 渲染每个图层
    layers.forEach((layer) => {
      const patternDef = getPatternById(layer.textureId)
      if (!patternDef) return

      const {
        x: xPercent,
        y: yPercent,
        scale,
        opacity,
        rotation = 0
      } = layer.params

      // 转换百分比坐标到像素坐标
      const x = (xPercent / 100) * width
      const y = (yPercent / 100) * height

      // 计算图案大小（基础80px * scale）
      const patternSize = 80 * scale

      // 根据染色深度计算靛蓝色
      const indigoColor = getIndigoColor(layer.dyeDepth)

      // 保存当前状态
      ctx.save()

      // 移动到图案中心
      ctx.translate(x, y)
      
      // 旋转
      if (rotation) {
        ctx.rotate((rotation * Math.PI) / 180)
      }

      // 设置透明度
      ctx.globalAlpha = opacity

      // 绘制图案（简化版）
      drawPattern(ctx, patternDef.id, patternSize, indigoColor)

      // 恢复状态
      ctx.restore()
    })

    // 如果需要，绘制边框
    if (showFrame) {
      ctx.strokeStyle = '#8B6F47'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, width - 8, height - 8)
    }
  }, [layers, width, height, showFrame])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'high-quality'
      }}
    />
  )
}

/**
 * 根据染色深度获取靛蓝色
 */
function getIndigoColor(depth: number): string {
  // 真实靛蓝色系 - 从浅到深
  const colors = [
    '#C5D5E4', // 极浅靛蓝 0.0-0.2
    '#8FA9C3', // 浅靛蓝 0.2-0.4
    '#5B7FA1', // 中靛蓝 0.4-0.6
    '#3A5A7B', // 深靛蓝 0.6-0.8
    '#1E3A5F'  // 浓靛蓝 0.8-1.0
  ]
  const index = Math.min(Math.floor(depth * 5), 4)
  return colors[index]
}

/**
 * 绘制图案（简化版）
 */
function drawPattern(
  ctx: CanvasRenderingContext2D,
  patternId: string,
  size: number,
  color: string
) {
  const halfSize = size / 2

  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  // 根据不同图案ID绘制不同形状
  switch (patternId) {
    case 'circle':
      // 圆形
      ctx.beginPath()
      ctx.arc(0, 0, halfSize * 0.8, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'square':
      // 方形
      ctx.fillRect(-halfSize * 0.8, -halfSize * 0.8, size * 0.8, size * 0.8)
      break

    case 'triangle':
      // 三角形
      ctx.beginPath()
      ctx.moveTo(0, -halfSize * 0.8)
      ctx.lineTo(halfSize * 0.8, halfSize * 0.8)
      ctx.lineTo(-halfSize * 0.8, halfSize * 0.8)
      ctx.closePath()
      ctx.fill()
      break

    case 'star':
      // 星形
      drawStar(ctx, 0, 0, 5, halfSize * 0.8, halfSize * 0.4)
      ctx.fill()
      break

    case 'hexagon':
      // 六边形
      drawPolygon(ctx, 0, 0, 6, halfSize * 0.8)
      ctx.fill()
      break

    case 'flower':
      // 花朵（多个圆形组成）
      const petalCount = 6
      const petalRadius = halfSize * 0.4
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2
        const px = Math.cos(angle) * halfSize * 0.5
        const py = Math.sin(angle) * halfSize * 0.5
        ctx.beginPath()
        ctx.arc(px, py, petalRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      // 中心圆
      ctx.beginPath()
      ctx.arc(0, 0, halfSize * 0.3, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'wave':
      // 波浪线
      ctx.beginPath()
      ctx.moveTo(-halfSize, 0)
      for (let x = -halfSize; x <= halfSize; x += 10) {
        const y = Math.sin((x / halfSize) * Math.PI * 2) * (halfSize * 0.3)
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      break

    case 'dots':
      // 点状图案
      const dotRadius = halfSize * 0.15
      const dotPositions = [
        [0, 0],
        [-halfSize * 0.5, -halfSize * 0.5],
        [halfSize * 0.5, -halfSize * 0.5],
        [-halfSize * 0.5, halfSize * 0.5],
        [halfSize * 0.5, halfSize * 0.5]
      ]
      dotPositions.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      })
      break

    case 'cross':
      // 十字
      ctx.lineWidth = halfSize * 0.3
      ctx.beginPath()
      ctx.moveTo(0, -halfSize * 0.8)
      ctx.lineTo(0, halfSize * 0.8)
      ctx.moveTo(-halfSize * 0.8, 0)
      ctx.lineTo(halfSize * 0.8, 0)
      ctx.stroke()
      break

    case 'spiral':
      // 螺旋
      ctx.beginPath()
      let angle = 0
      const maxRadius = halfSize * 0.8
      ctx.moveTo(0, 0)
      for (let r = 0; r <= maxRadius; r += 2) {
        angle += 0.3
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      break

    default:
      // 默认圆形
      ctx.beginPath()
      ctx.arc(0, 0, halfSize * 0.8, 0, Math.PI * 2)
      ctx.fill()
  }
}

/**
 * 绘制星形
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
}

/**
 * 绘制多边形
 */
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sides: number,
  radius: number
) {
  const angle = (Math.PI * 2) / sides
  ctx.beginPath()

  for (let i = 0; i < sides; i++) {
    const x = cx + radius * Math.cos(angle * i - Math.PI / 2)
    const y = cy + radius * Math.sin(angle * i - Math.PI / 2)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
}
