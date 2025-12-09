'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { LayerManager, Layer } from '@/lib/game/canvas/layer-manager'
import { Eye, EyeOff, Trash2, MoveUp, MoveDown, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

/**
 * 高级染色Canvas（带图层系统）
 * 
 * 特点：
 * - 完整的图层管理
 * - 实时预览合成效果
 * - 可调整每层透明度
 * - 支持显示/隐藏图层
 * - 图层顺序调整
 * - 撤销/重做功能
 */

interface AdvancedDyeCanvasProps {
  width?: number
  height?: number
  backgroundColor?: string
  onComplete?: (imageData: string, layersData: any) => void
}

export function AdvancedDyeCanvas({
  width = 600,
  height = 600,
  backgroundColor = '#f8f8f8',
  onComplete,
}: AdvancedDyeCanvasProps) {
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentLayerCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [layerManager] = useState(() => new LayerManager())
  const [layers, setLayers] = useState<Layer[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [dyeColor, setDyeColor] = useState('hsl(210, 70%, 50%)')
  
  // 可用颜色
  const colors = [
    { name: '月白', value: 'hsl(210, 30%, 88%)' },
    { name: '缥色', value: 'hsl(210, 50%, 75%)' },
    { name: '靛蓝', value: 'hsl(210, 70%, 50%)' },
    { name: '胜色', value: 'hsl(210, 80%, 35%)' },
  ]

  /**
   * 刷新图层列表
   */
  const refreshLayers = useCallback(() => {
    setLayers(layerManager.getLayers())
  }, [layerManager])

  /**
   * 创建新图层并开始绘制
   */
  const startNewLayer = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, width, height)
    }

    const layer = layerManager.addLayer(canvas, 'dye-click', undefined, {
      dyeColor,
    })
    
    refreshLayers()
    setSelectedLayerId(layer.id)
    
    // 设置当前工作图层
    if (currentLayerCanvasRef.current) {
      const currentCtx = currentLayerCanvasRef.current.getContext('2d')
      if (currentCtx) {
        currentCtx.clearRect(0, 0, width, height)
      }
    }
    
    return layer
  }, [width, height, layerManager, dyeColor, refreshLayers])

  /**
   * 点击染色
   */
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = currentLayerCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 创建径向渐变
    const maxRadius = 60 + Math.random() * 30
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, maxRadius)
    
    const hslMatch = dyeColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (hslMatch) {
      const [, h, s, l] = hslMatch
      const opacity = 0.3 + Math.random() * 0.2
      
      gradient.addColorStop(0, `hsla(${h}, ${s}%, ${Math.max(20, parseInt(l) - 20)}%, ${opacity})`)
      gradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${opacity * 0.7})`)
      gradient.addColorStop(0.8, `hsla(${h}, ${s}%, ${Math.min(80, parseInt(l) + 20)}%, ${opacity * 0.3})`)
      gradient.addColorStop(1, `hsla(${h}, ${s}%, ${Math.min(90, parseInt(l) + 30)}%, 0)`)
    }

    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = gradient
    ctx.fillRect(x - maxRadius, y - maxRadius, maxRadius * 2, maxRadius * 2)
    ctx.globalCompositeOperation = 'source-over'

    // 更新合成视图
    updateComposite()
  }, [dyeColor])

  /**
   * 更新合成视图
   */
  const updateComposite = useCallback(() => {
    const canvas = compositeCanvasRef.current
    const currentLayerCanvas = currentLayerCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // 合成所有图层
    layerManager.composite(canvas)

    // 叠加当前正在编辑的图层
    if (currentLayerCanvas) {
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(currentLayerCanvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
  }, [layerManager, backgroundColor, width, height])

  /**
   * 完成当前图层
   */
  const finishCurrentLayer = useCallback(() => {
    const currentLayerCanvas = currentLayerCanvasRef.current
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    
    if (!currentLayerCanvas || !selectedLayer) return

    // 将当前图层内容复制到选中的图层Canvas
    const ctx = selectedLayer.canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(currentLayerCanvas, 0, 0)
    }

    // 清空当前图层
    const currentCtx = currentLayerCanvas.getContext('2d')
    if (currentCtx) {
      currentCtx.clearRect(0, 0, width, height)
    }

    updateComposite()
  }, [layers, selectedLayerId, width, height, updateComposite])

  /**
   * 切换图层可见性
   */
  const toggleLayerVisibility = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      layerManager.updateLayer(layerId, { visible: !layer.visible })
      refreshLayers()
      updateComposite()
    }
  }, [layers, layerManager, refreshLayers, updateComposite])

  /**
   * 删除图层
   */
  const deleteLayer = useCallback((layerId: string) => {
    layerManager.removeLayer(layerId)
    refreshLayers()
    updateComposite()
    
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null)
    }
  }, [layerManager, refreshLayers, updateComposite, selectedLayerId])

  /**
   * 调整图层透明度
   */
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    layerManager.updateLayer(layerId, { opacity })
    refreshLayers()
    updateComposite()
  }, [layerManager, refreshLayers, updateComposite])

  /**
   * 移动图层
   */
  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    layerManager.moveLayer(layerId, direction)
    refreshLayers()
    updateComposite()
  }, [layerManager, refreshLayers, updateComposite])

  /**
   * 导出作品
   */
  const exportWork = useCallback(() => {
    const imageData = layerManager.exportComposite('png', 1.0)
    const layersData = layerManager.exportLayersData()
    onComplete?.(imageData, layersData)
  }, [layerManager, onComplete])

  /**
   * 初始化Canvas
   */
  useEffect(() => {
    const canvas = compositeCanvasRef.current
    const currentLayerCanvas = currentLayerCanvasRef.current
    
    if (canvas) {
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }
    }

    if (currentLayerCanvas) {
      const dpr = window.devicePixelRatio || 1
      currentLayerCanvas.width = width * dpr
      currentLayerCanvas.height = height * dpr
      const ctx = currentLayerCanvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    // 创建第一个图层
    startNewLayer()
  }, [width, height, backgroundColor, startNewLayer])

  // 自动更新合成
  useEffect(() => {
    updateComposite()
  }, [layers, updateComposite])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：图层面板 */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                图层面板
              </h3>
              <Badge variant="secondary">{layers.length} 层</Badge>
            </div>

            {/* 图层列表 */}
            <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
              {layers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  暂无图层
                </p>
              )}
              
              {[...layers].reverse().map((layer, index) => (
                <div
                  key={layer.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedLayerId === layer.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedLayerId(layer.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1">
                      {layer.name}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(layer.id)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {layer.visible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteLayer(layer.id)
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* 透明度滑块 */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>透明度</span>
                      <span>{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([value]) => updateLayerOpacity(layer.id, value / 100)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* 图层操作 */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, 'up')
                      }}
                      disabled={index === 0}
                      className="flex-1 h-7 text-xs"
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, 'down')
                      }}
                      disabled={index === layers.length - 1}
                      className="flex-1 h-7 text-xs"
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 图层操作按钮 */}
            <div className="space-y-2">
              <Button onClick={startNewLayer} className="w-full" size="sm">
                + 新建图层
              </Button>
              <Button onClick={finishCurrentLayer} variant="outline" className="w-full" size="sm">
                完成当前图层
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 颜色选择 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">染料颜色</h3>
            <div className="grid grid-cols-2 gap-2">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setDyeColor(color.value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    dyeColor === color.value
                      ? 'border-indigo-500 scale-105'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-xs mt-1 text-center">{color.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：画布区域 */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {/* 合成预览Canvas */}
              <canvas
                ref={compositeCanvasRef}
                width={width}
                height={height}
                className="rounded-lg shadow-lg border-2 border-indigo-100"
                style={{ width: `${width}px`, height: `${height}px` }}
              />

              {/* 当前编辑层Canvas（透明覆盖）*/}
              <canvas
                ref={currentLayerCanvasRef}
                width={width}
                height={height}
                onClick={handleCanvasClick}
                className="absolute top-0 left-0 cursor-crosshair"
                style={{ width: `${width}px`, height: `${height}px` }}
              />

              {/* 提示 */}
              {layers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center backdrop-blur-sm bg-white/70 p-6 rounded-lg">
                    <p className="font-medium text-indigo-600 mb-1">点击画布开始染色</p>
                    <p className="text-xs text-muted-foreground">每个图层都可以独立调整</p>
                  </div>
                </div>
              )}
            </div>

            {/* 控制按钮 */}
            <div className="mt-4 flex gap-2">
              <Button onClick={exportWork} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                完成作品
              </Button>
              <Button
                onClick={() => {
                  layerManager.clear()
                  refreshLayers()
                  updateComposite()
                }}
                variant="outline"
                className="flex-1"
              >
                清空所有
              </Button>
            </div>

            {/* 说明 */}
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-sm">
              <p className="font-medium mb-2">💡 图层系统使用说明</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• <strong>点击画布</strong>在当前图层上染色</li>
                <li>• <strong>完成当前图层</strong>后再创建新图层</li>
                <li>• <strong>调整透明度</strong>控制每层的浓度</li>
                <li>• <strong>显示/隐藏</strong>预览不同组合效果</li>
                <li>• <strong>上下移动</strong>调整图层叠放顺序</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
