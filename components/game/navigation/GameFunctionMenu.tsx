'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Palette, Package, ListChecks, Droplet, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    label: '漂流池',
    description: '功能收口中，暂不开放',
    href: '#',
    gradient: 'from-cyan-500 to-blue-600',
    emoji: '🌊',
    disabled: true
  }
]

interface GameFunctionMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * 游戏功能菜单触发按钮
 */
export function GameFunctionMenuTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border-2 border-blue-200"
    >
      <Menu className="w-4 h-4" />
      功能
    </Button>
  )
}

/**
 * 游戏功能菜单弹窗内容
 */
export function GameFunctionMenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // 优先挂载到手机容器内部
  const mobileFrame = document.querySelector('.mobile-frame')
  const portalTarget = mobileFrame || document.body

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          />

          {/* 菜单面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-white shadow-2xl z-[9999] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 shadow-lg z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl sm:text-2xl font-bold">游戏功能</h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-blue-100 text-sm">
                选择功能后进入对应页面
              </p>
            </div>

            {/* 菜单列表 */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.disabled ? (
                    <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200 opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg`}>
                          {item.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">
                            {item.label}
                          </h3>
                          <p className="text-xs text-gray-600">
                            即将开放
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href} onClick={onClose}>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg`}
                          >
                            {item.emoji}
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                              {item.label}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {item.description}
                            </p>
                          </div>
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
            <div className="p-4 sm:p-6 bg-gradient-to-b from-transparent to-gray-50">
              <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                <p className="text-xs sm:text-sm text-gray-700 text-center">
                  💡 <span className="font-medium">提示：</span>
                  你可以随时返回商店查看销售情况。
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalTarget
  )
}

/**
 * 游戏功能菜单完整组件
 * 适用于不需要外部分离控制的场景
 */
export function GameFunctionMenu({ open: controlledOpen, onOpenChange }: GameFunctionMenuProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <>
      <GameFunctionMenuTrigger onClick={() => handleOpenChange(true)} />
      <GameFunctionMenuPanel open={isOpen} onClose={() => handleOpenChange(false)} />
    </>
  )
}

