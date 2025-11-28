const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFavoritesMigration() {
  try {
    console.log('=== 验证收藏表迁移结果 ===\n');
    
    // 1. 检查表结构
    console.log('1. 检查表结构:');
    const { data: structure, error: structError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'favorites' 
          ORDER BY ordinal_position;
        `
      });
    
    if (structError) {
      console.log('获取表结构失败:', structError.message);
    } else {
      console.log('字段信息:');
      structure.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${col.column_default ? ' DEFAULT ' + col.column_default : ''}`);
      });
    }
    
    // 2. 检查约束
    console.log('\n2. 检查约束:');
    const { data: constraints, error: constError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT conname as constraint_name, contype as constraint_type,
                 pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conrelid = 'favorites'::regclass
          ORDER BY conname;
        `
      });
    
    if (constError) {
      console.log('获取约束失败:', constError.message);
    } else {
      constraints.forEach(constraint => {
        const typeMap = { 'p': '主键', 'f': '外键', 'u': '唯一', 'c': '检查' };
        console.log(`  ${constraint.constraint_name}: ${typeMap[constraint.constraint_type] || constraint.constraint_type}`);
        if (constraint.definition) {
          console.log(`    定义: ${constraint.definition}`);
        }
      });
    }
    
    // 3. 检查索引
    console.log('\n3. 检查索引:');
    const { data: indexes, error: indexError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT indexname, indexdef
          FROM pg_indexes 
          WHERE tablename = 'favorites'
          ORDER BY indexname;
        `
      });
    
    if (indexError) {
      console.log('获取索引失败:', indexError.message);
    } else {
      indexes.forEach(index => {
        console.log(`  ${index.indexname}`);
      });
    }
    
    // 4. 检查样本数据
    console.log('\n4. 检查样本数据:');
    const { data: samples, error: sampleError } = await supabase
      .from('favorites')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (sampleError) {
      console.log('获取样本数据失败:', sampleError.message);
    } else if (samples && samples.length > 0) {
      console.log('最新5条数据:');
      samples.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, 用户: ${row.user_id}, 类型: ${row.item_type}, 产品ID: ${row.product_id}, 课程ID: ${row.course_id}`);
      });
    } else {
      console.log('表中没有数据');
    }
    
    // 5. 验证约束是否有效
    console.log('\n5. 验证约束有效性:');
    const { data: validation, error: valError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN item_type = 'product' THEN 1 END) as product_count,
            COUNT(CASE WHEN item_type = 'course' THEN 1 END) as course_count,
            COUNT(CASE WHEN item_type = 'product' AND product_id IS NULL THEN 1 END) as invalid_product,
            COUNT(CASE WHEN item_type = 'course' AND course_id IS NULL THEN 1 END) as invalid_course,
            COUNT(CASE WHEN product_id IS NOT NULL AND course_id IS NOT NULL THEN 1 END) as both_not_null
          FROM favorites;
        `
      });
    
    if (valError) {
      console.log('验证约束失败:', valError.message);
    } else if (validation && validation.length > 0) {
      const stats = validation[0];
      console.log(`总记录数: ${stats.total}`);
      console.log(`产品收藏: ${stats.product_count}`);
      console.log(`课程收藏: ${stats.course_count}`);
      console.log(`无效产品收藏: ${stats.invalid_product}`);
      console.log(`无效课程收藏: ${stats.invalid_course}`);
      console.log(`同时有产品和课程ID: ${stats.both_not_null}`);
      
      if (stats.invalid_product == 0 && stats.invalid_course == 0 && stats.both_not_null == 0) {
        console.log('\n✅ 所有约束验证通过！');
      } else {
        console.log('\n❌ 发现约束违反的数据！');
      }
    }
    
  } catch (error) {
    console.error('验证失败:', error.message);
  }
}

verifyFavoritesMigration();