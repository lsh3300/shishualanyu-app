'use client'

import { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react'
import { Undo2, Redo2, Trash2, ChevronLeft, ChevronRight, MousePointer2, Plus, Eraser, Save, Loader2, Minus, Maximize2 } from 'lucide-react'
import { toast } from "sonner"
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'
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
  const supabase = useMemo(() => getSupabaseClient(), [])
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)
  const [layers, setLayers] = useState<ClothLayer[]>([])
  const [patterns, setPatterns] = useState<PlacedPattern[]>([])
  const [selectedInternalId, setSelectedInternalId] = useState<string | null>(null)
  const [showPatternSelector, setShowPatternSelector] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [tool, setTool] = useState<Tool>('select')
  
  // 自动保存相关状态
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
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

  // 自动保存逻辑（仅保存到本地）
  const autoSaveWork = useCallback(async () => {
    if (!autoSaveEnabled || patterns.length === 0) return

    try {
      setIsSaving(true)
      
      // 保存到localStorage作为临时备份
      const saveData = {
        clothId,
        patterns,
        layers,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(`workshop-draft-${clothId}`, JSON.stringify(saveData))
      
      // 显示保存成功提示
      setLastSaved(new Date())
      console.log('✅ 本地自动保存成功:', new Date().toLocaleTimeString())
      
      // 注意：不在这里保存到服务器
      // 服务器保存会在"完成作品"评分时自动进行
    } catch (error) {
      console.error('本地保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }, [autoSaveEnabled, patterns, layers, clothId])

  // 定时自动保存
  useEffect(() => {
    // 当patterns变化时，设置定时器自动保存
    if (patterns.length > 0) {
      // 清除之前的定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // 设置3秒后自动保存
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveWork()
      }, 3000)
    }
    
    // 组件卸载时清除定时器
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [patterns, autoSaveWork])

  // 页面关闭前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (patterns.length > 0) {
        // 同步保存到localStorage
        const saveData = {
          clothId,
          patterns,
          layers,
          lastSaved: new Date().toISOString()
        }
        localStorage.setItem(`workshop-draft-${clothId}`, JSON.stringify(saveData))
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [patterns, layers, clothId])

  // 手动保存函数
  const handleManualSave = () => {
    autoSaveWork()
  }

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
  const showCompactHeader = isMobile
  const selectedPlacedPattern = useMemo(
    () => patterns.find((pattern) => pattern.id === selectedInternalId) || null,
    [patterns, selectedInternalId]
  )

  const addPatternToCenter = useCallback(() => {
    if (!selectedPatternId) return

    const newPattern: PlacedPattern = {
      id: `pattern-${Date.now()}-${Math.random()}`,
      patternId: selectedPatternId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 0.7,
      dyeDepth: 0.6
    }

    const nextPatterns = [...patterns, newPattern]
    history.set(nextPatterns)
    setSelectedInternalId(newPattern.id)
    setTool('select')
  }, [history, patterns, selectedPatternId])

  const updateSelectedPlacedPattern = useCallback((updater: (pattern: PlacedPattern) => PlacedPattern) => {
    if (!selectedInternalId) return

    const nextPatterns = patterns.map((pattern) =>
      pattern.id === selectedInternalId ? updater(pattern) : pattern
    )
    history.set(nextPatterns)
  }, [history, patterns, selectedInternalId])

  const adjustSelectedScale = useCallback((delta: number) => {
    updateSelectedPlacedPattern((pattern) => ({
      ...pattern,
      scale: Math.max(0.3, Math.min(2.5, Number((pattern.scale + delta).toFixed(2))))
    }))
  }, [updateSelectedPlacedPattern])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 响应式顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 lg:px-6 sm:py-3">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
            {/* 左侧 */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <Link href="/game/shop">
                <button className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-3 sm:py-2 sm:text-sm">
                  ← <span className="hidden min-[420px]:inline">返回大厅</span>
                </button>
              </Link>
              <h1 className="flex min-w-0 items-center gap-2 text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
                <span className="text-lg sm:text-xl">🎨</span>
                <span className="truncate hidden min-[420px]:inline">蓝染创作工坊</span>
                <span className="min-[420px]:hidden">工坊</span>
              </h1>
            </div>

            {/* 工具栏 */}
            <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
              {/* 工具模式切换 */}
              <div className="mr-1 flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 sm:mr-2 sm:gap-1">
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

              <div className={`${showCompactHeader ? 'order-3 w-full justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2' : 'hidden'} flex items-center text-xs text-gray-600 sm:hidden`}>
                <span>{layerCount} 图层</span>
                <span>{isSaving ? '保存中...' : lastSaved ? '草稿已保存' : '自动保存已开启'}</span>
              </div>

              <div className="hidden items-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 sm:flex">
                {layerCount} 图层
              </div>
              
              {/* 手动保存按钮 */}
              <button
                onClick={handleManualSave}
                disabled={isSaving || layerCount === 0}
                className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="保存"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              
              {/* 自动保存状态 */}
              <div className="hidden items-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 sm:flex">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    保存中...
                  </span>
                ) : lastSaved ? (
                  <span>草稿已保存</span>
                ) : null}
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
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 sm:py-6">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-[320px_1fr]'}`}>
          {/* 图案选择器 - 移动端顶部，桌面端左侧 */}
          <div className="order-1 lg:order-1">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:p-6">
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

            {(selectedPatternId || selectedPlacedPattern) && (
              <div className="rounded-xl border border-blue-100 bg-white/95 p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">快捷操作</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {selectedPlacedPattern
                        ? '已选中画布图案，可以直接缩放大小'
                        : '已选中图案，可以点击画布放置，或直接放到中央'}
                    </div>
                  </div>

                  {!selectedPlacedPattern && selectedPatternId && (
                    <button
                      onClick={addPatternToCenter}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      <Maximize2 className="h-4 w-4" />
                      放到画布中央
                    </button>
                  )}

                  {selectedPlacedPattern && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustSelectedScale(-0.15)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100"
                        title="缩小"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="min-w-[88px] rounded-xl bg-blue-50 px-3 py-2 text-center">
                        <div className="text-[11px] text-blue-500">当前大小</div>
                        <div className="text-sm font-semibold text-blue-700">
                          {Math.round(selectedPlacedPattern.scale * 100)}%
                        </div>
                      </div>
                      <button
                        onClick={() => adjustSelectedScale(0.15)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-600 text-white transition-colors hover:bg-blue-700"
                        title="放大"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
