const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('检查数据库表结构...');
    
    // 检查courses表结构
    console.log('\n=== 检查 courses 表结构 ===');
    const { data: coursesColumns, error: coursesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'courses')
      .order('ordinal_position');
    
    if (coursesError) {
      console.log('获取courses表结构失败:', coursesError.message);
    } else {
      console.log('courses表结构:');
      coursesColumns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // 检查favorites表结构
    console.log('\n=== 检查 favorites 表结构 ===');
    const { data: favoritesColumns, error: favoritesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'favorites')
      .order('ordinal_position');
    
    if (favoritesError) {
      console.log('获取favorites表结构失败:', favoritesError.message);
    } else {
      console.log('favorites表结构:');
      favoritesColumns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // 检查现有约束
    console.log('\n=== 检查 favorites 表约束 ===');
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT conname, contype, consrc 
          FROM pg_constraint 
          WHERE conrelid = 'public.favorites'::regclass
        `
      });
    
    if (constraintsError) {
      console.log('获取约束信息失败:', constraintsError.message);
    } else {
      console.log('favorites表约束:');
      constraints.forEach(constraint => {
        console.log(`  ${constraint.conname}: ${constraint.contype}`);
      });
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkTableStructure();