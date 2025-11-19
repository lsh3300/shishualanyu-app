import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

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

async function fetchProductsWithMedia() {
  const supabase = createServiceClient()

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (productsError) {
    throw productsError
  }

  const ids = (products ?? []).map((product) => product.id).filter(Boolean)

  let mediaMap: Record<string, MediaRecord[]> = {}
  if (ids.length > 0) {
    const { data: mediaData, error: mediaError } = await supabase
      .from('product_media')
      .select('*')
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

  return (products || []).map((product) => normalizeProduct(product, mediaMap[product.id]))
}

export async function GET() {
  try {
    const products = await fetchProductsWithMedia()
    return NextResponse.json({ products })
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