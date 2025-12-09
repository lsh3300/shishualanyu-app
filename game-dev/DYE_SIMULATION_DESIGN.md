# 🎨 蓝染模拟系统设计
## 基于真实作品的完整重构方案

**设计日期**: 2025-11-30
**基于**: 5张真实蓝染作品分析

---

## 📷 真实作品特征分析

### 关键视觉特征

1. **折叠痕迹** 🔲
   - 清晰的折线
   - 对称的辐射线
   - 不完全规则

2. **白色留白区域** ⬜
   - 绑扎中心完全未染色
   - 形成自然的图案
   - 边缘柔和过渡

3. **染料扩散** 🌊
   - 从绑扎点向外扩散
   - 沿着布料褶皱流动
   - 不规则的渐变

4. **颜色层次** 🎨
   - 深蓝（中心/多次浸染）
   - 中蓝（正常染色）
   - 浅蓝（边缘/单次浸染）
   - 白色（抗染区）

5. **布料质感** 📐
   - 可见编织纹理
   - 立体褶皱
   - 手工不完美感

---

## 🎯 新系统设计理念

### 从"图形设计"到"染色模拟"

**旧系统**（方案A）：
```
用户选择SVG图案 → 放置在画布 → 添加滤镜效果
                ↓
         看起来还是"图形"
```

**新系统**（方案B升级）：
```
用户选择扎染技法 → 设置绑扎点 → 模拟染料扩散 → 生成真实效果
                              ↓
                    看起来像"真实蓝染"
```

---

## 🏗️ 系统架构设计

### 1. 虚拟布料层

**目的**：模拟真实布料的物理属性

```typescript
class VirtualFabric {
  // 布料网格（用于计算染料扩散）
  private grid: Float32Array  // 像素网格，存储染料浓度
  private fabricTexture: ImageData  // 布料纹理
  private foldLines: FoldLine[]  // 折叠线
  
  constructor(width: number, height: number) {
    // 创建高分辨率网格
    this.grid = new Float32Array(width * height)
    
    // 加载布料纹理
    this.fabricTexture = this.generateFabricTexture()
    
    // 初始化为白色（未染色状态）
    this.grid.fill(0)
  }
  
  // 生成布料纹理
  private generateFabricTexture(): ImageData {
    // 使用噪点算法生成编织纹理
    // 参考真实图片的纹理密度
  }
}
```

### 2. 扎染点系统

**目的**：定义染料扩散的起点和规则

```typescript
interface TiePoint {
  x: number
  y: number
  type: 'kumo' | 'itajime' | 'arashi' | 'kanoko'  // 扎染技法
  size: number  // 绑扎区域大小
  intensity: number  // 染色强度
  foldPattern: FoldPattern  // 折叠方式
}

interface FoldPattern {
  type: 'radial' | 'linear' | 'grid'  // 折叠类型
  symmetry: number  // 对称性（4、6、8等）
  irregularity: number  // 不规则度（0-1）
}
```

### 3. 染料扩散算法

**核心**：模拟染料在布料上的真实扩散

```typescript
class DyeSimulator {
  /**
   * 模拟染料扩散
   * 参考图片特征：从中心向外，沿着褶皱流动
   */
  simulateDyeSpread(
    fabric: VirtualFabric,
    tiePoint: TiePoint,
    dyeColor: RGB,
    diffusionSteps: number = 100
  ): void {
    const { x, y, size, intensity, foldPattern } = tiePoint
    
    // 1. 确定抗染区域（白色留白）
    const resistArea = this.calculateResistArea(x, y, size)
    
    // 2. 生成折痕路径
    const foldLines = this.generateFoldLines(x, y, foldPattern)
    
    // 3. 染料扩散模拟（多次迭代）
    for (let step = 0; step < diffusionSteps; step++) {
      this.diffuseStep(fabric.grid, {
        sources: foldLines,  // 染料从折痕扩散
        resistAreas: resistArea,  // 不染色区域
        intensity: intensity * (1 - step / diffusionSteps),  // 逐渐减弱
        irregularity: 0.2  // 添加随机性
      })
    }
    
    // 4. 应用布料纹理
    this.applyFabricTexture(fabric.grid, fabric.fabricTexture)
  }
  
  /**
   * 单步扩散
   * 使用改进的热传导模型
   */
  private diffuseStep(
    grid: Float32Array,
    params: DiffusionParams
  ): void {
    // 对每个像素
    for (let i = 0; i < grid.length; i++) {
      // 检查是否在抗染区
      if (this.isInResistArea(i, params.resistAreas)) {
        continue
      }
      
      // 计算邻近像素的平均染料浓度
      const neighbors = this.getNeighbors(i, grid)
      const avgConcentration = this.average(neighbors)
      
      // 扩散公式（带随机性）
      const diffusion = avgConcentration * 0.25  // 扩散系数
      const randomNoise = (Math.random() - 0.5) * params.irregularity
      
      grid[i] += diffusion + randomNoise
      grid[i] = Math.min(1, Math.max(0, grid[i]))  // 限制在[0,1]
    }
  }
  
  /**
   * 生成折痕路径
   * 参考图片的放射状/对称折痕
   */
  private generateFoldLines(
    centerX: number,
    centerY: number,
    pattern: FoldPattern
  ): Line[] {
    const lines: Line[] = []
    
    switch (pattern.type) {
      case 'radial':
        // 放射状折痕（如图1、图2）
        const angleStep = 360 / pattern.symmetry
        for (let i = 0; i < pattern.symmetry; i++) {
          const angle = i * angleStep + (Math.random() - 0.5) * pattern.irregularity * 10
          lines.push({
            start: { x: centerX, y: centerY },
            end: this.pointAtAngle(centerX, centerY, angle, 200)
          })
        }
        break
        
      case 'grid':
        // 网格折痕（如图3）
        // 生成水平和垂直折线
        break
    }
    
    return lines
  }
  
  /**
   * 计算抗染区域
   * 绑扎中心及周围保持白色
   */
  private calculateResistArea(
    x: number,
    y: number,
    size: number
  ): ResistArea {
    return {
      center: { x, y },
      radius: size,
      // 边缘柔和过渡（不是硬边界）
      falloff: size * 0.3
    }
  }
}
```

### 4. 渲染系统

**目的**：将模拟结果渲染到Canvas

```typescript
class IndigoDyeRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  
  /**
   * 渲染染色效果
   */
  render(fabric: VirtualFabric, colorPalette: IndigoColorPalette): void {
    const imageData = this.ctx.createImageData(
      this.canvas.width,
      this.canvas.height
    )
    
    // 遍历每个像素
    for (let i = 0; i < fabric.grid.length; i++) {
      const dyeConcentration = fabric.grid[i]  // 0-1
      
      // 根据浓度选择颜色
      const color = this.getColorForConcentration(
        dyeConcentration,
        colorPalette
      )
      
      // 叠加布料纹理
      const fabricColor = fabric.fabricTexture.data[i * 4]
      const finalColor = this.blendWithFabric(color, fabricColor)
      
      // 写入像素
      const pixelIndex = i * 4
      imageData.data[pixelIndex] = finalColor.r
      imageData.data[pixelIndex + 1] = finalColor.g
      imageData.data[pixelIndex + 2] = finalColor.b
      imageData.data[pixelIndex + 3] = 255
    }
    
    this.ctx.putImageData(imageData, 0, 0)
  }
  
  /**
   * 真实靛蓝色调映射
   * 参考实际图片的颜色
   */
  private getColorForConcentration(
    concentration: number,
    palette: IndigoColorPalette
  ): RGB {
    // 0.0 - 白色（未染色）
    // 0.2 - 极浅蓝 #E8F0F7
    // 0.4 - 浅蓝 #A8C8E1
    // 0.6 - 中蓝 #6B9BC3
    // 0.8 - 深蓝 #3D5E7B
    // 1.0 - 浓蓝 #1E3A5F
    
    return palette.interpolate(concentration)
  }
}
```

---

## 🎮 用户交互设计

### 新的创作流程

**步骤1：选择扎染技法**

```tsx
<TieDyeTechniqueSelector>
  <Technique 
    id="kumo"
    name="蜘蛛扎染"
    icon="🕷️"
    description="从中心点放射，形成蜘蛛网状"
    preview={图片5}
  />
  <Technique 
    id="itajime"
    name="板缔"
    icon="▦"
    description="折叠后夹板压制，形成对称图案"
    preview={图片2、图片4}
  />
  <Technique 
    id="arashi"
    name="岚染"
    icon="🌀"
    description="斜向缠绕，形成雨线效果"
    preview={图片1}
  />
</TieDyeTechniqueSelector>
```

**步骤2：在画布上点击设置扎染点**

```typescript
// 用户点击画布
const handleCanvasClick = (x, y) => {
  if (selectedTechnique) {
    // 显示配置面板
    showTiePointConfig({
      position: { x, y },
      technique: selectedTechnique,
      onConfirm: (config) => {
        // 添加扎染点
        addTiePoint({
          x, y,
          type: selectedTechnique,
          ...config
        })
        
        // 实时预览染色效果
        simulateDyeing()
      }
    })
  }
}
```

**步骤3：调整参数**

```tsx
<TiePointConfig>
  <Slider 
    label="绑扎大小"
    value={size}
    onChange={setSize}
    min={10} max={100}
  />
  <Slider 
    label="染色强度"
    value={intensity}
    onChange={setIntensity}
    min={0} max={1}
  />
  <Slider 
    label="对称性"
    value={symmetry}
    onChange={setSymmetry}
    options={[4, 6, 8, 12]}
  />
  <Slider 
    label="不规则度"
    value={irregularity}
    onChange={setIrregularity}
    min={0} max={1}
  />
</TiePointConfig>
```

**步骤4：模拟染色**

```typescript
// 点击"开始染色"按钮
const startDyeing = async () => {
  // 显示动画
  showDyeingAnimation()
  
  // 逐步模拟染料扩散
  for (let step = 0; step < 100; step++) {
    await simulator.diffuseStep()
    renderer.render()
    
    // 延迟以显示动画
    await sleep(50)
  }
  
  // 完成
  showCompletedResult()
}
```

---

## 🎨 扎染技法库

### 基于真实技法的图案类型

```typescript
const TIE_DYE_TECHNIQUES = [
  {
    id: 'kumo-shibori',
    name: '蜘蛛扎染（蜘蛛絞り）',
    nameEn: 'Kumo Shibori',
    icon: '🕷️',
    description: '从中心点绑扎，形成放射状图案',
    reference: '参考图片5',
    foldPattern: {
      type: 'radial',
      symmetry: 8,
      irregularity: 0.3
    },
    dyePattern: {
      whiteCenter: true,  // 中心白色
      radiateLines: true,  // 放射线
      concentricCircles: true  // 同心圆
    }
  },
  
  {
    id: 'itajime-shibori',
    name: '板缔（板締め絞り）',
    nameEn: 'Itajime Shibori',
    icon: '▦',
    description: '折叠后夹板压制，形成几何对称图案',
    reference: '参考图片2、图片4',
    foldPattern: {
      type: 'grid',
      symmetry: 4,
      irregularity: 0.1
    },
    dyePattern: {
      geometricShapes: true,  // 几何形状
      sharpFolds: true,  // 清晰折痕
      symmetrical: true  // 完全对称
    }
  },
  
  {
    id: 'arashi-shibori',
    name: '岚染（嵐絞り）',
    nameEn: 'Arashi Shibori',
    icon: '🌀',
    description: '斜向缠绕管子，形成雨线效果',
    reference: '参考图片1',
    foldPattern: {
      type: 'diagonal',
      symmetry: 2,
      irregularity: 0.4
    },
    dyePattern: {
      diagonalLines: true,  // 斜线
      rainEffect: true,  // 雨线效果
      flowing: true  // 流动感
    }
  },
  
  {
    id: 'kanoko-shibori',
    name: '鹿の子絞り',
    nameEn: 'Kanoko Shibori',
    icon: '🦌',
    description: '多点绑扎，形成小圆点图案',
    reference: '参考图片3',
    foldPattern: {
      type: 'multiple-points',
      symmetry: 0,  // 不对称
      irregularity: 0.5
    },
    dyePattern: {
      smallCircles: true,  // 小圆点
      scattered: true,  // 散布
      varied: true  // 大小不一
    }
  }
]
```

---

## 🎨 真实靛蓝色调系统

### 基于图片的精确配色

```typescript
const REALISTIC_INDIGO_PALETTE = {
  // 完全未染色
  white: {
    rgb: [250, 248, 245],
    concentration: 0.0
  },
  
  // 极浅蓝（图1的浅色区域）
  veryLightBlue: {
    rgb: [232, 240, 247],
    concentration: 0.15
  },
  
  // 浅蓝（图4的主要色调）
  lightBlue: {
    rgb: [168, 200, 225],
    concentration: 0.35
  },
  
  // 中蓝（图5的中间色）
  mediumBlue: {
    rgb: [107, 155, 195],
    concentration: 0.55
  },
  
  // 深蓝（图2的深色区域）
  darkBlue: {
    rgb: [61, 94, 123],
    concentration: 0.75
  },
  
  // 浓蓝（图2的中心）
  veryDarkBlue: {
    rgb: [30, 58, 95],
    concentration: 0.95
  },
  
  // 插值函数
  interpolate(concentration: number): RGB {
    // 在上述颜色之间平滑插值
  }
}
```

---

## 🚀 实施计划

### 阶段1：核心引擎开发（3-4天）

**任务**：
1. ✅ 创建VirtualFabric类
2. ✅ 实现DyeSimulator
3. ✅ 实现基础扩散算法
4. ✅ 创建IndigoDyeRenderer
5. ✅ 测试单个扎染点效果

**验证标准**：
- 可以生成一个类似图片5的单个圆形染色效果
- 有白色中心、放射线、颜色渐变

### 阶段2：交互系统（2天）

**任务**：
1. ✅ 设计扎染技法选择器
2. ✅ 实现画布点击添加扎染点
3. ✅ 实现参数调整面板
4. ✅ 实时预览

**验证标准**：
- 用户可以选择技法
- 可以点击画布添加扎染点
- 可以看到实时效果

### 阶段3：技法库扩展（2-3天）

**任务**：
1. ✅ 实现Kumo Shibori（蜘蛛扎染）
2. ✅ 实现Itajime Shibori（板缔）
3. ✅ 实现Arashi Shibori（岚染）
4. ✅ 实现Kanoko Shibori（鹿の子）

**验证标准**：
- 每种技法都能生成接近真实图片的效果

### 阶段4：优化和完善（2天）

**任务**：
1. ✅ 性能优化（WebGL加速）
2. ✅ 动画效果（染色过程动画）
3. ✅ 导出高清图片
4. ✅ 用户体验优化

---

## 💡 技术挑战与解决方案

### 挑战1：性能问题

**问题**：
- 高分辨率网格（如800x800）需要640,000个像素
- 100步扩散迭代 = 6400万次计算

**解决方案**：
```typescript
// 方案A：使用WebGL着色器加速
class WebGLDyeSimulator {
  private gl: WebGLRenderingContext
  
  // 在GPU上并行计算扩散
  diffuseOnGPU(grid: WebGLTexture): void {
    // Fragment Shader执行扩散算法
    // 比CPU快100倍
  }
}

// 方案B：多层次细节（LOD）
const resolution = patterns.length < 3 ? 800 : 400
```

### 挑战2：真实感

**问题**：
- 完全规则的扩散不够真实
- 需要手工的不完美感

**解决方案**：
```typescript
// 添加多种随机性
const irregularities = {
  // 1. 扩散系数随机
  diffusionCoeff: 0.25 + (Math.random() - 0.5) * 0.05,
  
  // 2. 折痕角度偏移
  angleOffset: (Math.random() - 0.5) * 10,
  
  // 3. 染料浓度波动
  concentrationNoise: perlinNoise(x, y) * 0.1,
  
  // 4. 抗染区域不规则
  resistAreaVariation: simplex(x, y) * 5
}
```

### 挑战3：与现有系统整合

**问题**：
- 现有系统是SVG-based
- 新系统是Canvas-based
- 需要平滑迁移

**解决方案**：
```typescript
// 混合模式：同时支持两种
<IndigoCanvas mode="simple" />  // SVG模式（快速）
<IndigoCanvas mode="realistic" />  // Canvas染色模拟（真实）

// 用户可以切换
const [renderMode, setRenderMode] = useState<'simple' | 'realistic'>('realistic')
```

---

## 📊 效果对比预期

### Before（当前方案A）
```
✅ 布料纹理背景
✅ 柔和的边缘
✅ 真实的颜色
❌ 还是"图形"的感觉
❌ 缺少折痕
❌ 缺少白色留白
❌ 缺少手工感
```

### After（新方案）
```
✅ 布料纹理
✅ 柔和的边缘
✅ 真实的颜色
✅ 有折痕和放射线
✅ 有白色留白区域
✅ 有自然的不规则性
✅ 整体像真实蓝染作品
```

---

## 🎯 成功标准

### 视觉标准
1. **放在真实作品旁边不违和**
2. **外行人分辨不出是数字作品**
3. **具有明显的手工感**
4. **每次生成的结果略有不同**

### 技术标准
1. 渲染时间 < 2秒（800x800分辨率）
2. 支持至少4种扎染技法
3. 参数可调整且效果明显
4. 导出高清图片（2400x2400）

---

## 🚀 立即开始

我建议**立即启动这个新方案**，因为：

1. ✅ 这才能真正解决"不像蓝染"的问题
2. ✅ 基于真实作品的深入分析
3. ✅ 有清晰的技术路线
4. ✅ 可以分阶段实施

**第一步**：我先实现一个**单个扎染点的完整原型**，让你看到效果，然后再决定是否继续。

---

**你同意这个方案吗？我可以立即开始实现原型！** 🎨✨
