'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreResultDialog } from '@/components/game/scoring/ScoreResultDialog'
import { useSubmitScore } from '@/hooks/game/use-submit-score'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import type { ClothLayer, ScoreSubmitResult } from '@/types/game.types'

interface CompleteWorkButtonProps {
  clothId: string
  layers: ClothLayer[]
  onComplete?: () => void
  disabled?: boolean
}

/**
 * 完成创作按钮
 * 点击后提交评分并显示结果
 */
export function CompleteWorkButton({
  clothId,
  layers,
  onComplete,
  disabled = false
}: CompleteWorkButtonProps) {
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreSubmitResult | null>(null)
  
  const { submitScore, isSubmitting, error } = useSubmitScore()
  const { refresh: refreshProfile } = usePlayerProfile()

  const handleComplete = async () => {
    try {
      await submitScore({
        clothId,
        layers,
        onSuccess: async (data) => {
          // 评分API已自动保存到最近创作，无需额外调用
          console.log('✅ 作品评分与保存成功')
          
          setScoreResult(data)
          setShowScoreDialog(true)
          // 刷新玩家档案数据
          refreshProfile()
        },
        onError: (err) => {
          console.error('评分失败:', err)
          alert(`评分失败: ${err.message}`)
        }
      })
    } catch (err) {
      // 错误已在onError中处理
    }
  }

  const handleCloseDialog = () => {
    setShowScoreDialog(false)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        {/* 主按钮 */}
        <Button
          size="lg"
          onClick={handleComplete}
          disabled={disabled || isSubmitting || layers.length === 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              评分中...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              完成创作
            </>
          )}
        </Button>

        {/* 提示文字 */}
        <AnimatePresence>
          {layers.length === 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-center text-muted-foreground"
            >
              还没有开始创作哦，快来染制你的作品吧！
            </motion.p>
          )}
        </AnimatePresence>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 说明文字 */}
        {!isSubmitting && layers.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            作品将根据颜色、纹样、创意和技法进行评分
          </p>
        )}
      </motion.div>

      {/* 评分结果弹窗 */}
      {scoreResult && (
        <ScoreResultDialog
          isOpen={showScoreDialog}
          onClose={handleCloseDialog}
          dimensions={scoreResult.dimensions}
          totalScore={scoreResult.total_score}
          grade={scoreResult.grade}
          levelUpInfo={{
            leveled_up: scoreResult.leveled_up,
            old_level: scoreResult.old_level,
            new_level: scoreResult.new_level
          }}
          clothId={clothId}
          autoSaved={true}
        />
      )}
    </>
  )
}
