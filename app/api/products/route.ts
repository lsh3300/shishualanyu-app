import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'

// 获取所有产品
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('获取产品失败:', error)
    return NextResponse.json({ error: '获取产品失败' }, { status: 500 })
  }
}

// 创建新产品
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { name, description, price, category, image_url, in_stock } = body
    
    if (!name || !price || !category) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        image_url,
        in_stock: in_stock !== undefined ? in_stock : true
      })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error) {
    console.error('创建产品失败:', error)
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 })
  }
}