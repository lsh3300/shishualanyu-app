"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface BannerItem {
  id: string
  title: string
  subtitle: string
  image: string
  href: string
}

interface BannerCarouselProps {
  items: BannerItem[]
}

export function BannerCarousel({ items }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // 重置自动播放计时器
  const resetAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
    autoplayRef.current = setInterval(() => {
      goToNext()
    }, 5000)
  }

  useEffect(() => {
    resetAutoplay()
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [currentIndex, items.length])

  const goToPrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    resetAutoplay()
    // 重置过渡状态
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    resetAutoplay()
    // 重置过渡状态
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    resetAutoplay()
    // 重置过渡状态
    setTimeout(() => setIsTransitioning(false), 500)
  }

  // 阻止事件冒泡的处理函数
  const handlePreviousClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevious();
  }

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNext();
  }

  return (
    <div className="relative h-72 md:h-80 rounded-xl overflow-hidden shadow-lg group my-2">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background -z-10" />
      
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <Link 
            key={item.id} 
            href={item.href} 
            prefetch={false}
            className="w-full h-full flex-shrink-0 relative group-hover:scale-[1.02] transition-transform duration-700 hover:shadow-xl"
          >
            <Image 
              src={item.image || "/placeholder.svg"} 
              alt={item.title} 
              fill 
              className="object-cover transition-transform duration-700 ease-out"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              quality={index === 0 ? 85 : 70}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            
            {/* 内容区域 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500 transform translate-y-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white tracking-tight animate-fadeIn">
                {item.title}
              </h3>
              <p className="text-base md:text-lg text-white/90 mb-4 max-w-lg animate-fadeIn animation-delay-200">
                {item.subtitle}
              </p>
              
              {/* 查看详情按钮 */}
              <div className="animate-fadeIn animation-delay-400">
                <Button className="bg-white text-primary hover:bg-white/90 transition-all group rounded-full px-6 py-2 shadow-md hover:shadow-lg">
                  查看详情
                  <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 左右导航按钮 - 仅在悬停时显示 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-none shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto"
          onClick={handlePreviousClick}
          aria-label="上一张"
        >
          <ChevronLeft className="h-5 w-5 transition-transform duration-300 hover:scale-125" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-none shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto"
          onClick={handleNextClick}
          aria-label="下一张"
        >
          <ChevronRight className="h-5 w-5 transition-transform duration-300 hover:scale-125" />
        </Button>
      </div>

      {/* 指示器 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white w-8 shadow-md" : "bg-white/50 hover:bg-white/70"}`}
            onClick={() => goToSlide(index)}
            aria-label={`前往幻灯片 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
