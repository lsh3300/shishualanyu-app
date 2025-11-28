const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFavoritesMigrationSimple() {
  try {
    console.log('=== 验证收藏表迁移结果 ===\n');
    
    // 1. 检查样本数据
    console.log('1. 检查样本数据:');
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
    
    // 2. 检查数据完整性
    console.log('\n2. 检查数据完整性:');
    const { data: products, error: prodError } = await supabase
      .from('favorites')
      .select('id, item_type, product_id, course_id')
      .eq('item_type', 'product')
      .not('product_id', 'is', null)
      .limit(3);
    
    console.log(`产品收藏: ${products ? products.length : 0} 条有效记录`);
    
    const { data: courses, error: courseError } = await supabase
      .from('favorites')
      .select('id, item_type, product_id, course_id')
      .eq('item_type', 'course')
      .not('course_id', 'is', null)
      .limit(3);
    
    console.log(`课程收藏: ${courses ? courses.length : 0} 条有效记录`);
    
    // 3. 检查课程数据
    if (courses && courses.length > 0) {
      console.log('\n3. 检查课程收藏数据:');
      for (const course of courses) {
        console.log(`  课程收藏 ID: ${course.id}`);
        console.log(`    课程ID: ${course.course_id} (类型: ${typeof course.course_id})`);
        
        // 检查对应的课程是否存在
        const { data: courseData, error: courseCheckError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', course.course_id)
          .single();
        
        if (courseCheckError) {
          console.log(`    ❌ 课程不存在或查询失败: ${courseCheckError.message}`);
        } else if (courseData) {
          console.log(`    ✅ 课程存在: ${courseData.title}`);
        } else {
          console.log(`    ❌ 课程不存在`);
        }
      }
    }
    
    // 4. 检查产品数据
    if (products && products.length > 0) {
      console.log('\n4. 检查产品收藏数据:');
      for (const product of products) {
        console.log(`  产品收藏 ID: ${product.id}`);
        console.log(`    产品ID: ${product.product_id} (类型: ${typeof product.product_id})`);
        
        // 检查对应的产品是否存在
        const { data: productData, error: productCheckError } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', product.product_id)
          .single();
        
        if (productCheckError) {
          console.log(`    ❌ 产品不存在或查询失败: ${productCheckError.message}`);
        } else if (productData) {
          console.log(`    ✅ 产品存在: ${productData.name}`);
        } else {
          console.log(`    ❌ 产品不存在`);
        }
      }
    }
    
    // 5. 统计总览
    console.log('\n5. 数据总览:');
    const { data: totalData, error: totalError } = await supabase
      .from('favorites')
      .select('item_type', { count: 'exact' });
    
    if (!totalError && totalData) {
      const { count: totalCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });
      
      const { count: productCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', 'product');
      
      const { count: courseCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', 'course');
      
      console.log(`总收藏数: ${totalCount}`);
      console.log(`产品收藏: ${productCount}`);
      console.log(`课程收藏: ${courseCount}`);
      
      if (totalCount === (productCount + courseCount)) {
        console.log('✅ 数据完整性检查通过');
      } else {
        console.log('❌ 数据完整性检查失败');
      }
    }
    
  } catch (error) {
    console.error('验证失败:', error.message);
  }
}

verifyFavoritesMigrationSimple();