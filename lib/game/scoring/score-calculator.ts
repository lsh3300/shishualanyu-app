/**
 * 评分系统 - 核心计算逻辑
 * Scoring System - Core Calculation Logic
 * 
 * 修复版本：移除硬编码的颜色分数，实现真实的评分算法
 */

import type { ClothLayer, ColorHSL, ScoreDimensions, ScoreGrade } from '@/types/game.types'
import { ScoreConfig } from '../config'

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 计算标准差
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const squareDiffs = values.map(v => Math.pow(v - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length
  
  return Math.sqrt(avgSquareDiff)
}

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ============================================================================
// 颜色分数计算 - 修复版本
// ============================================================================

/**
 * 计算颜色分数
 * 
 * 基于三个维度：
 * 1. 染色深度分布 (30分) - 平均染色深度
 * 2. 深度变化丰富度 (30分) - 染色深度的变化程度
 * 3. 颜色和谐度 (40分) - 是否在最佳染色深度范围内
 * 
 * @param layers - 布料图层数组
 * @returns 颜色分数 (0-100)
 */
export function calculateColorScore(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0

  const dyeDepths = layers.map(l => l.dyeDepth)
  const { optimalDyeDepthRange } = ScoreConfig

  // 1. 染色深度分布分数 (30分)
  // 平均染色深度越接近0.6（中等深度）越好
  const avgDepth = dyeDepths.reduce((a, b) => a + b, 0) / dyeDepths.length
  const idealDepth = 0.6
  const depthDeviation = Math.abs(avgDepth - idealDepth)
  const depthScore = (1 - depthDeviation / idealDepth) * 30

  // 2. 深度变化丰富度分数 (30分)
  // 有适度的变化更好，但不能太极端
  const depthVariance = calculateStandardDeviation(dyeDepths)
  const idealVariance = 0.15 // 理想的变化程度
  const varianceDeviation = Math.abs(depthVariance - idealVariance)
  const varianceScore = Math.max(0, (1 - varianceDeviation / 0.3)) * 30

  // 3. 颜色和谐度分数 (40分)
  // 检查每个图层的染色深度是否在最佳范围内
  const inRangeCount = dyeDepths.filter(
    depth => depth >= optimalDyeDepthRange.min && depth <= optimalDyeDepthRange.max
  ).length
  const harmonyRatio = inRangeCount / dyeDepths.length
  const harmonyScore = harmonyRatio * 40

  const totalScore = depthScore + varianceScore + harmonyScore
  return clamp(Math.round(totalScore), 0, 100)
}

/**
 * 从图层中提取平均颜色
 */
export function extractAverageColor(layers: ClothLayer[]): ColorHSL {
  if (layers.length === 0) {
    return { h: 210, s: 50, l: 50 } // 默认蓝色
  }

  const avgDyeDepth = layers.reduce((sum, l) => sum + l.dyeDepth, 0) / layers.length
  
  // 蓝染色系：色相固定在蓝色区域(200-220)
  // 染色深度影响饱和度和亮度
  return {
    h: 210, // 靛蓝色相
    s: 30 + avgDyeDepth * 50, // 30-80%
    l: 90 - avgDyeDepth * 40  // 90-50%
  }
}

/**
 * 计算两个颜色的差异分数
 */
export function calculateColorDifference(
  target: ColorHSL,
  actual: ColorHSL
): number {
  const hueDiff = Math.min(
    Math.abs(target.h - actual.h),
    360 - Math.abs(target.h - actual.h)
  )
  const saturationDiff = Math.abs(target.s - actual.s)
  const lightnessDiff = Math.abs(target.l - actual.l)
  
  const score = 100 - (
    (hueDiff / 180) * 40 +
    (saturationDiff / 100) * 30 +
    (lightnessDiff / 100) * 30
  ) * 100
  
  return clamp(Math.round(score), 0, 100)
}

// ============================================================================
// 纹样复杂度分析
// ============================================================================

/**
 * 计算纹样复杂度分数
 * 
 * @param layers - 布料图层数组
 * @returns 纹样分数 (0-100)
 */
export function calculatePatternComplexity(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0

  // 1. 基础分：图层数量（1-5层最佳）(30分)
  const layerCount = Math.min(layers.length, 5)
  const layerScore = (layerCount / 5) * 30

  // 2. 覆盖率分：综合不透明度 (30分)
  const totalOpacity = layers.reduce((sum, layer) => {
    return sum + layer.params.opacity * (1 + layer.dyeDepth)
  }, 0)
  const coverageScore = Math.min(totalOpacity / 4, 1) * 30

  // 3. 多样性分：使用的纹样种类 (20分)
  const uniqueTextures = new Set(layers.map(l => l.textureId)).size
  const varietyScore = Math.min(uniqueTextures / 3, 1) * 20

  // 4. 精细度分：参数调整的复杂性 (20分)
  const adjustmentScore = layers.reduce((sum, layer) => {
    let score = 0
    if (Math.abs(layer.params.scale - 1) > 0.1) score += 3
    if (layer.params.rotation && Math.abs(layer.params.rotation) > 5) score += 3
    if (Math.abs(layer.params.x) > 10 || Math.abs(layer.params.y) > 10) score += 2
    if (layer.params.opacity < 0.9) score += 2
    return sum + score
  }, 0)
  const fineTuneScore = Math.min(adjustmentScore / (layers.length * 10), 1) * 20

  const totalScore = layerScore + coverageScore + varietyScore + fineTuneScore
  return clamp(Math.round(totalScore), 0, 100)
}

// ============================================================================
// 创意指数评估
// ============================================================================

/**
 * 计算创意指数
 * 
 * @param layers - 布料图层数组
 * @returns 创意分数 (0-100)
 */
export function calculateCreativityScore(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0

  // 1. 纹样组合独特性（30分）
  const textureCombo = layers.map(l => l.textureId).sort().join('-')
  const uniquenessScore = Math.min(textureCombo.length / 20, 1) * 30

  // 2. 参数变化丰富度（30分）
  const paramVariance = calculateParameterVariance(layers)
  const varianceScore = paramVariance * 30

  // 3. 染色深度变化（20分）
  const dyeDepthVariance = calculateDyeDepthVariance(layers)
  const dyeScore = dyeDepthVariance * 20

  // 4. 布局创意（20分）
  const layoutScore = calculateLayoutCreativity(layers) * 20

  const totalScore = uniquenessScore + varianceScore + dyeScore + layoutScore
  return clamp(Math.round(totalScore), 0, 100)
}

/**
 * 计算参数变化丰富度
 */
function calculateParameterVariance(layers: ClothLayer[]): number {
  if (layers.length <= 1) return 0.5

  const scales = layers.map(l => l.params.scale)
  const opacities = layers.map(l => l.params.opacity)
  const rotations = layers.map(l => l.params.rotation || 0)

  const scaleVariance = calculateStandardDeviation(scales)
  const opacityVariance = calculateStandardDeviation(opacities)
  const rotationVariance = calculateStandardDeviation(rotations)

  return (
    Math.min(scaleVariance / 0.5, 1) * 0.33 +
    Math.min(opacityVariance / 0.3, 1) * 0.33 +
    Math.min(rotationVariance / 45, 1) * 0.34
  )
}

/**
 * 计算染色深度变化
 */
function calculateDyeDepthVariance(layers: ClothLayer[]): number {
  if (layers.length <= 1) return 0.5

  const dyeDepths = layers.map(l => l.dyeDepth)
  const variance = calculateStandardDeviation(dyeDepths)
  
  const idealVariance = 0.2
  const deviation = Math.abs(variance - idealVariance)
  return Math.max(0, 1 - deviation / idealVariance)
}

/**
 * 计算布局创意
 */
function calculateLayoutCreativity(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0

  const positions = layers.map(l => ({ x: l.params.x, y: l.params.y }))
  const xPositions = positions.map(p => p.x)
  const yPositions = positions.map(p => p.y)
  
  const xSpread = calculateStandardDeviation(xPositions)
  const ySpread = calculateStandardDeviation(yPositions)
  
  return Math.min((xSpread + ySpread) / 200, 1)
}

// ============================================================================
// 技法评分
// ============================================================================

/**
 * 计算技法得分
 * 
 * @param layers - 布料图层数组
 * @returns 技法分数 (0-100)
 */
export function calculateTechniqueScore(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0

  let score = 0

  // 1. 图层叠加技巧（40分）
  const hasGoodLayering = layers.some((layer, i) => {
    if (i === 0) return false
    return layer.params.opacity < 0.8 && layer.params.opacity > 0.3
  })
  if (hasGoodLayering) score += 40

  // 2. 染色渐进（30分）
  if (layers.length > 1) {
    const dyeDepths = layers.map(l => l.dyeDepth)
    const isProgressive = dyeDepths.every((depth, i) => {
      if (i === 0) return true
      return depth >= dyeDepths[i - 1] - 0.1
    })
    if (isProgressive) score += 30
  }

  // 3. 纹样搭配（30分）
  const uniqueTextures = new Set(layers.map(l => l.textureId)).size
  const hasVariety = uniqueTextures > 1
  const notTooMany = uniqueTextures <= layers.length * 0.8
  
  if (hasVariety && notTooMany) {
    score += 30
  } else if (hasVariety) {
    score += 15
  }

  return clamp(Math.round(score), 0, 100)
}

// ============================================================================
// 总分计算
// ============================================================================

/**
 * 根据总分确定等级
 * 
 * 等级边界：
 * - SSS: >= 95
 * - SS: 90-94
 * - S: 80-89
 * - A: 70-79
 * - B: 60-69
 * - C: < 60
 */
export function getGradeFromScore(total: number): ScoreGrade {
  const { gradeBoundaries } = ScoreConfig
  
  if (total >= gradeBoundaries.SSS) return 'SSS'
  if (total >= gradeBoundaries.SS) return 'SS'
  if (total >= gradeBoundaries.S) return 'S'
  if (total >= gradeBoundaries.A) return 'A'
  if (total >= gradeBoundaries.B) return 'B'
  return 'C'
}

/**
 * 计算总分并确定等级
 */
export function calculateTotalScore(
  dimensions: ScoreDimensions
): { total: number; grade: ScoreGrade } {
  const total = Math.round(
    (dimensions.color_score +
     dimensions.pattern_score +
     dimensions.creativity_score +
     dimensions.technique_score) / 4
  )

  const grade = getGradeFromScore(total)
  return { total, grade }
}

/**
 * 完整评分函数 - 修复版本
 * 
 * 不再使用硬编码的颜色分数，而是基于实际图层数据计算
 */
export function scoreCloth(layers: ClothLayer[]): {
  dimensions: ScoreDimensions
  total: number
  grade: ScoreGrade
} {
  // 计算各维度分数 - 全部基于实际数据
  const color_score = calculateColorScore(layers)
  const pattern_score = calculatePatternComplexity(layers)
  const creativity_score = calculateCreativityScore(layers)
  const technique_score = calculateTechniqueScore(layers)

  const dimensions: ScoreDimensions = {
    color_score,
    pattern_score,
    creativity_score,
    technique_score
  }

  const { total, grade } = calculateTotalScore(dimensions)

  return {
    dimensions,
    total,
    grade
  }
}

// ============================================================================
// 奖励和展示相关
// ============================================================================

/**
 * 获取等级对应的奖励
 */
export function getGradeRewards(grade: ScoreGrade): {
  exp: number
  currency: number
} {
  return ScoreConfig.gradeRewards[grade]
}

/**
 * 获取等级对应的颜色
 */
export function getGradeColor(grade: ScoreGrade): string {
  const colors: Record<ScoreGrade, string> = {
    SSS: '#FFD700', // 金色
    SS: '#FF6B6B',  // 红色
    S: '#4ECDC4',   // 青色
    A: '#95E1D3',   // 浅绿
    B: '#A8E6CF',   // 更浅绿
    C: '#DDDDDD'    // 灰色
  }
  return colors[grade]
}

/**
 * 获取等级对应的文字描述
 */
export function getGradeDescription(grade: ScoreGrade): string {
  const descriptions: Record<ScoreGrade, string> = {
    SSS: '传世佳作！',
    SS: '大师之作！',
    S: '精品力作！',
    A: '优秀作品',
    B: '良好作品',
    C: '尚需努力'
  }
  return descriptions[grade]
}

/**
 * 检查颜色是否在范围内
 */
export function isColorInRange(
  color: ColorHSL,
  range: {
    h: [number, number]
    s: [number, number]
    l: [number, number]
  }
): boolean {
  const inHueRange = color.h >= range.h[0] && color.h <= range.h[1]
  const inSatRange = color.s >= range.s[0] && color.s <= range.s[1]
  const inLightRange = color.l >= range.l[0] && color.l <= range.l[1]
  
  return inHueRange && inSatRange && inLightRange
}
