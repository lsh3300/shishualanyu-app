/**
 * 奖励发放服务
 * Reward Service
 * 
 * 负责发放任务奖励、处理升级逻辑
 */

import { createClient } from '@/lib/supabase/client'
import type { TaskReward, TaskCompleteResult } from '@/types/task.types'
import type { ExpGainResult } from '@/types/game.types'

// ============================================================================
// 奖励发放
// ============================================================================

/**
 * 发放任务奖励
 */
export async function grantTaskReward(
  userId: string,
  taskId: string,
  reward: TaskReward
): Promise<TaskCompleteResult> {
  const supabase = createClient()

  try {
    // 1. 标记任务奖励已领取
    const { error: updateError } = await supabase
      .from('user_task_progress')
      .update({
        reward_claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('task_id', taskId)

    if (updateError) throw updateError

    // 2. 增加经验和货币
    const expResult = await addExpAndCurrency(userId, reward.exp, reward.currency)

    // 3. 解锁物品（如果有）
    if (reward.items && reward.items.length > 0) {
      await unlockItems(userId, reward.items)
    }

    // 4. 授予称号（如果有）
    if (reward.title) {
      await grantTitle(userId, reward.title)
    }

    // 5. 授予徽章（如果有）
    if (reward.badge) {
      await grantBadge(userId, reward.badge)
    }

    return {
      task_id: taskId,
      completed: true,
      reward,
      new_exp: expResult.new_exp,
      new_currency: expResult.new_currency || 0,
      leveled_up: expResult.leveled_up,
      new_level: expResult.new_level
    }
  } catch (error) {
    console.error('Error granting task reward:', error)
    throw error
  }
}

/**
 * 增加经验和货币
 */
export async function addExpAndCurrency(
  userId: string,
  expGain: number,
  currencyGain: number
): Promise<ExpGainResult & { new_currency?: number }> {
  const supabase = createClient()

  try {
    // 调用数据库函数增加经验
    const { data: expResult, error: expError } = await supabase
      .rpc('add_exp', {
        p_user_id: userId,
        p_exp_gain: expGain
      })

    if (expError) throw expError

    // 增加货币 - 先获取当前值，再更新
    const { data: currentProfile } = await supabase
      .from('player_profile')
      .select('currency')
      .eq('user_id', userId)
      .single()

    const newCurrency = (currentProfile?.currency || 0) + currencyGain

    const { data: profile, error: currencyError } = await supabase
      .from('player_profile')
      .update({ currency: newCurrency })
      .eq('user_id', userId)
      .select('currency')
      .single()

    if (currencyError) throw currencyError

    return {
      ...expResult,
      new_currency: profile?.currency || 0
    }
  } catch (error) {
    console.error('Error adding exp and currency:', error)
    throw error
  }
}

/**
 * 解锁物品
 */
async function unlockItems(
  userId: string,
  items: TaskReward['items']
): Promise<void> {
  if (!items || items.length === 0) return

  const supabase = createClient()

  for (const item of items) {
    if (item.type === 'pattern') {
      // 解锁图案
      await unlockPattern(userId, item.id)
    } else if (item.type === 'material') {
      // 添加材料到背包
      await addMaterial(userId, item.id)
    }
    // 其他类型的物品可以后续添加
  }
}

/**
 * 解锁图案
 */
async function unlockPattern(userId: string, patternId: string): Promise<void> {
  const supabase = createClient()

  // TODO: 实现图案解锁逻辑
  // 需要先创建 user_patterns 表
  console.log(`Unlock pattern ${patternId} for user ${userId}`)
}

/**
 * 添加材料
 */
async function addMaterial(userId: string, materialId: string): Promise<void> {
  const supabase = createClient()

  // TODO: 实现材料添加逻辑
  // 需要先创建 user_materials 表
  console.log(`Add material ${materialId} for user ${userId}`)
}

/**
 * 授予称号
 */
async function grantTitle(userId: string, title: string): Promise<void> {
  const supabase = createClient()

  // TODO: 实现称号授予逻辑
  // 需要先创建 user_titles 表
  console.log(`Grant title ${title} to user ${userId}`)
}

/**
 * 授予徽章
 */
async function grantBadge(userId: string, badge: string): Promise<void> {
  const supabase = createClient()

  // TODO: 实现徽章授予逻辑
  // 需要先创建 user_badges 表
  console.log(`Grant badge ${badge} to user ${userId}`)
}

// ============================================================================
// 成就相关
// ============================================================================

/**
 * 更新成就进度
 */
export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
): Promise<boolean> {
  const supabase = createClient()

  try {
    // 获取成就目标
    const { data: achievement, error: fetchError } = await supabase
      .from('achievements')
      .select('id, conditions')
      .eq('id', achievementId)
      .single()

    if (fetchError || !achievement) return false

    const target = achievement.conditions.requirements.count || 1
    const isUnlocked = progress >= target

    // 更新或插入进度
    const { error: upsertError } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress,
        target,
        is_unlocked: isUnlocked,
        unlocked_at: isUnlocked ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,achievement_id'
      })

    if (upsertError) throw upsertError

    return isUnlocked
  } catch (error) {
    console.error('Error updating achievement progress:', error)
    return false
  }
}

/**
 * 解锁成就并发放奖励
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<void> {
  const supabase = createClient()

  try {
    // 获取成就信息
    const { data: achievement, error: fetchError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (fetchError || !achievement) return

    // 发放奖励
    const reward: TaskReward = {
      exp: achievement.reward_exp,
      currency: achievement.reward_currency,
      title: achievement.reward_title || undefined,
      badge: achievement.reward_badge || undefined
    }

    await addExpAndCurrency(userId, reward.exp, reward.currency)

    if (reward.title) {
      await grantTitle(userId, reward.title)
    }

    if (reward.badge) {
      await grantBadge(userId, reward.badge)
    }

    console.log(`Achievement ${achievementId} unlocked for user ${userId}`)
  } catch (error) {
    console.error('Error unlocking achievement:', error)
  }
}

// ============================================================================
// 批量更新
// ============================================================================

/**
 * 批量更新任务进度
 */
export async function batchUpdateTaskProgress(
  userId: string,
  updates: Array<{ taskId: string; progress: number; completed: boolean }>
): Promise<void> {
  const supabase = createClient()

  for (const update of updates) {
    try {
      await supabase
        .from('user_task_progress')
        .upsert({
          user_id: userId,
          task_id: update.taskId,
          progress: update.progress,
          is_completed: update.completed,
          completed_at: update.completed ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,task_id'
        })
    } catch (error) {
      console.error(`Error updating task ${update.taskId}:`, error)
    }
  }
}
