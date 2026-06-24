import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export const revalidate = 120

interface MediaRecord {
  id: string
  product_id: string
  type: 'image' | 'video'
  url: string
  thumbnail: string | null
  position: number
  cover: boolean
  metadata: Record<string, any>
}

function normalizeProduct(record: any, media: MediaRecord[] = []) {
  const sortedImages = media
    .filter((item) => item.type === 'image')
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const sortedVideos = media
    .filter((item) => item.type === 'video')
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  const fallbackImages: string[] = Array.isArray(record.images)
    ? record.images
    : record.image_url
      ? [record.image_url]
      : []

  const coverImage =
    sortedImages.find((img) => img.cover)?.url ||
    sortedImages[0]?.url ||
    fallbackImages[0] ||
    null

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    price: Number(record.price),
    originalPrice: record.original_price ? Number(record.original_price) : null,
    category: record.category,
    inventory: record.inventory ?? 0,
    status: record.status ?? 'published',
    isNew: record.is_new ?? false,
    discount: record.discount ?? null,
    metadata: record.metadata || {},
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    images:
      sortedImages.length > 0
        ? sortedImages.map((image) => image.url)
        : fallbackImages,
    videos: sortedVideos.map((video) => video.url),
    media: [...sortedImages, ...sortedVideos],
    coverImage: coverImage || '/placeholder.jpg',
  }
}

interface FetchProductsOptions {
  page?: number
  limit?: number
  category?: string | null
}

interface FetchProductsResult {
  products: ReturnType<typeof normalizeProduct>[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

async function fetchProductsWithMedia(options: FetchProductsOptions = {}): Promise<FetchProductsResult> {
  const supabase = createServiceClient()
  
  const { page = 1, limit = 9, category = null } = options
  const offset = (page - 1) * limit

  // 构建查询，使用 count: 'exact' 获取总数
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // 添加分类筛选
  if (category) {
    query = query.eq('category', category)
  }

  // 添加分页
  query = query.range(offset, offset + limit - 1)

  const { data: products, error: productsError, count } = await query

  if (productsError) {
    throw productsError
  }

  const ids = (products ?? []).map((product) => product.id).filter(Boolean)

  let mediaMap: Record<string, MediaRecord[]> = {}
  if (ids.length > 0) {
    const { data: mediaData, error: mediaError } = await supabase
      .from('product_media')
      .select('id, product_id, type, url, thumbnail, position, cover, metadata')
      .in('product_id', ids)
      .order('position', { ascending: true })

    if (mediaError) {
      console.warn('获取 product_media 失败，将使用回退图片:', mediaError.message)
    } else {
      mediaMap = (mediaData || []).reduce<Record<string, MediaRecord[]>>((acc, item: any) => {
        const entry: MediaRecord = {
          id: item.id,
          product_id: item.product_id,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
          position: item.position ?? 0,
          cover: item.cover ?? false,
          metadata: item.metadata || {},
        }
        if (!acc[entry.product_id]) acc[entry.product_id] = []
        acc[entry.product_id].push(entry)
        return acc
      }, {})
    }
  }

  const normalizedProducts = (products || []).map((product) => normalizeProduct(product, mediaMap[product.id]))
  const total = count || 0
  const returnedCount = normalizedProducts.length
  // hasMore 为 true 当：返回的数据等于 limit 且还有更多数据
  const hasMore = returnedCount === limit && (offset + returnedCount) < total

  return {
    products: normalizedProducts,
    total,
    page,
    limit,
    hasMore
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 解析分页参数
    const limit = parseInt(searchParams.get('limit') || '9')
    const pageParam = searchParams.get('page')
    const page = pageParam !== null ? Math.max(1, parseInt(pageParam) || 1) : 1
    
    // 解析筛选参数
    const category = searchParams.get('category')

    const result = await fetchProductsWithMedia({
      page,
      limit,
      category
    })

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('获取产品失败:', error)
    return NextResponse.json({ error: '获取产品失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const {
      id,
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      inventory = 0,
      status = 'draft',
      isNew = false,
      discount,
      metadata = {},
    } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        id,
        name,
        slug,
        description,
        price,
        original_price: originalPrice,
        category,
        inventory,
        status,
        is_new: isNew,
        discount,
        metadata,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const product = normalizeProduct(data, [])
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('创建产品失败:', error)
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 })
  }
}
