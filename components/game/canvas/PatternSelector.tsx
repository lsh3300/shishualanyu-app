'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PATTERN_LIBRARY } from '../patterns/PatternLibrary'

interface PatternSelectorProps {
  onSelectPattern: (patternId: string) => void
  selectedPatternId?: string | null
}

/**
 * 图案选择器（响应式+滚动支持）
 * 支持PC端滚轮、移动端触摸滑动
 */
export function PatternSelector({
  onSelectPattern,
  selectedPatternId
}: PatternSelectorProps) {
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 检查滚动状态
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // 滚动控制
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const scrollAmount = 200
    const newScrollLeft = direction === 'left'
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  // 自动滚动到选中项
  useEffect(() => {
    if (selectedPatternId && scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(`[data-pattern-id="${selectedPatternId}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [selectedPatternId])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollButtons()
    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [])

  return (
    <div className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-3 md:p-4">
      {/* 标题 */}
      <div className="mb-2 md:mb-3 text-center">
        <h3 className="text-sm font-semibold text-gray-700">选择图案</h3>
        <p className="text-xs text-gray-500 hidden sm:block">
          点击图案，然后在画布上放置 | 支持滚轮/滑动浏览
        </p>
        <p className="text-xs text-gray-500 sm:hidden">
          左右滑动选择图案
        </p>
      </div>

      {/* 滚动容器 */}
      <div className="relative group">
        {/* 左滚动按钮 - PC端显示 */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="
              hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 items-center justify-center
              bg-white/90 backdrop-blur-sm rounded-full shadow-lg
              hover:bg-white hover:scale-110 transition-all
              opacity-0 group-hover:opacity-100
            "
            aria-label="向左滚动"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* 右滚动按钮 - PC端显示 */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="
              hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 items-center justify-center
              bg-white/90 backdrop-blur-sm rounded-full shadow-lg
              hover:bg-white hover:scale-110 transition-all
              opacity-0 group-hover:opacity-100
            "
            aria-label="向右滚动"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* 图案列表 - 支持横向滚动 */}
        <div
          ref={scrollContainerRef}
          className="
            flex gap-2 md:gap-4 overflow-x-auto pb-2
            scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent
            snap-x snap-mandatory
            touch-pan-x
          "
          style={{
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {PATTERN_LIBRARY.map((pattern) => {
            const isSelected = selectedPatternId === pattern.id
            const isHovered = hoveredPattern === pattern.id
            const PatternComponent = pattern.component

            return (
              <motion.div
                key={pattern.id}
                data-pattern-id={pattern.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredPattern(pattern.id)}
                onHoverEnd={() => setHoveredPattern(null)}
                onClick={() => onSelectPattern(pattern.id)}
                className={`
                  relative cursor-pointer rounded-xl p-2 md:p-3 transition-all
                  flex-shrink-0 snap-center
                  ${isSelected 
                    ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md scale-105' 
                    : 'bg-white hover:bg-blue-50 hover:shadow-md'
                  }
                `}
              >
                {/* 图案预览 */}
                <div className="
                  w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                  flex items-center justify-center bg-white rounded-lg overflow-hidden
                ">
                  <div className="scale-[0.28] sm:scale-[0.35] md:scale-[0.4] origin-center">
                    <PatternComponent
                      color="#1E4D8B"
                      opacity={0.8}
                      scale={1}
                      rotation={0}
                    />
                  </div>
                </div>

                {/* 图案名称 */}
                <div className="mt-1 md:mt-2 text-center">
                  <div className="text-base sm:text-lg mb-0.5">{pattern.icon}</div>
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {pattern.name}
                  </div>
                </div>

                {/* 选中指示器 */}
                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* 悬停提示 - 仅PC端显示 */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
                      hidden md:block
                      absolute -top-12 left-1/2 -translate-x-1/2
                      bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg
                      whitespace-nowrap z-20
                    "
                  >
                    {pattern.description}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 提示文字 */}
      {selectedPatternId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 md:mt-3 text-center text-xs text-blue-600 font-medium"
        >
          ✨ 已选择 "{PATTERN_LIBRARY.find(p => p.id === selectedPatternId)?.name}"
          <span className="hidden sm:inline">，点击画布放置图案</span>
        </motion.div>
      )}

      {/* 移动端滚动提示 */}
      {!selectedPatternId && (
        <div className="mt-2 text-center text-xs text-gray-400 md:hidden flex items-center justify-center gap-1">
          <span>👈</span>
          <span>左右滑动查看更多</span>
          <span>👉</span>
        </div>
      )}
    </div>
  )
}
