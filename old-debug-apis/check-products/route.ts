import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // 检查 products 表中的数据
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, in_stock, category')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch products', 
        details: error 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      productsCount: products?.length || 0,
      products: products || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
