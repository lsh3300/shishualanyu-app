import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST() {
  try {
    console.log('开始初始化数据库表结构...')
    
    const supabase = createServiceClient()
    
    // 检查表是否存在
    console.log('检查products表是否存在...')
    const { data: existingData, error: checkError } = await supabase.from('products').select('id').limit(1)
    
    console.log('表检查结果:', { existingData, checkError })
    
    // 如果表不存在（PGRST205错误），则创建表
    if (checkError && checkError.code === 'PGRST205') {
      console.log('products表不存在，需要创建')
      return NextResponse.json({
        success: false,
        error: '数据库表不存在',
        message: '请在Supabase控制台的SQL编辑器中执行以下SQL创建表结构',
        instructions: [
          '1. 登录Supabase Dashboard',
          '2. 进入SQL编辑器',
          '3. 复制并执行下面的SQL代码',
          '4. 执行完成后，再次调用此API插入示例数据'
        ],
        sqlFile: '/supabase/init-products.sql',
        details: checkError
      }, { status: 400 })
    }
    
    // 处理其他错误
    if (checkError) {
      console.error('检查表时出错:', checkError)
      return NextResponse.json({
        success: false,
        error: '检查表时出错',
        details: checkError
      }, { status: 500 })
    }
    
    // 表已存在，检查是否已有数据
    if (existingData && existingData.length > 0) {
      return NextResponse.json({
        success: true,
        message: '数据库已包含示例数据，无需重复初始化',
        data: existingData
      })
    }
    
    // 插入示例产品数据
    console.log('插入示例产品数据...')
    const { data, error: seedError } = await supabase.from('products').insert([
      {
        name: '蓝染帆布袋',
        description: '采用传统蓝染工艺制作的帆布袋，环保耐用，适合日常使用',
        price: 89.00,
        category: 'accessories',
        image_url: '/images/styles/indigo-dyed-canvas-bag.jpg',
        in_stock: true
      },
      {
        name: '蓝染亚麻茶席',
        description: '天然亚麻材质，蓝染工艺制作，适合茶道爱好者使用',
        price: 128.00,
        category: 'home',
        image_url: '/images/styles/indigo-dyed-linen-tea-mat.jpg',
        in_stock: true
      },
      {
        name: '现代蓝染艺术画',
        description: '融合传统与现代的蓝染艺术作品，适合家居装饰',
        price: 299.00,
        category: 'art',
        image_url: '/images/styles/modern-indigo-dyeing-art.jpg',
        in_stock: true
      },
      {
        name: '扎染体验套装',
        description: '包含扎染所需全部材料和工具，适合初学者体验',
        price: 158.00,
        category: 'materials',
        image_url: '/images/styles/tie-dye-tutorial-hands-on.jpg',
        in_stock: true
      },
      {
        name: '蜡染工艺布料',
        description: '采用传统蜡染工艺制作的布料，可自行裁剪制作各种物品',
        price: 198.00,
        category: 'materials',
        image_url: '/images/styles/wax-resist-dyeing-fabric.jpg',
        in_stock: true
      }
    ]).select()
    
    if (seedError) {
      console.error('插入示例数据失败:', seedError)
      return NextResponse.json({
        success: false,
        error: '插入示例数据失败',
        details: seedError
      }, { status: 500 })
    }
    
    console.log('数据库初始化成功!')
    return NextResponse.json({
      success: true,
      message: '示例数据初始化成功',
      data: data
    })
    
  } catch (error: any) {
    console.error('初始化失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}