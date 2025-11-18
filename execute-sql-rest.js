const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置');
  process.exit(1);
}

async function executeSQLViaRestAPI() {
  try {
    console.log('尝试通过REST API执行SQL...');
    
    // 使用fetch直接调用Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
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
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('通过REST API执行SQL失败:', error);
      
      // 尝试使用不同的端点
      console.log('尝试使用不同的端点...');
      
      const response2 = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: `
            -- 删除外键约束（如果存在）
            ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
          `
        })
      });
      
      if (!response2.ok) {
        const error2 = await response2.text();
        console.error('使用不同端点也失败:', error2);
        
        console.log('无法通过API执行SQL，请手动在Supabase控制台中执行以下SQL:');
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
        console.log('使用不同端点成功');
      }
    } else {
      const result = await response.json();
      console.log('通过REST API执行SQL成功:', result);
    }
  } catch (error) {
    console.error('执行SQL时出错:', error);
  }
}

executeSQLViaRestAPI();