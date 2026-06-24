/**
 * 任务系统类型定义
 * Task System Type Definitions
 */

// ============================================================================
// 任务相关
// ============================================================================

/**
 * 任务类别
 */
export type TaskCategory = 'challenge' | 'weekly' | 'achievement'

/**
 * 任务难度
 */
export type TaskTier = 'beginner' | 'intermediate' | 'master'

/**
 * 任务条件类型
 */
export interface TaskConditions {
  type: 'create_cloth' | 'achieve_score' | 'unlock_patterns' | 'create_cloths' | 'achieve_grade'
  requirements: {
    count?: number
    min_patterns?: number
    required_patterns?: string[]
    required_pattern_ids?: string[]
    min_score?: number
    min_grade?: string
    grade?: string
    has_symmetry?: boolean
    min_color_depths?: number
    pattern_categories?: string[]
  }
}

/**
 * 任务模板
 */
export interface TaskTemplate {
  id: string
  name: string
  description: string | null
  category: TaskCategory
  tier: TaskTier | null
  conditions: TaskConditions
  reward_exp: number
  reward_currency: number
  reward_items: any | null
  is_limited: boolean
  start_time: string | null
  end_time: string | null
  sort_order: number
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 用户任务进度
 */
export interface UserTaskProgress {
  id: string
  user_id: string
  task_id: string
  progress: number
  target: number
  is_completed: boolean
  reward_claimed: boolean
  claimed_at: string | null
  started_at: string
  completed_at: string | null
  updated_at: string
}

/**
 * 任务详情（包含模板和进度）
 */
export interface TaskWithProgress extends TaskTemplate {
  user_progress?: UserTaskProgress
}

// ============================================================================
// 成就相关
// ============================================================================

/**
 * 成就类别
 */
export type AchievementCategory = 'collection' | 'creation' | 'score' | 'social'

/**
 * 成就稀有度
 */
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * 成就条件
 */
export interface AchievementConditions {
  type: string
  requirements: {
    count?: number
    grade?: string
    min_grade?: string
  }
}

/**
 * 成就
 */
export interface Achievement {
  id: string
  name: string
  description: string | null
  category: AchievementCategory
  tier: number
  conditions: AchievementConditions
  reward_exp: number
  reward_currency: number
  reward_title: string | null
  reward_badge: string | null
  icon: string | null
  rarity: AchievementRarity
  is_hidden: boolean
  created_at: string
}

/**
 * 用户成就
 */
export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  progress: number
  target: number
  is_unlocked: boolean
  started_at: string
  unlocked_at: string | null
}

/**
 * 成就详情（包含定义和进度）
 */
export interface AchievementWithProgress extends Achievement {
  user_progress?: UserAchievement
}

// ============================================================================
// 奖励相关
// ============================================================================

/**
 * 奖励类型
 */
export interface TaskReward {
  exp: number
  currency: number
  items?: {
    type: 'pattern' | 'title' | 'badge' | 'material'
    id: string
    name: string
    icon?: string
  }[]
  title?: string
  badge?: string
}

/**
 * 任务完成结果
 */
export interface TaskCompleteResult {
  task_id: string
  completed: boolean
  reward: TaskReward
  new_exp: number
  new_currency: number
  leveled_up: boolean
  new_level?: number
}

/**
 * 成就解锁结果
 */
export interface AchievementUnlockResult {
  achievement_id: string
  unlocked: boolean
  reward: TaskReward
  new_exp: number
  new_currency: number
  leveled_up: boolean
  new_level?: number
}

// ============================================================================
// API 请求/响应
// ============================================================================

/**
 * 获取任务列表请求
 */
export interface GetTasksRequest {
  category?: TaskCategory
  tier?: TaskTier
  include_completed?: boolean
}

/**
 * 领取奖励请求
 */
export interface ClaimRewardRequest {
  task_id: string
  user_id: string
}

/**
 * 检查任务进度请求
 */
export interface CheckTaskProgressRequest {
  user_id: string
  task_id: string
  progress: number
}
