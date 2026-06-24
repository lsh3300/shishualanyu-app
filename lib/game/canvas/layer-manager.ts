/**
 * 图层管理系统
 * 
 * 核心理念：
 * - 每次染色操作都是一个独立的图层
 * - 图层可以独立编辑、删除、调整透明度
 * - 最终合成时按顺序叠加
 * - 支持导出各个阶段的效果
 * 
 * 设计灵感：
 * - Photoshop的图层面板
 * - 但简化为蓝染场景
 */

export interface Layer {
  id: string
  name: string
  type: 'dye-click' | 'dye-brush' | 'fold' | 'tie'
  canvas: HTMLCanvasElement
  opacity: number
  visible: boolean
  blendMode: GlobalCompositeOperation
  metadata: {
    createdAt: string
    dyeColor?: string
    toolUsed?: string
    strokeCount?: number
  }
}

export interface LayerSnapshot {
  layers: Layer[]
  timestamp: string
  author?: string
  description?: string
}

export class LayerManager {
  private layers: Layer[] = []
  private history: LayerSnapshot[] = []
  private maxHistorySize = 20
  private currentHistoryIndex = -1

  /**
   * 添加新图层
   */
  addLayer(
    canvas: HTMLCanvasElement,
    type: Layer['type'],
    name?: string,
    metadata?: Partial<Layer['metadata']>
  ): Layer {
    const layer: Layer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || this.generateLayerName(type),
      type,
      canvas,
      opacity: 1.0,
      visible: true,
      blendMode: type === 'dye-click' || type === 'dye-brush' ? 'multiply' : 'source-over',
      metadata: {
        createdAt: new Date().toISOString(),
        ...metadata,
      },
    }

    this.layers.push(layer)
    this.saveSnapshot('添加图层')
    return layer
  }

  /**
   * 生成图层名称
   */
  private generateLayerName(type: Layer['type']): string {
    const typeNames = {
      'dye-click': '点染',
      'dye-brush': '画笔',
      'fold': '折叠',
      'tie': '捆扎',
    }

    const count = this.layers.filter(l => l.type === type).length
    return `${typeNames[type]} ${count + 1}`
  }

  /**
   * 删除图层
   */
  removeLayer(layerId: string): boolean {
    const index = this.layers.findIndex(l => l.id === layerId)
    if (index === -1) return false

    this.layers.splice(index, 1)
    this.saveSnapshot('删除图层')
    return true
  }

  /**
   * 更新图层属性
   */
  updateLayer(
    layerId: string,
    updates: Partial<Pick<Layer, 'name' | 'opacity' | 'visible' | 'blendMode'>>
  ): boolean {
    const layer = this.layers.find(l => l.id === layerId)
    if (!layer) return false

    Object.assign(layer, updates)
    return true
  }

  /**
   * 调整图层顺序
   */
  moveLayer(layerId: string, direction: 'up' | 'down'): boolean {
    const index = this.layers.findIndex(l => l.id === layerId)
    if (index === -1) return false

    const newIndex = direction === 'up' ? index + 1 : index - 1
    if (newIndex < 0 || newIndex >= this.layers.length) return false

    const [layer] = this.layers.splice(index, 1)
    this.layers.splice(newIndex, 0, layer)
    this.saveSnapshot('调整图层顺序')
    return true
  }

  /**
   * 获取所有图层
   */
  getLayers(): Layer[] {
    return [...this.layers]
  }

  /**
   * 获取可见图层
   */
  getVisibleLayers(): Layer[] {
    return this.layers.filter(l => l.visible)
  }

  /**
   * 合成所有图层到单个Canvas
   */
  composite(targetCanvas: HTMLCanvasElement): void {
    const ctx = targetCanvas.getContext('2d')
    if (!ctx) return

    // 清空目标画布
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height)

    // 按顺序合成每个可见图层
    for (const layer of this.getVisibleLayers()) {
      ctx.save()

      // 设置透明度
      ctx.globalAlpha = layer.opacity

      // 设置混合模式
      ctx.globalCompositeOperation = layer.blendMode

      // 绘制图层
      ctx.drawImage(layer.canvas, 0, 0)

      ctx.restore()
    }
  }

  /**
   * 导出合成图像
   */
  exportComposite(format: 'png' | 'jpeg' = 'png', quality: number = 1.0): string {
    const canvas = document.createElement('canvas')
    
    // 使用第一个图层的尺寸（假设所有图层尺寸相同）
    if (this.layers.length > 0) {
      canvas.width = this.layers[0].canvas.width
      canvas.height = this.layers[0].canvas.height
    }

    this.composite(canvas)

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    return canvas.toDataURL(mimeType, quality)
  }

  /**
   * 保存快照（用于撤销/重做）
   */
  private saveSnapshot(description: string): void {
    // 如果当前不在历史的末尾，删除后面的历史
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentHistoryIndex + 1)
    }

    // 创建快照（深拷贝图层信息，但不拷贝Canvas）
    const snapshot: LayerSnapshot = {
      layers: this.layers.map(layer => ({
        ...layer,
        canvas: layer.canvas.cloneNode(true) as HTMLCanvasElement,
      })),
      timestamp: new Date().toISOString(),
      description,
    }

    this.history.push(snapshot)
    this.currentHistoryIndex++

    // 限制历史大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentHistoryIndex--
    }
  }

  /**
   * 撤销
   */
  undo(): boolean {
    if (this.currentHistoryIndex <= 0) return false

    this.currentHistoryIndex--
    this.restoreSnapshot(this.history[this.currentHistoryIndex])
    return true
  }

  /**
   * 重做
   */
  redo(): boolean {
    if (this.currentHistoryIndex >= this.history.length - 1) return false

    this.currentHistoryIndex++
    this.restoreSnapshot(this.history[this.currentHistoryIndex])
    return true
  }

  /**
   * 恢复快照
   */
  private restoreSnapshot(snapshot: LayerSnapshot): void {
    this.layers = snapshot.layers.map(layer => ({
      ...layer,
      canvas: layer.canvas.cloneNode(true) as HTMLCanvasElement,
    }))
  }

  /**
   * 获取历史信息
   */
  getHistoryInfo(): {
    canUndo: boolean
    canRedo: boolean
    currentIndex: number
    totalSnapshots: number
  } {
    return {
      canUndo: this.currentHistoryIndex > 0,
      canRedo: this.currentHistoryIndex < this.history.length - 1,
      currentIndex: this.currentHistoryIndex,
      totalSnapshots: this.history.length,
    }
  }

  /**
   * 清空所有图层
   */
  clear(): void {
    this.layers = []
    this.saveSnapshot('清空所有图层')
  }

  /**
   * 获取图层统计信息
   */
  getStats(): {
    totalLayers: number
    visibleLayers: number
    layersByType: Record<Layer['type'], number>
  } {
    return {
      totalLayers: this.layers.length,
      visibleLayers: this.getVisibleLayers().length,
      layersByType: {
        'dye-click': this.layers.filter(l => l.type === 'dye-click').length,
        'dye-brush': this.layers.filter(l => l.type === 'dye-brush').length,
        'fold': this.layers.filter(l => l.type === 'fold').length,
        'tie': this.layers.filter(l => l.type === 'tie').length,
      },
    }
  }

  /**
   * 导出图层数据（用于保存/分享）
   */
  exportLayersData(): {
    layers: Array<{
      id: string
      name: string
      type: Layer['type']
      imageData: string
      opacity: number
      visible: boolean
      blendMode: Layer['blendMode']
      metadata: Layer['metadata']
    }>
  } {
    return {
      layers: this.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        imageData: layer.canvas.toDataURL('image/png'),
        opacity: layer.opacity,
        visible: layer.visible,
        blendMode: layer.blendMode,
        metadata: layer.metadata,
      })),
    }
  }

  /**
   * 从数据导入图层
   */
  async importLayersData(data: ReturnType<LayerManager['exportLayersData']>): Promise<void> {
    const loadedLayers: Layer[] = []

    for (const layerData of data.layers) {
      // 创建Canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      // 加载图像
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve()
        }
        img.onerror = reject
        img.src = layerData.imageData
      })

      // 创建图层对象
      loadedLayers.push({
        id: layerData.id,
        name: layerData.name,
        type: layerData.type,
        canvas,
        opacity: layerData.opacity,
        visible: layerData.visible,
        blendMode: layerData.blendMode,
        metadata: layerData.metadata,
      })
    }

    this.layers = loadedLayers
    this.saveSnapshot('导入图层')
  }
}
