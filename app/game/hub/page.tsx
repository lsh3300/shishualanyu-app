'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlayerStatsCard } from '@/components/game/core/PlayerStatsCard'
import { RiverWaveBackground } from '@/components/game/svg/RiverWaveBackground'
import { GameStatusBar } from '@/components/game/core/GameStatusBar'

/**
 * 染坊大厅（游戏主界面）
 */
export default function GameHubPage() {
  const currentTime = new Date().getHours()
  const timeOfDay = 
    currentTime >= 5 && currentTime < 10 ? 'dawn' :
    currentTime >= 10 && currentTime < 17 ? 'day' :
    currentTime >= 17 && currentTime < 20 ? 'dusk' :
    'night'

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景 */}
      <RiverWaveBackground timeOfDay={timeOfDay} speed="slow" intensity={0.5} />
      
      {/* 顶部状态栏 */}
      <GameStatusBar />
      
      {/* 主内容 */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </motion.div>

        {/* 欢迎标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🏮 蓝染坊
          </h1>
          <p className="text-gray-600">
            欢迎回来，染匠
          </p>
        </motion.div>

        {/* 玩家档案卡片 */}
        <div className="max-w-md mx-auto mb-12">
          <PlayerStatsCard />
        </div>

        {/* 功能区域 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 工作台 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/game/workshop">
              <div className="group bg-gradient-to-br from-blue-50/90 to-indigo-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-200 hover:shadow-xl transition-all cursor-pointer">
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  创作工坊
                </h3>
                <p className="text-center text-gray-600 text-sm">
                  开始染制你的布料作品
                </p>
              </div>
            </Link>
          </motion.div>

          {/* 我的商店 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Link href="/game/shop">
              <div className="group bg-gradient-to-br from-amber-50/90 to-yellow-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200 hover:shadow-xl transition-all cursor-pointer">
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                  🏪
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  我的商店
                </h3>
                <p className="text-center text-gray-600 text-sm">
                  出售你的蓝染作品
                </p>
              </div>
            </Link>
          </motion.div>

          {/* 漂流河 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/drift">
              <div className="group bg-gradient-to-br from-cyan-50/90 to-blue-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cyan-200 hover:shadow-xl transition-all cursor-pointer">
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                  🌊
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  漂流河
                </h3>
                <p className="text-center text-gray-600 text-sm">
                  探索他人的作品
                </p>
              </div>
            </Link>
          </motion.div>

          {/* 蓝染市场 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/game/market">
              <div className="group bg-gradient-to-br from-purple-50/90 to-pink-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-200 hover:shadow-xl transition-all cursor-pointer">
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                  🛒
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  蓝染市场
                </h3>
                <p className="text-center text-gray-600 text-sm">
                  购买其他染匠的作品
                </p>
              </div>
            </Link>
          </motion.div>

          {/* 任务板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="group bg-gradient-to-br from-amber-50/90 to-orange-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200 opacity-60 cursor-not-allowed">
              <div className="text-6xl mb-4 text-center">
                📋
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                任务板
              </h3>
              <p className="text-center text-gray-600 text-sm">
                即将开放...
              </p>
            </div>
          </motion.div>
        </div>

        {/* 提示文字 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-sm text-gray-500"
        >
          <p>🎮 游戏系统 Phase 1 - 基础框架已就绪</p>
          <p className="mt-1">✨ 更多功能正在开发中...</p>
        </motion.div>
      </div>
    </div>
  )
}
