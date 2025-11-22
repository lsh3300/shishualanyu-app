import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API: /api/user/stats called');
    
    // 从请求头中获取Authorization token
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    let supabase: ReturnType<typeof createClient>;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('从请求头获取到token');
      
      // 使用token创建Supabase客户端
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      // 验证token并获取用户信息
      // 由于token已经在global headers中设置，getUser()会自动使用它
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('用户认证失败:', userError);
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
      
      userId = user.id;
      console.log('获取到真实用户ID:', userId);
    } else {
      console.log('未找到Authorization token，返回空统计数据');
      // 如果没有token，返回空统计数据
      return NextResponse.json({
        stats: {
          orders: 0,
          courses: 0,
          favorites: 0,
          assignments: 0,
          learningDays: 0,
          completedCourses: 0
        }
      });
    }
    
    if (!userId) {
      return NextResponse.json({ error: '无法获取用户ID' }, { status: 401 });
    }
    
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
    
    // 获取用户收藏数量（产品和课程）
    const { count: favoritesCount, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('获取收藏数据失败:', countError);
      return NextResponse.json({ error: '获取收藏数据失败' }, { status: 500 });
    }
    
    // 获取用户文章收藏数量
    const { count: articleFavoritesCount, error: articleCountError } = await supabase
      .from('article_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (articleCountError) {
      console.error('获取文章收藏数据失败:', articleCountError);
      // 不阻断，继续执行
    }
    
    // 合计总收藏数量：产品 + 课程 + 文章
    const finalFavoritesCount = (favoritesCount || 0) + (articleFavoritesCount || 0);
    
    console.log(`收藏统计: 产品/课程=${favoritesCount || 0}, 文章=${articleFavoritesCount || 0}, 总计=${finalFavoritesCount}`);
    
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