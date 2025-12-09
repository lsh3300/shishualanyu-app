'use client'

import { useState, useCallback, useEffect } from 'react'
import { Undo2, Redo2, Trash2, Save, Menu, ChevronLeft, ChevronRight, PanelLeft, PanelRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { IndigoCanvas, PlacedPattern } from '../canvas/IndigoCanvas'
import { PatternSelector } from '../canvas/PatternSelector'
import { LayerPanel } from '../canvas/LayerPanel'
import { PropertyPanel } from '../canvas/PropertyPanel'
import { CompleteWorkButton } from './CompleteWorkButton'
import { MobileActionButtons } from '../mobile/MobileActionButtons'
import { useHistory } from '@/hooks/useHistory'
import type { ClothLayer } from '@/types/game.types'

interface IndigoWorkshopProps {
  clothId: string
  onComplete?: () => void
}

/**
 * 蓝染工坊完整组件
 * 集成画布、图案选择器、图层管理和撤销/重做功能
 */
export function IndigoWorkshop({
  clothId,
  onComplete
}: IndigoWorkshopProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)
  const [layers, setLayers] = useState<ClothLayer[]>([])
  const [patterns, setPatterns] = useState<PlacedPattern[]>([])
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  
  // 侧边栏折叠状态
  const [showLayerPanel, setShowLayerPanel] = useState(true)
  const [showPropertyPanel, setShowPropertyPanel] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  
  // 历史记录管理
  const history = useHistory<PlacedPattern[]>([])

  // 当patterns从Canvas更新时，保存到历史（防抖）
  const handlePatternsChange = useCallback((newPatterns: PlacedPattern[]) => {
    setPatterns(newPatterns)
  }, [])

  // 防抖保存历史
  useEffect(() => {
    const timer = setTimeout(() => {
      if (patterns.length > 0 && JSON.stringify(patterns) !== JSON.stringify(history.state)) {
        history.set(patterns)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [patterns])

  const handleSelectPattern = (patternId: string) => {
    setSelectedPatternId(patternId)
  }

  const handleLayersChange = (newLayers: ClothLayer[]) => {
    setLayers(newLayers)
  }

  const handleSelectInternalPattern = (id: string | null) => {
    setInternalSelectedId(id)
  }

  // 撤销
  const handleUndo = () => {
    history.undo()
  }

  // 重做
  const handleRedo = () => {
    history.redo()
  }

  // 清空画布
  const handleClear = () => {
    if (confirm('确定要清空画布吗？此操作不可撤销。')) {
      history.set([])
      setInternalSelectedId(null)
    }
  }

  // 获取选中的图案
  const selectedPattern = patterns.find(p => p.id === internalSelectedId) || null

  // 更新图案属性
  const handleUpdatePattern = (id: string, updates: Partial<PlacedPattern>) => {
    const newPatterns = patterns.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    setPatterns(newPatterns)
    history.set(newPatterns)
  }

  // 删除图案
  const handleRemovePattern = (id: string) => {
    const newPatterns = patterns.filter(p => p.id !== id)
    setPatterns(newPatterns)
    history.set(newPatterns)
    if (internalSelectedId === id) {
      setInternalSelectedId(null)
    }
  }

  // 复制图案
  const handleDuplicatePattern = (id: string) => {
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
    history.set(newPatterns)
    setInternalSelectedId(newPattern.id)
  }

  // 移动图层
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = patterns.findIndex(p => p.id === id)
    if (index === -1) return

    const newPatterns = [...patterns]
    if (direction === 'up' && index < patterns.length - 1) {
      [newPatterns[index], newPatterns[index + 1]] = [newPatterns[index + 1], newPatterns[index]]
    } else if (direction === 'down' && index > 0) {
      [newPatterns[index], newPatterns[index - 1]] = [newPatterns[index - 1], newPatterns[index]]
    }

    setPatterns(newPatterns)
    history.set(newPatterns)
  }

  // 检测屏幕尺寸和计算画布大小
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const mobile = width < 768
      setIsMobileView(mobile)
      
      // 计算画布大小（响应式）
      let canvasWidth: number
      if (width < 640) {
        // 手机端：全宽 - padding
        canvasWidth = Math.min(width - 32, 500)
      } else if (width < 1024) {
        // 平板端
        canvasWidth = Math.min(width * 0.6, 600)
      } else {
        // 桌面端
        canvasWidth = 600
      }
      
      setCanvasSize({ width: canvasWidth, height: canvasWidth })
      
      // 在移动端自动折叠侧边栏
      if (mobile) {
        setShowLayerPanel(false)
        setShowPropertyPanel(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 加载示例作品
  useEffect(() => {
    const loadSampleArtwork = () => {
      const sampleData = localStorage.getItem('selectedSample')
      if (sampleData) {
        try {
          const sample = JSON.parse(sampleData)
          // 将示例作品的图案转换为PlacedPattern格式
          const loadedPatterns: PlacedPattern[] = sample.patterns.map((p: any, index: number) => ({
            id: `pattern-${Date.now()}-${index}`,
            patternId: p.patternId,
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotation: p.rotation,
            opacity: p.opacity,
            dyeDepth: p.dyeDepth,
            visible: true,
            locked: false
          }))
          
          setPatterns(loadedPatterns)
          history.set(loadedPatterns)
          
          // 清除localStorage中的示例数据
          localStorage.removeItem('selectedSample')
        } catch (error) {
          console.error('加载示例作品失败:', error)
        }
      }
    }

    loadSampleArtwork()
  }, [])

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (history.canUndo) handleUndo()
      }
      // Ctrl/Cmd + Shift + Z: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (history.canRedo) handleRedo()
      }
      // Delete: 删除选中图层
      if (e.key === 'Delete' && internalSelectedId) {
        e.preventDefault()
        handleRemovePattern(internalSelectedId)
      }
      // Ctrl/Cmd + D: 复制选中图层
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && internalSelectedId) {
        e.preventDefault()
        handleDuplicatePattern(internalSelectedId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, internalSelectedId])

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 标题和工具栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-1 md:mb-2 truncate">
            🎨 蓝染创作工坊
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
              选择图案，点击画布放置，使用面板精细调整
            </p>
            {patterns.length === 0 && (
              <Link 
                href="/game/samples"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                查看示例作品
              </Link>
            )}
          </div>
        </div>
        
        {/* 工具栏 */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* 侧边栏折叠按钮 - 中等屏幕以上显示 */}
          {!isMobileView && (
            <>
              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${showLayerPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="图层管理"
                aria-label="切换图层管理面板"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPropertyPanel(!showPropertyPanel)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${showPropertyPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="属性面板"
                aria-label="切换属性面板"
              >
                <PanelRight className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-0.5 md:mx-1 flex-shrink-0"></div>
            </>
          )}

          <button
            onClick={handleUndo}
            disabled={!history.canUndo}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!history.canRedo}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            onClick={handleClear}
            disabled={patterns.length === 0}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="清空画布"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="text-xs text-gray-500 ml-1 md:ml-2 whitespace-nowrap">
            {patterns.length} 图层
          </div>
        </div>
      </div>

      {/* 主工作区 - 使用flex布局更灵活 */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6 items-start">
        {/* 左侧：图层管理 */}
        {showLayerPanel && (
          <div className="
            w-full md:w-64 lg:w-72 xl:w-80
            flex-shrink-0
            max-h-[500px] md:max-h-[calc(100vh-350px)] lg:max-h-[calc(100vh-250px)]
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
          ">
            <LayerPanel
              patterns={patterns}
              selectedPatternId={internalSelectedId}
              onSelectPattern={setInternalSelectedId}
              onUpdatePattern={handleUpdatePattern}
              onRemovePattern={handleRemovePattern}
              onDuplicatePattern={handleDuplicatePattern}
              onMoveLayer={handleMoveLayer}
            />
          </div>
        )}

        {/* 中间：画布 - 响应式大小 */}
        <div className="flex-1 flex justify-center items-start min-w-0">
          <div className="w-full max-w-[600px]">
            <IndigoCanvas
              onLayersChange={handleLayersChange}
              selectedPatternId={selectedPatternId}
              onPatternsChange={handlePatternsChange}
              onSelectPattern={handleSelectInternalPattern}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </div>
        </div>

        {/* 右侧：属性编辑 + 操作 */}
        {showPropertyPanel && (
          <div className="
            w-full md:w-64 lg:w-72 xl:w-80
            flex-shrink-0
            max-h-[500px] md:max-h-[calc(100vh-350px)] lg:max-h-[calc(100vh-250px)]
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
            space-y-3
          ">

          {/* 属性编辑面板 */}
          <PropertyPanel
            pattern={selectedPattern}
            onUpdate={(updates) => {
              if (internalSelectedId) {
                handleUpdatePattern(internalSelectedId, updates)
              }
            }}
          />

          {/* 创作信息 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 创作统计</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>图层数量</span>
                <span className="font-semibold text-blue-600">{patterns.length}</span>
              </div>
              <div className="flex justify-between">
                <span>使用图案</span>
                <span className="font-semibold text-blue-600">
                  {new Set(patterns.map(p => p.patternId)).size} 种
                </span>
              </div>
              <div className="flex justify-between">
                <span>历史记录</span>
                <span className="font-semibold text-blue-600">{history.historySize}</span>
              </div>
            </div>
          </div>

          {/* 快捷键提示 */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">⌨️ 快捷键</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Z</kbd> 撤销</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Shift+Z</kbd> 重做</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+D</kbd> 复制图层</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Delete</kbd> 删除图层</li>
            </ul>
          </div>

            {/* 完成按钮 */}
            <CompleteWorkButton
              clothId={clothId}
              layers={layers}
              onComplete={onComplete}
              disabled={patterns.length === 0}
            />
          </div>
        )}
      </div>

      {/* 底部：图案选择器 */}
      <div>
        <PatternSelector
          onSelectPattern={handleSelectPattern}
          selectedPatternId={selectedPatternId}
        />
      </div>

      {/* 移动端浮动操作按钮 */}
      <MobileActionButtons
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        hasSelection={!!internalSelectedId}
        onDelete={() => internalSelectedId && handleRemovePattern(internalSelectedId)}
        onDuplicate={() => internalSelectedId && handleDuplicatePattern(internalSelectedId)}
        onClear={handleClear}
        onToggleLayerPanel={() => {
          setShowLayerPanel(!showLayerPanel)
          if (!showLayerPanel) setShowPropertyPanel(false) // 打开一个关闭另一个
        }}
        onTogglePropertyPanel={() => {
          setShowPropertyPanel(!showPropertyPanel)
          if (!showPropertyPanel) setShowLayerPanel(false) // 打开一个关闭另一个
        }}
      />
    </div>
  )
}
