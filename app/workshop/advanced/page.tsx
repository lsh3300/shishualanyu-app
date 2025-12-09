'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Layers, Save } from 'lucide-react'
import { AdvancedDyeCanvas } from '@/components/game/canvas/AdvancedDyeCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 高级染坊 - 带完整图层系统
 */
export default function AdvancedWorkshopPage() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [completedWork, setCompletedWork] = useState<{
    image: string
    layersData: any
  } | null>(null)

  const handleComplete = (imageData: string, layersData: any) => {
    setCompletedWork({ image: imageData, layersData })
    setShowSuccessDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50 pb-20">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/workshop">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回基础染坊
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                高级染坊
              </h1>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Layers className="h-3 w-3" />
                图层染色系统
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Pro
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 功能介绍 */}
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">🎨 专业图层染色</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  像Photoshop一样管理每一层染色效果，自由调整透明度、顺序和可见性，创造复杂精美的蓝染作品
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">独立图层</Badge>
                  <Badge variant="outline" className="text-xs">透明度调节</Badge>
                  <Badge variant="outline" className="text-xs">图层排序</Badge>
                  <Badge variant="outline" className="text-xs">显隐切换</Badge>
                  <Badge variant="outline" className="text-xs">实时预览</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 图层系统Canvas */}
        <AdvancedDyeCanvas
          width={500}
          height={500}
          onComplete={handleComplete}
        />

        {/* 使用技巧 */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>高级技巧</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-purple-600 mb-2">图层叠加策略</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 底层用宽范围淡色打底</li>
                  <li>• 中层添加主要图案</li>
                  <li>• 顶层用深色强调细节</li>
                  <li>• 降低中间层透明度可产生过渡效果</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-indigo-600 mb-2">创作流程建议</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 先规划整体色调（浅→深）</li>
                  <li>• 每层完成后再新建图层</li>
                  <li>• 随时隐藏图层查看效果</li>
                  <li>• 用图层顺序控制主次关系</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 与基础模式的对比 */}
        <Card className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">📊 图层系统 vs 基础染色</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2 text-gray-600">基础染色</h4>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  <li>✓ 简单直观，快速上手</li>
                  <li>✓ 适合快速体验</li>
                  <li>✗ 无法调整已完成的部分</li>
                  <li>✗ 难以创作复杂图案</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                <h4 className="font-medium mb-2 text-purple-600">图层系统 ⭐</h4>
                <ul className="space-y-1 text-purple-600 text-xs">
                  <li>✓ 完全可控，专业级创作</li>
                  <li>✓ 每层独立调整</li>
                  <li>✓ 无限创作可能性</li>
                  <li>✓ 适合精细作品</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 完成对话框 */}
      {showSuccessDialog && completedWork && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Save className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">✨ 作品创作完成！</h3>
                <p className="text-muted-foreground">
                  你的蓝染艺术作品已完成，包含 {completedWork.layersData?.layers?.length || 0} 个图层
                </p>
              </div>

              {/* 作品预览 */}
              <div className="mb-6">
                <img
                  src={completedWork.image}
                  alt="完成的作品"
                  className="w-full rounded-lg border-2 border-purple-100 shadow-xl"
                />
              </div>

              {/* 图层信息 */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">图层详情</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded">
                    <p className="text-muted-foreground">总图层数</p>
                    <p className="font-bold text-lg">{completedWork.layersData?.layers?.length || 0}</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-muted-foreground">创作时间</p>
                    <p className="font-bold text-lg">
                      {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-muted-foreground">图片尺寸</p>
                    <p className="font-bold text-lg">500×500</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-muted-foreground">格式</p>
                    <p className="font-bold text-lg">PNG</p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = completedWork.image
                    link.download = `indigo-layers-${Date.now()}.png`
                    link.click()
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  下载作品
                </Button>
                <Button
                  onClick={() => {
                    // TODO: 保存到数据库
                    alert('保存功能开发中...')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  保存到作品集
                </Button>
                <Button
                  onClick={() => setShowSuccessDialog(false)}
                  variant="outline"
                >
                  继续创作
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>🎯 完整版游戏将支持投放到漂流河，让其他玩家接力创作</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
