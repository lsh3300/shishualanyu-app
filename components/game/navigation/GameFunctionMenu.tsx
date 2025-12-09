'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Palette, Package, ListChecks, Droplet, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * 游戏功能菜单
 * 从商店展开进入其他功能页面
 */
export function GameFunctionMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      icon: <Palette className="w-6 h-6" />,
      label: '创作工坊',
      description: '染制你的布料作品',
      href: '/game/workshop',
      gradient: 'from-blue-500 to-indigo-600',
      emoji: '🎨'
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: '背包',
      description: '查看你的作品收藏',
      href: '/game/inventory',
      gradient: 'from-amber-500 to-orange-600',
      emoji: '🎒'
    },
    {
      icon: <ListChecks className="w-6 h-6" />,
      label: '任务',
      description: '完成任务获得奖励',
      href: '/game/tasks',
      gradient: 'from-green-500 to-emerald-600',
      emoji: '✓'
    },
    {
      icon: <Droplet className="w-6 h-6" />,
      label: '材料库',
      description: '管理染料和材料',
      href: '#',
      gradient: 'from-purple-500 to-pink-600',
      emoji: '🪣',
      disabled: true
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: '漂流河',
      description: '探索他人的作品',
      href: '/drift',
      gradient: 'from-cyan-500 to-blue-600',
      emoji: '🌊'
    }
  ]

  return (
    <>
      {/* 功能按钮 */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border-2 border-blue-200"
      >
        <Menu className="w-4 h-4" />
        功能
      </Button>

      {/* 功能菜单弹窗 - 使用Portal渲染到body */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />

            {/* 菜单面板 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[9999] overflow-y-auto"
            >
              {/* 头部 */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 shadow-lg z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">游戏功能</h2>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-blue-100 text-sm">
                  选择功能进入对应页面
                </p>
              </div>

              {/* 菜单项列表 */}
              <div className="p-4 space-y-3">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.disabled ? (
                      <div className="bg-gray-100 rounded-2xl p-5 border-2 border-gray-200 opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                            {item.emoji}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">
                              {item.label}
                            </h3>
                            <p className="text-xs text-gray-600">
                              即将开放...
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            {/* 图标 */}
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl shadow-lg`}
                            >
                              {item.emoji}
                            </motion.div>

                            {/* 文字 */}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {item.label}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {item.description}
                              </p>
                            </div>

                            {/* 箭头 */}
                            <motion.div
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                              className="text-gray-400 group-hover:text-blue-600 transition-colors"
                            >
                              →
                            </motion.div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* 底部说明 */}
              <div className="p-6 bg-gradient-to-b from-transparent to-gray-50">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-700 text-center">
                    💡 <span className="font-medium">提示：</span>
                    你可以随时返回商店查看销售情况
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
