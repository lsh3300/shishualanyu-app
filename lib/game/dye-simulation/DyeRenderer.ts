/**
 * 蓝染渲染器
 * 将染料模拟结果渲染到Canvas
 */

import { VirtualFabric, INDIGO_PALETTE, RGB } from './DyeSimulator'

/**
 * Canvas渲染器
 */
export class DyeRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { 
      alpha: false,  // 不需要透明度，性能更好
      willReadFrequently: false 
    })
    if (!ctx) throw new Error('无法获取Canvas上下文')
    this.ctx = ctx
  }
  
  /**
   * 渲染染色效果
   */
  render(fabric: VirtualFabric, options: RenderOptions = {}): void {
    const {
      addFabricTexture = true,
      addNoise = true,
      noiseIntensity = 0.05
    } = options
    
    const imageData = this.ctx.createImageData(fabric.width, fabric.height)
    const data = imageData.data
    
    // 生成布料纹理噪点（一次性）
    const fabricNoise = addFabricTexture 
      ? this.generateFabricNoise(fabric.width, fabric.height)
      : null
    
    // 遍历每个像素
    for (let y = 0; y < fabric.height; y++) {
      for (let x = 0; x < fabric.width; x++) {
        const idx = y * fabric.width + x
        const pixelIdx = idx * 4
        
        // 获取染料浓度
        let concentration = fabric.grid[idx]
        
        // 添加噪点（模拟染料不均匀）
        if (addNoise) {
          concentration += (Math.random() - 0.5) * noiseIntensity
          concentration = Math.max(0, Math.min(1, concentration))
        }
        
        // 获取对应的靛蓝色
        const color = INDIGO_PALETTE.getColor(concentration)
        
        // 叠加布料纹理
        let finalColor = color
        if (fabricNoise && fabricNoise[idx]) {
          finalColor = this.blendWithFabric(color, fabricNoise[idx])
        }
        
        // 写入像素数据
        data[pixelIdx] = finalColor.r
        data[pixelIdx + 1] = finalColor.g
        data[pixelIdx + 2] = finalColor.b
        data[pixelIdx + 3] = 255
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0)
  }
  
  /**
   * 生成布料纹理噪点
   */
  private generateFabricNoise(width: number, height: number): Float32Array | null {
    const noise = new Float32Array(width * height)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        
        // 简单的Perlin噪点近似
        // 使用正弦波叠加模拟编织纹理
        const nx = x / 3
        const ny = y / 3
        const value = 
          Math.sin(nx * 0.5) * 0.3 +
          Math.sin(ny * 0.5) * 0.3 +
          Math.sin((nx + ny) * 0.3) * 0.2 +
          (Math.random() - 0.5) * 0.2
        
        noise[idx] = value
      }
    }
    
    return noise
  }
  
  /**
   * 将颜色与布料纹理混合
   */
  private blendWithFabric(dyeColor: RGB, fabricNoise: number): RGB {
    // 布料纹理影响（使颜色略有变化）
    const factor = 1 + fabricNoise * 0.08
    
    return {
      r: Math.round(Math.max(0, Math.min(255, dyeColor.r * factor))),
      g: Math.round(Math.max(0, Math.min(255, dyeColor.g * factor))),
      b: Math.round(Math.max(0, Math.min(255, dyeColor.b * factor)))
    }
  }
  
  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.fillStyle = '#faf8f5'  // 米白色布料
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  /**
   * 导出为图片
   */
  toDataURL(type: string = 'image/png', quality: number = 1.0): string {
    return this.canvas.toDataURL(type, quality)
  }
  
  /**
   * 导出为Blob
   */
  async toBlob(type: string = 'image/png', quality: number = 1.0): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, type, quality)
    })
  }
}

export interface RenderOptions {
  addFabricTexture?: boolean
  addNoise?: boolean
  noiseIntensity?: number
}
