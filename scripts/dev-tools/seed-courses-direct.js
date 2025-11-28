const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSampleCoursesFixed() {
  try {
    console.log('=== 开始插入示例课程数据（修正版） ===\n');
    
    // 插入示例课程数据 - 使用实际的字段结构
    const courses = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: '传统扎染基础入门课程',
        description: '本课程将带您深入了解传统扎染工艺的精髓，从基础理论到实际操作，让您掌握这门古老而美丽的艺术。',
        instructor: '李师傅',
        duration: 150,
        price: 0,
        image_url: '/tie-dye-tutorial-hands-on.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        title: '扎染进阶技法与创作',
        description: '深入学习扎染的高级技法，包括复杂图案设计、多色染色技术等，提升您的扎染创作水平。',
        instructor: '王老师',
        duration: 195,
        price: 168,
        image_url: '/traditional-indigo-dyeing-workshop.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        title: '现代扎染艺术创作',
        description: '探索扎染在现代设计中的应用，学习如何将传统工艺与现代审美相结合，创作具有个人风格的扎染作品。',
        instructor: '张艺术家',
        duration: 165,
        price: 198,
        image_url: '/modern-indigo-dyeing-art.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        title: '扎染工艺与商业应用',
        description: '了解扎染工艺的商业价值，学习如何将扎染产品推向市场，打造个人扎染品牌。',
        instructor: '陈企业家',
        duration: 105,
        price: 128,
        image_url: '/modern-indigo-dyed-fashion-products.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        title: '蜡染工艺基础入门',
        description: '学习苗族传统蜡染工艺，从蜡刀使用到图案设计，全面掌握这项非物质文化遗产技艺。',
        instructor: '王老师',
        duration: 195,
        price: 199,
        image_url: '/wax-resist-dyeing-technique.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        title: '传统苗族蜡染技法',
        description: '深入学习苗族传统蜡染技法，学习绘制传统图案，掌握这门古老艺术的精髓。',
        instructor: '陈老师',
        duration: 240,
        price: 258,
        image_url: '/traditional-wax-resist-cushion.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000007',
        title: '蜡染纹样设计与应用',
        description: '学习蜡染纹样设计原理，掌握传统纹样的现代应用，创作具有个人风格的蜡染作品。',
        instructor: '张设计师',
        duration: 165,
        price: 178,
        image_url: '/modern-indigo-dyeing-art.jpg'
      },
      {
        id: '00000000-0000-0000-0000-000000000008',
        title: '蜡染与扎染结合创作',
        description: '学习如何将蜡染与扎染两种工艺相结合，创作更加丰富多样的蓝染艺术作品。',
        instructor: '李师傅',
        duration: 210,
        price: 238,
        image_url: '/modern-indigo-dyed-fashion-products.jpg'
      }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const course of courses) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .upsert(course, { onConflict: 'id' });
        
        if (error) {
          console.log(`❌ 插入课程 ${course.id} 失败:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ 插入课程 ${course.id}: ${course.title}`);
          successCount++;
        }
        
        // 稍作延迟，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ 处理课程 ${course.id} 时出错:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n=== 插入完成 ===`);
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    
    // 验证插入结果
    console.log(`\n=== 验证插入结果 ===`);
    const { data: insertedCourses, error: verifyError } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courses.map(c => c.id))
      .order('id');
    
    if (verifyError) {
      console.log('验证失败:', verifyError.message);
    } else {
      console.log(`已找到 ${insertedCourses.length} 条示例课程数据:`);
      insertedCourses.forEach(course => {
        console.log(`  ${course.id}: ${course.title}`);
      });
      
      if (insertedCourses.length === 8) {
        console.log('\n✅ 所有示例课程数据插入成功！');
      } else {
        console.log(`\n⚠️  只插入了 ${insertedCourses.length}/8 条数据`);
      }
    }
    
  } catch (error) {
    console.error('执行种子数据插入失败:', error.message);
  }
}

seedSampleCoursesFixed();