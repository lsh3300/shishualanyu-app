'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * 3D染缸组件
 * 
 * 突破性设计：
 * - 不是按钮，而是真实的"染缸"
 * - 可以看到液体、闻到气味（视觉暗示）
 * - 悬停时勺子"舀起"染料
 * - 点击时染料"飞溅"到画布
 * 
 * 灵感：
 * - 真实染坊中用木勺舀染料的动作
 * - 液体的流动性和光泽感
 * - 蓝染特有的深邃颜色
 */

interface DyeVatProps {
  color: {
    name: string
    value: string
    hsl: [number, number, number]
    description: string
  }
  selected: boolean
  onSelect: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function DyeVat({
  color,
  selected,
  onSelect,
  size = 'md',
}: DyeVatProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isScooping, setIsScooping] = useState(false)

  const sizes = {
    sm: { width: 80, height: 100 },
    md: { width: 100, height: 120 },
    lg: { width: 120, height: 140 },
  }

  const { width, height } = sizes[size]

  /**
   * 点击动画
   */
  const handleClick = () => {
    setIsScooping(true)
    setTimeout(() => {
      onSelect()
      setIsScooping(false)
    }, 600)
  }

  /**
   * 获取液体颜色的深浅变化
   */
  const getLiquidGradient = () => {
    const [h, s, l] = color.hsl
    return {
      top: `hsl(${h}, ${s}%, ${Math.min(l + 10, 90)}%)`,
      middle: color.value,
      bottom: `hsl(${h}, ${s}%, ${Math.max(l - 15, 10)}%)`,
      shadow: `hsl(${h}, ${s}%, ${Math.max(l - 25, 5)}%)`,
    }
  }

  const liquidColors = getLiquidGradient()

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{
        width: width,
        height: height,
        perspective: '600px',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 木桶容器 */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateX: isHovering ? -5 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 木桶主体 */}
        <div
          className="relative w-full h-full rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #6d4c41 0%, #4e342e 100%)',
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.2),
              inset 0 -2px 8px rgba(0,0,0,0.4),
              0 8px 16px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* 木纹纹理 */}
          <div className="absolute inset-0 opacity-30 rounded-lg overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-1"
                style={{
                  top: `${i * 15}%`,
                  background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent)',
                }}
              />
            ))}
          </div>

          {/* 木桶边缘加固环 */}
          <div
            className="absolute top-2 left-0 right-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, #3e2723, #1b0000)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
          <div
            className="absolute bottom-2 left-0 right-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, #3e2723, #1b0000)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          />

          {/* 液体层 */}
          <motion.div
            className="absolute left-2 right-2 bottom-3 rounded-b-lg overflow-hidden"
            style={{
              height: '65%',
              background: `linear-gradient(180deg, 
                ${liquidColors.top} 0%,
                ${liquidColors.middle} 30%,
                ${liquidColors.bottom} 80%,
                ${liquidColors.shadow} 100%
              )`,
              boxShadow: `
                inset 0 2px 8px rgba(0,0,0,0.4),
                inset 0 -2px 4px rgba(255,255,255,0.1)
              `,
            }}
            animate={{
              height: isScooping ? '60%' : '65%',
            }}
            transition={{ duration: 0.3 }}
          >
            {/* 液体表面波纹 */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-4"
              style={{
                background: `radial-gradient(ellipse at center, 
                  rgba(255,255,255,0.4) 0%, 
                  transparent 70%
                )`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* 液体光泽 */}
            <div
              className="absolute top-2 left-1/4 w-1/2 h-8"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
                filter: 'blur(4px)',
                borderRadius: '50%',
              }}
            />

            {/* 气泡效果 */}
            {isHovering && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white opacity-50"
                    initial={{
                      bottom: 0,
                      left: `${30 + i * 20}%`,
                    }}
                    animate={{
                      bottom: '100%',
                      scale: [0.5, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* 木桶内壁阴影 */}
          <div
            className="absolute inset-2 pointer-events-none rounded-lg"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* 舀染料的勺子（悬停时出现）*/}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              initial={{ y: -20, opacity: 0, rotateZ: -30 }}
              animate={{
                y: isScooping ? -15 : 0,
                opacity: 1,
                rotateZ: isScooping ? 0 : -10,
              }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 勺柄 */}
              <div
                className="w-1 h-12 rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, #8d6e63, #5d4037)',
                  boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
                }}
              />
              
              {/* 勺子 */}
              <div
                className="absolute -bottom-1 -left-3 w-8 h-6 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #bcaaa4, #8d6e63)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {/* 勺子里的染料 */}
                {isScooping && (
                  <motion.div
                    className="absolute inset-1 rounded-full"
                    style={{
                      background: liquidColors.middle,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 飞溅效果（点击时）*/}
        <AnimatePresence>
          {isScooping && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: liquidColors.middle,
                  }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 100,
                    y: -(Math.random() * 80 + 40),
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 染缸底座阴影 */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 rounded-full blur-sm"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.4), transparent)',
        }}
      />

      {/* 颜色名称标签 */}
      <motion.div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
        animate={{
          y: selected ? -5 : 0,
          scale: selected ? 1.1 : 1,
        }}
      >
        <div className={`text-center ${selected ? 'font-bold' : ''}`}>
          <p className="text-sm">{color.name}</p>
          {(isHovering || selected) && (
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {color.description}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* 选中指示器 */}
      {selected && (
        <motion.div
          className="absolute -inset-4 border-4 border-indigo-500 rounded-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          style={{
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
          }}
        />
      )}

      {/* 蒸汽效果 */}
      {(isHovering || selected) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full h-8 pointer-events-none overflow-visible">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full blur-md"
              style={{
                left: `${30 + i * 15}%`,
                background: 'rgba(255,255,255,0.6)',
              }}
              animate={{
                y: [-10, -40],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

/**
 * 导入AnimatePresence
 */
import { AnimatePresence } from 'framer-motion'
