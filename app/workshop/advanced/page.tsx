'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Layers, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedDyeCanvas } from '@/components/game/canvas/AdvancedDyeCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type LayersData = {
  layers?: unknown[]
}

type SavedAdvancedWork = {
  id: string
  image: string
  layersData: LayersData
  layerCount: number
  createdAt: string
}

const ADVANCED_WORKSHOP_STORAGE_KEY = 'advanced-workshop-saved-works'

export default function AdvancedWorkshopPage() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [completedWork, setCompletedWork] = useState<{
    image: string
    layersData: LayersData
  } | null>(null)

  const handleComplete = (imageData: string, layersData: unknown) => {
    const normalizedLayersData: LayersData =
      layersData &&
      typeof layersData === 'object' &&
      'layers' in layersData &&
      Array.isArray((layersData as { layers?: unknown[] }).layers)
        ? { layers: (layersData as { layers?: unknown[] }).layers }
        : {}

    setCompletedWork({ image: imageData, layersData: normalizedLayersData })
    setShowSuccessDialog(true)
  }

  const handleSaveWork = () => {
    if (!completedWork) return

    try {
      const savedWorksRaw = localStorage.getItem(ADVANCED_WORKSHOP_STORAGE_KEY)
      const savedWorks = savedWorksRaw ? (JSON.parse(savedWorksRaw) as SavedAdvancedWork[]) : []

      const nextWork: SavedAdvancedWork = {
        id: `advanced-work-${Date.now()}`,
        image: completedWork.image,
        layersData: completedWork.layersData,
        layerCount: completedWork.layersData.layers?.length || 0,
        createdAt: new Date().toISOString(),
      }

      const nextWorks = [nextWork, ...savedWorks].slice(0, 20)
      localStorage.setItem(ADVANCED_WORKSHOP_STORAGE_KEY, JSON.stringify(nextWorks))

      toast.success('已保存到本机作品草稿')
    } catch (error) {
      console.error('保存高级工坊作品失败:', error)
      toast.error('本机保存失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50 pb-20">
      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/workshop">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回基础工坊
              </Button>
            </Link>

            <div className="text-center">
              <h1 className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                高级工坊
              </h1>
              <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
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
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold">专业图层染色</h2>
                <p className="mb-3 text-sm text-muted-foreground">
                  像设计软件一样管理每一层染色效果，自由调整透明度、顺序和可见性，适合制作更复杂的蓝染作品。
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">独立图层</Badge>
                  <Badge variant="outline" className="text-xs">透明度调节</Badge>
                  <Badge variant="outline" className="text-xs">图层排序</Badge>
                  <Badge variant="outline" className="text-xs">显示隐藏</Badge>
                  <Badge variant="outline" className="text-xs">实时预览</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AdvancedDyeCanvas width={500} height={500} onComplete={handleComplete} />

        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">高级技巧</h3>
            <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-purple-600">图层叠加策略</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>底层先铺大面积浅色。</li>
                  <li>中层补主要图案。</li>
                  <li>顶层用深色强调细节。</li>
                  <li>适当降低中间层透明度，会更自然。</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-indigo-600">创作流程建议</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>先定整体色调，再逐层补细节。</li>
                  <li>每层完成后再新增下一层。</li>
                  <li>随时隐藏图层检查整体效果。</li>
                  <li>通过图层顺序控制主次关系。</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="mb-3 font-semibold">图层系统 vs 基础染色</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="rounded-lg bg-white p-4">
                <h4 className="mb-2 font-medium text-gray-600">基础染色</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>简单直观，上手快。</li>
                  <li>适合快速体验。</li>
                  <li>对已完成部分调整较少。</li>
                  <li>复杂图案能力有限。</li>
                </ul>
              </div>
              <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
                <h4 className="mb-2 font-medium text-purple-600">图层系统</h4>
                <ul className="space-y-1 text-xs text-purple-600">
                  <li>每层都能单独调节。</li>
                  <li>更适合精细创作。</li>
                  <li>图案组合空间更大。</li>
                  <li>后续返工也更方便。</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSuccessDialog && completedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <Card className="my-4 max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-3xl">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Save className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">作品创作完成</h3>
                <p className="text-muted-foreground">
                  你的作品已生成，当前包含 {completedWork.layersData.layers?.length || 0} 个图层。
                </p>
              </div>

              <div className="mb-6">
                <img
                  src={completedWork.image}
                  alt="完成作品预览"
                  className="w-full rounded-lg border-2 border-purple-100 shadow-xl"
                />
              </div>

              <div className="mb-6 rounded-lg bg-purple-50 p-4">
                <h4 className="mb-2 text-sm font-semibold">作品信息</h4>
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <div className="rounded bg-white p-2">
                    <p className="text-muted-foreground">图层数量</p>
                    <p className="text-lg font-bold">{completedWork.layersData.layers?.length || 0}</p>
                  </div>
                  <div className="rounded bg-white p-2">
                    <p className="text-muted-foreground">创作时间</p>
                    <p className="text-lg font-bold">
                      {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="rounded bg-white p-2">
                    <p className="text-muted-foreground">图片尺寸</p>
                    <p className="text-lg font-bold">500x500</p>
                  </div>
                  <div className="rounded bg-white p-2">
                    <p className="text-muted-foreground">格式</p>
                    <p className="text-lg font-bold">PNG</p>
                  </div>
                </div>
              </div>

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
                <Button onClick={handleSaveWork} variant="outline" className="flex-1">
                  保存到本机
                </Button>
                <Button onClick={() => setShowSuccessDialog(false)} variant="outline">
                  继续创作
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>当前版本先支持下载图片与本机保存草稿，后续再接通作品集同步。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
