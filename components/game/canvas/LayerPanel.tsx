'use client'

import { Eye, EyeOff, Trash2, Copy, MoveUp, MoveDown, Lock, Unlock } from 'lucide-react'
import { getPatternById } from '../patterns/PatternLibrary'

interface PlacedPattern {
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

interface LayerPanelProps {
  patterns: PlacedPattern[]
  selectedPatternId: string | null
  onSelectPattern: (id: string) => void
  onUpdatePattern: (id: string, updates: Partial<PlacedPattern>) => void
  onRemovePattern: (id: string) => void
  onDuplicatePattern: (id: string) => void
  onMoveLayer: (id: string, direction: 'up' | 'down') => void
}

export function LayerPanel({
  patterns,
  selectedPatternId,
  onSelectPattern,
  onUpdatePattern,
  onRemovePattern,
  onDuplicatePattern,
  onMoveLayer
}: LayerPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">🎨 图层管理</h3>
        <span className="text-xs text-gray-500 whitespace-nowrap">{patterns.length} 个</span>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">暂无图层</p>
          <p className="text-xs mt-1">选择图案开始创作</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {[...patterns].reverse().map((pattern, index) => {
            const patternDef = getPatternById(pattern.patternId)
            const isSelected = pattern.id === selectedPatternId
            const actualIndex = patterns.length - 1 - index

            return (
              <div
                key={pattern.id}
                onClick={() => onSelectPattern(pattern.id)}
                className={`
                  group relative p-2 md:p-3 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                {/* 主要信息 */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* 图案图标 */}
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-base md:text-xl">
                    {patternDef?.icon || '🎨'}
                  </div>

                  {/* 图层信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="font-medium text-xs md:text-sm text-gray-900 truncate">
                        {patternDef?.name || '图案'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">#{actualIndex + 1}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {Math.round(pattern.opacity * 100)}% · {(pattern.scale * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* 快捷操作 */}
                  <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                    {/* 可见性切换 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdatePattern(pattern.id, { visible: !pattern.visible })
                      }}
                      className="p-1.5 hover:bg-white rounded transition-colors"
                      title={pattern.visible === false ? '显示图层' : '隐藏图层'}
                    >
                      {pattern.visible === false ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>

                    {/* 锁定切换 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdatePattern(pattern.id, { locked: !pattern.locked })
                      }}
                      className="p-1.5 hover:bg-white rounded transition-colors"
                      title={pattern.locked ? '解锁图层' : '锁定图层'}
                    >
                      {pattern.locked ? (
                        <Lock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 扩展操作（选中时显示） */}
                {isSelected && (
                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-blue-200 grid grid-cols-4 gap-1 md:gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveLayer(pattern.id, 'up')
                      }}
                      disabled={actualIndex === patterns.length - 1}
                      className="px-1.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                      title="上移图层"
                    >
                      <MoveUp className="w-3 h-3" />
                      <span className="hidden md:inline">上移</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveLayer(pattern.id, 'down')
                      }}
                      disabled={actualIndex === 0}
                      className="px-1.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                      title="下移图层"
                    >
                      <MoveDown className="w-3 h-3" />
                      <span className="hidden md:inline">下移</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicatePattern(pattern.id)
                      }}
                      className="px-1.5 py-1.5 text-xs font-medium bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50 flex flex-col items-center justify-center gap-0.5"
                      title="复制图层"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden md:inline">复制</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemovePattern(pattern.id)
                      }}
                      className="px-1.5 py-1.5 text-xs font-medium bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 flex flex-col items-center justify-center gap-0.5"
                      title="删除图层"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden md:inline">删除</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
