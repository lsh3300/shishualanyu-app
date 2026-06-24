/**
 * 游戏系统类型定义
 * Game System Type Definitions
 */

// ============================================================================
// 玩家档案相关
// ============================================================================

/**
 * 玩家档案
 */
export interface PlayerProfile {
  user_id: string
  dye_house_name: string
  level: number
  exp: number
  currency: number
  total_cloths_created: number
  total_score: number
  highest_score: number
  created_at: string
  updated_at: string
  last_login_at: string
}

/**
 * 等级信息（计算后的）
 */
export interface LevelInfo {
  level: number
  currentLevelExp: number
  expToNextLevel: number
  progress: number // 0-1
}

/**
 * 经验增加结果
 */
export interface ExpGainResult {
  leveled_up: boolean
  old_level: number
  new_level: number
  new_exp: number
  currency_reward: number
}

// ============================================================================
// 评分系统相关
// ============================================================================

/**
 * 评分维度
 */
export interface ScoreDimensions {
  color_score: number // 0-100
  pattern_score: number // 0-100
  creativity_score: number // 0-100
  technique_score: number // 0-100
}

/**
 * 评分等级
 */
export type ScoreGrade = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C'

/**
 * 完整评分
 */
export interface ClothScore extends ScoreDimensions {
  id: string
  cloth_id: string
  user_id: string
  total_score: number
  grade: ScoreGrade
  exp_reward: number
  currency_reward: number
  created_at: string
}

/**
 * 评分提交结果
 */
export interface ScoreSubmitResult {
  score_id: string
  dimensions: ScoreDimensions
  total_score: number
  grade: ScoreGrade
  exp_reward: number
  currency_reward: number
  leveled_up: boolean
  old_level: number
  new_level: number
}

/**
 * 评分配置
 */
export interface ScoreConfig {
  // 等级奖励配置
  gradeRewards: Record<ScoreGrade, {
    exp: number
    currency: number
  }>
  
  // 评分权重
  weights: {
    color: number
    pattern: number
    creativity: number
    technique: number
  }
}

// ============================================================================
// 布料图层相关（扩展现有定义）
// ============================================================================

/**
 * 布料图层
 */
export interface ClothLayer {
  userId: string
  userName?: string
  textureId: string
  params: {
    x: number
    y: number
    scale: number
    opacity: number
    rotation?: number
  }
  dyeDepth: number
  message?: string
  timestamp: string
}

/**
 * 颜色 HSL
 */
export interface ColorHSL {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

// ============================================================================
// 排行榜相关
// ============================================================================

/**
 * 排行榜条目
 */
export interface LeaderboardEntry {
  user_id: string
  username?: string
  avatar_url?: string
  dye_house_name: string
  rank: number
  // 按等级排行
  level?: number
  exp?: number
  // 按分数排行
  highest_score?: number
  total_score?: number
  total_cloths_created?: number
}

/**
 * 排行榜类型
 */
export type LeaderboardType = 'level' | 'score'

// ============================================================================
// UI 状态相关
// ============================================================================

/**
 * 游戏通知
 */
export interface GameNotification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error' | 'level_up' | 'achievement'
  title: string
  message?: string
  duration?: number
  data?: any
}

/**
 * 奖励展示数据
 */
export interface RewardDisplay {
  type: 'exp' | 'currency' | 'material' | 'achievement'
  amount?: number
  item?: {
    id: string
    name: string
    icon?: string
    rarity?: number
  }
}

// ============================================================================
// API 请求/响应类型
// ============================================================================

/**
 * API 响应包装
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 提交评分请求
 */
export interface SubmitScoreRequest {
  cloth_id: string
  color_score: number
  pattern_score: number
  creativity_score: number
  technique_score: number
}

/**
 * 初始化档案请求
 */
export interface InitProfileRequest {
  dye_house_name?: string
}

// ============================================================================
// 游戏配置
// ============================================================================

/**
 * 等级系统配置
 */
export interface LevelConfig {
  baseExp: number // 基础经验值
  exponent: number // 增长指数
  maxLevel: number // 最大等级
}

/**
 * 货币系统配置
 */
export interface CurrencyConfig {
  name: string // 货币名称
  icon: string // 货币图标
  levelUpReward: number // 每级奖励基数
}

/**
 * 游戏全局配置
 */
export interface GameConfig {
  level: LevelConfig
  currency: CurrencyConfig
  score: ScoreConfig
}

// ============================================================================
// 导出默认配置
// ============================================================================

export const DEFAULT_GAME_CONFIG: GameConfig = {
  level: {
    baseExp: 100,
    exponent: 1.5,
    maxLevel: 100
  },
  currency: {
    name: '蓝草币',
    icon: '🪙',
    levelUpReward: 50
  },
  score: {
    gradeRewards: {
      SSS: { exp: 200, currency: 100 },
      SS: { exp: 150, currency: 70 },
      S: { exp: 100, currency: 50 },
      A: { exp: 70, currency: 30 },
      B: { exp: 50, currency: 20 },
      C: { exp: 30, currency: 10 }
    },
    weights: {
      color: 0.25,
      pattern: 0.25,
      creativity: 0.25,
      technique: 0.25
    }
  }
}
