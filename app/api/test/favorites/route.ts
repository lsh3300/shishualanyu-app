import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

export async function GET() {
  try {
    console.log('测试API: /api/test/favorites called');
    
    const supabase = createServerClient();
    
    // 1. 查询所有收藏记录
    const { data: allFavorites, error: allError } = await supabase
      .from('favorites')
      .select('*');
    
    console.log('API - 所有收藏记录:', allFavorites?.length || 0, '条');
    
    // 2. 查询测试用户的收藏记录
    const { data: userFavorites, error: userError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    console.log('API - 用户收藏记录:', userFavorites?.length || 0, '条');
    
    // 3. 使用count查询
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log('API - Count查询结果:', count);
    
    // 4. 使用与stats API完全相同的查询方式
    const { data: apiFavorites, error: apiError } = await supabase
      .from('favorites')
      .select('id, created_at')
      .eq('user_id', TEST_USER_ID);
    
    console.log('API - API方式查询结果:', apiFavorites);
    
    // 5. 再次使用count查询，与stats API完全相同
    const { count: apiCount, error: apiCountError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log('API - API方式Count查询结果:', apiCount);
    
    return NextResponse.json({
      allFavoritesCount: allFavorites?.length || 0,
      userFavoritesCount: userFavorites?.length || 0,
      countResult: count || 0,
      apiFavoritesCount: apiFavorites?.length || 0,
      apiCountResult: apiCount || 0,
      allFavorites: allFavorites || [],
      userFavorites: userFavorites || [],
      apiFavorites: apiFavorites || []
    });
    
  } catch (error) {
    console.error('测试API出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}