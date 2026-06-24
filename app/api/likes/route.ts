import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 启用 Next.js 路由缓存优化
export const dynamic = 'force-dynamic' // 保持动态以确保用户认证
export const revalidate = 30 // 30秒缓存

// 类型定义
type ItemType = 'product' | 'course' | 'article'

interface LikeRequest {
  item_type: ItemType
  item_id: string
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
 * GET - 查询指定内容的点赞列表和总数
 * 查询参数: item_type, item_id
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const item_type = searchParams.get('item_type') as ItemType
    const item_id = searchParams.get('item_id')

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

    // 查询点赞列表（包含用户信息）- 优化：只获取必要字段
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select(`
        id,
        user_id,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('item_type', item_type)
      .eq('item_id', item_id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (likesError) {
      console.error('查询点赞列表失败:', likesError)
      return NextResponse.json(
        { error: '查询点赞列表失败', details: likesError.message },
        { status: 500 }
      )
    }

    // 查询当前用户是否已点赞
    const { data: { user } } = await supabase.auth.getUser()
    let isLiked = false

    if (user) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', item_type)
        .eq('item_id', item_id)
        .single()

      isLiked = !!userLike
    }

    return NextResponse.json({
      likes: likes || [],
      total: likes?.length || 0,
      isLiked,
    })
  } catch (error) {
    console.error('GET /api/likes 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * POST - 添加点赞
 * Body: { item_type, item_id }
 */
export async function POST(request: NextRequest) {
  try {
    const body: LikeRequest = await request.json()
    const { item_type, item_id } = body

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

    // 用户认证
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录或登录已过期' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', item_type)
      .eq('item_id', item_id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: '已经点赞过了' },
        { status: 409 }
      )
    }

    // 添加点赞
    const { data: newLike, error: insertError } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        item_type,
        item_id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('添加点赞失败:', insertError)
      return NextResponse.json(
        { error: '添加点赞失败', details: insertError.message },
        { status: 500 }
      )
    }

    // 查询最新的点赞总数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', item_type)
      .eq('item_id', item_id)

    return NextResponse.json({
      success: true,
      like: newLike,
      total: count || 0,
      message: '点赞成功',
    })
  } catch (error) {
    console.error('POST /api/likes 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - 取消点赞
 * 查询参数: item_type, item_id
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const item_type = searchParams.get('item_type') as ItemType
    const item_id = searchParams.get('item_id')

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
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('item_type', item_type)
      .eq('item_id', item_id)

    if (deleteError) {
      console.error('取消点赞失败:', deleteError)
      return NextResponse.json(
        { error: '取消点赞失败', details: deleteError.message },
        { status: 500 }
      )
    }

    // 查询最新的点赞总数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', item_type)
      .eq('item_id', item_id)

    return NextResponse.json({
      success: true,
      total: count || 0,
      message: '已取消点赞',
    })
  } catch (error) {
    console.error('DELETE /api/likes 错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
