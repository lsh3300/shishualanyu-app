import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 创建测试产品
export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // 检查是否已存在测试产品
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('name', '测试视频产品')
      .single()
    
    if (existingProduct) {
      return NextResponse.json({ message: '测试产品已存在', productId: existingProduct.id })
    }
    
    // 创建测试产品
    const testProduct = {
      name: '测试视频产品',
      description: '这是一个用于测试视频播放功能的产品',
      price: 99.99,
      category: 'test',
      image_url: '/placeholder.jpg',
      in_stock: true,
      images: ['/placeholder.jpg', '/placeholder.jpg'],
      videos: [
        {
          id: 'test-video-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: '/placeholder.jpg',
          title: '测试视频1',
          duration: '0:30'
        },
        {
          id: 'test-video-2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail: '/placeholder.jpg',
          title: '测试视频2',
          duration: '1:00'
        }
      ]
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: '测试产品创建成功', 
      productId: data[0].id,
      product: data[0]
    })
  } catch (error) {
    console.error('创建测试产品失败:', error)
    return NextResponse.json({ error: '创建测试产品失败' }, { status: 500 })
  }
}