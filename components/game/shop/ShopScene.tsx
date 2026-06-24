'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ShoppingBag, DollarSign } from 'lucide-react'
import { ShopListing } from '@/types/shop.types'
import { ClothPreview } from '@/components/game/preview/ClothPreview'

/**
 * 商店场景组件
 * 参考设计优化：背景占据更大空间，更沉浸的体验
 */
interface ShopSceneProps {
  listings?: ShopListing[]
}

export function ShopScene({ listings = [] }: ShopSceneProps) {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)
  
  // 调试日志
  console.log('🏪 ShopScene listings:', listings)
  if (listings.length > 0) {
    console.log('🖼️ 第一个listing:', listings[0])
    console.log('🎨 cloth数据:', listings[0]?.cloth)
    console.log('🎨 layers数据:', listings[0]?.cloth?.layers)
    console.log('🎨 layers类型:', typeof listings[0]?.cloth?.layers)
    console.log('🎨 layers是数组?:', Array.isArray(listings[0]?.cloth?.layers))
    console.log('🎨 layers长度:', listings[0]?.cloth?.layers?.length)
  }

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
            listing={listings[0]}
          />

          {/* 画框2 */}
          <FramePlaceholder 
            index={2}
            isSelected={selectedFrame === 2}
            onClick={() => setSelectedFrame(2)}
            delay={0.5}
            listing={listings[1]}
          />

          {/* 画框3 */}
          <FramePlaceholder 
            index={3}
            isSelected={selectedFrame === 3}
            onClick={() => setSelectedFrame(3)}
            delay={0.6}
            listing={listings[2]}
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
  listing?: ShopListing
}

function FramePlaceholder({ index, isSelected, onClick, delay, listing }: FramePlaceholderProps) {
  // 调试日志
  const hasListing = !!listing
  const hasCloth = !!listing?.cloth
  const layers = listing?.cloth?.layers
  const hasLayers = Array.isArray(layers) && layers.length > 0
  
  console.log(`🖼️ 画框${index}:`, { hasListing, hasCloth, hasLayers, layersCount: layers?.length })
  
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, rotate: -5 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 12 }}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        w-[20%] max-w-[180px] flex flex-col items-center
        ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}
      `}
    >
      {/* 画框 - 正方形 */}
      <div 
        className={`
          relative w-full aspect-square rounded-lg border-[6px] md:border-[10px] bg-white shadow-2xl
          transition-all duration-300
          ${isSelected 
            ? 'border-yellow-400 shadow-yellow-400/60 shadow-2xl' 
            : 'border-amber-900 hover:border-amber-700'
          }
        `}
      >
        {/* 内部内容 - 作品填满整个画框 */}
        <div className="absolute inset-1 rounded overflow-hidden">
          {hasListing && hasCloth && hasLayers ? (
            // 有作品且有图层数据 - 作品填满整个画框
            <ClothPreview
              layers={layers}
              width={200}
              height={200}
            />
          ) : hasListing ? (
            // 有上架但没有图层数据
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="text-2xl md:text-4xl">🎨</div>
              <div className="text-[8px] text-red-400 mt-1">
                (图层缺失)
              </div>
            </div>
          ) : (
            // 无作品
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <motion.div
                animate={{ 
                  scale: isSelected ? [1, 1.2, 1] : 1 
                }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-4xl"
              >
                🖼️
              </motion.div>
              <div className="text-[10px] md:text-xs text-gray-500 mt-1">
                {isSelected ? '已选中' : '空'}
              </div>
            </div>
          )}
        </div>

        {/* 木纹纹理效果 */}
        <div className="absolute inset-0 rounded-lg opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,69,19,0.1)_2px,rgba(139,69,19,0.1)_4px)] pointer-events-none" />
      </div>

      {/* 画框下方的信息卡片 - 所有画框都显示 */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
        className="mt-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 flex items-center justify-center gap-2 min-w-[80px]"
      >
        {hasListing ? (
          <>
            {/* 等级徽章 */}
            <div className={`
              px-2 py-0.5 rounded text-xs font-bold text-white
              ${listing.cloth?.score_data?.grade === 'SSS' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                listing.cloth?.score_data?.grade === 'SS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                listing.cloth?.score_data?.grade === 'S' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                listing.cloth?.score_data?.grade === 'A' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                listing.cloth?.score_data?.grade === 'B' ? 'bg-gray-500' :
                'bg-gray-400'}
            `}>
              {listing.cloth?.score_data?.grade || 'C'}
            </div>
            {/* 价格 */}
            <div className="text-xs md:text-sm text-green-600 font-bold flex items-center">
              <DollarSign className="w-3 h-3" />
              {listing.price}
            </div>
          </>
        ) : (
          // 空画框显示"点击上架"
          <div className="text-[10px] md:text-xs text-gray-400 font-medium">
            点击上架
          </div>
        )}
      </motion.div>

      {/* 选中时的光效 */}
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
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 bg-yellow-400/30 rounded-xl blur-xl -z-10"
          />
        </>
      )}

      {/* 悬停提示 */}
      {!isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium shadow-lg">
            {listing ? '查看详情' : '点击选择'}
          </div>
        </div>
      )}
    </motion.div>
  )
}
