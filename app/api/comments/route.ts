import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 启用 Next.js 路由缓存优化
export const dynamic = 'force-dynamic' // 保持动态以确保用户认证
export const revalidate = 30 // 30秒缓存

// 类型定义
type ItemType = 'product' | 'course' | 'article'
type SortType = 'latest' | 'oldest' | 'popular'

interface CommentRequest {
  item_type: ItemType
  item_id: string
  content: string
  parent_id?: string | null
}

interface UpdateCommentRequest {
  comment_id: string
  content: string
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
 * GET - 查询评论列表
 * 查询参数: item_type, item_id, sort (latest/oldest/popular), page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const item_type = searchParams.get('item_type') as ItemType
    const item_id = searchParams.get('item_id')
    const sort = (searchParams.get('sort') || 'latest') as SortType
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 参数验证
    if (!item_type || !item_id) {
      return NextResponse.json(
        { error: '缺少必要参数: item_type 和 item_id' },
        { status: 400 }
      )
    }

    if (!['product', 'course', 'article'].includes(item_type)) {
      return NextResponse.json(
        { error: 'item_type 必须是 product, course 或 article' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 构建查询 - 优化：只获取必要字段
    let query = supabase
      .from('comments')
      .select(`
        id,
        user_id,
        item_type,
        item_id,
        content,
        parent_id,
        status,
        likes_count,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('item_type', item_type)
      .eq('item_id', item_id)
      .eq('status', 'published')

    // 排序
    switch (sort) {
      case 'latest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('likes_count', { ascending: false })
        break
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: comments, error: commentsError, count } = await query

    if (commentsError) {
      console.error('查询评论失败:', commentsError)
      return NextResponse.json(
        { error: '查询评论失败', details: commentsError.message },
        { status: 500 }
      )
    }

    // 组织评论树形结构（将回复组织到父评论下）
    const commentMap = new Map()
    const topLevelComments: any[] = []

    // 第一遍：创建所有评论的映射
    comments?.forEach((comment: any) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // 第二遍：组织树形结构
    comments?.forEach((comment: any) => {
      const commentWithReplies = commentMap.get(comment.id)
      if (comment.parent_id) {
        // 这是一个回复
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies.push(commentWithReplies)
        }
      } else {
        // 这是顶级评论
        topLevelComments.push(commentWithReplies)
      }
    })

    // 查询当前用户已点赞的评论
    const { data: { user } } = await supabase.auth.getUser()
    let likedCommentIds: string[] = []

    if (user) {
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', comments?.map((c: any) => c.id) || [])

      likedCommentIds = userLikes?.map((l: any) => l.comment_id) || []
    }

    return NextResponse.json({
      comments: topLevelComments,
      total: count || 0,
      page,
      limit,
      hasMore: count ? (page * limit < count) : false,
      likedCommentIds,
    })
  } catch (error) {
    console.error('GET /api/comments 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * POST - 发布评论
 * Body: { item_type, item_id, content, parent_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CommentRequest = await request.json()
    const { item_type, item_id, content, parent_id } = body

    // 参数验证
    if (!item_type || !item_id || !content) {
      return NextResponse.json(
        { error: '缺少必要参数: item_type, item_id 和 content' },
        { status: 400 }
      )
    }

    if (!['product', 'course', 'article'].includes(item_type)) {
      return NextResponse.json(
        { error: 'item_type 必须是 product, course 或 article' },
        { status: 400 }
      )
    }

    // 内容长度验证
    const trimmedContent = content.trim()
    if (trimmedContent.length < 1) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: '评论内容不能超过2000字' },
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

    // 如果是回复，验证父评论是否存在
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parent_id)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: '父评论不存在' },
          { status: 404 }
        )
      }
    }

    // 插入评论
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        item_type,
        item_id,
        content: trimmedContent,
        parent_id: parent_id || null,
        status: 'published',
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('发布评论失败:', insertError)
      return NextResponse.json(
        { error: '发布评论失败', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: '评论发布成功',
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * PUT - 编辑评论
 * Body: { comment_id, content }
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateCommentRequest = await request.json()
    const { comment_id, content } = body

    // 参数验证
    if (!comment_id || !content) {
      return NextResponse.json(
        { error: '缺少必要参数: comment_id 和 content' },
        { status: 400 }
      )
    }

    // 内容长度验证
    const trimmedContent = content.trim()
    if (trimmedContent.length < 1) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: '评论内容不能超过2000字' },
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

    // 验证评论是否存在且属于当前用户（RLS 策略会确保只能编辑自己的评论）
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content: trimmedContent,
      })
      .eq('id', comment_id)
      .eq('user_id', user.id)
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('编辑评论失败:', updateError)
      return NextResponse.json(
        { error: '编辑评论失败', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedComment) {
      return NextResponse.json(
        { error: '评论不存在或无权限编辑' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: '评论编辑成功',
    })
  } catch (error) {
    console.error('PUT /api/comments 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - 删除评论
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

    // 删除评论（RLS 策略会确保只能删除自己的评论）
    // 注意：由于外键级联删除，删除父评论会自动删除所有子评论
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('删除评论失败:', deleteError)
      return NextResponse.json(
        { error: '删除评论失败', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '评论已删除',
    })
  } catch (error) {
    console.error('DELETE /api/comments 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
