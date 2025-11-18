const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsersTable() {
  try {
    console.log('创建users表...');
    
    // 使用SQL创建users表
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE,
          name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- 启用RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        -- 创建策略：允许用户查看自己的信息
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
        
        -- 创建策略：允许用户更新自己的信息
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
        
        -- 创建策略：允许服务角色插入用户
        CREATE POLICY IF NOT EXISTS "Service role can insert users" ON public.users
          FOR INSERT WITH CHECK (auth.role() = 'service_role');
      `
    });
    
    if (error) {
      console.error('创建users表失败:', error);
      console.log('尝试使用直接SQL执行...');
      
      // 如果exec_sql不可用，尝试使用其他方法
      const { data: sqlData, error: sqlError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (sqlError && sqlError.code === 'PGRST205') {
        console.log('users表不存在，需要手动创建。请在Supabase控制台中执行以下SQL:');
        console.log(`
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE,
            name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- 启用RLS
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          
          -- 创建策略：允许用户查看自己的信息
          CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
          
          -- 创建策略：允许用户更新自己的信息
          CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
          
          -- 创建策略：允许服务角色插入用户
          CREATE POLICY IF NOT EXISTS "Service role can insert users" ON public.users
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
        `);
      } else {
        console.log('users表已存在');
      }
    } else {
      console.log('users表创建成功');
    }
    
    // 尝试创建测试用户
    console.log('创建测试用户...');
    const testUser = {
      id: '12345678-1234-1234-1234-123456789abc',
      email: 'test@example.com',
      name: '测试用户'
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
  } catch (error) {
    console.error('创建users表时出错:', error);
  }
}

createUsersTable();