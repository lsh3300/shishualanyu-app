'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 染坊场景环境组件
 * 
 * 设计理念：
 * - 不只是背景，而是"你正站在染坊中"的沉浸感
 * - 借鉴传统中国染坊的美学元素
 * - 昼夜变化、季节感、环境音效（未来）
 * 
 * 视觉层次：
 * 1. 远景：模糊的山水画
 * 2. 中景：染坊内部结构（梁柱、窗户）
 * 3. 近景：工作台、染缸、竹竿
 * 4. 前景：光影变化、飘浮的蒸汽
 */

interface DyeWorkshopSceneProps {
  children: React.ReactNode
  timeOfDay?: 'morning' | 'noon' | 'afternoon' | 'dusk'
}

export function DyeWorkshopScene({
  children,
  timeOfDay = 'afternoon',
}: DyeWorkshopSceneProps) {
  const [currentTime, setCurrentTime] = useState(timeOfDay)
  const [steamParticles, setSteamParticles] = useState<Array<{
    id: number
    x: number
    delay: number
  }>>([])

  /**
   * 初始化蒸汽粒子
   */
  useEffect(() => {
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      delay: Math.random() * 3,
    }))
    setSteamParticles(particles)
  }, [])

  /**
   * 根据时间段获取色调
   */
  const getTimeColors = () => {
    const timeColors = {
      morning: {
        sky: 'from-rose-100 via-orange-50 to-amber-50',
        ambient: 'rgba(255, 220, 180, 0.3)',
        shadow: 'rgba(100, 80, 150, 0.15)',
      },
      noon: {
        sky: 'from-sky-100 via-blue-50 to-slate-50',
        ambient: 'rgba(255, 255, 240, 0.4)',
        shadow: 'rgba(0, 0, 0, 0.2)',
      },
      afternoon: {
        sky: 'from-amber-100 via-yellow-50 to-orange-50',
        ambient: 'rgba(255, 240, 200, 0.35)',
        shadow: 'rgba(120, 80, 40, 0.18)',
      },
      dusk: {
        sky: 'from-indigo-200 via-purple-100 to-pink-100',
        ambient: 'rgba(200, 180, 255, 0.3)',
        shadow: 'rgba(60, 40, 100, 0.25)',
      },
    }
    return timeColors[currentTime]
  }

  const colors = getTimeColors()

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-stone-100">
      {/* 远景：山水画 */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ filter: 'blur(8px)' }}
        >
          {/* 远山剪影 */}
          <defs>
            <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* 第一层山 */}
          <path
            d="M0,400 Q200,300 400,350 T800,380 T1200,400 L1200,800 L0,800 Z"
            fill="url(#mountain-gradient)"
          />
          
          {/* 第二层山 */}
          <path
            d="M0,450 Q300,380 600,420 T1200,460 L1200,800 L0,800 Z"
            fill="url(#mountain-gradient)"
            opacity="0.6"
          />
          
          {/* 远处的云雾 */}
          <ellipse cx="300" cy="350" rx="150" ry="30" fill="#ffffff" opacity="0.3" />
          <ellipse cx="700" cy="380" rx="200" ry="40" fill="#ffffff" opacity="0.25" />
        </svg>
      </div>

      {/* 天空色调（根据时间变化）*/}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${colors.sky}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />

      {/* 环境光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.ambient}, transparent 60%)`,
        }}
      />

      {/* 中景：染坊结构 */}
      <div className="absolute inset-0 opacity-20">
        {/* 窗户框架 */}
        <div
          className="absolute top-0 right-1/4 w-64 h-80 border-8 border-amber-900 rounded-t-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)',
          }}
        >
          {/* 窗格 */}
          <div className="absolute inset-4 grid grid-cols-2 gap-4">
            <div className="border-2 border-amber-800 rounded" />
            <div className="border-2 border-amber-800 rounded" />
          </div>
        </div>

        {/* 木梁 */}
        <div
          className="absolute top-0 left-0 right-0 h-16"
          style={{
            background: 'linear-gradient(to bottom, #78350f, #92400e)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* 近景：工作台木纹 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern id="wood-grain" x="0" y="0" width="200" height="50" patternUnits="userSpaceOnUse">
              <rect width="200" height="50" fill="#d4a574" />
              <path
                d="M0,10 Q50,5 100,10 T200,10"
                stroke="#b8875a"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M0,25 Q50,22 100,25 T200,25"
                stroke="#b8875a"
                strokeWidth="0.5"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M0,40 Q50,38 100,40 T200,40"
                stroke="#9d6d3f"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wood-grain)" />
        </svg>
        
        {/* 木纹阴影 */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${colors.shadow}, transparent)`,
          }}
        />
      </div>

      {/* 前景：蒸汽粒子 */}
      <AnimatePresence>
        {steamParticles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute bottom-1/4 w-12 h-12 rounded-full blur-xl"
            initial={{ y: 0, opacity: 0, scale: 0.5 }}
            animate={{
              y: -300,
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.8],
              x: [0, Math.sin(particle.id) * 30, Math.cos(particle.id) * 20],
            }}
            transition={{
              duration: 8,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              left: `${particle.x}%`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* 光线穿过窗户的效果 */}
      <motion.div
        className="absolute top-20 right-1/4 w-64 h-96 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.ambient}, transparent)`,
          opacity: 0.5,
          filter: 'blur(30px)',
          transform: 'skewY(-20deg)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 主内容区域 */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {children}
      </div>

      {/* 前景：飘落的灰尘粒子（增加真实感）*/}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
            }}
            animate={{
              y: window.innerHeight + 20,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* 底部渐变遮罩（确保内容可读）*/}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)',
        }}
      />
    </div>
  )
}
