const { createClient } = require('@supabase/supabase-js');
const { NextResponse } = require('next/server');

// 硬编码环境变量 - 使用匿名密钥而不是服务密钥
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTkzNDksImV4cCI6MjA3Nzg3NTM0OX0.JvPDK5VK8hfqSdh0XZr4rvlbrJJhcjUb4Hi33bG7aPI';

console.log('=== 硬编码环境变量测试 ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key存在:', !!supabaseKey);
console.log('Supabase Key前10字符:', supabaseKey?.substring(0, 10));

// 使用硬编码环境变量创建客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    console.log('\n=== 硬编码API测试查询 ===');
    
    // 1. 查询所有记录
    const { data: allData, error: allError } = await supabase
      .from('favorites')
      .select('*');
    
    console.log(`API - 所有记录: ${allData?.length || 0} 条`);
    if (allError) {
      console.error('API - 查询所有记录错误:', allError);
    }
    
    // 2. 查询特定用户记录
    const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
    const { data: userData, error: userError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    console.log(`API - 用户记录: ${userData?.length || 0} 条`);
    if (userError) {
      console.error('API - 查询用户记录错误:', userError);
    }
    
    // 3. Count查询
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log(`API - Count查询结果: ${count || 0}`);
    if (countError) {
      console.error('API - Count查询错误:', countError);
    }
    
    // 4. 查看用户记录详情
    if (userData && userData.length > 0) {
      console.log('\nAPI - 用户记录详情:');
      userData.forEach((record: any, index: number) => {
        console.log(`记录 ${index + 1}:`, record);
      });
    }
    
    return NextResponse.json({
      allRecords: allData?.length || 0,
      userRecords: userData?.length || 0,
      countResult: count || 0,
      userDetails: userData || [],
      errors: {
        allError: allError?.message || null,
        userError: userError?.message || null,
        countError: countError?.message || null
      }
    });
    
  } catch (error: any) {
    console.error('API测试查询失败:', error);
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}