/**
 * 蓝染模拟引擎
 * 模拟染料在布料上的真实扩散过程
 */

export interface TiePoint {
  x: number  // 百分比位置 0-100
  y: number
  type: 'kumo' | 'itajime' | 'arashi' | 'kanoko'
  size: number  // 绑扎大小 10-100
  intensity: number  // 染色强度 0-1
  symmetry: number  // 对称性 4/6/8/12
  irregularity: number  // 不规则度 0-1
}

export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * 虚拟布料网格
 */
export class VirtualFabric {
  public grid: Float32Array  // 染料浓度网格 [0-1]
  public width: number
  public height: number
  
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = new Float32Array(width * height)
    // 初始化为0（未染色）
    this.grid.fill(0)
  }
  
  getIndex(x: number, y: number): number {
    return Math.floor(y) * this.width + Math.floor(x)
  }
  
  getValue(x: number, y: number): number {
    const idx = this.getIndex(x, y)
    return this.grid[idx] || 0
  }
  
  setValue(x: number, y: number, value: number): void {
    const idx = this.getIndex(x, y)
    if (idx >= 0 && idx < this.grid.length) {
      this.grid[idx] = Math.max(0, Math.min(1, value))
    }
  }
  
  clear(): void {
    this.grid.fill(0)
  }
}

/**
 * 染料扩散模拟器
 */
export class DyeSimulator {
  private fabric: VirtualFabric
  
  constructor(width: number, height: number) {
    this.fabric = new VirtualFabric(width, height)
  }
  
  /**
   * 应用扎染点
   */
  applyTiePoint(tiePoint: TiePoint): void {
    const { x, y, type, size, intensity, symmetry, irregularity } = tiePoint
    
    // 转换百分比到像素坐标
    const centerX = (x / 100) * this.fabric.width
    const centerY = (y / 100) * this.fabric.height
    const radius = (size / 100) * Math.min(this.fabric.width, this.fabric.height) / 2
    
    switch (type) {
      case 'kumo':
        this.applyKumoShibori(centerX, centerY, radius, intensity, symmetry, irregularity)
        break
      case 'itajime':
        this.applyItajimeShibori(centerX, centerY, radius, intensity, symmetry, irregularity)
        break
      case 'arashi':
        this.applyArashiShibori(centerX, centerY, radius, intensity, symmetry, irregularity)
        break
      case 'kanoko':
        this.applyKanokoShibori(centerX, centerY, radius, intensity, symmetry, irregularity)
        break
    }
  }
  
  /**
   * 蜘蛛扎染（放射状）
   * 参考图片5
   */
  private applyKumoShibori(
    centerX: number,
    centerY: number,
    radius: number,
    intensity: number,
    symmetry: number,
    irregularity: number
  ): void {
    // 1. 设置抗染区域（中心白色圆）
    const resistRadius = radius * 0.15
    
    // 2. 生成放射线
    const angleStep = 360 / symmetry
    
    for (let ay = 0; ay < this.fabric.height; ay++) {
      for (let ax = 0; ax < this.fabric.width; ax++) {
        const dx = ax - centerX
        const dy = ay - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // 抗染区域
        if (distance < resistRadius) {
          continue
        }
        
        // 计算角度
        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        
        // 找到最近的放射线
        let minAngleDiff = 360
        for (let i = 0; i < symmetry; i++) {
          const lineAngle = i * angleStep + (Math.random() - 0.5) * irregularity * 10
          let diff = Math.abs(angle - lineAngle)
          if (diff > 180) diff = 360 - diff
          minAngleDiff = Math.min(minAngleDiff, diff)
        }
        
        // 距离放射线越近，染色越深
        const lineProximity = 1 - Math.min(minAngleDiff / 30, 1)
        
        // 距离中心越远，染色越浅（扩散效果）
        const distanceFactor = Math.max(0, 1 - (distance - resistRadius) / radius)
        
        // 添加噪点（模拟不均匀）
        const noise = (Math.random() - 0.5) * irregularity * 0.2
        
        // 计算最终染料浓度
        const concentration = intensity * distanceFactor * (0.5 + lineProximity * 0.5) + noise
        
        // 叠加到现有浓度
        const current = this.fabric.getValue(ax, ay)
        this.fabric.setValue(ax, ay, Math.min(1, current + concentration))
      }
    }
  }
  
  /**
   * 板缔（几何对称）
   * 参考图片2、图片4
   */
  private applyItajimeShibori(
    centerX: number,
    centerY: number,
    radius: number,
    intensity: number,
    symmetry: number,
    irregularity: number
  ): void {
    // 四方对称的几何图案
    const resistRadius = radius * 0.2
    
    for (let ay = 0; ay < this.fabric.height; ay++) {
      for (let ax = 0; ax < this.fabric.width; ax++) {
        const dx = ax - centerX
        const dy = ay - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // 抗染区域
        if (distance < resistRadius) {
          continue
        }
        
        // 计算对称位置
        const angle = Math.atan2(dy, dx)
        const symmetricAngle = Math.round(angle / (Math.PI * 2 / symmetry)) * (Math.PI * 2 / symmetry)
        
        // 对称折线效果
        const foldEffect = Math.abs(Math.cos(symmetricAngle * symmetry / 2))
        
        // 距离衰减
        const distanceFactor = Math.max(0, 1 - (distance - resistRadius) / radius)
        
        // 噪点
        const noise = (Math.random() - 0.5) * irregularity * 0.15
        
        const concentration = intensity * distanceFactor * foldEffect + noise
        
        const current = this.fabric.getValue(ax, ay)
        this.fabric.setValue(ax, ay, Math.min(1, current + concentration))
      }
    }
  }
  
  /**
   * 岚染（斜向雨线）
   * 参考图片1
   */
  private applyArashiShibori(
    centerX: number,
    centerY: number,
    radius: number,
    intensity: number,
    symmetry: number,
    irregularity: number
  ): void {
    const angle = 45 + (Math.random() - 0.5) * irregularity * 20  // 斜向角度
    const lineSpacing = radius / 10
    
    for (let ay = 0; ay < this.fabric.height; ay++) {
      for (let ax = 0; ax < this.fabric.width; ax++) {
        const dx = ax - centerX
        const dy = ay - centerY
        
        // 旋转坐标系
        const rotatedX = dx * Math.cos(angle * Math.PI / 180) - dy * Math.sin(angle * Math.PI / 180)
        
        // 计算到最近斜线的距离
        const linePosition = Math.abs(rotatedX % lineSpacing)
        const lineProximity = 1 - linePosition / lineSpacing
        
        // 距离中心的衰减
        const distance = Math.sqrt(dx * dx + dy * dy)
        const distanceFactor = Math.max(0, 1 - distance / radius)
        
        // 噪点
        const noise = (Math.random() - 0.5) * irregularity * 0.2
        
        const concentration = intensity * distanceFactor * lineProximity + noise
        
        const current = this.fabric.getValue(ax, ay)
        this.fabric.setValue(ax, ay, Math.min(1, current + concentration))
      }
    }
  }
  
  /**
   * 鹿の子（多点散布）
   * 参考图片3
   */
  private applyKanokoShibori(
    centerX: number,
    centerY: number,
    radius: number,
    intensity: number,
    symmetry: number,
    irregularity: number
  ): void {
    // 在范围内生成多个小圆点
    const numDots = Math.floor(10 + symmetry * 2)
    
    for (let i = 0; i < numDots; i++) {
      const dotAngle = (i / numDots) * Math.PI * 2 + (Math.random() - 0.5) * irregularity * Math.PI
      const dotDistance = radius * (0.3 + Math.random() * 0.5)
      const dotX = centerX + Math.cos(dotAngle) * dotDistance
      const dotY = centerY + Math.sin(dotAngle) * dotDistance
      const dotRadius = radius * (0.05 + Math.random() * 0.1)
      
      for (let ay = 0; ay < this.fabric.height; ay++) {
        for (let ax = 0; ax < this.fabric.width; ax++) {
          const dx = ax - dotX
          const dy = ay - dotY
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < dotRadius) {
            // 白色中心
            continue
          }
          
          // 放射状扩散
          const distanceFactor = Math.max(0, 1 - (distance - dotRadius) / (dotRadius * 3))
          const noise = (Math.random() - 0.5) * irregularity * 0.15
          
          const concentration = intensity * distanceFactor * 0.6 + noise
          
          const current = this.fabric.getValue(ax, ay)
          this.fabric.setValue(ax, ay, Math.min(1, current + concentration))
        }
      }
    }
  }
  
  /**
   * 模糊扩散（可选的后处理）
   */
  blur(iterations: number = 3): void {
    const tempGrid = new Float32Array(this.fabric.grid)
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < this.fabric.height - 1; y++) {
        for (let x = 1; x < this.fabric.width - 1; x++) {
          const idx = y * this.fabric.width + x
          
          // 3x3 邻域平均
          const sum = 
            tempGrid[idx - this.fabric.width - 1] * 0.05 +
            tempGrid[idx - this.fabric.width] * 0.1 +
            tempGrid[idx - this.fabric.width + 1] * 0.05 +
            tempGrid[idx - 1] * 0.1 +
            tempGrid[idx] * 0.4 +
            tempGrid[idx + 1] * 0.1 +
            tempGrid[idx + this.fabric.width - 1] * 0.05 +
            tempGrid[idx + this.fabric.width] * 0.1 +
            tempGrid[idx + this.fabric.width + 1] * 0.05
          
          this.fabric.grid[idx] = sum
        }
      }
      tempGrid.set(this.fabric.grid)
    }
  }
  
  /**
   * 获取布料网格
   */
  getFabric(): VirtualFabric {
    return this.fabric
  }
  
  /**
   * 清空画布
   */
  clear(): void {
    this.fabric.clear()
  }
}

/**
 * 真实靛蓝色调
 */
export const INDIGO_PALETTE = {
  // 完全未染色（米白色布料）
  white: { r: 250, g: 248, b: 245, concentration: 0.0 },
  
  // 极浅蓝
  veryLightBlue: { r: 232, g: 240, b: 247, concentration: 0.15 },
  
  // 浅蓝
  lightBlue: { r: 168, g: 200, b: 225, concentration: 0.35 },
  
  // 中蓝
  mediumBlue: { r: 107, g: 155, b: 195, concentration: 0.55 },
  
  // 深蓝
  darkBlue: { r: 61, g: 94, b: 123, concentration: 0.75 },
  
  // 浓蓝
  veryDarkBlue: { r: 30, g: 58, b: 95, concentration: 0.95 },
  
  /**
   * 根据染料浓度插值颜色
   */
  getColor(concentration: number): RGB {
    const colors = [
      this.white,
      this.veryLightBlue,
      this.lightBlue,
      this.mediumBlue,
      this.darkBlue,
      this.veryDarkBlue
    ]
    
    // 找到对应区间
    for (let i = 0; i < colors.length - 1; i++) {
      if (concentration <= colors[i + 1].concentration) {
        // 线性插值
        const c1 = colors[i]
        const c2 = colors[i + 1]
        const t = (concentration - c1.concentration) / (c2.concentration - c1.concentration)
        
        return {
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t)
        }
      }
    }
    
    return colors[colors.length - 1]
  }
}
