import { NextRequest, NextResponse } from 'next/server'
import featuredProductsConfig from '@/data/homepage-featured-products.json'
import { createServiceClient } from '@/lib/supabaseClient'

type CartItemWithProduct = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  color: string | null
  size: string | null
  created_at: string
  updated_at: string
  products: {
    id: string
    name: string
    price: number | null
    description: string | null
    image_url: string | null
    category: string | null
    in_stock: boolean | null
    images: string[] | null
  } | null
}

type ProductLookupResult = {
  id: string
  name: string
  price: number | null
  inventory: number | null
}

async function resolveUserId(
  request: NextRequest,
  supabase: ReturnType<typeof createServiceClient>,
) {
  const authHeader = request.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : undefined

  if (!token) {
    token = request.cookies.get('sb-access-token')?.value
  }

  if (!token) {
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) {
        return null
      }
      return data.user.id
    }

    return payload.sub || null
  } catch {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      return null
    }
    return data.user.id
  }
}

async function fetchProductsMap(
  supabase: ReturnType<typeof createServiceClient>,
  productIds: string[],
) {
  const map: Record<string, any> = {}
  if (!productIds.length) return map

  const [productsResult, mediaResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, image_url, category')
      .in('id', productIds),
    supabase
      .from('product_media')
      .select('product_id, url')
      .in('product_id', productIds)
      .eq('type', 'image')
      .eq('cover', true)
      .limit(productIds.length),
  ])

  if (productsResult.error) {
    console.error('获取购物车商品详情失败:', productsResult.error)
    return map
  }

  const coverMap: Record<string, string> = {}
  if (!mediaResult.error && mediaResult.data) {
    mediaResult.data.forEach((media) => {
      coverMap[media.product_id] = media.url
    })
  }

  ;(productsResult.data || []).forEach((product) => {
    map[product.id] = {
      ...product,
      image_url: coverMap[product.id] || product.image_url || '/placeholder.jpg',
    }
  })

  return map
}

async function buildCartPayload(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, user_id, product_id, quantity, color, size, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const rawItems = (data as any[]) ?? []
  const productIds = Array.from(new Set(rawItems.map((item) => item.product_id).filter(Boolean)))
  const productsMap = await fetchProductsMap(supabase, productIds)

  const items: CartItemWithProduct[] = rawItems.map((item) => {
    const product = productsMap[item.product_id] || null

    return {
      ...item,
      products: product
        ? {
            ...product,
            image_url: product.image_url || '/placeholder.jpg',
          }
        : null,
    }
  })

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalPrice = items.reduce((sum, item) => {
    const price = item.products?.price || 0
    return sum + price * (item.quantity || 0)
  }, 0)

  return {
    items,
    totalItems,
    totalPrice,
  }
}

function formatNullableValue(value?: string | null) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

async function resolveCartProduct(
  supabase: ReturnType<typeof createServiceClient>,
  identifier: string,
): Promise<ProductLookupResult | null> {
  if (!identifier) return null

  const fields = 'id, name, price, inventory'

  const { data: directProduct, error: directError } = await supabase
    .from('products')
    .select(fields)
    .eq('id', identifier)
    .maybeSingle()

  if (directError && directError.code !== 'PGRST116') {
    throw directError
  }

  if (directProduct) {
    return directProduct as ProductLookupResult
  }

  const aliasEntry = featuredProductsConfig.find(
    (item) => item.id === identifier || item.slug === identifier,
  )

  const slugCandidates = Array.from(
    new Set(
      [
        identifier,
        aliasEntry?.slug,
        aliasEntry?.slug?.replace('-travel-', '-'),
        aliasEntry?.slug?.replace('-gift-set', '-gift'),
      ].filter((value): value is string => Boolean(value)),
    ),
  )

  for (const slug of slugCandidates) {
    const { data: slugProduct, error: slugError } = await supabase
      .from('products')
      .select(fields)
      .eq('slug', slug)
      .maybeSingle()

    if (slugError && slugError.code !== 'PGRST116') {
      throw slugError
    }

    if (slugProduct) {
      return slugProduct as ProductLookupResult
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await resolveUserId(request, supabase)

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法获取购物车' }, { status: 401 })
    }

    const payload = await buildCartPayload(supabase, userId)
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=30',
        Vary: 'Authorization, Cookie',
      },
    })
  } catch (error) {
    console.error('获取购物车错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取购物车失败' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await resolveUserId(request, supabase)

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法添加购物车' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity = 1, color, size } = body

    console.log('POST /api/cart payload:', {
      userId,
      product_id,
      product_id_type: typeof product_id,
      product_id_length: product_id?.length,
      quantity,
      color,
      size,
    })

    if (!product_id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: '数量必须大于0' }, { status: 400 })
    }

    const normalizedColor = formatNullableValue(color)
    const normalizedSize = formatNullableValue(size)

    const product = await resolveCartProduct(supabase, product_id)
    if (!product) {
      console.error('商品不存在:', product_id)
      return NextResponse.json({ error: '商品不存在或已下架' }, { status: 404 })
    }

    if (typeof product.inventory === 'number' && product.inventory <= 0) {
      return NextResponse.json({ error: '该商品已售罄' }, { status: 400 })
    }

    let existingQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product.id)

    if (normalizedColor) {
      existingQuery = existingQuery.eq('color', normalizedColor)
    } else {
      existingQuery = existingQuery.is('color', null)
    }

    if (normalizedSize) {
      existingQuery = existingQuery.eq('size', normalizedSize)
    } else {
      existingQuery = existingQuery.is('size', null)
    }

    const { data: existingItem, error: existingError } = await existingQuery.single()
    let lastAddedItemId: string | undefined

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('检查购物车商品错误:', existingError)
      return NextResponse.json({ error: '检查购物车失败' }, { status: 500 })
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .eq('user_id', userId)

      if (updateError) {
        console.error('更新购物车错误:', updateError)
        return NextResponse.json({ error: '更新购物车失败' }, { status: 500 })
      }

      lastAddedItemId = existingItem.id
    } else {
      const { data: insertedItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: product.id,
          quantity,
          color: normalizedColor,
          size: normalizedSize,
        })
        .select('id')
        .single()

      if (insertError || !insertedItem) {
        console.error('添加购物车错误:', insertError)
        return NextResponse.json({ error: '添加购物车失败' }, { status: 500 })
      }

      lastAddedItemId = insertedItem.id
    }

    const payload = await buildCartPayload(supabase, userId)
    return NextResponse.json({
      ...payload,
      lastAddedItemId,
      statsUpdateRequired: true,
    })
  } catch (error) {
    console.error('添加到购物车错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加到购物车失败' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await resolveUserId(request, supabase)

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法更新购物车' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity } = body

    if (!id || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: '无效的参数' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)

    if (updateError) {
      console.error('更新购物车项错误:', updateError)
      return NextResponse.json({ error: '更新购物车项失败' }, { status: 500 })
    }

    const payload = await buildCartPayload(supabase, userId)
    return NextResponse.json({
      ...payload,
      statsUpdateRequired: true,
    })
  } catch (error) {
    console.error('更新购物车项错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新购物车项失败' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await resolveUserId(request, supabase)

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法删除购物车项' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: '缺少购物车项ID' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('删除购物车项错误:', deleteError)
      return NextResponse.json({ error: '删除购物车项失败' }, { status: 500 })
    }

    const payload = await buildCartPayload(supabase, userId)
    return NextResponse.json({
      ...payload,
      statsUpdateRequired: true,
    })
  } catch (error) {
    console.error('删除购物车项错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除购物车项失败' },
      { status: 500 },
    )
  }
}
