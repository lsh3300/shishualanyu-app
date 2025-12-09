'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, Reorder } from 'framer-motion'
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

interface IndigoCanvasProps {
  onLayersChange?: (layers: ClothLayer[]) => void
  selectedPatternId?: string | null
  onPatternsChange?: (patterns: PlacedPattern[]) => void
  onSelectPattern?: (id: string | null) => void
  width?: number
  height?: number
}

/**
 * 蓝染创作画布
 * 支持拖放、调整图案
 */
export function IndigoCanvas({
  onLayersChange,
  selectedPatternId: externalSelectedPatternId,
  onPatternsChange,
  onSelectPattern,
  width = 600,
  height = 600
}: IndigoCanvasProps) {
  const [patterns, setPatterns] = useState<PlacedPattern[]>([])
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggingPatternId, setDraggingPatternId] = useState<string | null>(null)
  const [tool, setTool] = useState<'add' | 'select'>('select') // 工具模式
  const canvasRef = useRef<HTMLDivElement>(null)

  // 同步内部状态到外部（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onPatternsChange) {
        onPatternsChange(patterns)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [patterns, onPatternsChange])

  useEffect(() => {
    if (onSelectPattern) {
      onSelectPattern(selectedPatternId)
    }
  }, [selectedPatternId, onSelectPattern])

  // 添加图案到画布
  const addPattern = (patternId: string, x: number, y: number) => {
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

    const newPatterns = [...patterns, newPattern]
    setPatterns(newPatterns)
    
    // 通知外部
    updateLayers(newPatterns)
  }

  // 更新图案属性
  const updatePattern = (id: string, updates: Partial<PlacedPattern>) => {
    const newPatterns = patterns.map(p =>
      p.id === id ? { ...p, ...updates } : p
    )
    setPatterns(newPatterns)
    updateLayers(newPatterns)
  }

  // 删除图案
  const removePattern = (id: string) => {
    const newPatterns = patterns.filter(p => p.id !== id)
    setPatterns(newPatterns)
    updateLayers(newPatterns)
    if (selectedPatternId === id) {
      setSelectedPatternId(null)
    }
  }

  // 复制图案
  const duplicatePattern = (id: string) => {
    const pattern = patterns.find(p => p.id === id)
    if (!pattern) return

    const newPattern: PlacedPattern = {
      ...pattern,
      id: `pattern-${Date.now()}-${Math.random()}`,
      x: Math.min(pattern.x + 5, 95),
      y: Math.min(pattern.y + 5, 95)
    }

    const newPatterns = [...patterns, newPattern]
    setPatterns(newPatterns)
    updateLayers(newPatterns)
    setSelectedPatternId(newPattern.id)
  }

  // 移动图层顺序
  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = patterns.findIndex(p => p.id === id)
    if (index === -1) return

    const newPatterns = [...patterns]
    if (direction === 'up' && index < patterns.length - 1) {
      [newPatterns[index], newPatterns[index + 1]] = [newPatterns[index + 1], newPatterns[index]]
    } else if (direction === 'down' && index > 0) {
      [newPatterns[index], newPatterns[index - 1]] = [newPatterns[index - 1], newPatterns[index]]
    }

    setPatterns(newPatterns)
    updateLayers(newPatterns)
  }

  // 转换为ClothLayer格式
  const updateLayers = (patternsData: PlacedPattern[]) => {
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
  }

  // 处理画布点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果刚完成拖动，不处理点击（防止取消选中）
    if (isDragging || draggingPatternId) return
    
    // 只有在添加模式且选择了图案时才添加
    if (tool === 'add' && externalSelectedPatternId) {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      
      // 排除边框影响
      const borderLeft = canvas.clientLeft || 0
      const borderTop = canvas.clientTop || 0
      
      // 计算鼠标相对于内容区域的位置（像素）
      const mouseX = e.clientX - rect.left - borderLeft
      const mouseY = e.clientY - rect.top - borderTop
      
      // 内容区域的实际宽高（像素）
      const contentWidth = canvas.clientWidth
      const contentHeight = canvas.clientHeight
      
      // 计算百分比（0-100）
      const x = (mouseX / contentWidth) * 100
      const y = (mouseY / contentHeight) * 100
      
      // 坐标计算完成

      // 添加选中的图案到点击位置
      addPattern(externalSelectedPatternId, x, y)
    }
    // 选择模式下点击画布空白处才取消选中
    // 但如果点击的是图案，会在 handleMouseDown 中处理选中
  }

  // 根据染色深度计算真实靛蓝色
  // 参考真实蓝染作品的颜色层次
  const getColor = (depth: number) => {
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

  // 处理鼠标按下开始拖动
  const handleMouseDown = (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDraggingPatternId(patternId)
    setSelectedPatternId(patternId)
    
    // 通知外部组件选中状态变化
    if (onSelectPattern) {
      onSelectPattern(patternId)
    }
  }

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggingPatternId) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    
    // 关键修复：排除边框的影响
    const borderLeft = canvas.clientLeft
    const borderTop = canvas.clientTop
    
    // 计算鼠标相对于内容区域的位置
    const mouseX = e.clientX - rect.left - borderLeft
    const mouseY = e.clientY - rect.top - borderTop
    
    // 内容区域的实际宽高
    const contentWidth = canvas.clientWidth
    const contentHeight = canvas.clientHeight
    
    // 计算百分比
    const newX = (mouseX / contentWidth) * 100
    const newY = (mouseY / contentHeight) * 100
    
    // 限制在画布内
    const clampedX = Math.max(0, Math.min(100, newX))
    const clampedY = Math.max(0, Math.min(100, newY))
    
    // 更新图案位置
    setPatterns(prev => prev.map(p =>
      p.id === draggingPatternId 
        ? { ...p, x: clampedX, y: clampedY }
        : p
    ))
  }

  // 处理鼠标释放
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // 通知外部更新（使用当前 state）
      setPatterns(prev => {
        updateLayers(prev)
        return prev
      })
      
      // 延迟清空 draggingPatternId，避免立即触发 click 导致取消选中
      setTimeout(() => {
        setDraggingPatternId(null)
      }, 100)
    }
  }

  // 渲染单个图案
  const renderPattern = (pattern: PlacedPattern) => {
    const patternDef = getPatternById(pattern.patternId)
    if (!patternDef) return null

    const PatternComponent = patternDef.component

    return (
      <motion.div
        key={pattern.id}
        onMouseDown={(e) => handleMouseDown(pattern.id, e)}
        style={{
          position: 'absolute',
          left: `${pattern.x}%`,
          top: `${pattern.y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: 'move',
          pointerEvents: 'auto',
          mixBlendMode: 'multiply',
          userSelect: 'none'
        }}
        className={`
          ${selectedPatternId === pattern.id ? 'ring-2 ring-blue-500 rounded-full' : ''}
        `}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <PatternComponent
          color={getColor(pattern.dyeDepth)}
          opacity={pattern.opacity}
          scale={pattern.scale}
          rotation={pattern.rotation}
        />
      </motion.div>
    )
  }

  // 当选择图案时自动切换到添加模式
  useEffect(() => {
    if (externalSelectedPatternId) {
      setTool('add')
    }
  }, [externalSelectedPatternId])

  return (
    <div className="relative">
      {/* 工具栏 */}
      <div className="absolute -left-20 top-0 flex flex-col gap-2 z-20">
        <button
          onClick={() => setTool('select')}
          className={`
            w-16 h-16 rounded-lg flex flex-col items-center justify-center gap-1 transition-all
            ${tool === 'select' 
              ? 'bg-blue-600 text-white shadow-lg scale-105' 
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
            }
          `}
          title="选择工具 (V)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="text-xs font-medium">选择</span>
        </button>
        
        <button
          onClick={() => setTool('add')}
          className={`
            w-16 h-16 rounded-lg flex flex-col items-center justify-center gap-1 transition-all
            ${tool === 'add' 
              ? 'bg-green-600 text-white shadow-lg scale-105' 
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
            }
          `}
          title="添加工具 (A)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xs font-medium">添加</span>
        </button>
      </div>

      {/* 画布 */}
      <div
        ref={canvasRef}
        className={`
          relative rounded-2xl shadow-lg overflow-hidden border-4 border-gray-200 transition-all
          ${tool === 'add' ? 'cursor-crosshair' : 'cursor-default'}
        `}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          // 布料纹理背景
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 125, 107, 0.03) 2px,
              rgba(139, 125, 107, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 125, 107, 0.03) 2px,
              rgba(139, 125, 107, 0.03) 4px
            ),
            radial-gradient(
              circle at 20% 30%,
              #faf8f5 0%,
              #f5f3f0 50%,
              #f0ede8 100%
            )
          `,
          backgroundBlendMode: 'multiply',
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.06),
            inset 0 0 20px rgba(139, 125, 107, 0.1),
            0 4px 12px rgba(0,0,0,0.1)
          `
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG布料纹理滤镜 */}
        <FabricTexture id="canvas-fabric" opacity={0.2} />
        
        {/* 图案层 */}
        {patterns.map(renderPattern)}

        {/* 空画布提示 */}
        {patterns.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">🎨 空白画布</p>
              <p className="text-sm">从下方选择图案开始创作</p>
            </div>
          </div>
        )}
      </div>

      {/* 选中图案的控制面板 */}
      {selectedPatternId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -right-48 top-0 w-40 bg-white rounded-lg shadow-lg p-4 space-y-3"
        >
          <div>
            <label className="text-xs text-gray-600">不透明度</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={patterns.find(p => p.id === selectedPatternId)?.opacity || 0.7}
              onChange={(e) => updatePattern(selectedPatternId, { 
                opacity: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">染色深度</label>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={patterns.find(p => p.id === selectedPatternId)?.dyeDepth || 0.6}
              onChange={(e) => updatePattern(selectedPatternId, { 
                dyeDepth: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">缩放</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={patterns.find(p => p.id === selectedPatternId)?.scale || 1}
              onChange={(e) => updatePattern(selectedPatternId, { 
                scale: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">旋转</label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={patterns.find(p => p.id === selectedPatternId)?.rotation || 0}
              onChange={(e) => updatePattern(selectedPatternId, { 
                rotation: parseInt(e.target.value) 
              })}
              className="w-full"
            />
          </div>

          <button
            onClick={() => {
              removePattern(selectedPatternId)
              setSelectedPatternId(null)
            }}
            className="w-full px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
          >
            删除
          </button>
        </motion.div>
      )}

      {/* 用于外部调用的方法 */}
      <div className="hidden" data-canvas-api>
        {JSON.stringify({ addPattern })}
      </div>
    </div>
  )
}
