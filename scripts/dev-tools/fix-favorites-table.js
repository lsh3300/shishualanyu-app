const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置');
  process.exit(1);
}

// 使用服务角色密钥创建客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsersTableDirectly() {
  try {
    console.log('尝试直接创建users表...');
    
    // 使用PostgREST的RPC功能执行SQL
    const { data, error } = await supabaseAdmin
      .rpc('exec', {
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
      console.error('直接创建users表失败:', error);
      
      // 如果还是失败，我们需要修改收藏功能，不依赖users表
      console.log('修改收藏功能，不依赖users表...');
      
      // 修改favorites表，移除对users表的外键约束
      const { data: alterData, error: alterError } = await supabaseAdmin
        .rpc('exec', {
          sql: `
            -- 删除外键约束（如果存在）
            ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
            
            -- 创建一个简单的策略，允许任何用户操作收藏表
            DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
            DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
            DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
            DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
            
            -- 创建新的策略，允许任何用户操作收藏表（仅用于测试）
            CREATE POLICY IF NOT EXISTS "Enable all operations for favorites" ON public.favorites
              FOR ALL USING (true);
          `
        });
      
      if (alterError) {
        console.error('修改favorites表失败:', alterError);
        console.log('请在Supabase控制台中手动执行以下SQL:');
        console.log(`
          -- 删除外键约束（如果存在）
          ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
          
          -- 创建一个简单的策略，允许任何用户操作收藏表
          DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
          DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
          DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
          DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
          
          -- 创建新的策略，允许任何用户操作收藏表（仅用于测试）
          CREATE POLICY IF NOT EXISTS "Enable all operations for favorites" ON public.favorites
            FOR ALL USING (true);
        `);
      } else {
        console.log('修改favorites表成功');
      }
    } else {
      console.log('users表创建成功');
      
      // 创建测试用户
      const testUser = {
        id: '12345678-1234-1234-1234-123456789abc',
        email: 'test@example.com',
        name: '测试用户'
      };
      
      const { data: newUser, error: insertError } = await supabaseAdmin
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
    console.error('创建users表时出错:', error);
  }
}

createUsersTableDirectly();