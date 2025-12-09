'use client'

import { motion } from 'framer-motion'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import Link from 'next/link'

/**
 * 游戏状态栏
 * 全局显示玩家等级、经验、货币
 */
export function GameStatusBar() {
  const { profile, levelInfo, loading } = usePlayerProfile()

  if (loading || !profile || !levelInfo) {
    return null // 加载中不显示，避免闪烁
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-indigo-600/95 to-blue-600/95 backdrop-blur-md border-b border-white/20 shadow-lg"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* 左侧：等级和经验 */}
          <div className="flex items-center gap-4">
            <Link href="/game/hub" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/30">
                  {levelInfo.level}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-white/80">染匠</div>
                  <div className="text-sm font-bold text-white">Lv.{levelInfo.level}</div>
                </div>
              </div>
            </Link>

            {/* 经验进度条 */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 lg:w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-white/90 whitespace-nowrap">
                {levelInfo.currentLevelExp}/{levelInfo.expToNextLevel}
              </span>
            </div>
          </div>

          {/* 右侧：货币和统计 */}
          <div className="flex items-center gap-4">
            {/* 货币 */}
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 border border-white/30">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-white">{profile.currency}</span>
            </div>

            {/* 作品数（移动端隐藏） */}
            <div className="hidden lg:flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 border border-white/30">
              <span className="text-lg">🎨</span>
              <span className="text-sm text-white">{profile.total_cloths_created}</span>
            </div>

            {/* 返回主页按钮（移动端） */}
            <Link href="/game/hub" className="sm:hidden">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 移动端精简版状态栏
 */
export function CompactGameStatusBar() {
  const { profile, levelInfo, loading } = usePlayerProfile()

  if (loading || !profile || !levelInfo) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-indigo-600/95 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
            {levelInfo.level}
          </div>
          <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-white text-sm font-bold">
          <span>🪙</span>
          <span>{profile.currency}</span>
        </div>
      </div>
    </div>
  )
}
