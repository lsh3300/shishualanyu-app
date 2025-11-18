import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('测试不同查询方式的API called');
  
  // 1. 使用createServerClient查询
  const serverSupabase = createServerClient();
  const { data: serverData, error: serverError } = await serverSupabase
    .from('favorites')
    .select('*');
  
  console.log(`Server客户端查询结果: ${serverData?.length || 0} 条`);
  if (serverError) {
    console.error('Server客户端查询错误:', serverError);
  }
  
  // 2. 使用createClient和服务密钥查询
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: '缺少环境变量' }, { status: 500 });
  }
  
  const adminSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const { data: adminData, error: adminError } = await adminSupabase
    .from('favorites')
    .select('*');
  
  console.log(`Admin客户端查询结果: ${adminData?.length || 0} 条`);
  if (adminError) {
    console.error('Admin客户端查询错误:', adminError);
  }
  
  // 3. 使用admin客户端查询特定用户的记录
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
  const { data: userData, error: userError } = await adminSupabase
    .from('favorites')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  
  console.log(`Admin客户端用户查询结果: ${userData?.length || 0} 条`);
  if (userError) {
    console.error('Admin客户端用户查询错误:', userError);
  }
  
  // 4. 使用admin客户端进行count查询
  const { count: adminCount, error: adminCountError } = await adminSupabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', TEST_USER_ID);
  
  console.log(`Admin客户端Count查询结果: ${adminCount || 0}`);
  if (adminCountError) {
    console.error('Admin客户端Count查询错误:', adminCountError);
  }
  
  // 5. 使用server客户端查询特定用户的记录
  const { data: serverUserData, error: serverUserError } = await serverSupabase
    .from('favorites')
    .select('*')
    .eq('user_id', TEST_USER_ID);
  
  console.log(`Server客户端用户查询结果: ${serverUserData?.length || 0} 条`);
  if (serverUserError) {
    console.error('Server客户端用户查询错误:', serverUserError);
  }
  
  // 6. 使用server客户端进行count查询
  const { count: serverCount, error: serverCountError } = await serverSupabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', TEST_USER_ID);
  
  console.log(`Server客户端Count查询结果: ${serverCount || 0}`);
  if (serverCountError) {
    console.error('Server客户端Count查询错误:', serverCountError);
  }
  
  return NextResponse.json({
    serverQuery: {
      count: serverData?.length || 0,
      error: serverError?.message || null
    },
    adminQuery: {
      count: adminData?.length || 0,
      error: adminError?.message || null
    },
    adminUserQuery: {
      count: userData?.length || 0,
      error: userError?.message || null,
      data: userData || []
    },
    adminCountQuery: {
      count: adminCount || 0,
      error: adminCountError?.message || null
    },
    serverUserQuery: {
      count: serverUserData?.length || 0,
      error: serverUserError?.message || null,
      data: serverUserData || []
    },
    serverCountQuery: {
      count: serverCount || 0,
      error: serverCountError?.message || null
    }
  });
}