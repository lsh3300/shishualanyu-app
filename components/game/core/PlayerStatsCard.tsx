'use client'

import { motion } from 'framer-motion'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'

/**
 * 玩家统计卡片
 * 显示等级、经验、货币等核心信息
 */
export function PlayerStatsCard() {
  const { profile, levelInfo, loading, error } = usePlayerProfile()

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !profile || !levelInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-600 text-sm">加载档案失败: {error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100"
    >
      {/* 染坊名称 */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {profile.dye_house_name}
        </h2>
      </div>

      {/* 等级信息 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Lv.{levelInfo.level}
          </span>
          <span className="text-xs text-gray-500">
            {levelInfo.currentLevelExp} / {levelInfo.expToNextLevel} EXP
          </span>
        </div>
        
        {/* 经验进度条 */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* 闪光效果 */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>
      </div>

      {/* 货币和统计 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 货币 */}
        <div className="text-center">
          <div className="text-2xl mb-1">🪙</div>
          <div className="text-lg font-bold text-blue-600">
            {profile.currency}
          </div>
          <div className="text-xs text-gray-500">蓝草币</div>
        </div>

        {/* 作品数 */}
        <div className="text-center">
          <div className="text-2xl mb-1">🎨</div>
          <div className="text-lg font-bold text-purple-600">
            {profile.total_cloths_created}
          </div>
          <div className="text-xs text-gray-500">作品数</div>
        </div>

        {/* 最高分 */}
        <div className="text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-lg font-bold text-yellow-600">
            {profile.highest_score}
          </div>
          <div className="text-xs text-gray-500">最高分</div>
        </div>
      </div>
    </motion.div>
  )
}
