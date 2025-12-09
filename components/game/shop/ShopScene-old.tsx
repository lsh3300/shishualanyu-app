'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ShoppingBag } from 'lucide-react'

/**
 * 商店场景组件
 * 展示商店背景、角色和作品展示区
 */
export function ShopScene() {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-200">
      {/* 场景容器 */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-amber-50 to-orange-50">
        
        {/* 商店背景图片 */}
        <div className="absolute inset-0">
          <Image
            src="/game-assets/商店背景.png"
            alt="商店场景"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 角色形象 - 左下角 */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute bottom-0 left-8 z-20"
          style={{ width: '180px', height: '270px' }}
        >
          <Image
            src="/game-assets/卡通人物01无背景.png"
            alt="店主"
            fill
            className="object-contain drop-shadow-2xl"
          />
          
          {/* 欢迎气泡 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-blue-200 whitespace-nowrap"
          >
            <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              欢迎光临！
            </div>
            {/* 气泡尾巴 */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
          </motion.div>
        </motion.div>

        {/* 作品展示区 - 画框占位符 */}
        <div className="absolute inset-0 flex items-center justify-center gap-8 px-20">
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

        {/* 底部提示文字 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm"
        >
          💡 点击画框查看作品详情
        </motion.div>
      </div>

      {/* 场景说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              这是你的蓝染商店，游客可以在这里购买你的作品
            </span>
          </div>
          <div className="text-xs text-gray-500">
            点击上方"从背包上架"可以添加作品
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 画框占位符组件
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
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring' }}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}
      `}
      style={{ width: '160px', height: '200px' }}
    >
      {/* 画框外框 */}
      <div 
        className={`
          absolute inset-0 rounded-lg border-8 bg-white shadow-xl
          transition-all duration-300
          ${isSelected 
            ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' 
            : 'border-amber-800 hover:border-amber-600'
          }
        `}
      >
        {/* 内部占位内容 */}
        <div className="absolute inset-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex flex-col items-center justify-center gap-3">
          <div className="text-4xl">🖼️</div>
          <div className="text-xs font-medium text-gray-600">
            画框 {index}
          </div>
          <div className="text-xs text-gray-500">
            暂无作品
          </div>
        </div>
      </div>

      {/* 选中时的光效 */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -inset-4 bg-yellow-400/20 rounded-xl blur-xl -z-10"
        />
      )}

      {/* 悬停提示 */}
      {!isSelected && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            点击查看
          </div>
        </div>
      )}
    </motion.div>
  )
}
