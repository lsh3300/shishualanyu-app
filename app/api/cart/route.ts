import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabaseClient';

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

async function resolveUserId(request: NextRequest, supabase: ReturnType<typeof createServiceClient>) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : undefined;

  if (!token) {
    token = request.cookies.get('sb-access-token')?.value;
  }

  if (!token) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    console.error('认证失败:', error);
    return null;
  }

  return data.user.id;
}

async function fetchProductsMap(
  supabase: ReturnType<typeof createServiceClient>,
  productIds: string[],
) {
  const map: Record<string, any> = {}
  if (!productIds.length) return map

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, description, image_url, category, metadata')
    .in('id', productIds)

  if (productsError) {
    console.error('获取购物车商品详情失败:', productsError)
    return map
  }

  const { data: mediaData, error: mediaError } = await supabase
    .from('product_media')
    .select('product_id, type, url, cover, position')
    .in('product_id', productIds)
    .eq('type', 'image')
    .order('position', { ascending: true })

  const coverMap: Record<string, string> = {}
  if (mediaError) {
    console.warn('获取购物车商品图片失败:', mediaError)
  } else {
    mediaData?.forEach((media) => {
      const current = coverMap[media.product_id]
      if (!current || media.cover || media.position === 0) {
        coverMap[media.product_id] = media.url
      }
    })
  }

  ;(productsData || []).forEach((product) => {
    map[product.id] = {
      ...product,
      image_url: coverMap[product.id] || product.image_url || '/placeholder.jpg',
    }
  })

  return map
}

async function buildCartPayload(supabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, user_id, product_id, quantity, color, size, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rawItems = (data as any[]) ?? [];
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
  });
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.products?.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return {
    items,
    totalItems,
    totalPrice
  };
}

function formatNullableValue(value?: string | null) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// GET: 获取用户购物车数据
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const userId = await resolveUserId(request, supabase);

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法获取购物车' }, { status: 401 });
    }

    const payload = await buildCartPayload(supabase, userId);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('获取购物车错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取购物车失败' },
      { status: 500 }
    );
  }
}

// POST: 添加商品到购物车
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const userId = await resolveUserId(request, supabase);

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法添加购物车' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity = 1, color, size } = body;

    console.log('🛒 POST /api/cart payload:', {
      userId,
      product_id,
      product_id_type: typeof product_id,
      product_id_length: product_id?.length,
      quantity,
      color,
      size,
    });

    if (!product_id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: '数量必须大于0' }, { status: 400 });
    }

    const normalizedColor = formatNullableValue(color);
    const normalizedSize = formatNullableValue(size);

    console.log('🔍 查询产品:', product_id)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, inventory')
      .eq('id', product_id)
      .single()

    if (productError) {
      console.error('❌ 产品查询错误:', productError)
    }
    if (!product) {
      console.error('❌ 产品不存在:', product_id)
    }

    if (productError || !product) {
      return NextResponse.json({ error: '商品不存在或已下架' }, { status: 404 })
    }
    
    console.log('✅ 找到产品:', product.name)

    // 检查库存（如果 inventory 字段存在且为 0 或更少）
    if (typeof (product as any).inventory === 'number' && (product as any).inventory <= 0) {
      return NextResponse.json({ error: '该商品已售罄' }, { status: 400 });
    }

    let existingQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id);

    if (normalizedColor) {
      existingQuery = existingQuery.eq('color', normalizedColor);
    } else {
      existingQuery = existingQuery.is('color', null);
    }

    if (normalizedSize) {
      existingQuery = existingQuery.eq('size', normalizedSize);
    } else {
      existingQuery = existingQuery.is('size', null);
    }

    const { data: existingItem, error: existingError } = await existingQuery.single();

    let lastAddedItemId: string | undefined;

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('检查购物车商品错误:', existingError);
      return NextResponse.json({ error: '检查购物车失败' }, { status: 500 });
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('更新购物车错误:', updateError);
        return NextResponse.json({ error: '更新购物车失败' }, { status: 500 });
      }
      lastAddedItemId = existingItem.id;
    } else {
      const { data: insertedItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id,
          quantity,
          color: normalizedColor,
          size: normalizedSize,
        })
        .select('id')
        .single();

      if (insertError || !insertedItem) {
        console.error('添加购物车错误:', insertError);
        return NextResponse.json({ error: '添加购物车失败' }, { status: 500 });
      }
      lastAddedItemId = insertedItem.id;
    }

    const payload = await buildCartPayload(supabase, userId);
    return NextResponse.json({
      ...payload,
      lastAddedItemId,
      statsUpdateRequired: true,
    });
  } catch (error) {
    console.error('添加到购物车错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加到购物车失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新购物车商品数量
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const userId = await resolveUserId(request, supabase);

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法更新购物车' }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity } = body;

    if (!id || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: '无效的参数' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('更新购物车项错误:', updateError);
      return NextResponse.json({ error: '更新购物车项失败' }, { status: 500 });
    }

    const payload = await buildCartPayload(supabase, userId);
    return NextResponse.json({
      ...payload,
      statsUpdateRequired: true,
    });
  } catch (error) {
    console.error('更新购物车项错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新购物车项失败' },
      { status: 500 }
    );
  }
}

// DELETE: 从购物车删除商品
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const userId = await resolveUserId(request, supabase);

    if (!userId) {
      return NextResponse.json({ error: '未登录，无法删除购物车项' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少购物车项ID' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('删除购物车项错误:', deleteError);
      return NextResponse.json({ error: '删除购物车项失败' }, { status: 500 });
    }

    const payload = await buildCartPayload(supabase, userId);
    return NextResponse.json({
      ...payload,
      statsUpdateRequired: true,
    });
  } catch (error) {
    console.error('删除购物车项错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除购物车项失败' },
      { status: 500 }
    );
  }
}