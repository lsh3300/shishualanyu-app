import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_URL } from '@/lib/supabase/config';

// 优化：快速解析 JWT 获取用户 ID
function parseJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.sub || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        stats: { orders: 0, courses: 0, favorites: 0, assignments: 0, learningDays: 0, completedCourses: 0 }
      });
    }
    
    const token = authHeader.substring(7);
    
    // 优化：先尝试快速解析 JWT
    let userId = parseJwtUserId(token);
    
    const supabase = createClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );
    
    // 如果快速解析失败，回退到完整验证
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
      userId = user.id;
    }
    
    // 优化：使用 Promise.all 并行查询所有统计数据
    const [ordersResult, favoritesResult, articleFavoritesResult] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('article_favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);
    
    const ordersCount = ordersResult.count || 0;
    const favoritesCount = (favoritesResult.count || 0) + (articleFavoritesResult.count || 0);
    
    return NextResponse.json({
      stats: {
        orders: ordersCount,
        courses: 0,
        favorites: favoritesCount,
        assignments: 0,
        learningDays: 0,
        completedCourses: 0
      }
    });
    
  } catch (error) {
    console.error('获取用户统计数据出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
