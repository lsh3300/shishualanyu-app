/**
 * 任务检测服务
 * Task Detection Service
 * 
 * 负责检测用户创作的作品是否满足任务条件
 */

import type { PlacedPattern } from '@/components/game/canvas/IndigoCanvas'
import type { ClothScore } from '@/types/game.types'
import type { TaskConditions } from '@/types/task.types'

// ============================================================================
// 类型定义
// ============================================================================

export interface TaskCheckResult {
  taskId: string
  satisfied: boolean
  progress: number
  target: number
  details?: string
}

// ============================================================================
// 主检测函数
// ============================================================================

/**
 * 检测作品是否满足任务条件
 */
export function checkTaskConditions(
  patterns: PlacedPattern[],
  score?: ClothScore,
  conditions?: TaskConditions
): boolean {
  if (!conditions) return false

  switch (conditions.type) {
    case 'create_cloth':
      return checkCreateClothConditions(patterns, conditions.requirements)
    
    case 'achieve_score':
      return checkScoreConditions(score, conditions.requirements)
    
    case 'achieve_grade':
      return checkGradeConditions(score, conditions.requirements)
    
    default:
      return false
  }
}

// ============================================================================
// 创作类任务检测
// ============================================================================

/**
 * 检测创作类任务条件
 */
function checkCreateClothConditions(
  patterns: PlacedPattern[],
  requirements: TaskConditions['requirements']
): boolean {
  // 1. 检查图案数量
  if (requirements.min_patterns !== undefined) {
    if (patterns.length < requirements.min_patterns) {
      return false
    }
  }

  // 2. 检查必需图案
  if (requirements.required_patterns && requirements.required_patterns.length > 0) {
    const patternIds = new Set(patterns.map(p => p.patternId))
    const hasAllRequired = requirements.required_patterns.every(id => patternIds.has(id))
    if (!hasAllRequired) {
      return false
    }
  }

  // 3. 检查对称性
  if (requirements.has_symmetry === true) {
    if (!detectSymmetry(patterns)) {
      return false
    }
  }

  // 4. 检查色彩深度多样性
  if (requirements.min_color_depths !== undefined) {
    const uniqueDepths = getUniqueColorDepths(patterns)
    if (uniqueDepths < requirements.min_color_depths) {
      return false
    }
  }

  // 5. 检查图案类别
  if (requirements.pattern_categories && requirements.pattern_categories.length > 0) {
    // TODO: 需要图案分类信息
    // 暂时跳过这个检测
  }

  return true
}

// ============================================================================
// 评分类任务检测
// ============================================================================

/**
 * 检测评分类任务条件
 */
function checkScoreConditions(
  score: ClothScore | undefined,
  requirements: TaskConditions['requirements']
): boolean {
  if (!score) return false

  // 检查最低分数
  if (requirements.min_score !== undefined) {
    if (score.total_score < requirements.min_score) {
      return false
    }
  }

  return true
}

/**
 * 检测评级类任务条件
 */
function checkGradeConditions(
  score: ClothScore | undefined,
  requirements: TaskConditions['requirements']
): boolean {
  if (!score) return false

  const gradeOrder = ['C', 'B', 'A', 'S', 'SS', 'SSS']
  
  // 检查最低评级
  if (requirements.min_grade) {
    const currentIndex = gradeOrder.indexOf(score.grade)
    const requiredIndex = gradeOrder.indexOf(requirements.min_grade)
    
    if (currentIndex === -1 || requiredIndex === -1) return false
    if (currentIndex < requiredIndex) return false
  }

  // 检查精确评级
  if (requirements.grade) {
    if (score.grade !== requirements.grade) {
      return false
    }
  }

  return true
}

// ============================================================================
// 辅助检测函数
// ============================================================================

/**
 * 检测对称性
 * 检查图案是否呈对称分布（轴对称或中心对称）
 */
function detectSymmetry(patterns: PlacedPattern[]): boolean {
  if (patterns.length < 2) return false

  // 检测垂直轴对称（x=50）
  const verticalSymmetry = checkVerticalSymmetry(patterns)
  if (verticalSymmetry) return true

  // 检测水平轴对称（y=50）
  const horizontalSymmetry = checkHorizontalSymmetry(patterns)
  if (horizontalSymmetry) return true

  // 检测中心对称
  const centralSymmetry = checkCentralSymmetry(patterns)
  if (centralSymmetry) return true

  return false
}

/**
 * 检测垂直轴对称
 */
function checkVerticalSymmetry(patterns: PlacedPattern[]): boolean {
  const tolerance = 5 // 允许5%的误差

  // 按y坐标分组
  const groups = new Map<number, PlacedPattern[]>()
  patterns.forEach(p => {
    const yKey = Math.round(p.y / 5) * 5 // 按5%分组
    if (!groups.has(yKey)) groups.set(yKey, [])
    groups.get(yKey)!.push(p)
  })

  // 检查每组是否对称
  for (const group of groups.values()) {
    if (group.length < 2) continue
    
    // 检查是否成对
    if (group.length % 2 !== 0) {
      // 可能有中心图案
      const centerPattern = group.find(p => Math.abs(p.x - 50) < tolerance)
      if (!centerPattern) return false
    }

    // 检查每个图案是否有镜像
    for (const pattern of group) {
      if (Math.abs(pattern.x - 50) < tolerance) continue // 中心图案
      
      const mirrorX = 100 - pattern.x
      const hasMirror = group.some(p => 
        Math.abs(p.x - mirrorX) < tolerance &&
        p.patternId === pattern.patternId
      )
      
      if (!hasMirror) return false
    }
  }

  return true
}

/**
 * 检测水平轴对称
 */
function checkHorizontalSymmetry(patterns: PlacedPattern[]): boolean {
  const tolerance = 5

  const groups = new Map<number, PlacedPattern[]>()
  patterns.forEach(p => {
    const xKey = Math.round(p.x / 5) * 5
    if (!groups.has(xKey)) groups.set(xKey, [])
    groups.get(xKey)!.push(p)
  })

  for (const group of groups.values()) {
    if (group.length < 2) continue
    
    if (group.length % 2 !== 0) {
      const centerPattern = group.find(p => Math.abs(p.y - 50) < tolerance)
      if (!centerPattern) return false
    }

    for (const pattern of group) {
      if (Math.abs(pattern.y - 50) < tolerance) continue
      
      const mirrorY = 100 - pattern.y
      const hasMirror = group.some(p => 
        Math.abs(p.y - mirrorY) < tolerance &&
        p.patternId === pattern.patternId
      )
      
      if (!hasMirror) return false
    }
  }

  return true
}

/**
 * 检测中心对称
 */
function checkCentralSymmetry(patterns: PlacedPattern[]): boolean {
  const tolerance = 5
  const centerX = 50
  const centerY = 50

  // 检查是否有中心图案
  const hasCenterPattern = patterns.some(p => 
    Math.abs(p.x - centerX) < tolerance && 
    Math.abs(p.y - centerY) < tolerance
  )

  // 检查每个非中心图案是否有对称图案
  for (const pattern of patterns) {
    // 跳过中心图案
    if (Math.abs(pattern.x - centerX) < tolerance && 
        Math.abs(pattern.y - centerY) < tolerance) {
      continue
    }

    // 计算中心对称位置
    const mirrorX = 2 * centerX - pattern.x
    const mirrorY = 2 * centerY - pattern.y

    // 检查是否存在对称图案
    const hasMirror = patterns.some(p =>
      Math.abs(p.x - mirrorX) < tolerance &&
      Math.abs(p.y - mirrorY) < tolerance &&
      p.patternId === pattern.patternId
    )

    if (!hasMirror) return false
  }

  return patterns.length >= 2 // 至少需要2个图案才能谈对称
}

/**
 * 获取唯一的色彩深度数量
 */
function getUniqueColorDepths(patterns: PlacedPattern[]): number {
  // 将深度分为5个档次：0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
  const depthLevels = new Set(
    patterns.map(p => Math.floor(p.dyeDepth * 5))
  )
  return depthLevels.size
}

// ============================================================================
// 批量检测函数
// ============================================================================

/**
 * 批量检测所有相关任务
 */
export function checkAllTasks(
  patterns: PlacedPattern[],
  score: ClothScore | undefined,
  taskTemplates: Array<{ id: string; conditions: TaskConditions }>
): TaskCheckResult[] {
  return taskTemplates.map(task => {
    const satisfied = checkTaskConditions(patterns, score, task.conditions)
    
    // 计算进度
    let progress = satisfied ? 1 : 0
    let target = 1

    // 对于某些任务，可能需要累积计数（如创作10个作品）
    // 这部分逻辑在实际使用时会从数据库获取

    return {
      taskId: task.id,
      satisfied,
      progress,
      target,
      details: satisfied ? '条件已满足' : '条件未满足'
    }
  })
}

// ============================================================================
// 导出便捷函数
// ============================================================================

/**
 * 快速检测：是否满足"第一次染色"任务
 */
export function checkFirstCreation(): boolean {
  return true // 只要创作了就满足
}

/**
 * 快速检测：是否满足"掌握对称"任务
 */
export function checkSymmetryMastery(patterns: PlacedPattern[]): boolean {
  return detectSymmetry(patterns)
}

/**
 * 快速检测：是否满足"色彩层次"任务
 */
export function checkColorDepthVariety(patterns: PlacedPattern[], minDepths: number = 3): boolean {
  return getUniqueColorDepths(patterns) >= minDepths
}

/**
 * 快速检测：是否满足"复杂图案"任务
 */
export function checkComplexPatterns(patterns: PlacedPattern[], minPatterns: number = 5): boolean {
  return patterns.length >= minPatterns
}

/**
 * 快速检测：是否满足"大师之作"任务
 */
export function checkMasterpiece(score: ClothScore | undefined): boolean {
  if (!score) return false
  const gradeOrder = ['C', 'B', 'A', 'S', 'SS', 'SSS']
  const currentIndex = gradeOrder.indexOf(score.grade)
  const aIndex = gradeOrder.indexOf('A')
  return currentIndex >= aIndex
}
