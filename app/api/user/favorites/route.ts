import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 用户认证函数
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
  if (!token) {
    return { userId: null, error: 'Missing authorization token' }
  }
  
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { userId: null, error: 'Invalid token' }
  }
  
  return { userId: data.user.id, error: null }
}

// GET: 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }
    
    const supabase = createServiceClient()
    
    // 查询收藏列表（支持商品和课程收藏）
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, product_id, course_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (favoritesError) {
      console.error('查询收藏失败:', favoritesError)
      return NextResponse.json({ error: '查询收藏失败' }, { status: 500 })
    }
    
    // 获取商品详情和图片
    const productIds = favorites?.filter(f => f.product_id).map(f => f.product_id) || []
    let productsMap: Record<string, any> = {}
    
    if (productIds.length > 0) {
      // 查询产品基本信息
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, image_url, category, description')
        .in('id', productIds)
      
      // 查询产品图片
      const { data: mediaData, error: mediaError } = await supabase
        .from('product_media')
        .select('product_id, url, type, cover, position')
        .in('product_id', productIds)
        .eq('type', 'image')
        .order('position', { ascending: true })
      
      if (!productsError && products) {
        products.forEach(product => {
          // 找到该产品的所有图片
          const productMedia = mediaData?.filter(m => m.product_id === product.id) || []
          // 优先使用封面图，否则使用第一张图片
          const coverImage = productMedia.find(m => m.cover)?.url || productMedia[0]?.url
          
          productsMap[product.id] = {
            ...product,
            image_url: coverImage || product.image_url || '/placeholder.svg',
            images: productMedia.map(m => m.url)
          }
        })
        
        console.log('📦 处理后的产品数据:', Object.values(productsMap).map(p => ({
          id: p.id,
          name: p.name,
          image_url: p.image_url,
          images_count: p.images?.length || 0
        })))
      }
    }
    
    // 获取课程详情
    const courseIds = favorites?.filter(f => f.course_id).map(f => f.course_id) || []
    let coursesMap: Record<string, any> = {}
    
    if (courseIds.length > 0) {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, instructor_name, duration, students, rating, price, is_free, difficulty, category, thumbnail')
        .in('id', courseIds)
      
      if (!coursesError && courses) {
        courses.forEach(course => {
          coursesMap[course.id] = {
            ...course,
            image_url: course.thumbnail || '/placeholder.svg'
          }
        })
        
        console.log('📚 处理后的课程数据:', Object.values(coursesMap).map(c => ({
          id: c.id,
          title: c.title,
          thumbnail: c.thumbnail
        })))
      }
    }
    
    // 组装返回数据
    const enrichedFavorites = favorites?.map(fav => {
      if (fav.product_id) {
        return {
          id: fav.id,
          product_id: fav.product_id,
          created_at: fav.created_at,
          item_type: 'product',
          products: productsMap[fav.product_id] || null
        }
      } else if (fav.course_id) {
        return {
          id: fav.id,
          course_id: fav.course_id,
          created_at: fav.created_at,
          item_type: 'course',
          courses: coursesMap[fav.course_id] || null
        }
      }
      return null
    }).filter(Boolean) || []
    
    return NextResponse.json({
      favorites: enrichedFavorites,
      source: 'supabase'
    })
    
  } catch (error) {
    console.error('GET /api/user/favorites 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
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
    const { productId, courseId } = body
    
    if (!productId && !courseId) {
      return NextResponse.json({ error: '缺少商品ID或课程ID' }, { status: 400 })
    }
    
    if (productId && courseId) {
      return NextResponse.json({ error: '不能同时收藏商品和课程' }, { status: 400 })
    }
    
    const supabase = createServiceClient()
    
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
    const { productId, courseId } = body
    
    if (!productId && !courseId) {
      return NextResponse.json({ error: '缺少商品ID或课程ID' }, { status: 400 })
    }
    
    const supabase = createServiceClient()
    
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
