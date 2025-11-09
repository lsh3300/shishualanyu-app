import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST() {
  try {
    console.log('开始初始化数据库表结构...')
    
    const supabase = createServiceClient()
    
    // 注意：在实际应用中，表结构应该通过Supabase控制台的SQL编辑器创建
    // 这里我们假设表已经存在，直接插入示例数据
    
    // 插入示例产品数据
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
      
      // 如果是表不存在的错误，提供指导
      if (seedError.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          error: 'products表不存在',
          message: '请在Supabase控制台的SQL编辑器中执行以下SQL创建表结构',
          sql: `
-- 创建products表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  videos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 添加更新时间戳触发器
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          `,
          details: seedError
        }, { status: 500 })
      }
      
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