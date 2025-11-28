import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 生成一个固定的UUID作为测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

export async function GET() {
  try {
    console.log('API: /api/debug/favorites called');
    
    const supabase = createServerClient();
    
    // 检查所有收藏记录
    console.log('查询所有收藏记录...');
    const { data: allFavorites, error: allFavError } = await supabase
      .from('favorites')
      .select('*');
    
    console.log('所有收藏记录:', allFavorites);
    console.log('查询错误:', allFavError);
    
    // 检查测试用户的收藏记录
    console.log('查询测试用户的收藏记录...');
    const { data: userFavorites, error: userFavError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    console.log('用户收藏记录:', userFavorites);
    console.log('用户查询错误:', userFavError);
    
    // 检查收藏数量
    console.log('查询收藏数量...');
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log('收藏数量:', count);
    console.log('数量查询错误:', countError);
    
    return NextResponse.json({
      allFavorites,
      allFavError,
      userFavorites,
      userFavError,
      count,
      countError
    });
    
  } catch (error) {
    console.error('调试API出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}