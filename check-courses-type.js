const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoursesTableStructure() {
  try {
    console.log('检查 courses 表结构...');
    
    // 直接查询courses表的一行数据来查看id字段类型
    const { data: courseSample, error: sampleError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (sampleError) {
      console.log('获取courses样本失败:', sampleError.message);
    } else if (courseSample && courseSample.length > 0) {
      console.log('courses样本数据:', courseSample[0]);
      console.log('id字段类型:', typeof courseSample[0].id);
      console.log('id字段值:', courseSample[0].id);
    } else {
      console.log('courses表为空，无法确定id字段类型');
    }
    
    // 检查favorites表当前结构
    console.log('\n=== 检查 favorites 表当前结构 ===');
    const { data: favoritesData, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (favError) {
      console.log('获取favorites数据失败:', favError.message);
    } else if (favoritesData && favoritesData.length > 0) {
      console.log('favorites样本数据:', favoritesData[0]);
      console.log('现有字段:', Object.keys(favoritesData[0]));
    } else {
      console.log('favorites表为空');
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkCoursesTableStructure();