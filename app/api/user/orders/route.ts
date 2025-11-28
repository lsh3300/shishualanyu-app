import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_URL } from '@/lib/supabase/config';

// 创建Supabase客户端
const createSupabaseClient = () => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(SUPABASE_URL, supabaseAnonKey, {
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
    
    // 获取用户订单数据
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        payment_status,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          quantity,
          price,
          products(
            id,
            name,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('获取订单数据错误:', ordersError);
      return NextResponse.json({ error: '获取订单数据失败' }, { status: 500 });
    }
    
    // 计算订单统计数据
    const totalOrders = orders ? orders.length : 0;
    const completedOrders = orders ? orders.filter(o => o.status === 'completed').length : 0;
    const pendingOrders = orders ? orders.filter(o => o.status === 'pending').length : 0;
    
    return NextResponse.json({
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        list: orders || []
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}