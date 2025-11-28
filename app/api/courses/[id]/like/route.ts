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

// 点赞/取消点赞课程
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
    const serviceSupabase = createServiceClient()
    
    // 检查是否已点赞
    const { data: existing } = await serviceSupabase
      .from('course_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    
    if (existing) {
      // 取消点赞
      const { error: deleteError } = await serviceSupabase
        .from('course_likes')
        .delete()
        .eq('id', existing.id)
      
      if (deleteError) throw deleteError
      
      // 获取最新点赞数
      const { count } = await serviceSupabase
        .from('course_likes')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
      
      return NextResponse.json({
        message: '已取消点赞',
        isLiked: false,
        likesCount: count || 0
      })
    } else {
      // 添加点赞
      const { error: insertError } = await serviceSupabase
        .from('course_likes')
        .insert({
          user_id: user.id,
          course_id: courseId
        })
      
      if (insertError) throw insertError
      
      // 获取最新点赞数
      const { count } = await serviceSupabase
        .from('course_likes')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
      
      return NextResponse.json({
        message: '点赞成功',
        isLiked: true,
        likesCount: count || 0
      })
    }
    
  } catch (error) {
    console.error('点赞操作失败:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

// 获取点赞状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const serviceSupabase = createServiceClient()
    
    // 尝试获取当前用户（可选）
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    let user = null
    
    if (token) {
      const { data } = await serviceSupabase.auth.getUser(token)
      user = data?.user
    }
    
    // 获取点赞总数
    const { count } = await serviceSupabase
      .from('course_likes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
    
    let isLiked = false
    
    // 如果用户已登录，检查是否已点赞
    if (user) {
      const { data } = await serviceSupabase
        .from('course_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()
      
      isLiked = !!data
    }
    
    return NextResponse.json({
      isLiked,
      likesCount: count || 0
    })
    
  } catch (error) {
    console.error('获取点赞状态失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
