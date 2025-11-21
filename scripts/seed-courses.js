const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 加载环境变量
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量')
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedCourses() {
  try {
    console.log('📚 开始初始化课程数据')

    // 读取课程数据
    const coursesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/courses-seed.json'), 'utf8')
    )

    for (const courseData of coursesData) {
      const { chapters, ...courseFields } = courseData

      // 插入或更新课程
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .upsert(
          {
            id: courseFields.id,
            slug: courseFields.slug,
            title: courseFields.title,
            description: courseFields.description,
            instructor_name: courseFields.instructor_name,
            instructor_bio: courseFields.instructor_bio,
            instructor_avatar: courseFields.instructor_avatar,
            duration: courseFields.duration,
            students: courseFields.students,
            rating: courseFields.rating,
            price: courseFields.price,
            is_free: courseFields.is_free,
            difficulty: courseFields.difficulty,
            category: courseFields.category,
            thumbnail: courseFields.thumbnail,
            status: courseFields.status,
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (courseError) {
        console.error(`❌ 课程 ${courseFields.title} 插入失败:`, courseError)
        continue
      }

      console.log(`✅ 课程 ${courseFields.title} 已插入/更新`)

      // 删除旧的章节
      await supabase.from('course_chapters').delete().eq('course_id', course.id)

      // 插入章节
      if (chapters && chapters.length > 0) {
        const chaptersToInsert = chapters.map((chapter) => ({
          course_id: course.id,
          title: chapter.title,
          duration: chapter.duration,
          is_free: chapter.is_free,
          position: chapter.position,
          video_url: chapter.video_url || null,
          content: chapter.content || null,
        }))

        const { error: chaptersError } = await supabase
          .from('course_chapters')
          .insert(chaptersToInsert)

        if (chaptersError) {
          console.error(`❌ 课程章节插入失败:`, chaptersError)
        } else {
          console.log(`   ✅ ${chapters.length} 个章节已插入`)
        }
      }
    }

    console.log('🎉 课程初始化完成')
    console.log(`📊 总共初始化了 ${coursesData.length} 门课程`)
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    process.exit(1)
  }
}

seedCourses()
