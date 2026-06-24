'use client'

import { Slider } from '@/components/ui/slider'
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
}

interface PropertyPanelProps {
  pattern: PlacedPattern | null
  onUpdate: (updates: Partial<PlacedPattern>) => void
}

export function PropertyPanel({ pattern, onUpdate }: PropertyPanelProps) {
  if (!pattern) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">⚙️ 属性编辑</h3>
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">未选择图案</p>
          <p className="text-xs mt-1">点击画布中的图案进行编辑</p>
        </div>
      </div>
    )
  }

  const patternDef = getPatternById(pattern.patternId)

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6">
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
          {patternDef?.icon || '🎨'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">⚙️ 属性编辑</h3>
          <p className="text-xs text-gray-500 truncate">{patternDef?.name}</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-5">
        {/* 位置 */}
        <div>
          <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">
            📍 位置
          </label>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(pattern.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(pattern.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* 缩放 */}
        <div>
          <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 flex justify-between items-center">
            <span>🔍 缩放</span>
            <span className="text-blue-600 text-xs md:text-sm font-semibold">{(pattern.scale * 100).toFixed(0)}%</span>
          </label>
          <Slider
            value={[pattern.scale * 100]}
            onValueChange={([value]) => onUpdate({ scale: value / 100 })}
            min={20}
            max={300}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20%</span>
            <span>300%</span>
          </div>
        </div>

        {/* 旋转 */}
        <div>
          <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 flex justify-between items-center">
            <span>🔄 旋转</span>
            <span className="text-blue-600 text-xs md:text-sm font-semibold">{pattern.rotation}°</span>
          </label>
          <Slider
            value={[pattern.rotation]}
            onValueChange={([value]) => onUpdate({ rotation: value })}
            min={0}
            max={360}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0°</span>
            <span>360°</span>
          </div>
          {/* 快捷旋转按钮 */}
          <div className="grid grid-cols-4 gap-1.5 md:gap-2 mt-2">
            {[0, 90, 180, 270].map((angle) => (
              <button
                key={angle}
                onClick={() => onUpdate({ rotation: angle })}
                className={`px-1.5 py-1 md:px-2 text-xs rounded transition-colors ${
                  pattern.rotation === angle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>

        {/* 不透明度 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>👁️ 不透明度</span>
            <span className="text-blue-600">{(pattern.opacity * 100).toFixed(0)}%</span>
          </label>
          <Slider
            value={[pattern.opacity * 100]}
            onValueChange={([value]) => onUpdate({ opacity: value / 100 })}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 染色深度 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>💧 染色深度</span>
            <span className="text-blue-600">{(pattern.dyeDepth * 100).toFixed(0)}%</span>
          </label>
          <Slider
            value={[pattern.dyeDepth * 100]}
            onValueChange={([value]) => onUpdate({ dyeDepth: value / 100 })}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>浅色</span>
            <span>深色</span>
          </div>
        </div>

        {/* 预设组合 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            ✨ 快捷预设
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdate({ scale: 0.5, opacity: 0.3, rotation: 0 })}
              className="px-3 py-2 text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors"
            >
              🌸 精致小花
            </button>
            <button
              onClick={() => onUpdate({ scale: 1.5, opacity: 0.7, rotation: 45 })}
              className="px-3 py-2 text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-colors"
            >
              🌟 醒目主题
            </button>
            <button
              onClick={() => onUpdate({ scale: 1.0, opacity: 0.5, rotation: 0 })}
              className="px-3 py-2 text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-colors"
            >
              ⚪ 标准样式
            </button>
            <button
              onClick={() => onUpdate({ scale: 0.8, opacity: 0.9, rotation: 30 })}
              className="px-3 py-2 text-xs bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-colors"
            >
              💫 深邃神秘
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
