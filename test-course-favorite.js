const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCourseFavoriteFixed() {
  try {
    console.log('=== 测试课程收藏插入（修正版） ===\n');
    
    // 首先获取数据库中已存在的用户ID
    const { data: existingFavorites, error: userError } = await supabase
      .from('favorites')
      .select('user_id')
      .limit(1);
    
    if (userError || !existingFavorites || existingFavorites.length === 0) {
      console.log('无法获取现有用户ID，使用测试UUID');
      var testUserId = '8d17a57d-cfdc-4408-af72-1a7effdde2e6'; // 从之前的查询结果中获取
    } else {
      var testUserId = existingFavorites[0].user_id;
      console.log(`使用现有用户ID: ${testUserId}`);
    }
    
    // 检查示例课程是否存在
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002'
      ]);
    
    if (courseError) {
      console.log('查询课程失败:', courseError.message);
      return;
    }
    
    console.log('找到的示例课程:');
    courses.forEach(course => {
      console.log(`  ${course.id}: ${course.title}`);
    });
    
    // 测试插入课程收藏
    const testFavorites = [
      {
        user_id: testUserId,
        item_type: 'course',
        course_id: '00000000-0000-0000-0000-000000000001',
        product_id: null
      },
      {
        user_id: testUserId,
        item_type: 'course',
        course_id: '00000000-0000-0000-0000-000000000002',
        product_id: null
      }
    ];
    
    console.log('\n=== 测试插入课程收藏 ===');
    
    for (const favorite of testFavorites) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .insert(favorite);
        
        if (error) {
          console.log(`❌ 插入失败 (${favorite.course_id}):`, error.message);
        } else {
          console.log(`✅ 插入成功 (${favorite.course_id})`);
        }
        
      } catch (error) {
        console.log(`❌ 插入异常 (${favorite.course_id}):`, error.message);
      }
    }
    
    // 验证插入结果
    console.log('\n=== 验证收藏数据 ===');
    const { data: allFavorites, error: verifyError } = await supabase
      .from('favorites')
      .select('id, user_id, item_type, product_id, course_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (verifyError) {
      console.log('验证失败:', verifyError.message);
    } else {
      console.log('最新的收藏记录:');
      allFavorites.forEach(fav => {
        if (fav.item_type === 'course') {
          console.log(`  课程收藏 - ID: ${fav.id}, 用户: ${fav.user_id}, 课程ID: ${fav.course_id}`);
        } else {
          console.log(`  产品收藏 - ID: ${fav.id}, 用户: ${fav.user_id}, 产品ID: ${fav.product_id}`);
        }
      });
      
      const courseFavorites = allFavorites.filter(fav => fav.item_type === 'course');
      console.log(`\n总计: ${allFavorites.length} 条收藏记录 (其中 ${courseFavorites.length} 条课程收藏)`);
      
      if (courseFavorites.length > 0) {
        console.log('\n✅ 课程收藏功能测试成功！');
      } else {
        console.log('\n⚠️  没有成功插入课程收藏');
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testCourseFavoriteFixed();