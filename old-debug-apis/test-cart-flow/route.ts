import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // 测试用户ID（你需要替换为实际的用户ID）
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const testProductId = '11111111-1111-1111-1111-111111111111' // 扎染T恤
    
    console.log('开始测试购物车流程...')
    
    // 1. 检查商品是否存在
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
    
    console.log('商品检查通过:', product.name)
    
    // 2. 清理之前的测试数据
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', testUserId)
      .eq('product_id', testProductId)
    
    console.log('清理旧数据完成')
    
    // 3. 添加商品到购物车
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        quantity: 1,
        color: null,
        size: null,
      })
      .select('*')
      .single()
    
    if (cartError) {
      return NextResponse.json({ 
        error: '添加购物车失败',
        cartError,
        details: cartError.message 
      }, { status: 500 })
    }
    
    console.log('添加购物车成功:', cartItem.id)
    
    // 4. 查询购物车数据
    const { data: cartItems, error: queryError } = await supabase
      .from('cart_items')
      .select(`
        id, user_id, product_id, quantity, color, size, created_at, updated_at,
        products:product_id (
          id, name, price, description, image_url, category, in_stock
        )
      `)
      .eq('user_id', testUserId)
    
    if (queryError) {
      return NextResponse.json({ 
        error: '查询购物车失败',
        queryError,
        details: queryError.message 
      }, { status: 500 })
    }
    
    console.log('查询购物车成功，商品数量:', cartItems?.length || 0)
    
    // 5. 计算总价
    const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const totalPrice = cartItems?.reduce((sum, item) => {
      const price = (item.products as any)?.price || 0
      return sum + price * (item.quantity || 0)
    }, 0) || 0
    
    return NextResponse.json({
      success: true,
      message: '购物车测试成功',
      data: {
        product,
        cartItem,
        cartItems,
        totalItems,
        totalPrice
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('购物车测试失败:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
