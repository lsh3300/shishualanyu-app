const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFavoritesData() {
  try {
    console.log('=== 检查 favorites 表中的问题数据 ===');
    
    // 获取所有数据
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('获取数据失败:', error.message);
      return;
    }
    
    console.log(`总记录数: ${favorites.length}`);
    
    // 检查违反约束的数据
    const problematicRows = [];
    
    favorites.forEach((row, index) => {
      const issues = [];
      
      // 检查约束违反情况
      if (row.item_type === 'product') {
        if (!row.product_id) {
          issues.push('item_type=product但product_id为NULL');
        }
        if (row.course_id) {
          issues.push('item_type=product但course_id不为NULL');
        }
      } else if (row.item_type === 'course') {
        if (!row.course_id) {
          issues.push('item_type=course但course_id为NULL');
        }
        if (row.product_id) {
          issues.push('item_type=course但product_id不为NULL');
        }
      } else {
        issues.push(`未知的item_type: ${row.item_type}`);
      }
      
      // 检查product_id和course_id同时为NULL的情况
      if (!row.product_id && !row.course_id) {
        issues.push('product_id和course_id同时为NULL');
      }
      
      // 检查product_id和course_id同时不为NULL的情况
      if (row.product_id && row.course_id) {
        issues.push('product_id和course_id同时不为NULL');
      }
      
      if (issues.length > 0) {
        problematicRows.push({
          rowNumber: index + 1,
          id: row.id,
          user_id: row.user_id,
          item_type: row.item_type,
          product_id: row.product_id,
          course_id: row.course_id,
          created_at: row.created_at,
          issues: issues
        });
      }
    });
    
    if (problematicRows.length > 0) {
      console.log(`\n发现 ${problematicRows.length} 条问题数据:`);
      problematicRows.forEach(row => {
        console.log(`\n第${row.rowNumber}行 (ID: ${row.id}):`);
        console.log(`  user_id: ${row.user_id}`);
        console.log(`  item_type: ${row.item_type}`);
        console.log(`  product_id: ${row.product_id}`);
        console.log(`  course_id: ${row.course_id}`);
        console.log(`  问题: ${row.issues.join(', ')}`);
      });
      
      console.log('\n=== 修复建议 ===');
      console.log('1. 删除或修复上述问题数据');
      console.log('2. 或者先清理数据再添加约束');
      console.log('3. 或者修改约束允许现有数据存在');
      
    } else {
      console.log('没有发现违反约束的数据');
    }
    
    // 显示数据统计
    console.log('\n=== 数据统计 ===');
    const productFavorites = favorites.filter(f => f.item_type === 'product');
    const courseFavorites = favorites.filter(f => f.item_type === 'course');
    
    console.log(`产品收藏: ${productFavorites.length}`);
    console.log(`课程收藏: ${courseFavorites.length}`);
    
    // 检查NULL值统计
    const nullProductIds = favorites.filter(f => f.product_id === null).length;
    const nullCourseIds = favorites.filter(f => f.course_id === null).length;
    const bothNull = favorites.filter(f => f.product_id === null && f.course_id === null).length;
    const bothNotNull = favorites.filter(f => f.product_id !== null && f.course_id !== null).length;
    
    console.log(`product_id为NULL: ${nullProductIds}`);
    console.log(`course_id为NULL: ${nullCourseIds}`);
    console.log(`两者都为NULL: ${bothNull}`);
    console.log(`两者都不为NULL: ${bothNotNull}`);
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkFavoritesData();