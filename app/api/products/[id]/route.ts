import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 获取单个产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('获取产品详情失败:', error)
    return NextResponse.json({ error: '获取产品详情失败' }, { status: 500 })
  }
}

// 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id } = params
    
    const { name, description, price, category, image_url, in_stock, images, videos } = body
    
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (category !== undefined) updateData.category = category
    if (image_url !== undefined) updateData.image_url = image_url
    if (in_stock !== undefined) updateData.in_stock = in_stock
    if (images !== undefined) updateData.images = images
    if (videos !== undefined) updateData.videos = videos
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('更新产品失败:', error)
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 })
  }
}

// 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const { id } = params
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: '产品删除成功' })
  } catch (error) {
    console.error('删除产品失败:', error)
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 })
  }
}