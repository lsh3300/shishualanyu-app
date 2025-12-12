'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Eye } from 'lucide-react'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import type { ClothLayer } from '@/types/game.types'

interface ClothCardProps {
  cloth: {
    id: string
    cloth_data: {
      layers: ClothLayer[]
      preview_image?: string
    }
    created_at: string
    score_data?: {
      total_score: number
      grade: string
      dimensions: {
        color_score: number
        pattern_score: number
        creativity_score: number
        technique_score: number
      }
    }
  }
  showActions?: boolean
  onSave?: () => void
  onView?: () => void
  badgeText?: string
  badgeColor?: string
  actionButtons?: Array<{
    icon: React.ReactNode
    label: string
    variant?: 'default' | 'destructive' | 'outline'
    onClick: () => void
  }>
}

/**
 * 作品卡片组件（优化版）
 * 使用 memo 减少不必要的重渲染
 * 移除 framer-motion 动画提升性能
 */
export const ClothCard = memo(function ClothCard({
  cloth,
  showActions = false,
  onSave,
  onView,
  badgeText,
  badgeColor,
  actionButtons
}: ClothCardProps) {
  const gradeColors: Record<string, string> = {
    SSS: 'from-purple-500 to-pink-500',
    SS: 'from-blue-500 to-indigo-500',
    S: 'from-green-500 to-emerald-500',
    A: 'from-yellow-500 to-orange-500',
    B: 'from-gray-500 to-slate-500',
    C: 'from-gray-400 to-gray-500'
  }

  const grade = cloth.score_data?.grade || 'C'
  const score = cloth.score_data?.total_score || 0

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden border-2 border-gray-200 hover:border-blue-300"
    >
      {/* 作品预览 - 真实渲染 */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Canvas 预览层 - z-0 */}
        <div className="absolute inset-0 z-0">
          <ClothPreview
            layers={cloth.cloth_data?.layers || []}
            className="w-full h-full"
          />
        </div>
        
        {/* 图层信息提示 - z-10 */}
        {cloth.cloth_data?.layers && cloth.cloth_data.layers.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 z-10 text-[10px] text-gray-600 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-center shadow-sm">
            {cloth.cloth_data.layers.length} 个图层
          </div>
        )}

        {/* 悬停遮罩和按钮 - z-20 */}
        <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          >
            <Eye className="w-4 h-4 mr-1" />
            查看
          </Button>
        </div>

        {/* 评分徽章 - z-10 */}
        {cloth.score_data && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradeColors[grade]} text-white text-xs font-bold shadow-lg`}>
              {grade} · {score}分
            </div>
          </div>
        )}

        {/* 自定义徽章 - z-10 */}
        {badgeText && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`px-2 py-1 rounded-full ${badgeColor || 'bg-blue-500'} text-white text-xs font-medium shadow-lg`}>
              {badgeText}
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮区域 */}
      {showActions && (
        <div className="p-2 bg-gray-50 border-t border-gray-200 relative z-40">
          {/* 创作时间 - 显示在按钮区域上方 */}
          <div className="text-[10px] text-gray-400 text-center mb-1">
            {new Date(cloth.created_at).toLocaleDateString()}
          </div>
          {actionButtons && actionButtons.length > 0 ? (
            <div className="flex gap-1">
              {actionButtons.map((btn, index) => (
                <Button
                  key={index}
                  variant={btn.variant || 'outline'}
                  size="sm"
                  onClick={btn.onClick}
                  className="flex-1 text-xs h-8"
                >
                  {btn.icon}
                  <span className="ml-1 hidden sm:inline">{btn.label}</span>
                </Button>
              ))}
            </div>
          ) : onSave ? (
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              保存到背包
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
})
