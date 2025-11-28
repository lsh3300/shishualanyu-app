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

// 注册/开始学习课程
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 用户认证
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const courseId = params.id
    
    // 检查课程是否存在
    const serviceSupabase = createServiceClient()
    const { data: course, error: courseError } = await serviceSupabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()
    
    if (courseError || !course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }

    // 检查是否已经注册
    const { data: existing } = await serviceSupabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    
    if (existing) {
      // 如果已注册，更新最后访问时间
      const { data, error } = await serviceSupabase
        .from('enrollments')
        .update({
          last_accessed_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: '继续学习',
        enrollment: data
      })
    }

    // 创建新的注册记录
    const { data: enrollment, error: enrollError } = await serviceSupabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'in_progress',
        progress: 0
      })
      .select()
      .single()
    
    if (enrollError) throw enrollError

    return NextResponse.json({
      message: '注册成功',
      enrollment
    }, { status: 201 })
    
  } catch (error) {
    console.error('课程注册失败:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}

// 更新学习进度
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 用户认证
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const { progress } = await request.json()
    const courseId = params.id
    
    // 验证进度值
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ error: '进度值无效' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    
    // 更新进度
    const updateData: any = {
      progress,
      last_accessed_at: new Date().toISOString()
    }
    
    // 如果进度达到100%，标记为已完成
    if (progress === 100) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await serviceSupabase
      .from('enrollments')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .select()
      .single()
    
    if (error) throw error

    return NextResponse.json({
      message: progress === 100 ? '恭喜完成课程！' : '进度已更新',
      enrollment: data
    })
    
  } catch (error) {
    console.error('更新进度失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
