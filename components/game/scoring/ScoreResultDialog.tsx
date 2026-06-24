'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { Loader2 } from 'lucide-react'
import type { ScoreDimensions, ScoreGrade } from '@/types/game.types'
import { 
  getGradeColor, 
  getGradeDescription,
  getGradeRewards 
} from '@/lib/game/scoring/score-calculator'
import { useAuth } from '@/contexts/auth-context'
import { fetchJson } from '@/lib/fetch-json'

interface ScoreResultDialogProps {
  isOpen: boolean
  onClose: () => void
  dimensions: ScoreDimensions
  totalScore: number
  grade: ScoreGrade
  levelUpInfo?: {
    leveled_up: boolean
    old_level: number
    new_level: number
  }
  clothId?: string
  autoSaved?: boolean
}

/**
 * 评分结果弹窗
 * 显示评分动画和奖励信息
 */
export function ScoreResultDialog({
  isOpen,
  onClose,
  dimensions,
  totalScore,
  grade,
  levelUpInfo,
  clothId,
  autoSaved = false
}: ScoreResultDialogProps) {
  const [showScores, setShowScores] = useState(false)
  const [showTotal, setShowTotal] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const rewards = getGradeRewards(grade)
  const gradeColor = getGradeColor(grade)
  const gradeDesc = getGradeDescription(grade)
  const { getToken } = useAuth()

  // 动画时序控制
  useEffect(() => {
    if (isOpen) {
      // 重置状态
      setShowScores(false)
      setShowTotal(false)
      setShowRewards(false)
      setSaveMessage('')

      // 分步显示
      setTimeout(() => setShowScores(true), 500)
      setTimeout(() => setShowTotal(true), 2000)
      setTimeout(() => setShowRewards(true), 2500)
    }
  }, [isOpen])

  // 保存到背包
  const handleSaveToInventory = async () => {
    if (!clothId || isSaving) return

    setIsSaving(true)
    try {
      const token = await getToken()
      if (!token) {
        setSaveMessage('❌ 请先登录')
        toast.error("请先登录", { position: "bottom-right", duration: 3000 })
        setIsSaving(false)
        return
      }

      const data = await fetchJson<{
        success: boolean
        message?: string
      }>('/api/inventory/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cloth_id: clothId }),
        timeoutMs: 12000,
        retries: 1,
      })
      
      if (data.success) {
        setSaveMessage('✅ 已保存到背包')
        toast.success("作品已保存到背包", {
          position: "bottom-right",
          duration: 3000
        })
        // 2秒后关闭弹窗
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setSaveMessage(`❌ ${data.message || '保存失败'}`)
        toast.error(`保存失败: ${data.message || 'API调用失败'}`, {
          position: "bottom-right",
          duration: 5000
        })
      }
    } catch (error) {
      setSaveMessage('❌ 保存失败，请稍后重试')
      toast.error("API调用失败: 网络错误", {
        position: "bottom-right",
        duration: 5000
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-[calc(100%-2rem)] sm:max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题 */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              🎨 作品评分
            </motion.h2>
            <p className="text-gray-600 text-sm">
              你的蓝染作品已完成
            </p>
          </div>

          {/* 分数维度 */}
          <AnimatePresence>
            {showScores && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mb-6"
              >
                <ScoreDimension
                  label="颜色匹配"
                  score={dimensions.color_score}
                  icon="🎨"
                  delay={0}
                />
                <ScoreDimension
                  label="纹样复杂度"
                  score={dimensions.pattern_score}
                  icon="🌀"
                  delay={0.2}
                />
                <ScoreDimension
                  label="创意指数"
                  score={dimensions.creativity_score}
                  icon="✨"
                  delay={0.4}
                />
                <ScoreDimension
                  label="技法运用"
                  score={dimensions.technique_score}
                  icon="🖌️"
                  delay={0.6}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 总分和等级 */}
          <AnimatePresence>
            {showTotal && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center mb-6 p-6 rounded-2xl"
                style={{ 
                  backgroundColor: `${gradeColor}20`,
                  borderWidth: 2,
                  borderColor: gradeColor
                }}
              >
                <div className="text-5xl font-bold mb-2" style={{ color: gradeColor }}>
                  {totalScore}
                </div>
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: gradeColor }}
                >
                  {grade}
                </div>
                <div className="text-gray-600 text-sm">
                  {gradeDesc}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 奖励信息 */}
          <AnimatePresence>
            {showRewards && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">
                    ⭐ 经验值
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold text-blue-600"
                  >
                    +{rewards.exp}
                  </motion.span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">
                    🪙 蓝草币
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-bold text-yellow-600"
                  >
                    +{rewards.currency}
                  </motion.span>
                </div>

                {/* 升级提示 */}
                {levelUpInfo?.leveled_up && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center"
                  >
                    <div className="text-2xl mb-1">🎉</div>
                    <div className="font-bold text-lg">
                      升级了！
                    </div>
                    <div className="text-sm">
                      Lv.{levelUpInfo.old_level} → Lv.{levelUpInfo.new_level}
                    </div>
                  </motion.div>
                )}

                {/* 自动保存提示 */}
                {autoSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"
                  >
                    <div className="text-sm text-green-700">
                      📦 作品已自动保存到"最近创作"
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 保存消息 */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 p-3 rounded-xl text-center text-sm ${
                saveMessage.includes('✅') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            {/* 保存到背包按钮（仅当有clothId时显示） */}
            {clothId && !saveMessage.includes('✅') && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                onClick={handleSaveToInventory}
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </div>
                ) : (
                  '💾 保存到背包'
                )}
              </motion.button>
            )}

            {/* 继续按钮 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              onClick={onClose}
              className={`${clothId && !saveMessage.includes('✅') ? 'flex-1' : 'w-full'} py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all`}
            >
              继续
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * 单个分数维度显示
 */
function ScoreDimension({
  label,
  score,
  icon,
  delay
}: {
  label: string
  score: number
  icon: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* 进度条 */}
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          />
        </div>
        
        {/* 分数 */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="text-lg font-bold text-gray-800 min-w-[3rem] text-right"
        >
          {score}
        </motion.span>
      </div>
    </motion.div>
  )
}
