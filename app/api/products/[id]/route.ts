import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

function normalizeProduct(record: any, media: any[]) {
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
      sortedImages.length > 0 ? sortedImages.map((image) => image.url) : fallbackImages,
    videos: sortedVideos.map((video) => video.url),
    coverImage:
      sortedImages.find((img) => img.cover)?.url ||
      sortedImages[0]?.url ||
      fallbackImages[0] ||
      '/placeholder.jpg',
    media: [...sortedImages, ...sortedVideos],
  }
}

function isUuid(value: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  )
}

async function fetchProductRecord(supabase: ReturnType<typeof createServiceClient>, identifier: string) {
  if (!identifier) return null

  if (isUuid(identifier)) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', identifier)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    if (data) return data
  }

  const { data: slugData, error: slugError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', identifier)
    .maybeSingle()

  if (slugError && slugError.code !== 'PGRST116') {
    throw slugError
  }

  return slugData || null
}

async function fetchProduct(identifier: string) {
  const supabase = createServiceClient()
  const data = await fetchProductRecord(supabase, identifier)
  if (!data) {
    return null
  }
  const { data: mediaData, error: mediaError } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', data.id)
    .order('position', { ascending: true })
  if (mediaError) {
    console.warn('获取 product_media 失败:', mediaError.message)
  }
  return normalizeProduct(data, mediaData || [])
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const product = await fetchProduct(params.id)
    if (!product) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('获取产品详情失败:', error)
    return NextResponse.json({ error: '获取产品详情失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceClient()
    const updates = await request.json()
    const { id } = params

    const payload: Record<string, any> = {}
    const mapping: Record<string, string> = {
      slug: 'slug',
      name: 'name',
      description: 'description',
      price: 'price',
      originalPrice: 'original_price',
      original_price: 'original_price',
      category: 'category',
      inventory: 'inventory',
      status: 'status',
      isNew: 'is_new',
      is_new: 'is_new',
      discount: 'discount',
      metadata: 'metadata',
    }

    Object.entries(mapping).forEach(([inputKey, column]) => {
      if (inputKey in updates) {
        payload[column] = updates[inputKey]
      }
    })

    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const product = await fetchProduct(id)
    return NextResponse.json(product)
  } catch (error) {
    console.error('更新产品失败:', error)
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceClient()
    const { id } = params

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('product_media').delete().eq('product_id', id)
    return NextResponse.json({ message: '产品删除成功' })
  } catch (error) {
    console.error('删除产品失败:', error)
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 })
  }
}