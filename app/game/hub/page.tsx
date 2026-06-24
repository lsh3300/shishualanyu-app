'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlayerStatsCard } from '@/components/game/core/PlayerStatsCard'
import { GameStatusBar } from '@/components/game/core/GameStatusBar'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import { useAuth } from '@/contexts/auth-context'

// 游戏功能配置
const GAME_FEATURES = [
  {
    id: 'workshop',
    title: '创作工坊',
    description: '染制你的布料作品',
    icon: '🎨',
    href: '/game/workshop',
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50/90 to-indigo-100/80',
    borderColor: 'border-blue-200',
    tag: '热门',
    tagColor: 'bg-red-500'
  },
  {
    id: 'inventory',
    title: '背包',
    description: '查看你的作品收藏',
    icon: '🎒',
    href: '/game/inventory',
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50/90 to-yellow-100/80',
    borderColor: 'border-amber-200',
    tag: '收藏',
    tagColor: 'bg-green-500'
  },
  {
    id: 'tasks',
    title: '任务',
    description: '完成任务获得奖励',
    icon: '✓',
    href: '/game/tasks',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50/90 to-emerald-100/80',
    borderColor: 'border-green-200',
    tag: '奖励',
    tagColor: 'bg-purple-500'
  },
  {
    id: 'drift',
    title: '漂流池',
    description: '功能收口中，暂不开放入口',
    icon: '🌊',
    href: '#',
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50/90 to-blue-100/80',
    borderColor: 'border-cyan-200',
    tag: '收口中',
    tagColor: 'bg-indigo-500',
    disabled: true
  },
  {
    id: 'market',
    title: '蓝染市场',
    description: '购买其他染匠的作品',
    icon: '🛒',
    href: '/game/market',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50/90 to-pink-100/80',
    borderColor: 'border-purple-200',
    tag: '精品',
    tagColor: 'bg-yellow-500'
  },
  {
    id: 'materials',
    title: '材料库',
    description: '管理染料和材料',
    icon: '🪣',
    href: '#',
    gradient: 'from-gray-400 to-gray-500',
    bgGradient: 'from-gray-50/90 to-gray-100/80',
    borderColor: 'border-gray-200',
    disabled: true
  }
]

// 快捷操作
const QUICK_ACTIONS = [
  { icon: '📊', label: '数据统计', href: '/game/stats', color: 'bg-emerald-50 text-emerald-600' },
  { icon: '🎁', label: '每日奖励', href: '/game/rewards', color: 'bg-rose-50 text-rose-600' },
  { icon: '🏆', label: '成就系统', href: '/game/achievements', color: 'bg-yellow-50 text-yellow-600' },
  { icon: '⚙️', label: '游戏设置', href: '/game/settings', color: 'bg-gray-50 text-gray-600' },
]

// 最新动态
const RECENT_ACTIVITIES = [
  { type: 'sale', message: '你的作品《蓝韵》已售出', time: '2分钟前', icon: '💵' },
  { type: 'level', message: '恭喜升级到 Lv.2 染匠', time: '1小时前', icon: '⭐' },
  { type: 'visit', message: '有 3 位染匠访问了你的商店', time: '3小时前', icon: '👤' },
]

/**
 * 染坊大厅（游戏主界面）重新设计版本
 */
export default function GameHubPage() {
  const { profile, loading: profileLoading, error: profileError } = usePlayerProfile()
  const { user, loading: authLoading } = useAuth()

  const getUserDisplayName = () => {
    return profile?.dye_house_name || '无名染坊'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 如果用户未登录，显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎来到蓝染坊</h2>
          <p className="text-gray-600 mb-6">请先登录以开启你的染匠之旅</p>
          <div className="space-y-3">
            <Link href="/auth?view=login" className="block">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
                立即登录
              </Button>
            </Link>
            <Link href="/auth?view=register" className="block">
              <Button variant="outline" className="w-full">
                注册账号
              </Button>
            </Link>
            <Link href="/game/shop" className="block">
              <Button variant="ghost" className="w-full text-sm">
                返回商店
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 如果用户已登录但档案加载失败，显示错误信息
  if (!authLoading && user && profileError) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">加载档案失败</h2>
          <p className="text-red-600 mb-4 text-sm">{profileError}</p>
          <p className="text-gray-600 mb-6 text-sm">用户ID: {user.id}</p>
          <div className="space-y-3">
            <Link href="/game/shop" className="block">
              <Button variant="outline" className="w-full">
                返回商店
              </Button>
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-left">
              <p className="text-xs text-gray-600 mb-2">调试信息:</p>
              <p className="text-xs text-gray-500">认证状态: {authLoading ? '加载中' : '已完成'}</p>
              <p className="text-xs text-gray-500">用户: {user ? '已登录' : '未登录'}</p>
              <p className="text-xs text-gray-500">档案加载: {profileLoading ? '加载中' : '已完成'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col relative" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      {/* 顶部状态栏 */}
      <GameStatusBar />
      
      {/* 可滚动的主内容 */}
      <main className="flex-1 overflow-y-auto">
        {/* 顶部导航 */}
        <section className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Link href="/game/shop">
              <Button variant="ghost" size="sm" className="gap-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-sm border border-indigo-100">
                <ArrowLeft className="h-4 w-4" />
                返回商店
              </Button>
            </Link>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">{getGreeting()}</p>
              <p className="text-sm font-medium text-gray-700">染匠大厅</p>
            </div>
          </div>

          {/* 欢迎横幅 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden shadow-lg mb-4"
          >
            <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-700 p-6 text-white relative">
              {/* 装饰性背景图案 */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white/30"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/10"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                    🏮
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">染匠大厅</h1>
                    <p className="text-blue-100 text-sm">{getUserDisplayName()}</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  传承千年蓝染技艺，探索更多玩法和内容。
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 玩家档案卡片 */}
        <section className="px-4 py-2">
          <PlayerStatsCard />
        </section>

        {/* 分隔线 */}
        <div className="flex items-center justify-center px-6 my-3">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
        </div>

        {/* 主要功能区域 */}
        <section className="px-4 py-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
              游戏功能
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {GAME_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {feature.disabled ? (
                  <div className={`bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-2xl p-4 shadow-sm border ${feature.borderColor} opacity-60 cursor-not-allowed relative overflow-hidden`}>
                    <div className="text-4xl mb-3 text-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-sm font-bold text-center text-gray-800 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-center text-gray-600 text-[10px] leading-snug">
                      即将开放...
                    </p>
                  </div>
                ) : (
                  <Link href={feature.href}>
                    <div className={`group bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-2xl p-4 shadow-sm border ${feature.borderColor} hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}>
                      {/* 标签 */}
                      {feature.tag && (
                        <div className={`absolute top-0 right-0 ${feature.tagColor} text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold shadow-sm`}>
                          {feature.tag}
                        </div>
                      )}
                      
                      <div className="text-4xl mb-3 text-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-sm font-bold text-center text-gray-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-center text-gray-600 text-[10px] leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 快捷操作 */}
        <section className="px-4 py-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
              快捷操作
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action, index) => (
              <Link 
                key={index}
                href={action.href}
                className="flex flex-col items-center justify-center py-3 rounded-xl bg-white/80 border border-white shadow-sm group transition-all active:scale-95 hover:shadow-md"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} mb-1 group-hover:scale-110 transition-transform text-sm`}>
                  {action.icon}
                </div>
                <span className="text-[9px] font-medium text-gray-700 text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 分隔线 */}
        <div className="flex items-center justify-center px-6 my-3">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
          <div className="mx-3 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent flex-1"></div>
        </div>

        {/* 最新动态 */}
        <section className="px-4 py-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
              最新动态
            </h3>
            <Link href="/game/activities" className="text-xs text-indigo-500 flex items-center gap-1 hover:text-indigo-600">
              更多 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {RECENT_ACTIVITIES.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-indigo-50 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-sm shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{activity.message}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 底部提示 */}
        <section className="px-4 py-6 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-700">游戏系统 Phase 1</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                基础框架已就绪，更多精彩功能正在开发中...
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}



