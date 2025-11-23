import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

interface CommentLikeRequest {
  comment_id: string
}

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

/**
 * POST - 给评论点赞
 * Body: { comment_id }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CommentLikeRequest = await request.json()
    const { comment_id } = body

    // 参数验证
    if (!comment_id) {
      return NextResponse.json(
        { error: '缺少必要参数: comment_id' },
        { status: 400 }
      )
    }

    // 用户认证
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录或登录已过期' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    // 验证评论是否存在
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, likes_count')
      .eq('id', comment_id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', comment_id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: '已经点赞过该评论' },
        { status: 409 }
      )
    }

    // 添加点赞
    const { data: newLike, error: insertError } = await supabase
      .from('comment_likes')
      .insert({
        user_id: user.id,
        comment_id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('评论点赞失败:', insertError)
      return NextResponse.json(
        { error: '评论点赞失败', details: insertError.message },
        { status: 500 }
      )
    }

    // 查询更新后的点赞数（触发器会自动更新）
    const { data: updatedComment } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', comment_id)
      .single()

    return NextResponse.json({
      success: true,
      like: newLike,
      likes_count: updatedComment?.likes_count || 0,
      message: '点赞成功',
    })
  } catch (error) {
    console.error('POST /api/comment-likes 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - 取消评论点赞
 * 查询参数: comment_id
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const comment_id = searchParams.get('comment_id')

    // 参数验证
    if (!comment_id) {
      return NextResponse.json(
        { error: '缺少必要参数: comment_id' },
        { status: 400 }
      )
    }

    // 用户认证
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录或登录已过期' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    // 删除点赞（RLS 策略会确保只能删除自己的点赞）
    const { error: deleteError } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('comment_id', comment_id)

    if (deleteError) {
      console.error('取消评论点赞失败:', deleteError)
      return NextResponse.json(
        { error: '取消评论点赞失败', details: deleteError.message },
        { status: 500 }
      )
    }

    // 查询更新后的点赞数（触发器会自动更新）
    const { data: updatedComment } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', comment_id)
      .single()

    return NextResponse.json({
      success: true,
      likes_count: updatedComment?.likes_count || 0,
      message: '已取消点赞',
    })
  } catch (error) {
    console.error('DELETE /api/comment-likes 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
