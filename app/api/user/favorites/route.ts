import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 启用 Next.js 路由缓存优化
export const dynamic = 'force-dynamic'
export const revalidate = 60

// 优化：快速解析 JWT 获取用户 ID
function parseJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.sub || null;
  } catch {
    return null;
  }
}

// 用户认证函数 - 优化版
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
  if (!token) {
    return { userId: null, error: 'Missing authorization token' }
  }
  
  // 优化：先尝试快速解析 JWT
  const quickUserId = parseJwtUserId(token)
  if (quickUserId) {
    return { userId: quickUserId, error: null }
  }
  
  // 回退到完整验证
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { userId: null, error: 'Invalid token' }
  }
  
  return { userId: data.user.id, error: null }
}

// GET: 获取用户收藏列表 - 优化版：使用 Promise.all 并行查询
export async function GET(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }
    
    const supabase = createServiceClient()
    
    // 优化：并行查询收藏列表和文章收藏
    const [favoritesResult, articleFavoritesResult] = await Promise.all([
      supabase
        .from('favorites')
        .select('id, product_id, course_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('article_favorites')
        .select('id, article_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ])
    
    if (favoritesResult.error) {
      console.error('查询收藏失败:', favoritesResult.error)
      return NextResponse.json({ error: '查询收藏失败' }, { status: 500 })
    }
    
    const favorites = favoritesResult.data || []
    const articleFavorites = articleFavoritesResult.data || []
    
    // 收集所有需要查询的 ID
    const productIds = favorites.filter(f => f.product_id).map(f => f.product_id)
    const courseIds = favorites.filter(f => f.course_id).map(f => f.course_id)
    const articleIds = articleFavorites.filter(f => f.article_id).map(f => f.article_id)
    
    // 优化：并行查询所有详情数据
    const detailQueries: Promise<any>[] = []
    
    if (productIds.length > 0) {
      detailQueries.push(
        Promise.all([
          supabase.from('products').select('id, name, price, image_url, category').in('id', productIds),
          supabase.from('product_media').select('product_id, url').in('product_id', productIds).eq('type', 'image').eq('cover', true)
        ]).then(([products, media]) => ({ type: 'products', products: products.data, media: media.data }))
      )
    }
    
    if (courseIds.length > 0) {
      detailQueries.push(
        (async () => {
          const result = await supabase.from('courses').select('id, title, instructor, duration, price, is_free, image_url').in('id', courseIds)
          return { type: 'courses', data: result.data }
        })()
      )
    }
    
    if (articleIds.length > 0) {
      detailQueries.push(
        (async () => {
          const result = await supabase.from('culture_articles').select('id, slug, title, excerpt, cover_image, read_time').in('id', articleIds)
          return { type: 'articles', data: result.data }
        })()
      )
    }
    
    const detailResults = await Promise.all(detailQueries)
    
    // 构建映射
    const productsMap: Record<string, any> = {}
    const coursesMap: Record<string, any> = {}
    const articlesMap: Record<string, any> = {}
    
    for (const result of detailResults) {
      if (result.type === 'products' && result.products) {
        const mediaMap: Record<string, string> = {}
        result.media?.forEach((m: any) => { mediaMap[m.product_id] = m.url })
        result.products.forEach((p: any) => {
          productsMap[p.id] = { ...p, image_url: mediaMap[p.id] || p.image_url || '/placeholder.svg' }
        })
      } else if (result.type === 'courses' && result.data) {
        result.data.forEach((c: any) => {
          coursesMap[c.id] = { ...c, thumbnail: c.image_url || '/placeholder.svg' }
        })
      } else if (result.type === 'articles' && result.data) {
        result.data.forEach((a: any) => {
          articlesMap[a.id] = { ...a, image_url: a.cover_image || '/placeholder.svg' }
        })
      }
    }
    
    // 组装返回数据
    const enrichedFavorites = favorites.map(fav => {
      if (fav.product_id) {
        return { id: fav.id, product_id: fav.product_id, created_at: fav.created_at, item_type: 'product', products: productsMap[fav.product_id] || null }
      } else if (fav.course_id) {
        return { id: fav.id, course_id: fav.course_id, created_at: fav.created_at, item_type: 'course', courses: coursesMap[fav.course_id] || null }
      }
      return null
    }).filter(Boolean)
    
    const enrichedArticleFavorites = articleFavorites.map(fav => ({
      id: fav.id, article_id: fav.article_id, created_at: fav.created_at, item_type: 'article', articles: articlesMap[fav.article_id] || null
    })).filter(f => f.articles)
    
    const allFavorites = [...enrichedFavorites, ...enrichedArticleFavorites]
      .sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())
    
    return NextResponse.json({ favorites: allFavorites, source: 'supabase' })
    
  } catch (error) {
    console.error('GET /api/user/favorites 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST: 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }
    
    const body = await request.json()
    const { productId, courseId, articleId } = body
    
    if (!productId && !courseId && !articleId) {
      return NextResponse.json({ error: '缺少商品ID、课程ID或文章ID' }, { status: 400 })
    }
    
    const itemCount = [productId, courseId, articleId].filter(Boolean).length
    if (itemCount > 1) {
      return NextResponse.json({ error: '只能收藏一种类型的项目' }, { status: 400 })
    }
    
    const supabase = createServiceClient()
    
    // 文章使用单独的表
    if (articleId) {
      // 检查文章是否已收藏
      const { data: existing } = await supabase
        .from('article_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .maybeSingle()
      
      if (existing) {
        return NextResponse.json({
          success: true,
          message: '已在收藏夹中',
          favorite: existing
        })
      }
      
      // 添加文章收藏
      const { data: newFavorite, error: insertError } = await supabase
        .from('article_favorites')
        .insert({ user_id: userId, article_id: articleId })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ 添加文章收藏失败:', insertError)
        return NextResponse.json({ error: '添加收藏失败' }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: '收藏成功',
        favorite: newFavorite
      })
    }
    
    // 商品和课程使用 favorites 表
    // 检查是否已收藏
    let existingQuery = supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
    
    if (productId) {
      existingQuery = existingQuery.eq('product_id', productId)
    } else {
      existingQuery = existingQuery.eq('course_id', courseId)
    }
    
    const { data: existing } = await existingQuery.maybeSingle()
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: '已在收藏夹中',
        favorite: existing
      })
    }
    
    // 添加收藏
    const insertData: any = { user_id: userId }
    if (productId) {
      insertData.product_id = productId
    } else {
      insertData.course_id = courseId
    }
    
    console.log('📝 准备插入收藏数据:', insertData)
    
    const { data: newFavorite, error: insertError } = await supabase
      .from('favorites')
      .insert(insertData)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ 添加收藏失败:', insertError)
      console.error('插入数据:', insertData)
      return NextResponse.json({ 
        error: '添加收藏失败', 
        details: insertError.message,
        code: insertError.code 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: '收藏成功',
      favorite: newFavorite
    })
    
  } catch (error) {
    console.error('POST /api/user/favorites 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE: 删除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }
    
    const body = await request.json()
    const { productId, courseId, articleId } = body
    
    if (!productId && !courseId && !articleId) {
      return NextResponse.json({ error: '缺少商品ID、课程ID或文章ID' }, { status: 400 })
    }
    
    const supabase = createServiceClient()
    
    // 文章使用单独的表
    if (articleId) {
      const { error: deleteError } = await supabase
        .from('article_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId)
      
      if (deleteError) {
        console.error('删除文章收藏失败:', deleteError)
        return NextResponse.json({ error: '删除收藏失败' }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: '删除成功'
      })
    }
    
    // 商品和课程使用 favorites 表
    let deleteQuery = supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
    
    if (productId) {
      deleteQuery = deleteQuery.eq('product_id', productId)
    } else {
      deleteQuery = deleteQuery.eq('course_id', courseId)
    }
    
    const { error: deleteError } = await deleteQuery
    
    if (deleteError) {
      console.error('删除收藏失败:', deleteError)
      return NextResponse.json({ error: '删除收藏失败' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
    
  } catch (error) {
    console.error('DELETE /api/user/favorites 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
