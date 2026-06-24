'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Droplet, Brush, Wand2, Sparkles, Layers } from 'lucide-react'
import { DyeCanvas } from '@/components/game/canvas/DyeCanvas'
import { DyeBrushCanvas } from '@/components/game/canvas/DyeBrushCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 染坊创作页
 *
 * 功能：
 * - 两种染色模式：点染 / 画笔
 * - 实时切换，同一画布创作
 * - 颜色选择
 * - 作品预览与下载
 */
export default function WorkshopPage() {
  const [dyeMode, setDyeMode] = useState<'click' | 'brush'>('click')
  const [selectedColor, setSelectedColor] = useState('hsl(210, 70%, 50%)')
  const [showPreview, setShowPreview] = useState(false)
  const [completedWork, setCompletedWork] = useState<string | null>(null)

  // 蓝染色谱
  const colorPalette = [
    { name: '月白', value: 'hsl(210, 30%, 88%)', desc: '最浅的蓝' },
    { name: '缥色', value: 'hsl(210, 50%, 75%)', desc: '淡雅浅蓝' },
    { name: '天青', value: 'hsl(210, 60%, 60%)', desc: '明快中蓝' },
    { name: '靛蓝', value: 'hsl(210, 70%, 50%)', desc: '标准深蓝' },
    { name: '绀色', value: 'hsl(210, 80%, 35%)', desc: '深邃浓蓝' },
    { name: '藏青', value: 'hsl(210, 85%, 25%)', desc: '最深的蓝' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50 pb-20">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/game/hub">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">返回游戏大厅</span>
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                云端染坊
              </h1>
              <p className="text-xs text-muted-foreground">创造你的蓝染艺术</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/workshop/advanced">
                <Button size="sm" variant="outline" className="gap-1">
                  <Layers className="h-3 w-3" />
                  <span className="hidden sm:inline">高级模式</span>
                </Button>
              </Link>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Beta
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 沉浸式体验推荐 */}
        <Card className="mb-8 border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      全新沉浸式体验
                    </h2>
                    <p className="text-xs text-muted-foreground">Immersive Workshop Experience</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  不只是点击工具，而是把染布过程做成更完整的体验。你可以进入沉浸式场景，感受布料、色彩与工艺细节的变化。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-white/50">3D 视角</Badge>
                  <Badge variant="outline" className="bg-white/50">真实交互</Badge>
                  <Badge variant="outline" className="bg-white/50">沉浸场景</Badge>
                  <Badge variant="outline" className="bg-white/50">艺术体验</Badge>
                </div>
                <Link href="/workshop/immersive">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg">
                    立即体验
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 opacity-20 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 模式介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card 
            className={`cursor-pointer transition-all ${
              dyeMode === 'click' 
                ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setDyeMode('click')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">点染模式</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    点击画布后，染料会从落点向外自然扩散
                  </p>
                  <div className="flex gap-1 text-xs">
                    <Badge variant="secondary">径向扩散</Badge>
                    <Badge variant="secondary">自然叠加</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              dyeMode === 'brush' 
                ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setDyeMode('brush')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Brush className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">画笔模式</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    拖动画笔，在布面上绘制更细致的染色轨迹
                  </p>
                  <div className="flex gap-1 text-xs">
                    <Badge variant="secondary">压感模拟</Badge>
                    <Badge variant="secondary">4 种画笔</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：颜色选择 */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold">染料颜色</h3>
                </div>
                
                <div className="space-y-2">
                  {colorPalette.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedColor === color.value
                          ? 'border-indigo-500 bg-indigo-50 scale-105'
                          : 'border-gray-200 hover:border-indigo-300 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{color.name}</p>
                          <p className="text-xs text-muted-foreground">{color.desc}</p>
                        </div>
                        {selectedColor === color.value && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 技巧提示 */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>🎨</span>
                  <span>染色技巧</span>
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {dyeMode === 'click' ? (
                    <>
                      <li>多次点击同一区域，可以逐步加深颜色。</li>
                      <li>不同落点会形成更自然的纹样中心。</li>
                      <li>尝试叠加不同色阶，能做出更丰富的层次。</li>
                    </>
                  ) : (
                    <>
                      <li>移动越慢，颜色通常会更浓。</li>
                      <li>不同画笔会产生不同的边缘质感。</li>
                      <li>细笔适合勾勒，宽笔更适合铺色。</li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：工作区 */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                {dyeMode === 'click' ? (
                  <DyeCanvas
                    width={600}
                    height={600}
                    dyeColor={selectedColor}
                    onDyeComplete={imageData => {
                      setCompletedWork(imageData)
                      setShowPreview(true)
                    }}
                  />
                ) : (
                  <DyeBrushCanvas
                    width={600}
                    height={600}
                    defaultColor={selectedColor}
                    onStrokeComplete={strokes => {
                      console.log('绘制完成，共', strokes.length, '笔')
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">使用说明</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-indigo-600 mb-2">点染模式</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>1. 选择喜欢的染料颜色。</li>
                      <li>2. 点击画布任意位置。</li>
                      <li>3. 观察染料扩散效果。</li>
                      <li>4. 重复点染，组合出新的纹样。</li>
                      <li>5. 完成后点击画布内的完成操作。</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-600 mb-2">画笔模式</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>1. 选择合适的画笔工具。</li>
                      <li>2. 按住鼠标左键拖动绘制。</li>
                      <li>3. 移动速度会影响笔触浓淡。</li>
                      <li>4. 可随时撤销上一笔。</li>
                      <li>5. 满意后再完成当前作品。</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部说明 */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-indigo-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">完整玩法正在继续完善</h3>
            <p className="text-sm text-muted-foreground mb-4">
              当前页面主要提供染色体验。后续会逐步补齐折叠、捆扎、漂流协作、AI 传记等完整玩法。
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">折叠系统</Badge>
              <Badge variant="outline">捆扎工具</Badge>
              <Badge variant="outline">图层管理</Badge>
              <Badge variant="outline">漂流协作</Badge>
              <Badge variant="outline">接力创作</Badge>
              <Badge variant="outline">AI 传记</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 作品预览弹窗 */}
      {showPreview && completedWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-[calc(100%-2rem)] sm:max-w-2xl w-full my-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">作品已完成</h3>
              <img
                src={completedWork}
                alt="完成的作品"
                className="w-full rounded-lg border-2 border-indigo-100 mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = completedWork
                    link.download = `indigo-dye-${Date.now()}.png`
                    link.click()
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  下载作品
                </Button>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="flex-1"
                >
                  继续创作
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

