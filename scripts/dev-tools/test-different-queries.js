const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('=== 直接查询脚本环境变量 ===');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key存在:', !!process.env.SUPABASE_SERVICE_KEY);
console.log('Supabase Key前10字符:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 10));

// 使用与API完全相同的方式创建客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDifferentQueries() {
  try {
    console.log('\n=== 测试不同查询方式 ===');
    
    // 1. 查询所有记录
    const { data: allData, error: allError } = await supabase
      .from('favorites')
      .select('*');
    
    console.log(`所有记录: ${allData?.length || 0} 条`);
    if (allError) {
      console.error('查询所有记录错误:', allError);
    }
    
    // 2. 查询特定用户记录
    const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
    const { data: userData, error: userError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    console.log(`用户记录: ${userData?.length || 0} 条`);
    if (userError) {
      console.error('查询用户记录错误:', userError);
    }
    
    // 3. Count查询
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log(`Count查询结果: ${count || 0}`);
    if (countError) {
      console.error('Count查询错误:', countError);
    }
    
    // 4. 查看用户记录详情
    if (userData && userData.length > 0) {
      console.log('\n用户记录详情:');
      userData.forEach((record, index) => {
        console.log(`记录 ${index + 1}:`, record);
      });
    }
    
    // 5. 检查表是否存在
    const { data: tableInfo, error: tableError } = await supabase
      .from('favorites')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('\n表检查错误:', tableError);
    } else {
      console.log('\nfavorites表存在且可访问');
    }
    
  } catch (error) {
    console.error('测试查询失败:', error);
  }
}

testDifferentQueries();