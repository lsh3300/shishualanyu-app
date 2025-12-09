'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Package, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShopScene } from '@/components/game/shop/ShopScene'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'

/**
 * 我的商店页面
 * 展示商店场景、上架作品、收入统计
 */
export default function MyShopPage() {
  const { profile, loading } = usePlayerProfile()
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [listedCount, setListedCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      {/* 顶部导航栏 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧：返回按钮 */}
          <Link href="/game/hub">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回大厅
            </Button>
          </Link>

          {/* 中间：商店名称 */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-gray-800">
              {profile?.user_id ? '我的蓝染坊' : '蓝染坊'}
            </h1>
            {profile && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Lv.{profile.level} 染匠
                </span>
                <span className="text-yellow-600 font-medium">
                  💰 {profile.currency} 币
                </span>
              </div>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-2">
            <Link href="/game/inventory">
              <Button variant="outline" size="sm" className="gap-2">
                <Package className="w-4 h-4" />
                背包
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {/* 今日收入 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">今日收入</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {todayEarnings} 币
            </div>
            <div className="text-xs text-gray-500 mt-1">
              +{Math.floor(todayEarnings * 0.2)}% 较昨日
            </div>
          </div>

          {/* 在售作品 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">在售作品</span>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {listedCount} 件
            </div>
            <div className="text-xs text-gray-500 mt-1">
              最多可上架 5 件
            </div>
          </div>

          {/* 访客数量 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">今日访客</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0
            </div>
            <div className="text-xs text-gray-500 mt-1">
              暂无访客
            </div>
          </div>
        </motion.div>

        {/* 商店场景 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ShopScene />
        </motion.div>

        {/* 快捷操作栏 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">快捷操作</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 上架作品 */}
            <Link href="/game/inventory">
              <Button 
                className="w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex flex-col gap-2"
                size="lg"
              >
                <Package className="w-8 h-8" />
                <span>从背包上架</span>
              </Button>
            </Link>

            {/* 上架管理 */}
            <Button 
              className="w-full h-24 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex flex-col gap-2"
              size="lg"
              disabled
            >
              <Settings className="w-8 h-8" />
              <span>管理上架</span>
            </Button>

            {/* 交易记录 */}
            <Button 
              className="w-full h-24 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white flex flex-col gap-2"
              size="lg"
              disabled
            >
              <TrendingUp className="w-8 h-8" />
              <span>交易记录</span>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
