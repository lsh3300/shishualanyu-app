import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // 检查products表是否已存在
    const { data: existingData, error: checkError } = await supabase
      .from('products')
      .select('count')
      .single()
    
    // 如果表不存在，返回手动创建提示
    if (checkError && checkError.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: '需要手动创建数据库表',
        requiresManualSetup: true,
        message: '请在Supabase控制台中执行SQL脚本创建products表',
        sql: `
          CREATE TABLE IF NOT EXISTS public.products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT,
            images TEXT[] DEFAULT '{}',
            videos TEXT[] DEFAULT '{}',
            in_stock BOOLEAN DEFAULT true,
            sales INTEGER DEFAULT 0,
            is_new BOOLEAN DEFAULT false,
            discount INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE OR REPLACE FUNCTION public.handle_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          DROP TRIGGER IF EXISTS handle_products_updated_at ON public.products;
          CREATE TRIGGER handle_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        `
      }, { status: 400 })
    }
    
    // 检查是否已有数据
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .limit(5)
    
    if (!checkError && existingData && Number(existingData.count) > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '表已存在且包含数据',
        count: Number(existingData.count)
      })
    }
    
    // 插入示例数据
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          name: '扎染T恤',
          description: '传统扎染工艺制作的纯棉T恤，舒适透气，图案独特',
          price: 128.00,
          category: '服饰',
          images: ['https://picsum.photos/seed/tie-dye-tshirt/400/300.jpg'],
          in_stock: true,
          sales: 42,
          is_new: true,
          discount: 24
        },
        {
          name: '蜡染丝巾',
          description: '手工蜡染真丝丝巾，精美图案，优雅大方',
          price: 198.00,
          category: '配饰',
          images: ['https://picsum.photos/seed/wax-resist-scarf/400/300.jpg'],
          in_stock: true,
          sales: 28,
          is_new: true,
          discount: 23
        },
        {
          name: '扎染帆布包',
          description: '环保帆布材质，传统扎染图案，实用时尚',
          price: 88.00,
          category: '配饰',
          images: ['https://picsum.photos/seed/tie-dye-bag/400/300.jpg'],
          in_stock: true,
          sales: 65,
          is_new: false,
          discount: 25
        },
        {
          name: '蜡染抱枕',
          description: '精美蜡染图案抱枕，为家居增添艺术气息',
          price: 68.00,
          category: '家居',
          images: ['https://picsum.photos/seed/wax-resist-pillow/400/300.jpg'],
          in_stock: true,
          sales: 33,
          is_new: false,
          discount: 23
        },
        {
          name: '扎染壁挂',
          description: '大型扎染艺术壁挂，适合客厅或卧室装饰',
          price: 268.00,
          category: '家居',
          images: ['https://picsum.photos/seed/tie-dye-tapestry/400/300.jpg'],
          in_stock: true,
          sales: 15,
          is_new: true,
          discount: 18
        }
      ])
      .select()
    
    if (insertError) {
      console.error('插入数据失败:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: '插入数据失败',
        details: insertError 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '数据库初始化成功',
      count: insertData?.length || 0
    })
    
  } catch (error: any) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: '请手动在Supabase控制台中执行SQL脚本'
    }, { status: 500 })
  }
}