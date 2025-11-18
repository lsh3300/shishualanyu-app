const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量');
  process.exit(1);
}

// 使用管理员密钥连接
const adminSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRLS() {
  try {
    console.log('检查RLS策略...');
    
    // 1. 检查favorites表的RLS状态
    let rlsStatus, rlsError;
    try {
      const result = await adminSupabase
        .rpc('get_table_rls_status', { table_name: 'favorites' });
      rlsStatus = result.data;
      rlsError = result.error;
    } catch (e) {
      // 如果RPC不存在，使用SQL查询
      const result = await adminSupabase
        .from('information_schema.table_policies')
        .select('policyname, permissive, roles, cmd, qual, with_check')
        .eq('tablename', 'favorites');
      rlsStatus = result.data;
      rlsError = result.error;
    }
    
    if (rlsError) {
      console.error('获取RLS状态失败:', rlsError);
      
      // 尝试直接查询表策略
      const { data: policies, error: policiesError } = await adminSupabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'favorites');
      
      if (policiesError) {
        console.error('获取表策略失败:', policiesError);
      } else {
        console.log('表策略:', policies);
      }
    } else {
      console.log('RLS状态:', rlsStatus);
    }
    
    // 2. 尝试使用不同的方式查询
    console.log('\n尝试不同的查询方式...');
    
    // 使用原始SQL查询
    let sqlData, sqlError;
    try {
      const result = await adminSupabase
        .rpc('exec_sql', { 
          sql: 'SELECT * FROM favorites WHERE user_id = $1',
          params: ['12345678-1234-1234-1234-123456789abc']
        });
      sqlData = result.data;
      sqlError = result.error;
    } catch (e) {
      // 如果RPC不存在，跳过
      sqlData = null;
      sqlError = { message: 'RPC不存在' };
    }
    
    if (sqlError) {
      console.log('SQL查询失败:', sqlError.message);
    } else {
      console.log('SQL查询结果:', sqlData);
    }
    
    // 3. 检查表结构
    const { data: tableInfo, error: tableError } = await adminSupabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'favorites')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('获取表结构失败:', tableError);
    } else {
      console.log('\nfavorites表结构:');
      tableInfo.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('检查RLS失败:', error);
  }
}

checkRLS();