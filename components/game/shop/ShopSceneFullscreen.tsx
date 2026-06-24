'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, DollarSign, Plus, Edit3, Trash2, Star, Share2, Eye, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import type { ShopListing } from '@/types/shop.types'

interface ShopSceneFullscreenProps {
  listings?: ShopListing[]
  onFrameClick?: (index: number, listing?: ShopListing) => void
  onQuickAction?: (action: 'edit' | 'delete' | 'feature' | 'share', listing: ShopListing) => void
}

export function ShopSceneFullscreen({
  listings = [],
  onFrameClick,
  onQuickAction,
}: ShopSceneFullscreenProps) {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [quickMenuOpen, setQuickMenuOpen] = useState<{ index: number; listing: ShopListing } | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleFrameClick = (index: number, event: React.MouseEvent) => {
    const listing = listings[index - 1]
    setSelectedFrame(index)

    if (listing) {
      const rect = event.currentTarget.getBoundingClientRect()
      setMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
      setQuickMenuOpen({ index, listing })
      return
    }

    onFrameClick?.(index, listing)
  }

  const handleQuickAction = (action: 'edit' | 'delete' | 'feature' | 'share') => {
    if (!quickMenuOpen) return
    onQuickAction?.(action, quickMenuOpen.listing)
    setQuickMenuOpen(null)
  }

  const closeQuickMenu = () => {
    setQuickMenuOpen(null)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src="/game-assets/shop-bg.png"
            alt="商店场景"
            fill
            priority
            className="object-contain"
            style={{ objectPosition: 'center center' }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-amber-900/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10" />

      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
        className="absolute bottom-[18%] left-[6%] z-20 aspect-[2/3] w-[18%]"
      >
        <Image
          src="/game-assets/shop-owner.png"
          alt="店主"
          fill
          className="object-contain drop-shadow-2xl"
        />

        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-amber-300 bg-white/95 px-3 py-1.5 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                </motion.div>
                欢迎光临
              </div>
              <div className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pt-[5%]">
        <div className="flex w-full items-end justify-center gap-[3%] px-[12%]">
          {[1, 2, 3].map((index) => (
            <FrameItem
              key={index}
              index={index}
              listing={listings[index - 1]}
              isSelected={selectedFrame === index}
              onClick={(event) => handleFrameClick(index, event)}
              delay={0.3 + index * 0.1}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-[26%] right-3 max-w-[40vw] rounded-xl border border-amber-700/50 bg-amber-900/80 px-2.5 py-2 text-[11px] text-white shadow-lg backdrop-blur-md sm:right-4 sm:px-3 sm:text-xs"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
          <span>点击画框上架作品</span>
        </div>
      </motion.div>

      {typeof window !== 'undefined' && quickMenuOpen
        ? createPortal(
            <QuickActionMenu
              position={menuPosition}
              listing={quickMenuOpen.listing}
              onAction={handleQuickAction}
              onClose={closeQuickMenu}
            />,
            document.querySelector('.mobile-frame') || document.body,
          )
        : null}
    </div>
  )
}

interface FrameItemProps {
  index: number
  listing?: ShopListing
  isSelected: boolean
  onClick: (event: React.MouseEvent) => void
  delay: number
}

function FrameItem({ listing, isSelected, onClick, delay }: FrameItemProps) {
  const hasListing = Boolean(listing)
  const hasCloth = Boolean(listing?.cloth)
  const layers = listing?.cloth?.layers
  const hasLayers = Array.isArray(layers) && layers.length > 0

  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 12 }}
      onClick={onClick}
      className={`
        relative flex w-[28%] max-w-[120px] cursor-pointer flex-col items-center transition-all duration-300
        ${isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105 active:scale-95'}
      `}
    >
      <div
        className={`
          relative aspect-square w-full rounded-lg border-[5px] bg-white shadow-2xl transition-all duration-300
          ${isSelected ? 'border-yellow-400 shadow-yellow-400/50' : 'border-amber-800 hover:border-amber-600'}
        `}
      >
        <div className="absolute inset-1 overflow-hidden rounded bg-gradient-to-br from-gray-50 to-gray-100">
          {hasListing && hasCloth && hasLayers ? (
            <ClothPreview layers={layers} width={120} height={120} />
          ) : hasListing ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <span className="text-2xl">布</span>
              <span className="mt-0.5 text-[7px] text-red-400">图层缺失</span>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <motion.div
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Plus className="h-6 w-6 text-gray-300" />
              </motion.div>
              <span className="mt-0.5 text-[8px] text-gray-400">点击上架</span>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,69,19,0.2)_2px,rgba(139,69,19,0.2)_4px)] opacity-15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
        className="mt-1.5 flex min-w-[60px] items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-1 shadow-lg backdrop-blur-sm"
      >
        {hasListing ? (
          <>
            <div
              className={`
                rounded px-1 py-0.5 text-[8px] font-bold text-white
                ${listing?.cloth?.score_data?.grade === 'SSS' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  listing?.cloth?.score_data?.grade === 'SS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  listing?.cloth?.score_data?.grade === 'S' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  listing?.cloth?.score_data?.grade === 'A' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gray-400'}
              `}
            >
              {listing?.cloth?.score_data?.grade || 'C'}
            </div>
            <div className="flex items-center text-[10px] font-bold text-green-600">
              <DollarSign className="h-2.5 w-2.5" />
              {listing?.price}
            </div>
          </>
        ) : (
          <span className="text-[9px] text-gray-400">空位</span>
        )}
      </motion.div>

      {isSelected ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.4 }}
          className="absolute -inset-3 -z-10 rounded-2xl bg-yellow-300/40 blur-xl"
        />
      ) : null}
    </motion.div>
  )
}

interface QuickActionMenuProps {
  position: { x: number; y: number }
  listing: ShopListing
  onAction: (action: 'edit' | 'delete' | 'feature' | 'share') => void
  onClose: () => void
}

function QuickActionMenu({ position, listing, onAction, onClose }: QuickActionMenuProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.quick-menu')) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  const menuActions = [
    {
      id: 'edit' as const,
      icon: Edit3,
      label: '改价',
      color: 'from-blue-500 to-blue-600',
      description: `当前: ${listing.price} 币`,
    },
    {
      id: 'feature' as const,
      icon: Star,
      label: '推荐',
      color: 'from-yellow-500 to-orange-500',
      description: '设为精品',
    },
    {
      id: 'share' as const,
      icon: Share2,
      label: '分享',
      color: 'from-green-500 to-emerald-600',
      description: '分享作品',
    },
    {
      id: 'delete' as const,
      icon: Trash2,
      label: '下架',
      color: 'from-red-500 to-red-600',
      description: '移除商品',
    },
  ]

  const mobileFrame = document.querySelector('.mobile-frame')
  const isInMobileFrame = Boolean(mobileFrame)

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="quick-menu pointer-events-none z-[9999]"
      style={{
        position: isInMobileFrame ? 'absolute' : 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        maxWidth: 'min(320px, calc(100vw - 2rem))',
      }}
    >
      <div className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative pointer-events-auto">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-3 rounded-2xl border border-amber-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
              {listing.cloth?.layers && Array.isArray(listing.cloth.layers) && listing.cloth.layers.length > 0 ? (
                <ClothPreview layers={listing.cloth.layers} width={48} height={48} />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-lg">布</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div
                  className={`
                    rounded px-2 py-0.5 text-[10px] font-bold text-white
                    ${listing.cloth?.score_data?.grade === 'SSS' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      listing.cloth?.score_data?.grade === 'SS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      listing.cloth?.score_data?.grade === 'S' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      listing.cloth?.score_data?.grade === 'A' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gray-400'}
                  `}
                >
                  {listing.cloth?.score_data?.grade || 'C'}
                </div>
                <div className="flex items-center text-sm font-bold text-green-600">
                  <DollarSign className="h-3 w-3" />
                  {listing.price}
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div>今日浏览</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          {menuActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.05, type: 'spring', stiffness: 300 }}
              onClick={() => onAction(action.id)}
              className={`
                relative flex min-w-[72px] flex-col items-center gap-1 overflow-hidden rounded-xl bg-gradient-to-br p-2.5 text-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:min-w-[80px] sm:p-3
                ${action.color}
              `}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
              <span className="text-[9px] opacity-80">{action.description}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full" />
            </motion.button>
          ))}
        </div>

        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/95" />
      </div>
    </motion.div>
  )
}
