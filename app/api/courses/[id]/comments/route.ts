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

// 获取课程评论
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const courseId = params.id
    const serviceSupabase = createServiceClient()
    
    // 获取评论（不join profiles表，避免外键错误）
    const { data: comments, error, count } = await serviceSupabase
      .from('course_comments')
      .select('*', { count: 'exact' })
      .eq('course_id', courseId)
      .is('parent_id', null) // 只获取顶层评论
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    // 格式化评论数据
    const formattedComments = comments?.map(comment => ({
      id: comment.id,
      user_id: comment.user_id,
      user_name: '用户', // 简化处理，不查询用户名
      avatar_url: null,
      content: comment.content,
      likes_count: comment.likes_count || 0,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    })) || []

    return NextResponse.json({
      comments: formattedComments,
      total: count || 0,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('获取评论失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 发表评论
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

    const { content, parent_id } = await request.json()
    const courseId = params.id
    
    // 验证评论内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }
    
    if (content.length > 500) {
      return NextResponse.json({ error: '评论内容不能超过500字' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    
    // 插入评论
    const { data: comment, error: insertError } = await serviceSupabase
      .from('course_comments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        content: content.trim(),
        parent_id: parent_id || null
      })
      .select()
      .single()
    
    if (insertError) throw insertError

    // 格式化返回数据
    const formattedComment = {
      id: comment.id,
      user_id: comment.user_id,
      user_name: '用户',
      avatar_url: null,
      content: comment.content,
      likes_count: 0,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }

    return NextResponse.json({
      message: '评论成功',
      comment: formattedComment
    }, { status: 201 })
    
  } catch (error) {
    console.error('发表评论失败:', error)
    return NextResponse.json({ error: '发表失败' }, { status: 500 })
  }
}
