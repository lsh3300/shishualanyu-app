'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, TrendingUp, Package, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShopScene } from '@/components/game/shop/ShopScene'
import { GameFunctionMenu } from '@/components/game/navigation/GameFunctionMenu'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'

/**
 * 我的商店页面 V2
 * 参考设计优化：商店作为主界面，背景占据主要空间
 */
export default function MyShopPageV2() {
  const { profile, loading } = usePlayerProfile()
  const [todayEarnings] = useState(0)
  const [listedCount] = useState(0)
  const [todayVisitors] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-indigo-50">
      
      {/* 顶部导航栏 - 更紧凑 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* 左侧：返回 + 商店名 */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回</span>
              </Button>
            </Link>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🏪 我的蓝染坊
              </h1>
              {profile && (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Lv.{profile.level} 染匠</span>
                  <span className="text-yellow-600 font-semibold">💰 {profile.currency} 币</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：功能菜单 + 设置 */}
          <div className="flex items-center gap-2">
            <GameFunctionMenu />
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">设置</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        
        {/* 统计卡片 - 紧凑横向布局 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 grid grid-cols-3 gap-3 mb-4"
        >
          {/* 今日收入 */}
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="今日收入"
            value={`${todayEarnings} 币`}
            change="+0%"
            color="green"
          />

          {/* 在售作品 */}
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="在售作品"
            value={`${listedCount} 件`}
            subtitle="最多 5 件"
            color="blue"
          />

          {/* 今日访客 */}
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="今日访客"
            value={`${todayVisitors}`}
            subtitle="暂无访客"
            color="purple"
          />
        </motion.div>

        {/* 商店场景 - 主视觉焦点 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <ShopScene />
        </motion.div>

        {/* 快捷操作栏 - 简化为单行 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-4 grid grid-cols-3 gap-3"
        >
          {/* 从背包上架 */}
          <Link href="/game/inventory">
            <Button 
              className="w-full h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-lg"
              size="lg"
            >
              <Package className="w-5 h-5" />
              <span className="font-semibold">从背包上架</span>
            </Button>
          </Link>

          {/* 管理上架 */}
          <Button 
            className="w-full h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg"
            size="lg"
            disabled
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold">管理上架</span>
          </Button>

          {/* 交易记录 */}
          <Button 
            className="w-full h-16 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white flex items-center justify-center gap-2 shadow-lg"
            size="lg"
            disabled
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">交易记录</span>
          </Button>
        </motion.div>
      </main>
    </div>
  )
}

/**
 * 统计卡片组件 - 紧凑版
 */
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  change?: string
  color: 'green' | 'blue' | 'purple'
}

function StatCard({ icon, label, value, subtitle, change, color }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-500 bg-green-50 border-green-200',
    blue: 'text-blue-500 bg-blue-50 border-blue-200',
    purple: 'text-purple-500 bg-purple-50 border-purple-200'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-800">
        {value}
      </div>
      {(subtitle || change) && (
        <div className="text-[10px] text-gray-500 mt-0.5">
          {change || subtitle}
        </div>
      )}
    </div>
  )
}
