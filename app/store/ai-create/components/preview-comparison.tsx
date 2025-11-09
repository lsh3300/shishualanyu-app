"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { 
  Eye, 
  EyeOff, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Split,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewComparisonProps {
  originalImage?: string | null
  processedImage?: string
  generatedImage?: string | null
  isProcessing?: boolean
  onRegenerate?: () => void
  onDownload?: (imageType: 'original' | 'processed') => void
}

export default function PreviewComparison({ 
  originalImage, 
  processedImage, 
  generatedImage,
  isProcessing = false, 
  onRegenerate, 
  onDownload 
}: PreviewComparisonProps) {
  // 使用generatedImage或processedImage，优先使用generatedImage
  const finalProcessedImage = generatedImage || processedImage
  const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'side-by-side'>('split')
  const [showOriginal, setShowOriginal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [sliderPosition, setSliderPosition] = useState(50)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          预览与对比
        </CardTitle>
        <CardDescription>
          查看AI生成的蓝染效果，与原图对比调整
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">效果预览</TabsTrigger>
            <TabsTrigger value="compare">对比查看</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI正在处理您的图片...</p>
                <p className="text-sm text-muted-foreground mt-2">请稍候，这可能需要几秒钟</p>
              </div>
            ) : finalProcessedImage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">AI生成效果</Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleResetZoom}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div 
                  className="relative overflow-hidden rounded-md bg-muted"
                  style={{ height: '400px' }}
                >
                  <img
                    src={finalProcessedImage}
                    alt="AI生成的蓝染效果"
                    className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                </div>
                <div className="flex justify-center">
                  <Button onClick={() => onDownload?.('processed')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载生成图片
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">请先上传图片并选择风格</p>
                <p className="text-sm text-muted-foreground mt-2">AI将为您生成独特的蓝染效果</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-4">
            {!originalImage || !finalProcessedImage ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Split className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">需要原图和生成图才能进行对比</p>
                <p className="text-sm text-muted-foreground mt-2">请先上传图片并完成AI处理</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('split')}
                  >
                    <Split className="h-4 w-4 mr-2" />
                    分割对比
                  </Button>
                  <Button
                    variant={viewMode === 'overlay' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('overlay')}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    叠加对比
                  </Button>
                  <Button
                    variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('side-by-side')}
                  >
                    分屏对比
                  </Button>
                </div>
                
                {viewMode === 'split' && (
                  <div className="relative overflow-hidden rounded-md bg-muted" style={{ height: '400px' }}>
                    <div className="absolute inset-0 flex">
                      <div 
                        className="relative overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={originalImage}
                          alt="原始图片"
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2" variant="secondary">原图</Badge>
                      </div>
                      <div 
                        className="relative overflow-hidden"
                        style={{ width: `${100 - sliderPosition}%` }}
                      >
                        <img
                          src={finalProcessedImage}
                          alt="AI生成图片"
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2" variant="secondary">AI生成</Badge>
                      </div>
                    </div>
                    <Slider
                      value={[sliderPosition]}
                      onValueChange={(value) => setSliderPosition(value[0])}
                      max={100}
                      step={1}
                      className="absolute bottom-4 left-4 right-4 z-10"
                    />
                  </div>
                )}
                
                {viewMode === 'overlay' && (
                  <div className="relative overflow-hidden rounded-md bg-muted" style={{ height: '400px' }}>
                    <img
                      src={originalImage}
                      alt="原始图片"
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={finalProcessedImage}
                      alt="AI生成图片"
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity",
                        showOriginal ? "opacity-0" : "opacity-100"
                      )}
                    />
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <Badge variant="secondary">
                        {showOriginal ? "原图" : "AI生成"}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowOriginal(!showOriginal)}
                      >
                        {showOriginal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                
                {viewMode === 'side-by-side' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center">原图</Badge>
                      <div className="relative overflow-hidden rounded-md bg-muted" style={{ height: '300px' }}>
                        <img
                          src={originalImage}
                          alt="原始图片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center">AI生成</Badge>
                      <div className="relative overflow-hidden rounded-md bg-muted" style={{ height: '300px' }}>
                        <img
                          src={finalProcessedImage}
                          alt="AI生成图片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => onDownload?.('original')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载原图
                  </Button>
                  <Button onClick={() => onDownload?.('processed')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载生成图
                  </Button>
                  {onRegenerate && (
                    <Button variant="outline" onClick={onRegenerate}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      重新生成
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}