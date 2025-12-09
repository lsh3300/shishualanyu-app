/**
 * 更新任务进度API
 * POST /api/tasks/update-progress
 * 
 * 在用户完成某个行为（如创作作品）后调用
 * 自动检测并更新所有相关任务的进度
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAllTasks } from '@/lib/services/taskDetection'
import { batchUpdateTaskProgress, updateAchievementProgress } from '@/lib/services/rewardService'
import type { PlacedPattern } from '@/components/game/canvas/IndigoCanvas'
import type { ClothScore } from '@/types/game.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 获取请求体
    const body = await request.json()
    const { patterns, score, cloth_id } = body as {
      patterns: PlacedPattern[]
      score?: ClothScore
      cloth_id?: string
    }

    if (!patterns) {
      return NextResponse.json(
        { error: '缺少patterns参数' },
        { status: 400 }
      )
    }

    // 获取所有活跃的任务模板
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('id, conditions')
      .eq('is_active', true)
      .eq('category', 'challenge') // 只检测挑战任务

    if (templatesError) throw templatesError
    if (!templates || templates.length === 0) {
      return NextResponse.json({ success: true, updated: [] })
    }

    // 检测所有任务
    const checkResults = checkAllTasks(patterns, score, templates)

    // 准备批量更新
    const updates = checkResults
      .filter(result => result.satisfied)
      .map(result => ({
        taskId: result.taskId,
        progress: result.progress,
        completed: result.satisfied
      }))

    if (updates.length > 0) {
      // 批量更新任务进度
      await batchUpdateTaskProgress(user.id, updates)
    }

    // 更新成就进度
    await updateCreationAchievements(user.id)
    if (score) {
      await updateScoreAchievements(user.id, score)
    }

    return NextResponse.json({
      success: true,
      updated: updates.map(u => u.taskId),
      count: updates.length
    })
  } catch (error) {
    console.error('Error updating task progress:', error)
    return NextResponse.json(
      { error: '更新任务进度失败' },
      { status: 500 }
    )
  }
}

/**
 * 更新创作类成就
 */
async function updateCreationAchievements(userId: string): Promise<void> {
  const supabase = await createClient()

  // 获取用户的总创作数量
  const { data: profile } = await supabase
    .from('player_profile')
    .select('total_cloths_created')
    .eq('user_id', userId)
    .single()

  if (!profile) return

  const count = profile.total_cloths_created

  // 更新相关成就
  if (count >= 10) {
    await updateAchievementProgress(userId, 'creation_count_10', count)
  }
  if (count >= 50) {
    await updateAchievementProgress(userId, 'creation_count_50', count)
  }
  if (count >= 100) {
    await updateAchievementProgress(userId, 'creation_count_100', count)
  }
}

/**
 * 更新评分类成就
 */
async function updateScoreAchievements(userId: string, score: ClothScore): Promise<void> {
  const supabase = await createClient()

  // SSS评分成就
  if (score.grade === 'SSS') {
    await updateAchievementProgress(userId, 'score_first_sss', 1)
  }

  // 统计A级以上评分次数
  const { count: aCount } = await supabase
    .from('cloth_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('grade', ['A', 'S', 'SS', 'SSS'])

  if (aCount && aCount >= 10) {
    await updateAchievementProgress(userId, 'score_a_count_10', aCount)
  }

  // 统计S级以上评分次数
  const { count: sCount } = await supabase
    .from('cloth_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('grade', ['S', 'SS', 'SSS'])

  if (sCount && sCount >= 50) {
    await updateAchievementProgress(userId, 'score_s_count_50', sCount)
  }
}
