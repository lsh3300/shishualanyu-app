'use client'

import { useState, useCallback, useEffect, useMemo, memo } from 'react'
import { Undo2, Redo2, Trash2, ChevronLeft, ChevronRight, MousePointer2, Plus, Eraser } from 'lucide-react'
import Link from 'next/link'
import { IndigoCanvas, type PlacedPattern } from '../canvas/IndigoCanvas'
import { PatternSelector } from '../canvas/PatternSelector'
import { CompleteWorkButton } from './CompleteWorkButton'
import { useHistory } from '@/hooks/useHistory'
import type { ClothLayer } from '@/types/game.types'

interface IndigoWorkshopProps {
  clothId: string
  onComplete?: () => void
}

/**
 * 蓝染工坊响应式版本
 * 
 * 特性：
 * 1. 完全响应式设计，适配所有屏幕
 * 2. 移动端优化布局
 * 3. 性能优化（React.memo, useCallback等）
 * 4. 美化UI设计
 */
type Tool = 'select' | 'add' | 'delete'

export const IndigoWorkshop = memo(function IndigoWorkshop({
  clothId,
  onComplete
}: IndigoWorkshopProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)
  const [layers, setLayers] = useState<ClothLayer[]>([])
  const [patterns, setPatterns] = useState<PlacedPattern[]>([])
  const [selectedInternalId, setSelectedInternalId] = useState<string | null>(null)
  const [showPatternSelector, setShowPatternSelector] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [tool, setTool] = useState<Tool>('select')
  
  // 历史记录管理
  const history = useHistory<PlacedPattern[]>([])

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 同步历史记录的present状态到patterns
  useEffect(() => {
    setPatterns(history.state)
  }, [history.state])

  // 优化：使用useCallback避免函数重新创建
  const handlePatternsChange = useCallback((newPatterns: PlacedPattern[]) => {
    // 只有当patterns真正变化时才更新历史
    if (JSON.stringify(newPatterns) !== JSON.stringify(history.state)) {
      history.set(newPatterns)
    }
  }, [history])

  const handleSelectPattern = useCallback((patternId: string) => {
    setSelectedPatternId(patternId)
    // 选择图案时自动切换到添加模式
    setTool('add')
  }, [])

  const handleLayersChange = useCallback((newLayers: ClothLayer[]) => {
    setLayers(newLayers)
  }, [])

  // 撤销/重做
  const handleUndo = useCallback(() => {
    if (history.canUndo) {
      history.undo()
    }
  }, [history])

  const handleRedo = useCallback(() => {
    if (history.canRedo) {
      history.redo()
    }
  }, [history])

  // 清空画布
  const handleClear = useCallback(() => {
    if (confirm('确定要清空画布吗？此操作不可撤销。')) {
      history.set([])
    }
  }, [history])

  // 删除图案
  const handleDeletePattern = useCallback((id: string) => {
    const newPatterns = patterns.filter(p => p.id !== id)
    history.set(newPatterns)
    if (selectedInternalId === id) {
      setSelectedInternalId(null)
    }
  }, [patterns, history, selectedInternalId])

  // 处理内部图案选中
  const handleSelectInternalPattern = useCallback((id: string | null) => {
    setSelectedInternalId(id)
  }, [])

  // 优化：memoize是否可以撤销/重做
  const canUndo = useMemo(() => history.canUndo, [history.canUndo])
  const canRedo = useMemo(() => history.canRedo, [history.canRedo])
  const layerCount = useMemo(() => patterns.length, [patterns.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 响应式顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* 左侧 */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/game/hub">
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  ← <span className="hidden sm:inline">返回大厅</span>
                </button>
              </Link>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg sm:text-xl">🎨</span>
                <span className="hidden sm:inline">蓝染创作工坊</span>
                <span className="sm:hidden">工坊</span>
              </h1>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 工具模式切换 */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 p-0.5 rounded-lg mr-1 sm:mr-2">
                <button
                  onClick={() => setTool('select')}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    tool === 'select' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="选择工具"
                >
                  <MousePointer2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setTool('add')}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    tool === 'add' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="添加工具"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setTool('delete')}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    tool === 'delete' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="删除工具"
                >
                  <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="hidden sm:flex items-center text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-lg">
                {layerCount} 图层
              </div>
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="撤销"
              >
                <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="重做"
              >
                <Redo2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleClear}
                disabled={layerCount === 0}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="清空"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 - 响应式 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-[320px_1fr]'}`}>
          {/* 图案选择器 - 移动端顶部，桌面端左侧 */}
          <div className="order-1 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">选择图案</h3>
                {isMobile && (
                  <button
                    onClick={() => setShowPatternSelector(!showPatternSelector)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    {showPatternSelector ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {(!isMobile || showPatternSelector) && (
                <PatternSelector
                  selectedPatternId={selectedPatternId}
                  onSelectPattern={handleSelectPattern}
                />
              )}
            </div>
          </div>

          {/* 画布区域 - 移动端中间，桌面端右侧 */}
          <div className="order-2 lg:order-2 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <IndigoCanvas
                patterns={patterns}  // ⭐ 传入patterns使Canvas变为受控组件
                selectedPatternId={selectedPatternId}
                onPatternsChange={handlePatternsChange}
                onLayersChange={handleLayersChange}
                tool={tool}
                selectedInternalId={selectedInternalId}
                onSelectPattern={handleSelectInternalPattern}
                onDeletePattern={handleDeletePattern}
              />
            </div>

            {/* 完成按钮 */}
            <div className="flex justify-center sm:justify-end">
              <CompleteWorkButton
                clothId={clothId}
                layers={layers}
                onComplete={onComplete}
                disabled={layers.length === 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})
