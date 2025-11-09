import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 创建Supabase客户端
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取用户收藏夹数据
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select(`
        id,
        product_id,
        created_at,
        products(
          id,
          name,
          price,
          description,
          image_url,
          category,
          stock
        )
      `)
      .eq('user_id', user.id);
    
    if (favoritesError) {
      console.error('获取收藏夹数据错误:', favoritesError);
      return NextResponse.json({ error: '获取收藏夹数据失败' }, { status: 500 });
    }
    
    // 计算收藏夹统计数据
    const totalFavorites = favorites ? favorites.length : 0;
    
    return NextResponse.json({
      favorites: {
        total: totalFavorites,
        list: favorites || []
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}