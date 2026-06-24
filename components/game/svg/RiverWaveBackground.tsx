'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DawnRiverBackground } from '@/components/game/background/DawnRiverBackground'
import { DayRiverBackground } from '@/components/game/background/DayRiverBackground'
import { DuskRiverBackground } from '@/components/game/background/DuskRiverBackground'
import { NightRiverBackground } from '@/components/game/background/NightRiverBackground'

/**
 * 智能四时漂流河背景组件
 * 
 * 设计理念：
 * - 根据时段自动切换完全不同的背景设计
 * - 每个时段都是独立的艺术作品
 * - 平滑过渡动画
 * 
 * 时段划分：
 * - 晨曦 (5:00-8:00): 太阳升起、晨雾、露珠
 * - 日间 (8:00-17:00): 蓝天白云、波光粼粼
 * - 黄昏 (17:00-20:00): 夕阳、远山、归鸟
 * - 夜晚 (20:00-5:00): 月亮、星河、萤火虫
 */
export function RiverWaveBackground({
  speed = 'slow',
  timeOfDay,
  intensity = 0.5,
}: {
  speed?: 'slow' | 'medium' | 'fast'
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night'
  intensity?: number
}) {
  // 自动检测当前时间段
  const [autoTimeOfDay, setAutoTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day')

  useEffect(() => {
    if (timeOfDay) return // 如果手动指定，则不自动检测

    const hour = new Date().getHours()
    if (hour >= 5 && hour < 8) setAutoTimeOfDay('dawn')
    else if (hour >= 8 && hour < 17) setAutoTimeOfDay('day')
    else if (hour >= 17 && hour < 20) setAutoTimeOfDay('dusk')
    else setAutoTimeOfDay('night')
  }, [timeOfDay])

  const currentTimeOfDay = timeOfDay || autoTimeOfDay

  // 渲染对应时段的背景
  const renderBackground = () => {
    const commonProps = { speed, intensity }

    switch (currentTimeOfDay) {
      case 'dawn':
        return <DawnRiverBackground {...commonProps} />
      case 'day':
        return <DayRiverBackground {...commonProps} />
      case 'dusk':
        return <DuskRiverBackground {...commonProps} />
      case 'night':
        return <NightRiverBackground {...commonProps} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTimeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 3 }}
        className="fixed inset-0 -z-10"
      >
        {renderBackground()}
      </motion.div>
    </AnimatePresence>
  )
}
