const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoursesStructure() {
  try {
    console.log('=== 检查 courses 表结构 ===\n');
    
    // 获取表结构信息
    const { data: structure, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'courses' 
          ORDER BY ordinal_position;
        `
      });
    
    if (error) {
      console.log('无法通过RPC获取结构，尝试直接查询:');
      
      // 尝试查询一条数据来查看字段
      const { data: sample, error: sampleError } = await supabase
        .from('courses')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('查询失败:', sampleError.message);
      } else if (sample && sample.length > 0) {
        console.log('现有数据字段:');
        const fields = Object.keys(sample[0]);
        fields.forEach(field => {
          console.log(`  ${field}: ${typeof sample[0][field]}`);
        });
      } else {
        console.log('表中没有数据，无法确定字段结构');
      }
    } else if (structure) {
      console.log('表结构:');
      structure.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${col.column_default ? ' DEFAULT ' + col.column_default : ''}`);
      });
    }
    
    // 检查现有数据
    console.log('\n=== 检查现有课程数据 ===');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(10);
    
    if (coursesError) {
      console.log('查询课程失败:', coursesError.message);
    } else if (courses && courses.length > 0) {
      console.log(`找到 ${courses.length} 条课程数据:`);
      courses.forEach(course => {
        console.log(`  ${course.id}: ${course.title}`);
      });
    } else {
      console.log('表中没有课程数据');
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkCoursesStructure();