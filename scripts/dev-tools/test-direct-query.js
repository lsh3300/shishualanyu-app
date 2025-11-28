const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 测试用户ID
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

async function testDirectQuery() {
  try {
    console.log('直接查询数据库测试...');
    
    // 1. 查询所有收藏记录
    const { data: allFavorites, error: allError } = await supabase
      .from('favorites')
      .select('*');
    
    console.log('所有收藏记录:', allFavorites?.length || 0, '条');
    if (allFavorites && allFavorites.length > 0) {
      console.log('第一条记录:', allFavorites[0]);
    }
    
    // 2. 查询测试用户的收藏记录
    const { data: userFavorites, error: userError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    console.log('用户收藏记录:', userFavorites?.length || 0, '条');
    if (userFavorites && userFavorites.length > 0) {
      console.log('用户第一条记录:', userFavorites[0]);
    }
    
    // 3. 使用count查询
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log('Count查询结果:', count);
    
    // 4. 使用与API完全相同的查询方式
    const { data: apiFavorites, error: apiError } = await supabase
      .from('favorites')
      .select('id, created_at')
      .eq('user_id', TEST_USER_ID);
    
    console.log('API方式查询结果:', apiFavorites);
    
    // 5. 再次使用count查询，与API完全相同
    const { count: apiCount, error: apiCountError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    console.log('API方式Count查询结果:', apiCount);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDirectQuery();