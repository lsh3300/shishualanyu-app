import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// 生成一个固定的UUID作为测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

// GET: 获取用户购物车数据
export async function GET(request: NextRequest) {
  try {
    console.log('开始处理GET /api/cart请求');
    
    // 暂时跳过认证，使用固定用户ID进行测试
    const userId = TEST_USER_ID;
    console.log('使用测试用户ID:', userId);
    
    const supabase = createServerClient();

    // 获取购物车数据
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (cartError) {
      console.error('获取购物车数据错误:', cartError);
      return NextResponse.json(
        { error: '获取购物车数据失败' },
        { status: 500 }
      );
    }

    // 计算购物车统计信息
    const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice = cartItems?.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0) || 0;

    console.log('获取购物车成功，商品数量:', totalItems);
    return NextResponse.json({
      items: cartItems || [],
      totalItems,
      totalPrice
    });

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
    console.log('开始处理POST /api/cart请求');
    
    // 暂时跳过认证，使用固定用户ID进行测试
    const userId = TEST_USER_ID;
    console.log('使用测试用户ID:', userId);
    
    const supabase = createServerClient();
    const body = await request.json();
    const { product_id, quantity = 1, color, size } = body;

    console.log('收到请求数据:', { product_id, quantity, color, size });

    // 验证必填字段
    if (!product_id) {
      return NextResponse.json(
        { error: '缺少商品ID' },
        { status: 400 }
      );
    }

    // 验证商品是否存在
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      console.error('商品不存在错误:', productError);
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 检查库存
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: '库存不足' },
        { status: 400 }
      );
    }

    // 检查购物车中是否已存在该商品
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('color', color || '')
      .eq('size', size || '')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查购物车商品错误:', checkError);
      return NextResponse.json(
        { error: '检查购物车失败' },
        { status: 500 }
      );
    }

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: '库存不足' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('更新购物车错误:', updateError);
        return NextResponse.json(
          { error: '更新购物车失败' },
          { status: 500 }
        );
      }
    } else {
      // 添加新商品到购物车
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id,
          quantity,
          color: color || '',
          size: size || '',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('添加购物车错误:', insertError);
        return NextResponse.json(
          { error: '添加购物车失败' },
          { status: 500 }
        );
      }
    }

    // 返回更新后的购物车数据
    const { data: cartData, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id(*)
      `)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('获取购物车数据错误:', fetchError);
      return NextResponse.json(
        { error: '获取购物车数据失败' },
        { status: 500 }
      );
    }

    // 计算购物车统计信息
    const totalItems = cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice = cartData?.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0) || 0;

    console.log('添加到购物车成功');
    return NextResponse.json({
      items: cartData || [],
      totalItems,
      totalPrice,
      statsUpdateRequired: true // 标记需要更新统计数据
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
    console.log('开始处理PUT /api/cart请求');
    
    // 暂时跳过认证，使用固定用户ID进行测试
    const userId = TEST_USER_ID;
    console.log('使用测试用户ID:', userId);
    
    const supabase = createServerClient();
    const body = await request.json();
    const { id, quantity } = body;

    if (!id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: '无效的参数' },
        { status: 400 }
      );
    }

    // 更新购物车项数量
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('更新购物车项错误:', updateError);
      return NextResponse.json(
        { error: '更新购物车项失败' },
        { status: 500 }
      );
    }

    // 返回更新后的购物车数据
    const { data: cartData, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id(*)
      `)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('获取购物车数据错误:', fetchError);
      return NextResponse.json(
        { error: '获取购物车数据失败' },
        { status: 500 }
      );
    }

    // 计算购物车统计信息
    const totalItems = cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice = cartData?.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0) || 0;

    console.log('更新购物车成功');
    return NextResponse.json({
      items: cartData || [],
      totalItems,
      totalPrice,
      statsUpdateRequired: true // 标记需要更新统计数据
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
    console.log('开始处理DELETE /api/cart请求');
    
    // 暂时跳过认证，使用固定用户ID进行测试
    const userId = TEST_USER_ID;
    console.log('使用测试用户ID:', userId);
    
    const supabase = createServerClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: '缺少购物车项ID' },
        { status: 400 }
      );
    }

    // 删除购物车项
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('删除购物车项错误:', deleteError);
      return NextResponse.json(
        { error: '删除购物车项失败' },
        { status: 500 }
      );
    }

    // 返回更新后的购物车数据
    const { data: cartData, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id(*)
      `)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('获取购物车数据错误:', fetchError);
      return NextResponse.json(
        { error: '获取购物车数据失败' },
        { status: 500 }
      );
    }

    // 计算购物车统计信息
    const totalItems = cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice = cartData?.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0) || 0;

    console.log('删除购物车项成功');
    return NextResponse.json({
      items: cartData || [],
      totalItems,
      totalPrice,
      statsUpdateRequired: true // 标记需要更新统计数据
    });

  } catch (error) {
    console.error('删除购物车项错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除购物车项失败' },
      { status: 500 }
    );
  }
}