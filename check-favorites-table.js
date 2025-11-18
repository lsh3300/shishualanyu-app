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

async function checkFavoritesTable() {
  try {
    console.log('检查收藏表...');
    
    // 1. 获取所有收藏记录
    console.log('1. 获取所有收藏记录...');
    const { data: allFavorites, error: allError } = await supabase
      .from('favorites')
      .select('*');
    
    if (allError) {
      console.error('获取所有收藏失败:', allError);
    } else {
      console.log(`所有收藏记录 (共${allFavorites.length}条):`);
      allFavorites.forEach(fav => {
        console.log(`ID: ${fav.id}, 用户ID: ${fav.user_id}, 产品ID: ${fav.product_id}`);
      });
    }
    
    // 2. 获取测试用户的收藏记录
    console.log('\n2. 获取测试用户的收藏记录...');
    const { data: userFavorites, error: userError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (userError) {
      console.error('获取用户收藏失败:', userError);
    } else {
      console.log(`用户收藏记录 (共${userFavorites.length}条):`);
      userFavorites.forEach(fav => {
        console.log(`ID: ${fav.id}, 产品ID: ${fav.product_id}`);
      });
    }
    
    // 3. 使用count查询测试用户的收藏数量
    console.log('\n3. 使用count查询测试用户的收藏数量...');
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
    
    if (countError) {
      console.error('count查询失败:', countError);
    } else {
      console.log(`count查询结果: ${count}`);
    }
    
    // 4. 使用RPC查询测试用户的收藏数量
    console.log('\n4. 使用RPC查询测试用户的收藏数量...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('count_user_favorites', { user_id: TEST_USER_ID });
    
    if (rpcError) {
      console.error('RPC查询失败:', rpcError);
    } else {
      console.log(`RPC查询结果: ${rpcData}`);
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkFavoritesTable();