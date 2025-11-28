import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 用户认证函数
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
  if (!token) {
    return { user: null, error: 'Missing authorization token' }
  }
  
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { user: null, error: 'Invalid token' }
  }
  
  return { user: data.user, error: null }
}

// 获取用户成就数据
export async function GET(request: NextRequest) {
  try {
    // 用户认证
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    
    // 方法1: 使用数据库函数（如果迁移已执行）
    try {
      const { data: achievements, error: funcError } = await serviceSupabase
        .rpc('get_user_achievements', { p_user_id: user.id })
      
      if (!funcError && achievements) {
        return NextResponse.json(achievements)
      }
    } catch (funcError) {
      console.log('函数调用失败，使用备用查询方法')
    }
    
    // 方法2: 手动查询统计（备用方案）
    // 1. 完成课程数
    const { data: completedCourses, count: completedCount } = await serviceSupabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')
    
    // 2. 进行中课程数
    const { data: inProgressCourses, count: inProgressCount } = await serviceSupabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
    
    // 3. 学习天数（通过最后访问日期计算）
    const { data: enrollments } = await serviceSupabase
      .from('enrollments')
      .select('last_accessed_at, started_at')
      .eq('user_id', user.id)
    
    // 计算学习天数（去重日期）
    const uniqueDates = new Set()
    enrollments?.forEach(e => {
      if (e.last_accessed_at) {
        uniqueDates.add(e.last_accessed_at.split('T')[0])
      }
      if (e.started_at) {
        uniqueDates.add(e.started_at.split('T')[0])
      }
    })
    const learningDays = uniqueDates.size
    
    // 4. 点赞数
    const { data: likes, count: likesCount } = await serviceSupabase
      .from('course_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // 5. 评论数
    const { data: comments, count: commentsCount } = await serviceSupabase
      .from('course_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // 6. 最早和最晚学习日期
    const { data: firstEnrollment } = await serviceSupabase
      .from('enrollments')
      .select('started_at')
      .eq('user_id', user.id)
      .order('started_at', { ascending: true })
      .limit(1)
      .single()
    
    const { data: lastEnrollment } = await serviceSupabase
      .from('enrollments')
      .select('last_accessed_at')
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false })
      .limit(1)
      .single()

    const achievements = {
      user_id: user.id,
      completed_courses: completedCount || 0,
      in_progress_courses: inProgressCount || 0,
      learning_days: learningDays,
      total_likes: likesCount || 0,
      total_comments: commentsCount || 0,
      total_engagements: (likesCount || 0) + (commentsCount || 0),
      first_learning_date: firstEnrollment?.started_at || null,
      last_learning_date: lastEnrollment?.last_accessed_at || null
    }

    return NextResponse.json(achievements)
    
  } catch (error) {
    console.error('获取成就数据失败:', error)
    return NextResponse.json({ 
      error: '获取失败',
      // 返回默认值
      user_id: null,
      completed_courses: 0,
      in_progress_courses: 0,
      learning_days: 0,
      total_likes: 0,
      total_comments: 0,
      total_engagements: 0
    }, { status: 500 })
  }
}
