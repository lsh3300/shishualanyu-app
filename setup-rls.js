const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少必要的环境变量');
  console.error('需要 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// 使用服务角色密钥，具有管理员权限
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSPolicies() {
  try {
    console.log('设置favorites表的RLS策略...');
    
    // 1. 确保RLS已启用
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;`
    });
    
    if (enableError) {
      console.log('启用RLS可能已经存在:', enableError.message);
    }
    
    // 2. 删除现有策略（如果存在）
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
             DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
             DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
             DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;`
    });
    
    if (dropError) {
      console.log('删除现有策略可能出错:', dropError.message);
    }
    
    // 3. 创建查看策略 - 用户只能查看自己的收藏
    const { error: selectError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can view own favorites" ON favorites
             FOR SELECT USING (auth.uid()::text = user_id::text);`
    });
    
    if (selectError) {
      console.error('创建查看策略失败:', selectError);
    } else {
      console.log('创建查看策略成功');
    }
    
    // 4. 创建插入策略 - 用户只能插入自己的收藏
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can insert own favorites" ON favorites
             FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);`
    });
    
    if (insertError) {
      console.error('创建插入策略失败:', insertError);
    } else {
      console.log('创建插入策略成功');
    }
    
    // 5. 创建更新策略 - 用户只能更新自己的收藏
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can update own favorites" ON favorites
             FOR UPDATE USING (auth.uid()::text = user_id::text);`
    });
    
    if (updateError) {
      console.error('创建更新策略失败:', updateError);
    } else {
      console.log('创建更新策略成功');
    }
    
    // 6. 创建删除策略 - 用户只能删除自己的收藏
    const { error: deleteError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can delete own favorites" ON favorites
             FOR DELETE USING (auth.uid()::text = user_id::text);`
    });
    
    if (deleteError) {
      console.error('创建删除策略失败:', deleteError);
    } else {
      console.log('创建删除策略成功');
    }
    
    // 7. 创建一个临时策略，允许匿名用户在测试期间操作收藏
    const { error: tempError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Allow anonymous test access" ON favorites
             FOR ALL USING (true) WITH CHECK (true);`
    });
    
    if (tempError) {
      console.error('创建临时测试策略失败:', tempError);
    } else {
      console.log('创建临时测试策略成功');
    }
    
    console.log('RLS策略设置完成');
  } catch (error) {
    console.error('设置RLS策略失败:', error);
  }
}

setupRLSPolicies();