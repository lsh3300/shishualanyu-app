import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

interface CommentLikeRequest {
  comment_id: string
}

async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null

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

function getLikeInsertErrorResponse(error: { code?: string; message: string }) {
  if (error.code === '23503') {
    return NextResponse.json(
      {
        error: '评论点赞依赖的用户资料未同步到数据库，请先执行 Supabase 修复 SQL。',
        details: error.message,
        requiresSql: true,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: '评论点赞失败', details: error.message },
    { status: 500 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CommentLikeRequest
    const { comment_id: commentId } = body

    if (!commentId) {
      return NextResponse.json({ error: '缺少必要参数: comment_id' }, { status: 400 })
    }

    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, likes_count')
      .eq('id', commentId)
      .maybeSingle()

    if (commentError || !comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 })
    }

    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle()

    if (existingLike) {
      return NextResponse.json({ error: '已经点赞过该评论' }, { status: 409 })
    }

    const { data: insertedLike, error: insertError } = await supabase
      .from('comment_likes')
      .insert({
        user_id: user.id,
        comment_id: commentId,
      })
      .select('id, user_id, comment_id, created_at')
      .single()

    if (insertError || !insertedLike) {
      console.error('评论点赞失败:', insertError)
      return getLikeInsertErrorResponse({
        code: insertError?.code,
        message: insertError?.message || '插入评论点赞失败',
      })
    }

    const { data: updatedComment } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', commentId)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      like: insertedLike,
      likes_count: updatedComment?.likes_count || 0,
      message: '点赞成功',
    })
  } catch (error) {
    console.error('POST /api/comment-likes 错误:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const commentId = request.nextUrl.searchParams.get('comment_id')

    if (!commentId) {
      return NextResponse.json({ error: '缺少必要参数: comment_id' }, { status: 400 })
    }

    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: deletedRows, error: deleteError } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .select('id')

    if (deleteError) {
      console.error('取消评论点赞失败:', deleteError)
      return NextResponse.json(
        { error: '取消评论点赞失败', details: deleteError.message },
        { status: 500 }
      )
    }

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json({ error: '未找到可取消的点赞记录' }, { status: 404 })
    }

    const { data: updatedComment } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', commentId)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      likes_count: updatedComment?.likes_count || 0,
      message: '已取消点赞',
    })
  } catch (error) {
    console.error('DELETE /api/comment-likes 错误:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
