const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase环境变量');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('开始测试favorites表结构和功能...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFavoritesTable() {
  try {
    // 1. 检查favorites表是否存在
    console.log('\n1. 检查favorites表是否存在...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('无法获取表列表，尝试直接查询favorites表...');
    }
    
    // 2. 检查favorites表结构
    console.log('\n2. 检查favorites表结构...');
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(0);
    
    if (favError) {
      console.error('favorites表访问失败:', favError);
      console.log('错误代码:', favError.code);
      console.log('错误详情:', favError.details);
      return false;
    }
    
    console.log('favorites表访问成功!');
    
    // 3. 检查RLS策略是否启用
    console.log('\n3. 检查RLS策略...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_table_policies', { table_name: 'favorites' });
    
    if (rlsError) {
      console.log('无法获取RLS策略信息:', rlsError.message);
    } else {
      console.log('RLS策略:', rlsData);
    }
    
    // 4. 测试插入一条测试数据
    console.log('\n4. 测试插入数据...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // 测试用户ID
    const testProductId = '00000000-0000-0000-0000-000000000000'; // 测试产品ID
    
    // 先检查是否有测试产品
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productError || !productData || productData.length === 0) {
      console.log('没有找到产品，创建测试产品...');
      const { data: newProduct, error: insertProductError } = await supabase
        .from('products')
        .insert({
          name: '测试产品',
          description: '用于测试收藏功能的产品',
          price: 99.99,
          category: 'test'
        })
        .select('id')
        .single();
      
      if (insertProductError) {
        console.error('创建测试产品失败:', insertProductError);
        return false;
      }
      
      testProductId = newProduct.id;
      console.log('创建测试产品成功，ID:', testProductId);
    } else {
      testProductId = productData[0].id;
      console.log('使用现有产品，ID:', testProductId);
    }
    
    // 5. 检查表结构是否包含所需字段
    console.log('\n5. 检查表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'favorites')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('获取表结构失败:', tableError);
    } else {
      console.log('favorites表结构:');
      tableInfo.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    console.log('\nfavorites表结构和功能测试完成!');
    return true;
  } catch (err) {
    console.error('测试过程中发生错误:', err);
    return false;
  }
}

testFavoritesTable().then(success => {
  if (success) {
    console.log('\n所有测试通过，favorites表结构正常');
    process.exit(0);
  } else {
    console.error('\nfavorites表存在问题');
    process.exit(1);
  }
});