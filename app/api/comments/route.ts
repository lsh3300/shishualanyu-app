import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 30

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

interface ProfileRow {
  id?: string | null
  user_id?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
}

interface CommentRow {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  content: string
  parent_id: string | null
  status: string
  likes_count: number | null
  created_at: string
  updated_at: string
}

interface NormalizedComment extends Omit<CommentRow, 'likes_count'> {
  likes_count: number
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
  replies: NormalizedComment[]
}

function isValidItemType(value: string | null): value is ItemType {
  return value === 'product' || value === 'course' || value === 'article'
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

async function getOptionalAuthUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null

  if (!token) {
    return null
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return null
  }

  return data.user.id
}

async function loadProfilesMap(
  supabase: ReturnType<typeof createServiceClient>,
  userIds: string[]
) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))]
  const profileMap = new Map<string, ProfileRow>()

  if (uniqueUserIds.length === 0) {
    return profileMap
  }

  const { data: profilesById } = await supabase
    .from('profiles')
    .select('id, user_id, username, full_name, avatar_url')
    .in('id', uniqueUserIds)

  profilesById?.forEach((profile) => {
    const row = profile as ProfileRow
    if (row.id) {
      profileMap.set(row.id, row)
    }
    if (row.user_id) {
      profileMap.set(row.user_id, row)
    }
  })

  const unresolvedUserIds = uniqueUserIds.filter((userId) => !profileMap.has(userId))
  if (unresolvedUserIds.length === 0) {
    return profileMap
  }

  const { data: profilesByUserId } = await supabase
    .from('profiles')
    .select('id, user_id, username, full_name, avatar_url')
    .in('user_id', unresolvedUserIds)

  profilesByUserId?.forEach((profile) => {
    const row = profile as ProfileRow
    if (row.id) {
      profileMap.set(row.id, row)
    }
    if (row.user_id) {
      profileMap.set(row.user_id, row)
    }
  })

  return profileMap
}

function normalizeComment(comment: CommentRow, profile?: ProfileRow | null): NormalizedComment {
  return {
    ...comment,
    likes_count: comment.likes_count ?? 0,
    profiles: {
      id: profile?.id ?? profile?.user_id ?? comment.user_id,
      username: profile?.username ?? null,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    },
    replies: [],
  }
}

function buildCommentTree(comments: NormalizedComment[]) {
  const commentMap = new Map<string, NormalizedComment>()
  const topLevelComments: NormalizedComment[] = []

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  comments.forEach((comment) => {
    const normalizedComment = commentMap.get(comment.id)
    if (!normalizedComment) {
      return
    }

    if (comment.parent_id) {
      const parentComment = commentMap.get(comment.parent_id)
      if (parentComment) {
        parentComment.replies.push(normalizedComment)
        return
      }
    }

    topLevelComments.push(normalizedComment)
  })

  return topLevelComments
}

function getInsertErrorResponse(error: { code?: string; message: string }) {
  if (error.code === '23503') {
    return NextResponse.json(
      {
        error: '评论依赖的用户资料未同步到数据库，请先执行 Supabase 修复 SQL。',
        details: error.message,
        requiresSql: true,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: '发布评论失败', details: error.message },
    { status: 500 }
  )
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const itemType = searchParams.get('item_type')
    const itemId = searchParams.get('item_id')
    const sort = (searchParams.get('sort') || 'latest') as SortType
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: '缺少必要参数: item_type 和 item_id' },
        { status: 400 }
      )
    }

    if (!isValidItemType(itemType)) {
      return NextResponse.json(
        { error: 'item_type 必须是 product、course 或 article' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    let query = supabase
      .from('comments')
      .select(
        'id, user_id, item_type, item_id, content, parent_id, status, likes_count, created_at, updated_at',
        { count: 'exact' }
      )
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .eq('status', 'published')

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query
          .order('likes_count', { ascending: false })
          .order('created_at', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data: comments, error: commentsError, count } = await query.range(from, to)

    if (commentsError) {
      console.error('查询评论失败:', commentsError)
      return NextResponse.json(
        { error: '查询评论失败', details: commentsError.message },
        { status: 500 }
      )
    }

    const commentRows = (comments || []) as CommentRow[]
    const profileMap = await loadProfilesMap(
      supabase,
      commentRows.map((comment) => comment.user_id)
    )
    const normalizedComments = commentRows.map((comment) =>
      normalizeComment(comment, profileMap.get(comment.user_id))
    )
    const commentsTree = buildCommentTree(normalizedComments)

    const authUserId = await getOptionalAuthUserId(request)
    let likedCommentIds: string[] = []

    if (authUserId && commentRows.length > 0) {
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', authUserId)
        .in(
          'comment_id',
          commentRows.map((comment) => comment.id)
        )

      likedCommentIds = userLikes?.map((like) => like.comment_id as string) || []
    }

    return NextResponse.json({
      comments: commentsTree,
      total: count || 0,
      page,
      limit,
      hasMore: count ? page * limit < count : false,
      likedCommentIds,
    })
  } catch (error) {
    console.error('GET /api/comments 错误:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CommentRequest
    const { item_type: itemType, item_id: itemId, content, parent_id: parentId } = body

    if (!itemType || !itemId || !content) {
      return NextResponse.json(
        { error: '缺少必要参数: item_type、item_id 和 content' },
        { status: 400 }
      )
    }

    if (!isValidItemType(itemType)) {
      return NextResponse.json(
        { error: 'item_type 必须是 product、course 或 article' },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json({ error: '评论内容不能超过 2000 字' }, { status: 400 })
    }

    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const supabase = createServiceClient()

    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, item_type, item_id')
        .eq('id', parentId)
        .maybeSingle()

      if (parentError || !parentComment) {
        return NextResponse.json({ error: '父评论不存在' }, { status: 404 })
      }

      if (parentComment.item_type !== itemType || parentComment.item_id !== itemId) {
        return NextResponse.json({ error: '回复的评论与当前内容不匹配' }, { status: 400 })
      }
    }

    const { data: insertedComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        content: trimmedContent,
        parent_id: parentId || null,
        status: 'published',
      })
      .select(
        'id, user_id, item_type, item_id, content, parent_id, status, likes_count, created_at, updated_at'
      )
      .single()

    if (insertError || !insertedComment) {
      console.error('发布评论失败:', insertError)
      return getInsertErrorResponse({
        code: insertError?.code,
        message: insertError?.message || '插入评论失败',
      })
    }

    const profileMap = await loadProfilesMap(supabase, [insertedComment.user_id])
    const normalizedComment = normalizeComment(
      insertedComment as CommentRow,
      profileMap.get(insertedComment.user_id)
    )

    return NextResponse.json(
      {
        success: true,
        comment: normalizedComment,
        message: '评论发布成功',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/comments 错误:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateCommentRequest
    const { comment_id: commentId, content } = body

    if (!commentId || !content) {
      return NextResponse.json(
        { error: '缺少必要参数: comment_id 和 content' },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json({ error: '评论内容不能超过 2000 字' }, { status: 400 })
    }

    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({ content: trimmedContent })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select(
        'id, user_id, item_type, item_id, content, parent_id, status, likes_count, created_at, updated_at'
      )
      .maybeSingle()

    if (updateError) {
      console.error('编辑评论失败:', updateError)
      return NextResponse.json(
        { error: '编辑评论失败', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedComment) {
      return NextResponse.json({ error: '评论不存在或无权限编辑' }, { status: 404 })
    }

    const profileMap = await loadProfilesMap(supabase, [updatedComment.user_id])
    const normalizedComment = normalizeComment(
      updatedComment as CommentRow,
      profileMap.get(updatedComment.user_id)
    )

    return NextResponse.json({
      success: true,
      comment: normalizedComment,
      message: '评论编辑成功',
    })
  } catch (error) {
    console.error('PUT /api/comments 错误:', error)
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
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select('id')

    if (deleteError) {
      console.error('删除评论失败:', deleteError)
      return NextResponse.json(
        { error: '删除评论失败', details: deleteError.message },
        { status: 500 }
      )
    }

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json({ error: '评论不存在或无权限删除' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: '评论已删除',
    })
  } catch (error) {
    console.error('DELETE /api/comments 错误:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
