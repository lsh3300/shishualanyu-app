/**
 * 领取任务奖励API
 * POST /api/tasks/claim
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { grantTaskReward } from '@/lib/services/rewardService'
import type { TaskReward } from '@/types/task.types'

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
    const { task_id } = body

    if (!task_id) {
      return NextResponse.json(
        { error: '缺少task_id参数' },
        { status: 400 }
      )
    }

    // 检查任务是否完成且未领取
    const { data: progress, error: progressError } = await supabase
      .from('user_task_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_id', task_id)
      .single()

    if (progressError || !progress) {
      return NextResponse.json(
        { error: '未找到任务进度' },
        { status: 404 }
      )
    }

    if (!progress.is_completed) {
      return NextResponse.json(
        { error: '任务尚未完成' },
        { status: 400 }
      )
    }

    if (progress.reward_claimed) {
      return NextResponse.json(
        { error: '奖励已领取' },
        { status: 400 }
      )
    }

    // 获取任务模板以获取奖励信息
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', task_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: '未找到任务模板' },
        { status: 404 }
      )
    }

    // 构建奖励对象
    const reward: TaskReward = {
      exp: template.reward_exp,
      currency: template.reward_currency,
      items: template.reward_items || undefined
    }

    // 发放奖励
    const result = await grantTaskReward(user.id, task_id, reward)

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Error claiming task reward:', error)
    return NextResponse.json(
      { error: '领取奖励失败' },
      { status: 500 }
    )
  }
}
