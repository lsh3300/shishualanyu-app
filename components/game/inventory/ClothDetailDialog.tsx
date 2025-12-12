'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import { ShoppingBag, Save, X } from 'lucide-react'
import type { ClothLayer } from '@/types/game.types'

interface ClothDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cloth: {
    id: string
    cloth_data: {
      layers: ClothLayer[]
    }
    created_at: string
    score_data?: {
      total_score: number
      grade: string
      dimensions?: {
        color_score: number
        pattern_score: number
        creativity_score: number
        technique_score: number
      }
    }
  } | null
  slotType?: 'recent' | 'inventory'
  onSave?: () => void
  onList?: () => void
}

/**
 * 作品详情对话框
 */
export function ClothDetailDialog({
  open,
  onOpenChange,
  cloth,
  slotType,
  onSave,
  onList
}: ClothDetailDialogProps) {
  if (!cloth) return null

  const gradeColors: Record<string, string> = {
    SSS: 'text-purple-600 bg-purple-100',
    SS: 'text-blue-600 bg-blue-100',
    S: 'text-green-600 bg-green-100',
    A: 'text-yellow-600 bg-yellow-100',
    B: 'text-gray-600 bg-gray-100',
    C: 'text-gray-400 bg-gray-50'
  }

  const grade = cloth.score_data?.grade || 'C'
  const gradeStyle = gradeColors[grade] || gradeColors.C

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>作品详情</span>
            {cloth.score_data && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeStyle}`}>
                {grade} · {cloth.score_data.total_score}分
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 作品预览 */}
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-amber-900">
              <ClothPreview
                layers={cloth.cloth_data?.layers || []}
                showFrame={false}
              />
            </div>
          </div>

          {/* 评分详情 */}
          {cloth.score_data?.dimensions && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">评分详情</h4>
              <div className="grid grid-cols-2 gap-3">
                <ScoreItem label="色彩" score={cloth.score_data.dimensions.color_score} />
                <ScoreItem label="图案" score={cloth.score_data.dimensions.pattern_score} />
                <ScoreItem label="创意" score={cloth.score_data.dimensions.creativity_score} />
                <ScoreItem label="技法" score={cloth.score_data.dimensions.technique_score} />
              </div>
            </div>
          )}

          {/* 作品信息 */}
          <div className="text-sm text-gray-500 text-center">
            创作时间：{new Date(cloth.created_at).toLocaleString()}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            关闭
          </Button>
          
          {slotType === 'recent' && onSave && (
            <Button
              onClick={() => {
                onSave()
                onOpenChange(false)
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              保存到背包
            </Button>
          )}
          
          {slotType === 'inventory' && onList && (
            <Button
              onClick={() => {
                onList()
                onOpenChange(false)
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              上架到商店
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 评分项组件
 */
function ScoreItem({ label, score }: { label: string; score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-blue-600'
    if (s >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="flex items-center justify-between bg-white/50 rounded px-3 py-2">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
    </div>
  )
}
