import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('环境变量测试API called');
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log('API - Supabase URL:', supabaseUrl);
    console.log('API - Supabase Key存在:', !!supabaseKey);
    console.log('API - Supabase Key前10字符:', supabaseKey ? supabaseKey.substring(0, 10) : 'null');
    
    return NextResponse.json({
      supabaseUrl: supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseKeyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : null
    });
    
  } catch (error) {
    console.error('环境变量测试API出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}