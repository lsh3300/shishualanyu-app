'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Palette, Droplet, Sparkles } from 'lucide-react'
import { DyeCanvas } from '@/components/game/canvas/DyeCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 染色演示页面
 * 
 * 目的：
 * - 展示核心的染色交互体验
 * - 让用户感受染料扩散的真实感
 * - 验证游戏玩法的趣味性
 */
export default function WorkshopDemoPage() {
  const [dyeColor, setDyeColor] = useState('hsl(210, 70%, 50%)') // 靛蓝
  const [completedImage, setCompletedImage] = useState<string | null>(null)

  // 预设颜色
  const presetColors = [
    { name: '缥色', value: 'hsl(210, 50%, 75%)', desc: '浅蓝' },
    { name: '靛蓝', value: 'hsl(210, 70%, 50%)', desc: '标准蓝' },
    { name: '胜色', value: 'hsl(210, 80%, 30%)', desc: '深蓝' },
    { name: '月白', value: 'hsl(210, 30%, 85%)', desc: '淡蓝' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 pb-20">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/drift">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回漂流河
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                云端染坊
              </h1>
              <p className="text-xs text-muted-foreground">染色体验演示</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Demo
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 说明卡片 */}
        <Card className="mb-8 backdrop-blur-sm bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">染色体验说明</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>点击画布</strong>任意位置，染料会从点击处向外扩散</li>
                  <li>• 多次点击会产生<strong>颜色叠加</strong>，形成复杂图案</li>
                  <li>• 每次点击的扩散效果都<strong>略有不同</strong>（半径、透明度随机）</li>
                  <li>• 尝试不同的<strong>点击位置和频率</strong>，创造独特的作品</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 颜色选择 */}
            <Card className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold">染料颜色</h3>
                </div>
                <div className="space-y-3">
                  {presetColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setDyeColor(color.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        dyeColor === color.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.value }}
                        />
                        <div>
                          <p className="font-medium text-sm">{color.name}</p>
                          <p className="text-xs text-muted-foreground">{color.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 技术说明 */}
            <Card className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-sm">💡 技术亮点</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• <strong>径向渐变</strong>：模拟染料浓度从中心向外递减</li>
                  <li>• <strong>正片叠底</strong>：多次染色真实叠加</li>
                  <li>• <strong>缓动动画</strong>：平滑的扩散过程</li>
                  <li>• <strong>高DPI支持</strong>：清晰的画布渲染</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：画布区域 */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/90">
              <CardContent className="p-8">
                <DyeCanvas
                  width={500}
                  height={500}
                  dyeColor={dyeColor}
                  onDyeComplete={imageData => {
                    setCompletedImage(imageData)
                    console.log('染色完成！')
                  }}
                />
              </CardContent>
            </Card>

            {/* 完成后的预览 */}
            {completedImage && (
              <Card className="mt-6 backdrop-blur-sm bg-white/90">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">✨ 作品已完成</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">高清预览：</p>
                      <img
                        src={completedImage}
                        alt="完成的染色作品"
                        className="rounded-lg border-2 border-indigo-100 w-full"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        这是你创作的独一无二的蓝染作品！
                      </p>
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = completedImage
                            link.download = `indigo-dye-${Date.now()}.png`
                            link.click()
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          下载作品
                        </Button>
                        <Button
                          onClick={() => setCompletedImage(null)}
                          variant="outline"
                          className="w-full"
                        >
                          继续创作
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">🎯 这只是核心体验的演示</h3>
              <p className="text-sm text-muted-foreground mb-4">
                完整版游戏将包含：折叠、捆扎、多层染色、AI生成诗意传记等更多功能
              </p>
              <div className="flex gap-2 justify-center text-xs text-muted-foreground">
                <Badge variant="outline">折叠系统</Badge>
                <Badge variant="outline">图层管理</Badge>
                <Badge variant="outline">AI传记</Badge>
                <Badge variant="outline">异步协作</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
