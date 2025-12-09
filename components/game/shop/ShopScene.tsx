'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ShoppingBag } from 'lucide-react'

/**
 * 商店场景组件
 * 参考设计优化：背景占据更大空间，更沉浸的体验
 */
export function ShopScene() {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 场景容器 - 使用aspect-ratio保持16:9比例 */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-amber-50 to-orange-50">
        
        {/* 商店背景图片 - 全覆盖 */}
        <div className="absolute inset-0">
          <Image
            src="/game-assets/商店背景.png"
            alt="商店场景"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 半透明遮罩层，增强文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* 角色形象 - 左下角，响应式尺寸 */}
        <motion.div
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="absolute bottom-[2%] left-[2%] z-20 w-[18%] max-w-[260px] aspect-[2/3]"
        >
          <Image
            src="/game-assets/卡通人物01无背景.png"
            alt="店主"
            fill
            className="object-contain drop-shadow-2xl"
          />
          
          {/* 欢迎气泡 - 响应式大小 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
            className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 bg-white rounded-xl md:rounded-2xl px-3 py-1.5 md:px-6 md:py-3 shadow-2xl border-2 md:border-3 border-blue-300 whitespace-nowrap"
          >
            <div className="text-sm md:text-lg font-bold text-gray-800 flex items-center gap-1 md:gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </motion.div>
              欢迎光临！
            </div>
            {/* 气泡尾巴 */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white" />
          </motion.div>
        </motion.div>

        {/* 作品展示区 - 画框占位符 */}
        <div className="absolute inset-0 flex items-center justify-center gap-[3%] px-[8%] md:px-[12%]">
          {/* 画框1 */}
          <FramePlaceholder 
            index={1}
            isSelected={selectedFrame === 1}
            onClick={() => setSelectedFrame(1)}
            delay={0.4}
          />

          {/* 画框2 */}
          <FramePlaceholder 
            index={2}
            isSelected={selectedFrame === 2}
            onClick={() => setSelectedFrame(2)}
            delay={0.5}
          />

          {/* 画框3 */}
          <FramePlaceholder 
            index={3}
            isSelected={selectedFrame === 3}
            onClick={() => setSelectedFrame(3)}
            delay={0.6}
          />
        </div>

        {/* 右下角提示 - 响应式半透明 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-3 right-3 md:bottom-6 md:right-6 bg-black/70 backdrop-blur-md rounded-lg md:rounded-xl px-3 py-2 md:px-5 md:py-3 text-white text-xs md:text-sm flex items-center gap-1 md:gap-2 shadow-lg"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
          <span className="font-medium">点击画框上架</span>
        </motion.div>
      </div>

      {/* 底部提示条 - 紧凑设计 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 md:p-3 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600">
          <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
          <span className="font-medium hidden sm:inline">这是你的蓝染商店，展示作品吸引游客购买</span>
          <span className="font-medium sm:hidden">蓝染商店</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 画框占位符组件 - 优化版
 */
interface FramePlaceholderProps {
  index: number
  isSelected: boolean
  onClick: () => void
  delay: number
}

function FramePlaceholder({ index, isSelected, onClick, delay }: FramePlaceholderProps) {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, rotate: -5 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 12 }}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        w-[20%] max-w-[180px] aspect-square
        ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}
      `}
    >
      {/* 画框外框 - 响应式边框粗细 */}
      <div 
        className={`
          absolute inset-0 rounded-lg border-[6px] md:border-[10px] bg-white shadow-2xl
          transition-all duration-300
          ${isSelected 
            ? 'border-yellow-400 shadow-yellow-400/60 shadow-2xl' 
            : 'border-amber-900 hover:border-amber-700'
          }
        `}
      >
        {/* 内部占位内容 */}
        <div className="absolute inset-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex flex-col items-center justify-center gap-1 md:gap-3 border-2 border-gray-200">
          <motion.div
            animate={{ 
              scale: isSelected ? [1, 1.2, 1] : 1 
            }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl"
          >
            🖼️
          </motion.div>
          <div className="text-xs md:text-sm font-bold text-gray-700">
            画框 {index}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 text-center px-2">
            {isSelected ? '已选中' : '暂无作品'}
          </div>
        </div>

        {/* 木纹纹理效果（模拟） */}
        <div className="absolute inset-0 rounded-lg opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,69,19,0.1)_2px,rgba(139,69,19,0.1)_4px)]" />
      </div>

      {/* 选中时的光效 - 更强烈 */}
      {isSelected && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.6 }}
            className="absolute -inset-6 bg-yellow-300/40 rounded-2xl blur-2xl -z-10"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-4 bg-yellow-400/30 rounded-xl blur-xl -z-10"
          />
        </>
      )}

      {/* 悬停提示 */}
      {!isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium shadow-lg">
            点击选择
          </div>
        </div>
      )}
    </motion.div>
  )
}
