"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { OptimizedImage } from "@/components/ui/optimized-image"
import {
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewComparisonProps {
  originalImage?: string | null
  processedImage?: string
  generatedImage?: string | null
  isProcessing?: boolean
  onRegenerate?: () => void
  onDownload?: (imageType: "original" | "processed") => void
}

function PreviewFrame({
  src,
  alt,
  mode = "contain",
  zoomLevel = 100,
}: {
  src: string
  alt: string
  mode?: "contain" | "cover"
  zoomLevel?: number
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
      <div
        className="absolute inset-0 transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          usage="detail"
          className={mode === "cover" ? "object-cover" : "object-contain"}
        />
      </div>
    </div>
  )
}

export default function PreviewComparison({
  originalImage,
  processedImage,
  generatedImage,
  isProcessing = false,
  onRegenerate,
  onDownload,
}: PreviewComparisonProps) {
  const finalProcessedImage = generatedImage || processedImage
  const [viewMode, setViewMode] = useState<"split" | "overlay" | "side-by-side">("split")
  const [showOriginal, setShowOriginal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [sliderPosition, setSliderPosition] = useState(50)

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50))
  const handleResetZoom = () => setZoomLevel(100)

  return (
    <Card className="rounded-[30px] border-blue-100 bg-white/84 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Eye className="h-5 w-5" />
          预览与对比
        </CardTitle>
        <CardDescription className="leading-6">
          查看生成效果，必要时再回到上一步微调。
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl">
            <TabsTrigger value="preview">效果预览</TabsTrigger>
            <TabsTrigger value="compare">对比查看</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4 pt-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw className="mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">AI 正在处理你的图片...</p>
                <p className="mt-2 text-sm text-muted-foreground">完成后会在这里显示最新成品。</p>
              </div>
            ) : finalProcessedImage ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
                    AI 生成效果
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm text-slate-500">{zoomLevel}%</span>
                    <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleResetZoom}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <PreviewFrame src={finalProcessedImage} alt="AI 生成图片" zoomLevel={zoomLevel} />

                <div className="flex justify-center">
                  <Button onClick={() => onDownload?.("processed")} className="rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    下载生成图片
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <EyeOff className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">先上传图片并完成生成，预览区才会亮起来。</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-4 pt-4">
            {!originalImage || !finalProcessedImage ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Split className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">需要原图和成品图，才能进入对比模式。</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant={viewMode === "split" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("split")}
                    className="rounded-xl"
                  >
                    <Split className="mr-2 h-4 w-4" />
                    分割对比
                  </Button>
                  <Button
                    variant={viewMode === "overlay" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("overlay")}
                    className="rounded-xl"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    叠加对比
                  </Button>
                  <Button
                    variant={viewMode === "side-by-side" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("side-by-side")}
                    className="rounded-xl"
                  >
                    并排查看
                  </Button>
                </div>

                {viewMode === "split" && (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                        <div className="relative h-full w-full">
                          <OptimizedImage src={originalImage} alt="原图" fill usage="detail" className="object-cover" />
                        </div>
                        <Badge className="absolute left-3 top-3 rounded-full" variant="secondary">
                          原图
                        </Badge>
                      </div>

                      <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${100 - sliderPosition}%` }}>
                        <div className="relative h-full w-full">
                          <OptimizedImage src={finalProcessedImage} alt="AI 生成图" fill usage="detail" className="object-cover" />
                        </div>
                        <Badge className="absolute right-3 top-3 rounded-full" variant="secondary">
                          AI 成品
                        </Badge>
                      </div>
                    </div>

                    <Slider
                      value={[sliderPosition]}
                      onValueChange={(value) => setSliderPosition(value[0])}
                      max={100}
                      step={1}
                      className="mx-auto w-[92%]"
                    />
                  </div>
                )}

                {viewMode === "overlay" && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    <OptimizedImage src={originalImage} alt="原图" fill usage="detail" className="object-cover" />
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-300",
                        showOriginal ? "opacity-0" : "opacity-100"
                      )}
                    >
                      <OptimizedImage src={finalProcessedImage} alt="AI 生成图" fill usage="detail" className="object-cover" />
                    </div>

                    <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full">
                        {showOriginal ? "原图" : "AI 成品"}
                      </Badge>
                      <Button variant="secondary" size="sm" onClick={() => setShowOriginal(!showOriginal)} className="rounded-xl">
                        {showOriginal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {viewMode === "side-by-side" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center rounded-full">
                        原图
                      </Badge>
                      <PreviewFrame src={originalImage} alt="原图" mode="cover" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center rounded-full">
                        AI 成品
                      </Badge>
                      <PreviewFrame src={finalProcessedImage} alt="AI 成品" mode="cover" />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => onDownload?.("original")} className="rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    下载原图
                  </Button>
                  <Button onClick={() => onDownload?.("processed")} className="rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    下载成品
                  </Button>
                  {onRegenerate ? (
                    <Button variant="outline" onClick={onRegenerate} className="rounded-xl">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      重新生成
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
