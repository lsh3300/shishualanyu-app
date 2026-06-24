"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type ImmersiveWelcomeProps = {
  mode?: "gate" | "route"
  onEnterApp?: () => void
  onSkip?: () => void
}

type Slide = {
  id: string
  title: string
  english: string
  line: string
  image: string
  imageAlt: string
  overlay: string
}

const slides: Slide[] = [
  {
    id: "slide-1",
    title: "染",
    english: "INDIGO",
    line: "从一抹蓝开始，先让画面把人带进去。",
    image: "/welcome/slide-01.jpg",
    imageAlt: "欢迎页第一张蓝染主题图片",
    overlay:
      "linear-gradient(180deg, rgba(6,10,18,0.02) 0%, rgba(7,11,19,0.04) 52%, rgba(5,10,18,0.10) 78%, rgba(5,10,18,0.16) 100%)",
  },
  {
    id: "slide-2",
    title: "纹",
    english: "PATTERN",
    line: "蓝与白之间，先感受图案和节奏。",
    image: "/welcome/slide-02.jpg",
    imageAlt: "欢迎页第二张蓝染主题图片",
    overlay:
      "linear-gradient(180deg, rgba(8,12,20,0.02) 0%, rgba(8,12,20,0.05) 52%, rgba(6,10,18,0.12) 78%, rgba(6,10,18,0.18) 100%)",
  },
  {
    id: "slide-3",
    title: "艺",
    english: "CRAFT",
    line: "课程、器物与故事，会在这里慢慢展开。",
    image: "/welcome/slide-03.jpg",
    imageAlt: "欢迎页第三张蓝染主题图片",
    overlay:
      "linear-gradient(180deg, rgba(8,12,20,0.02) 0%, rgba(8,12,20,0.05) 50%, rgba(8,12,20,0.12) 78%, rgba(8,12,20,0.18) 100%)",
  },
  {
    id: "slide-4",
    title: "入",
    english: "ENTER",
    line: "左右滑过四张图，再进入应用试试整体效果。",
    image: "/welcome/slide-04.jpg",
    imageAlt: "欢迎页第四张蓝染主题图片",
    overlay:
      "linear-gradient(180deg, rgba(8,12,20,0.02) 0%, rgba(8,12,20,0.04) 50%, rgba(8,12,20,0.10) 78%, rgba(8,12,20,0.16) 100%)",
  },
]

export function ImmersiveWelcome({
  mode = "gate",
  onEnterApp,
  onSkip,
}: ImmersiveWelcomeProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleEnterApp = useCallback(() => {
    if (mode === "gate") {
      onEnterApp?.()
    }
  }, [mode, onEnterApp])

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return

    const nextIndex = Math.max(0, Math.min(slides.length - 1, index))
    container.scrollTo({
      left: nextIndex * container.clientWidth,
      behavior: "smooth",
    })
    setActiveIndex(nextIndex)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onScroll = () => {
      const sectionWidth = container.clientWidth || 1
      const nextIndex = Math.round(container.scrollLeft / sectionWidth)
      setActiveIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)))
    }

    container.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => {
      container.removeEventListener("scroll", onScroll)
    }
  }, [])

  useEffect(() => {
    document.body.classList.add("welcome-immersive-active")
    return () => {
      document.body.classList.remove("welcome-immersive-active")
    }
  }, [])

  const finalPrimaryAction = useMemo(() => {
    if (mode === "gate") {
      return (
        <button
          type="button"
          onClick={handleEnterApp}
          className="welcome-enter-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#d6c5ac] bg-[rgba(252,246,238,0.88)] px-5 text-sm font-medium text-[#4f3f2f] shadow-[0_8px_24px_rgba(120,95,67,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-[rgba(248,239,228,0.96)]"
        >
          进入应用
        </button>
      )
    }

    return (
      <Link
        href="/"
        className="welcome-enter-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#d6c5ac] bg-[rgba(252,246,238,0.88)] px-5 text-sm font-medium text-[#4f3f2f] shadow-[0_8px_24px_rgba(120,95,67,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-[rgba(248,239,228,0.96)]"
      >
        进入应用
      </Link>
    )
  }, [handleEnterApp, mode])

  return (
    <div
      className="relative h-screen overflow-hidden bg-[#f6f2ea] text-white"
      style={{ fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif" }}
    >
      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="absolute right-4 top-5 z-30 text-[11px] tracking-[0.18em] text-white/46 transition-colors duration-300 hover:text-white/74 sm:right-6 sm:top-6"
        >
          跳过
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => {
          const isFinal = index === slides.length - 1

          return (
            <section
              key={slide.id}
              className="relative h-full w-full shrink-0 snap-start overflow-hidden"
              aria-label={`${slide.title} ${slide.english}`}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={index < 2}
                className={`object-cover object-center transition-transform duration-[1600ms] ease-out ${
                  index === activeIndex ? "scale-[1.015]" : "scale-100"
                } ${index === activeIndex ? "welcome-image-breathe" : ""}`}
                sizes="100vw"
              />

              <div className="absolute inset-0" style={{ background: slide.overlay }} />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_24%,transparent_72%,rgba(255,248,239,0.10)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(180deg,rgba(246,242,234,0)_0%,rgba(246,242,234,0.55)_34%,rgba(246,242,234,0.88)_68%,rgba(246,242,234,0.98)_100%)]" />

              <div className="relative flex h-full flex-col justify-end px-7 pb-[max(2.2rem,env(safe-area-inset-bottom)+1.5rem)] pt-[max(2.4rem,env(safe-area-inset-top)+1.1rem)]">
                <div className={`mx-auto mb-2 h-px w-8 bg-[rgba(165,133,76,0.62)] ${index === activeIndex ? "welcome-text-reveal" : "opacity-75"}`} />

                <div className={`mx-auto max-w-[16rem] text-center ${index === activeIndex ? "welcome-text-reveal" : "opacity-85"}`}>
                  <div className="mb-1 text-[11px] tracking-[0.32em] text-[#9f8356]">
                    {slide.english}
                  </div>
                  <h1 className="text-[3rem] font-medium leading-none text-[#4f3f2f] sm:text-[3.3rem]">
                    {slide.title}
                  </h1>
                  <p className="mt-3 text-[13px] leading-6 text-[#6c5f52]">
                    {slide.line}
                  </p>
                </div>

                {isFinal ? (
                  <div className={`mt-5 flex flex-col items-center gap-3 ${index === activeIndex ? "welcome-text-reveal" : ""}`}>
                    {finalPrimaryAction}
                    <div className="flex items-center gap-4 text-[12px] text-[#7b6c5d]">
                      <Link href="/teaching" className="transition-colors hover:text-[#4f3f2f]">
                        探索课程
                      </Link>
                      <span className="h-3.5 w-px bg-[#cabaa7]" />
                      <Link href="/store" className="transition-colors hover:text-[#4f3f2f]">
                        访问商城
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={`mt-4 flex items-center justify-center gap-2 text-[#927f67] ${index === activeIndex ? "welcome-text-reveal" : ""}`}>
                    <span className="text-[10px] tracking-[0.28em]">SWIPE</span>
                    <ChevronRight className="welcome-swipe-cue h-4 w-4" />
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {activeIndex > 0 ? (
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="absolute left-3 top-[44%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[rgba(248,244,236,0.72)] text-[#5f5145] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[rgba(248,244,236,0.92)] sm:flex"
          aria-label="上一张"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}

      {activeIndex < slides.length - 1 ? (
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute right-3 top-[44%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[rgba(248,244,236,0.72)] text-[#5f5145] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[rgba(248,244,236,0.92)] sm:flex"
          aria-label="下一张"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`block rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "h-[3px] w-8 bg-[#9f8356] shadow-[0_0_10px_rgba(159,131,86,0.28)]"
                : "h-[3px] w-3 bg-[#ccbda9] hover:bg-[#bca88b]"
            }`}
            aria-label={`切换到第 ${index + 1} 张`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 text-[10px] tracking-[0.24em] text-white/62 sm:top-7">
        SHISHUO LANYU
      </div>
    </div>
  )
}
