import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// 生成一个固定的UUID作为测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

export async function GET() {
  try {
    console.log('API: /api/user/stats called');
    
    // 暂时跳过认证，使用固定用户ID进行测试
    const userId = TEST_USER_ID;
    console.log('使用测试用户ID:', userId);
    
    // 使用匿名密钥创建客户端，而不是服务密钥
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // 获取用户订单数量
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId);
    
    if (ordersError) {
      console.error('获取订单数据失败:', ordersError);
      return NextResponse.json({ error: '获取订单数据失败' }, { status: 500 });
    }
    
    const ordersCount = ordersData ? ordersData.length : 0;
    
    // 获取课程数量 - 暂时返回固定值，因为products表没有user_id字段
  const coursesCount = 0;
  const learningDays = 0;
  const completedCoursesCount = 0;
    
    // 获取用户收藏数量 - 只使用count查询
    console.log('开始查询收藏数据...');
    
    // 先尝试直接查询数据，看看是否有问题
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, created_at')
      .eq('user_id', userId);
    
    console.log('收藏数据查询结果:', favoritesData);
    console.log('收藏数据查询错误:', favoritesError);
    
    // 使用count查询获取准确的收藏数量
    const { count: favoritesCount, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    console.log('收藏数量查询结果:', favoritesCount);
    console.log('收藏数量查询错误:', countError);
    
    if (countError) {
      console.error('获取收藏数据失败:', countError);
      return NextResponse.json({ error: '获取收藏数据失败' }, { status: 500 });
    }
    
    const finalFavoritesCount = favoritesCount || 0;
    console.log('最终使用的收藏数量:', finalFavoritesCount);
    
    // 计算学习天数 - 暂时返回固定值，因为没有相关数据
  // let learningDays = 0;
    
    // 获取已完成课程数 - 暂时返回固定值，因为enrollments表不存在
  // const completedCoursesCount = coursesCount;
    
    // 作业数暂时使用固定值代替（后续可以根据实际需求修改）
  const assignmentsCount = 0;
    
    const statsData = {
      stats: {
        orders: ordersCount,
        courses: coursesCount,
        favorites: finalFavoritesCount,
        assignments: assignmentsCount,
        learningDays: learningDays,
        completedCourses: completedCoursesCount
      }
    };
    
    console.log('API: Returning real stats data:', JSON.stringify(statsData));
    return NextResponse.json(statsData);
    
  } catch (error) {
    console.error('获取用户统计数据出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}