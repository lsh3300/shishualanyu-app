import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // 测试添加商品到购物车（使用服务端权限，跳过用户认证）
    const testProductId = '11111111-1111-1111-1111-111111111111' // 扎染T恤
    const testUserId = '00000000-0000-0000-0000-000000000000' // 测试用户ID
    
    // 检查商品是否存在
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .eq('id', testProductId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json({ 
        error: '商品不存在',
        productError,
        testProductId 
      }, { status: 404 })
    }
    
    if (product.in_stock === false) {
      return NextResponse.json({ 
        error: '商品已售罄',
        product 
      }, { status: 400 })
    }
    
    // 尝试添加到购物车
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        quantity: 1,
        color: null,
        size: null,
      })
      .select('id')
      .single()
    
    if (cartError) {
      return NextResponse.json({ 
        error: '添加购物车失败',
        cartError,
        details: cartError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: '测试成功：商品已添加到购物车',
      product,
      cartItem,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
