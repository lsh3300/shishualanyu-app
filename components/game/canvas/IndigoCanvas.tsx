'use client'

import { useState, useRef, useCallback, memo, useEffect } from 'react'
import type { ClothLayer } from '@/types/game.types'
import { getPatternById } from '../patterns/PatternLibrary'
import { FabricTexture } from '../textures/FabricTexture'

export interface PlacedPattern {
  id: string
  patternId: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  dyeDepth: number
  visible?: boolean
  locked?: boolean
}

type Tool = 'select' | 'add' | 'delete'

interface IndigoCanvasProps {
  onLayersChange?: (layers: ClothLayer[]) => void
  selectedPatternId?: string | null
  patterns?: PlacedPattern[]  // 受控：从外部接收patterns
  onPatternsChange?: (patterns: PlacedPattern[]) => void
  onSelectPattern?: (id: string | null) => void
  tool?: Tool
  selectedInternalId?: string | null
  onDeletePattern?: (id: string) => void
  width?: number
  height?: number
}

/**
 * 蓝染画布优化版本
 * 
 * 优化要点：
 * 1. 移除Framer Motion，使用原生CSS transitions
 * 2. 使用requestAnimationFrame优化拖动性能
 * 3. 使用React.memo减少重渲染
 * 4. 简化事件处理逻辑
 */
export const IndigoCanvas = memo(function IndigoCanvas({
  onLayersChange,
  selectedPatternId: externalSelectedPatternId,
  patterns: externalPatterns = [],  // 受控：使用外部patterns
  onPatternsChange,
  onSelectPattern,
  tool = 'select',
  selectedInternalId: externalSelectedInternalId,
  onDeletePattern,
  width: propWidth,
  height: propHeight
}: IndigoCanvasProps) {
  // 移除内部patterns state，完全受控
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: propWidth || 600, height: propHeight || 600 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragDataRef = useRef<{ patternId: string; startX: number; startY: number } | null>(null)
  const rafIdRef = useRef<number>(0)

  // 响应式画布尺寸
  useEffect(() => {
    if (propWidth && propHeight) {
      setCanvasSize({ width: propWidth, height: propHeight })
      return
    }

    const updateSize = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const containerWidth = container.clientWidth
      // 画布大小根据容器宽度，最大800px，最小300px，保持正方形
      const size = Math.min(Math.max(containerWidth - 32, 300), 800)
      setCanvasSize({ width: size, height: size })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [propWidth, propHeight])

  // 转换为ClothLayer格式并通知外部
  const updateLayers = useCallback((patternsData: PlacedPattern[]) => {
    if (!onLayersChange) return

    const layers: ClothLayer[] = patternsData.map(p => ({
      userId: 'current-user',
      userName: '玩家',
      textureId: p.patternId,
      params: {
        x: p.x,
        y: p.y,
        scale: p.scale,
        opacity: p.opacity,
        rotation: p.rotation
      },
      dyeDepth: p.dyeDepth,
      timestamp: new Date().toISOString()
    }))

    onLayersChange(layers)
  }, [onLayersChange])

  // 添加图案
  const addPattern = useCallback((patternId: string, x: number, y: number) => {
    const newPattern: PlacedPattern = {
      id: `pattern-${Date.now()}-${Math.random()}`,
      patternId,
      x,
      y,
      scale: 1,
      rotation: 0,
      opacity: 0.7,
      dyeDepth: 0.6
    }

    const newPatterns = [...externalPatterns, newPattern]
    updateLayers(newPatterns)
    onPatternsChange?.(newPatterns)
  }, [externalPatterns, updateLayers, onPatternsChange])

  // 点击画布 - 根据工具模式执行不同操作
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    // 添加模式：添加新图案
    if (tool === 'add' && externalSelectedPatternId) {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      addPattern(externalSelectedPatternId, x, y)
    }
    // 选择模式：取消选中
    else if (tool === 'select') {
      setSelectedId(null)
      onSelectPattern?.(null)
    }
  }, [tool, externalSelectedPatternId, isDragging, addPattern, onSelectPattern])

  // 点击图案 - 根据工具模式执行不同操作
  const handlePatternClick = useCallback((patternId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // 删除模式：直接删除图案
    if (tool === 'delete') {
      if (confirm('确定要删除这个图案吗？')) {
        onDeletePattern?.(patternId)
      }
      return
    }

    // 选择模式：选中图案
    if (tool === 'select') {
      setSelectedId(patternId)
      onSelectPattern?.(patternId)
    }
  }, [tool, onDeletePattern, onSelectPattern])

  // 开始拖动 - 仅在选择模式下
  const handleMouseDown = useCallback((patternId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 只在选择模式下允许拖动
    if (tool !== 'select') return

    setIsDragging(true)
    setSelectedId(patternId)
    onSelectPattern?.(patternId)

    const pattern = externalPatterns.find((p: PlacedPattern) => p.id === patternId)
    if (pattern) {
      dragDataRef.current = {
        patternId,
        startX: pattern.x,
        startY: pattern.y
      }
    }
  }, [tool, externalPatterns, onSelectPattern])

  // 拖动过程 - 使用requestAnimationFrame优化
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragDataRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    // 取消之前的RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    // 使用RAF优化性能
    rafIdRef.current = requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      const clampedX = Math.max(0, Math.min(100, x))
      const clampedY = Math.max(0, Math.min(100, y))

      const newPatterns = externalPatterns.map((p: PlacedPattern) =>
        p.id === dragDataRef.current?.patternId
          ? { ...p, x: clampedX, y: clampedY }
          : p
      )
      onPatternsChange?.(newPatterns)
    })
  }, [isDragging, externalPatterns, onPatternsChange])

  // 结束拖动
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragDataRef.current = null

      // 通知外部更新（已在handleMouseMove中更新）
      updateLayers(externalPatterns)
    }
  }, [isDragging, updateLayers, externalPatterns])

  // 获取染料颜色
  const getColor = useCallback((depth: number) => {
    const colors = [
      '#C5D5E4', // 极浅靛蓝
      '#8FA9C3', // 浅靛蓝
      '#5B7FA1', // 中靛蓝
      '#3A5A7B', // 深靛蓝
      '#1E3A5F'  // 浓靛蓝
    ]
    const index = Math.min(Math.floor(depth * 5), 4)
    return colors[index]
  }, [])

  // 同步外部选中状态
  useEffect(() => {
    if (externalSelectedInternalId !== undefined) {
      setSelectedId(externalSelectedInternalId)
    }
  }, [externalSelectedInternalId])

  // 渲染单个图案 - memo优化
  const PatternItem = memo(({ pattern }: { pattern: PlacedPattern }) => {
    const patternDef = getPatternById(pattern.patternId)
    if (!patternDef) return null

    const PatternComponent = patternDef.component
    const isSelected = selectedId === pattern.id

    // 根据工具模式显示不同的光标
    const getCursor = () => {
      if (tool === 'delete') return 'not-allowed'
      if (tool === 'select') return 'move'
      return 'default'
    }

    // ⭐ 关键修复：添加模式下图案不响应鼠标事件
    const getPointerEvents = () => {
      return tool === 'add' ? 'none' : 'auto'
    }

    return (
      <div
        onClick={(e) => handlePatternClick(pattern.id, e)}
        onMouseDown={(e) => handleMouseDown(pattern.id, e)}
        style={{
          position: 'absolute',
          left: `${pattern.x}%`,
          top: `${pattern.y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: getCursor(),
          pointerEvents: getPointerEvents(),  // ⭐ 添加模式下为none
          mixBlendMode: 'multiply',
          userSelect: 'none',
          transition: isSelected ? 'none' : 'transform 0.2s ease',
        }}
        className={`${isSelected ? 'ring-2 ring-blue-500 rounded-full scale-105 shadow-lg' : tool !== 'add' ? 'hover:scale-105' : ''} ${
          tool === 'delete' ? 'hover:ring-2 hover:ring-red-500' : ''
        }`}
      >
        <PatternComponent
          color={getColor(pattern.dyeDepth)}
          opacity={pattern.opacity}
          scale={pattern.scale}
          rotation={pattern.rotation}
        />
      </div>
    )
  })
  PatternItem.displayName = 'PatternItem'

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-col items-center gap-4">
        {/* 画布容器 */}
        <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative border-4 border-gray-300 rounded-lg shadow-lg overflow-hidden bg-white"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          maxWidth: '100%',
          maxHeight: 'min(72vh, 100vw)',
          cursor: tool === 'add' && externalSelectedPatternId ? 'crosshair' : tool === 'delete' ? 'not-allowed' : 'default'
        }}
      >
        {/* 布料纹理背景 */}
        <FabricTexture />

        {/* 空状态提示 */}
        {externalPatterns.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-6xl mb-4">🎨</div>
            <div className="text-lg font-medium">空白画布</div>
            <div className="mt-2 text-center text-sm leading-6">
              <div>选择图案后点击画布开始创作</div>
              <div className="text-xs text-gray-400">也可以使用“放到画布中央”快速开始</div>
            </div>
          </div>
        )}

        {/* 渲染所有图案 */}
        {externalPatterns.map((pattern: PlacedPattern) => (
          <PatternItem key={pattern.id} pattern={pattern} />
        ))}
      </div>

      {/* 工具提示信息 */}
      {tool === 'add' && externalSelectedPatternId && (
        <div className="max-w-md rounded-lg bg-blue-50 px-4 py-2 text-center text-xs text-gray-600 sm:text-sm">
          <span className="hidden sm:inline">💡 点击画布添加图案</span>
          <span className="sm:hidden">💡 点击添加</span>
        </div>
      )}
      {tool === 'select' && externalPatterns.length > 0 && (
        <div className="max-w-md rounded-lg bg-green-50 px-4 py-2 text-center text-xs text-gray-600 sm:text-sm">
          <span className="hidden sm:inline">🖱️ 点击选中图案，拖动调整位置</span>
          <span className="sm:hidden">🖱️ 点击选中，拖动调整</span>
        </div>
      )}
      {tool === 'delete' && externalPatterns.length > 0 && (
        <div className="max-w-md rounded-lg bg-red-50 px-4 py-2 text-center text-xs text-gray-600 sm:text-sm">
          <span className="hidden sm:inline">🗑️ 点击图案进行删除</span>
          <span className="sm:hidden">🗑️ 点击删除</span>
        </div>
      )}
      </div>
    </div>
  )
})
