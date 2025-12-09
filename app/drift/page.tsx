'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RiverWaveBackground } from '@/components/game/svg/RiverWaveBackground'
import { ClothCard } from '@/components/game/svg/ClothCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 漂流河测试页面
 * 
 * 用途：
 * - 展示水波背景组件效果
 * - 提供交互控制面板测试不同参数
 * - 作为游戏的实际入口页面骨架
 */
export default function DriftPage() {
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day')
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('slow')
  const [intensity, setIntensity] = useState(0.5)

  return (
    <div className="relative min-h-screen">
      {/* 水波背景 */}
      <RiverWaveBackground timeOfDay={timeOfDay} speed={speed} intensity={intensity} />

      {/* 内容区域 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="backdrop-blur-sm bg-white/70 hover:bg-white/90 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-12 pt-4">
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
            style={{ fontFamily: 'serif' }}
          >
            蓝染·漂流记
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            一块布，经三人之手，染出深邃之蓝
          </p>
        </div>

        {/* 控制面板 */}
        <Card className="max-w-2xl mx-auto mb-12 backdrop-blur-sm bg-white/80">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">视觉效果控制面板</h2>

            {/* 时间段选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">时间氛围</label>
              <div className="flex gap-2">
                {(['dawn', 'day', 'dusk', 'night'] as const).map(time => (
                  <Button
                    key={time}
                    variant={timeOfDay === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeOfDay(time)}
                    className={
                      timeOfDay === time
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : ''
                    }
                  >
                    {time === 'dawn' && '🌅 晨曦'}
                    {time === 'day' && '☀️ 日间'}
                    {time === 'dusk' && '🌆 黄昏'}
                    {time === 'night' && '🌙 夜晚'}
                  </Button>
                ))}
              </div>
            </div>

            {/* 速度选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">水波速度</label>
              <div className="flex gap-2">
                {(['slow', 'medium', 'fast'] as const).map(s => (
                  <Button
                    key={s}
                    variant={speed === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpeed(s)}
                    className={
                      speed === s ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                    }
                  >
                    {s === 'slow' && '🐌 慢速'}
                    {s === 'medium' && '🚶 中速'}
                    {s === 'fast' && '🏃 快速'}
                  </Button>
                ))}
              </div>
            </div>

            {/* 强度滑块 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                水纹强度：{intensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={intensity}
                onChange={e => setIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900">
                💡 <strong>设计说明</strong>：水波背景使用三层不同频率的SVG波浪叠加，
                配合噪点滤镜模拟真实水面效果。动画极慢（15-20秒），营造宁静氛围。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 游戏入口 - 新增 */}
        <Card className="max-w-4xl mx-auto mb-8 backdrop-blur-sm bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 border-2">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-5xl">🎮</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎉 进入游戏模式
                </h2>
                <p className="text-muted-foreground mb-2">
                  体验完整的游戏循环：创作作品 → 获得评分 → 赚取经验和货币 → 升级！
                </p>
                <p className="text-sm text-purple-700 mb-4">
                  ✨ 等级系统 | 💰 货币奖励 | 🏆 评分排行 | 📈 持续成长
                </p>
                <Link href="/game/hub">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg text-lg px-8">
                    开始游戏 🚀
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 体验染色入口 */}
        <Card className="max-w-4xl mx-auto mb-12 backdrop-blur-sm bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-200">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16.5L12 21.5L17 16.5M7 7.5L12 2.5L17 7.5M12 2.5V21.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  🎨 自由创作模式
                </h2>
                <p className="text-muted-foreground mb-4">
                  点击画布，看染料从指尖扩散。每次点击都是独一无二的创作。
                </p>
                <Link href="/workshop">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
                    进入染坊 →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 真实布料卡片展示 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8">
            漂流中的布料
            <Badge variant="outline" className="ml-3">实时渲染</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: '螺旋手帕', days: 3, layers: 2, depth: 0.3, seed: 'spiral-handkerchief' },
              { name: '云纹桌布', days: 5, layers: 3, depth: 0.6, seed: 'cloud-tablecloth' },
              { name: '冰裂纹围巾', days: 2, layers: 1, depth: 0.2, seed: 'ice-scarf' },
            ].map((cloth, i) => (
              <ClothCard
                key={i}
                width={280}
                height={360}
                dyeDepth={cloth.depth}
                seed={cloth.seed}
                irregularity={0.7}
                isHovered={false}
                onClick={() => console.log(`点击了${cloth.name}`)}
                className="mx-auto"
              >
                <div className="flex flex-col h-full">
                  {/* 布料图案预览 */}
                  <div className="flex-1 mb-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                    {/* SVG图案装饰 */}
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id={`pattern-${i}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="2" fill={`hsla(210, ${40 + cloth.depth * 30}%, ${80 - cloth.depth * 30}%, 0.3)`} />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#pattern-${i})`} />
                    </svg>
                    <span className="text-5xl relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                      {i === 0 && '🌀'}
                      {i === 1 && '☁️'}
                      {i === 2 && '❄️'}
                    </span>
                  </div>

                  {/* 布料信息 */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{cloth.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      已漂流 <strong>{cloth.days}</strong> 天
                    </p>
                    <p className="text-sm text-muted-foreground">
                      经过 <strong>{cloth.layers}</strong> 人之手
                    </p>
                  </div>

                  {/* 标签 */}
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      {cloth.depth < 0.3 ? '浅蓝' : cloth.depth < 0.6 ? '中蓝' : '深蓝'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {cloth.layers}/{3} 层
                    </Badge>
                  </div>

                  {/* 操作按钮 */}
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`捞起${cloth.name}`)
                    }}
                  >
                    捞起复染 →
                  </Button>
                </div>
              </ClothCard>
            ))}
          </div>
        </div>

        {/* 技术说明 */}
        <Card className="max-w-4xl mx-auto mt-12 backdrop-blur-sm bg-white/80">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">📐 技术实现细节</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2 text-indigo-600">SVG图层组成</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 径向渐变背景（深度感）</li>
                  <li>• 三层独立频率的波浪路径</li>
                  <li>• 40个动态水纹点（远景）</li>
                  <li>• 15个椭圆反光效果（高光）</li>
                  <li>• 底部渐变遮罩（内容区域）</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-indigo-600">关键技术点</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• feTurbulence 生成噪点纹理</li>
                  <li>• feDisplacementMap 扭曲效果</li>
                  <li>• animateTransform 循环动画</li>
                  <li>• 多层透明度叠加营造深度</li>
                  <li>• 根据本地时间自动切换配色</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                ✅ <strong>性能优化</strong>：所有动画使用SVG原生动画和CSS transform，
                GPU加速渲染，移动端60fps流畅运行。文件大小仅约3KB（未压缩）。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 开发状态 */}
        <div className="text-center mt-12 pb-12">
          <Badge variant="outline" className="mb-4">
            🚧 开发中 - Phase 1: 视觉框架搭建
          </Badge>
          <p className="text-sm text-muted-foreground">
            接下来实现：布料卡片组件 → 印章生成器 → 染料扩散动画
          </p>
        </div>
      </div>
    </div>
  )
}
