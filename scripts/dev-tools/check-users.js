const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  try {
    console.log('检查users表是否存在...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('查询users表失败:', error);
      return;
    }
    
    console.log('users表存在，当前用户数量:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('现有用户:');
      data.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email || 'N/A'}, Name: ${user.name || 'N/A'}`);
      });
    } else {
      console.log('没有找到用户，将创建测试用户...');
      
      const testUser = {
        id: '12345678-1234-1234-1234-123456789abc',
        email: 'test@example.com',
        name: '测试用户',
        created_at: new Date().toISOString()
      };
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([testUser])
        .select();
      
      if (insertError) {
        console.error('创建测试用户失败:', insertError);
      } else {
        console.log('测试用户创建成功:', newUser);
      }
    }
  } catch (error) {
    console.error('检查users表时出错:', error);
  }
}

checkUsersTable();