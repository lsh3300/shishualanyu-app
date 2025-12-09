/**
 * 任务API
 * GET /api/tasks - 获取任务列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TaskWithProgress } from '@/types/task.types'

export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const tier = searchParams.get('tier')
    const includeCompleted = searchParams.get('include_completed') === 'true'

    // 构建查询
    let query = supabase
      .from('task_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // 应用筛选
    if (category) {
      query = query.eq('category', category)
    }
    if (tier) {
      query = query.eq('tier', tier)
    }

    // 获取任务模板
    const { data: templates, error: templatesError } = await query

    if (templatesError) throw templatesError
    if (!templates) {
      return NextResponse.json({ tasks: [] })
    }

    // 获取用户的任务进度
    const { data: progressData, error: progressError } = await supabase
      .from('user_task_progress')
      .select('*')
      .eq('user_id', user.id)

    if (progressError) throw progressError

    // 合并模板和进度
    const tasksWithProgress: TaskWithProgress[] = templates.map(template => {
      const progress = progressData?.find(p => p.task_id === template.id)
      
      return {
        ...template,
        user_progress: progress || undefined
      }
    })

    // 过滤已完成的任务（如果需要）
    const filteredTasks = includeCompleted
      ? tasksWithProgress
      : tasksWithProgress.filter(t => !t.user_progress?.is_completed)

    return NextResponse.json({
      success: true,
      tasks: filteredTasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    )
  }
}
