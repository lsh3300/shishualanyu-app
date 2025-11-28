import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // 检查 products 表
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .limit(10)
    
    if (productsError) {
      return NextResponse.json({ 
        error: 'Products query failed', 
        details: productsError 
      }, { status: 500 })
    }
    
    // 检查 cart_items 表
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity')
      .limit(5)
    
    return NextResponse.json({
      products: products || [],
      productsCount: products?.length || 0,
      cartItems: cartItems || [],
      cartError: cartError?.message || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
