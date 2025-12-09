/**
 * 不规则形状生成器
 * 
 * 用途：为布料卡片、印章等元素生成自然的、不规则的边缘
 * 设计理念：模拟手工裁剪的效果，每条边都有微妙的波动
 */

export interface Point {
  x: number
  y: number
}

export interface IrregularShapeOptions {
  /** 基础形状尺寸 */
  width: number
  height: number
  /** 每条边的点数 */
  pointsPerSide: number
  /** 不规则程度 (0-1) */
  irregularity: number
  /** 随机种子（确保相同输入产生相同输出）*/
  seed: number
  /** 圆角半径 */
  cornerRadius?: number
}

export class IrregularShapeGenerator {
  private options: Required<IrregularShapeOptions>

  constructor(options: IrregularShapeOptions) {
    this.options = {
      cornerRadius: 8,
      ...options,
    }
  }

  /**
   * 生成不规则矩形的所有顶点
   */
  generateRectPoints(): Point[] {
    const { width, height, pointsPerSide, irregularity, seed, cornerRadius } =
      this.options

    const points: Point[] = []
    let seedCounter = seed

    // 四条边：上、右、下、左
    const sides = [
      { start: { x: cornerRadius, y: 0 }, end: { x: width - cornerRadius, y: 0 } }, // 上
      { start: { x: width, y: cornerRadius }, end: { x: width, y: height - cornerRadius } }, // 右
      { start: { x: width - cornerRadius, y: height }, end: { x: cornerRadius, y: height } }, // 下
      { start: { x: 0, y: height - cornerRadius }, end: { x: 0, y: cornerRadius } }, // 左
    ]

    sides.forEach((side, sideIndex) => {
      // 在每条边上生成点
      for (let i = 0; i < pointsPerSide; i++) {
        const t = i / pointsPerSide
        const x = side.start.x + (side.end.x - side.start.x) * t
        const y = side.start.y + (side.end.y - side.start.y) * t

        // 计算垂直于边的扰动方向
        const dx = side.end.x - side.start.x
        const dy = side.end.y - side.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const normalX = -dy / length
        const normalY = dx / length

        // 生成扰动量
        const noise = this.pseudoRandom(seedCounter++) - 0.5
        const disturbance = noise * irregularity * 6

        points.push({
          x: x + normalX * disturbance,
          y: y + normalY * disturbance,
        })
      }

      // 在拐角处添加圆角过渡点
      if (sideIndex < sides.length - 1) {
        const cornerPoints = this.generateCorner(
          side.end,
          sides[(sideIndex + 1) % sides.length].start,
          cornerRadius,
          4,
          irregularity,
          seedCounter
        )
        points.push(...cornerPoints)
        seedCounter += cornerPoints.length
      }
    })

    return points
  }

  /**
   * 生成圆角过渡点
   */
  private generateCorner(
    start: Point,
    end: Point,
    radius: number,
    numPoints: number,
    irregularity: number,
    seed: number
  ): Point[] {
    const points: Point[] = []
    const cx = (start.x + end.x) / 2
    const cy = (start.y + end.y) / 2

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      const cornerAngle = angle + ((Math.PI / 2) * (t - 0.5))

      const noise = this.pseudoRandom(seed + i) - 0.5
      const r = radius + noise * irregularity * 2

      points.push({
        x: cx + Math.cos(cornerAngle) * r,
        y: cy + Math.sin(cornerAngle) * r,
      })
    }

    return points
  }

  /**
   * 生成不规则圆形
   */
  generateCirclePoints(cx: number, cy: number, radius: number): Point[] {
    const { pointsPerSide, irregularity, seed } = this.options
    const points: Point[] = []
    const totalPoints = pointsPerSide * 4 // 圆形需要更多点

    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2
      const noise = this.pseudoRandom(seed + i) - 0.5
      const r = radius + noise * irregularity * 8

      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      })
    }

    return points
  }

  /**
   * 将点数组转换为SVG路径字符串（使用平滑曲线）
   */
  pointsToSmoothPath(points: Point[], closed: boolean = true): string {
    if (points.length === 0) return ''

    let path = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`

    // 使用二次贝塞尔曲线平滑连接点
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[(i + 1) % points.length]

      // 控制点：当前点和下一点的中点
      const cpx = (curr.x + next.x) / 2
      const cpy = (curr.y + next.y) / 2

      path += ` Q ${curr.x.toFixed(2)},${curr.y.toFixed(2)} ${cpx.toFixed(2)},${cpy.toFixed(2)}`
    }

    // 闭合路径
    if (closed) {
      const first = points[0]
      const last = points[points.length - 1]
      const cpx = (last.x + first.x) / 2
      const cpy = (last.y + first.y) / 2
      path += ` Q ${last.x.toFixed(2)},${last.y.toFixed(2)} ${cpx.toFixed(2)},${cpy.toFixed(2)} Z`
    }

    return path
  }

  /**
   * 生成完整的SVG路径字符串（矩形）
   */
  generateRectPath(): string {
    const points = this.generateRectPoints()
    return this.pointsToSmoothPath(points, true)
  }

  /**
   * 生成完整的SVG路径字符串（圆形）
   */
  generateCirclePath(cx: number, cy: number, radius: number): string {
    const points = this.generateCirclePoints(cx, cy, radius)
    return this.pointsToSmoothPath(points, true)
  }

  /**
   * 伪随机数生成器（基于种子，确保可重复）
   */
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  /**
   * 生成字符串哈希（用于将用户名等字符串转换为数字种子）
   */
  static stringToSeed(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0 // 转换为32位整数
    }
    return Math.abs(hash)
  }
}
